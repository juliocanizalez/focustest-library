import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import authService from '../services/authService';
import { useAppDispatch } from '../hooks/redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../store/slices/authSlice';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ApiError } from '../types';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      dispatch(loginStart());
      const response = await authService.register(data);
      dispatch(loginSuccess(response));
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      dispatch(loginFailure(apiError.message));
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-8 text-center text-3xl font-bold'>Create an Account</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='mx-auto w-full max-w-md rounded-lg border p-8 shadow-sm'
      >
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
              htmlFor='firstName'
              className='mb-1 block text-sm'
            >
              First Name
            </label>
            <Input
              id='firstName'
              {...register('firstName')}
              placeholder='Enter your first name'
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='lastName'
              className='mb-1 block text-sm'
            >
              Last Name
            </label>
            <Input
              id='lastName'
              {...register('lastName')}
              placeholder='Enter your last name'
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className='mt-1 text-xs text-red-500'>
                {errors.lastName.message}
              </p>
            )}
          </div>

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
              <p className='mt-1 text-xs text-red-500'>
                {errors.email.message}
              </p>
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
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </Button>

          <p className='mt-4 text-center text-sm text-gray-600'>
            Already have an account?{' '}
            <Button
              variant='link'
              className='p-0'
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
