import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import authService from '../../services/authService';
import { useAppDispatch } from '../../hooks/redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ApiError } from '../../types';
import { UserRole } from '../../types';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname: string;
  };
}

export function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(data);
      dispatch(loginSuccess(response));

      // Redirect to the page the user was trying to access or to the home page
      const state = location.state as LocationState;

      // Only use the 'from' location if it exists and doesn't point to a role-restricted page
      const userRole = response.user.role;
      const from = state?.from?.pathname;

      // Default homepage for different roles
      const defaultHomePage = '/books';

      if (from && from !== '/login' && from !== '/unauthorized') {
        // Check if trying to access role-specific pages
        const studentOnlyPaths = ['/my-checkouts'];
        const librarianOnlyPaths = ['/checkouts', '/users', '/books/new'];

        const isStudentPath = studentOnlyPaths.some((path) =>
          from.startsWith(path),
        );
        const isLibrarianPath = librarianOnlyPaths.some((path) =>
          from.startsWith(path),
        );

        // Only navigate to the previous path if it's appropriate for the user's role
        if (
          (userRole === UserRole.STUDENT && !isLibrarianPath) ||
          (userRole === UserRole.LIBRARIAN && !isStudentPath)
        ) {
          navigate(from, { replace: true });
          return;
        }
      }

      // Navigate to the default home page
      navigate(defaultHomePage, { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      dispatch(loginFailure(apiError.message));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='mx-auto w-full max-w-md rounded-lg border p-8 shadow-sm'
    >
      <h2 className='mb-6 text-2xl font-bold'>Login</h2>

      {error && (
        <div className='mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800'>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-4'
      >
        <div>
          <label
            htmlFor='email'
            className='mb-1 block text-sm'
          >
            Email
          </label>
          <Input
            id='email'
            type='email'
            {...register('email')}
            placeholder='Enter your email'
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor='password'
            className='mb-1 block text-sm'
          >
            Password
          </label>
          <Input
            id='password'
            type='password'
            {...register('password')}
            placeholder='Enter your password'
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className='mt-1 text-xs text-red-500'>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type='submit'
          disabled={isSubmitting}
          className='w-full'
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </motion.div>
  );
}
