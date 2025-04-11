import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import userService from '../../services/userService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/loading';
import { UserRole } from '../../types';

// userSchema for new user
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([UserRole.STUDENT, UserRole.LIBRARIAN], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
});

// userSchema for edit user with password optional
const editUserSchema = userSchema.extend({
  password: z.union([
    z.string().min(6, 'Password must be at least 6 characters'),
    z
      .string()
      .length(0)
      .transform(() => undefined),
    z.undefined(),
  ]),
});

type CreateUserFormValues = z.infer<typeof userSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

export function UserForm() {
  const { userId } = useParams<{ userId: string }>();
  const isEditMode = userId !== undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(isEditMode ? editUserSchema : userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: undefined,
      role: UserRole.STUDENT,
    },
  });

  useEffect(() => {
    // If we're in edit mode, fetch the user data
    if (isEditMode && userId) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const user = await userService.getUserById(userId);
          // We don't populate the password field for security reasons
          reset({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            password: undefined, // Use undefined instead of empty string
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: (error as Error).message,
            variant: 'destructive',
          });
          navigate('/users');
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [userId, isEditMode, navigate, reset, toast]);

  const onSubmit = async (data: EditUserFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && userId) {
        // In edit mode, we only include the password if it's not empty or undefined
        const { password, ...restData } = data;
        const updateData =
          password && password.trim() !== ''
            ? { ...restData, password }
            : restData;

        await userService.updateUser({
          _id: userId,
          ...updateData,
        });
        toast({
          title: 'Success',
          description: 'User updated successfully',
        });
      } else {
        // In create mode, we ensure password is present
        if (!data.password || data.password.trim() === '') {
          throw new Error('Password is required');
        }

        // Cast to CreateUserFormValues since we now know password is defined
        await userService.createUser(data as CreateUserFormValues);
        toast({
          title: 'Success',
          description: 'User created successfully',
        });
      }
      navigate('/users');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoading && isEditMode) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loading size='lg' />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='container mx-auto max-w-xl p-4'
    >
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit User' : 'Add New User'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div>
              <label
                htmlFor='firstName'
                className='mb-1 block text-sm font-medium'
              >
                First Name
              </label>
              <Input
                id='firstName'
                {...register('firstName')}
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
                className='mb-1 block text-sm font-medium'
              >
                Last Name
              </label>
              <Input
                id='lastName'
                {...register('lastName')}
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
                className='mb-1 block text-sm font-medium'
              >
                Email
              </label>
              <Input
                id='email'
                type='email'
                {...register('email')}
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
                className='mb-1 block text-sm font-medium'
              >
                {isEditMode
                  ? 'Password (leave blank to keep unchanged)'
                  : 'Password'}
              </label>
              <Input
                id='password'
                type='password'
                {...register('password', {
                  onChange: (e) => {
                    // Convert empty string to undefined in edit mode
                    if (isEditMode && e.target.value === '') {
                      e.target.value = '';
                      return undefined;
                    }
                    return e.target.value;
                  },
                })}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='role'
                className='mb-1 block text-sm font-medium'
              >
                Role
              </label>
              <select
                id='role'
                {...register('role')}
                className={`w-full rounded-md border border-slate-200 px-3 py-2 ${
                  errors.role ? 'border-red-500' : ''
                }`}
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.LIBRARIAN}>Librarian</option>
              </select>
              {errors.role && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.role.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? (
                <Loading size='sm' />
              ) : isEditMode ? (
                'Update'
              ) : (
                'Create'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
