import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
} from '../../store/slices/userSlice';
import userService from '../../services/userService';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/loading';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

export function UserManagement() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, isLoading, error } = useAppSelector((state) => state.users);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        dispatch(fetchUsersStart());
        const data = await userService.getUsers();
        dispatch(fetchUsersSuccess(data));
      } catch (err) {
        dispatch(fetchUsersFailure((err as Error).message));
        toast({
          title: 'Error',
          description: (err as Error).message,
          variant: 'destructive',
        });
      }
    };

    fetchUsers();
  }, [dispatch, toast]);

  const handleAddUser = () => {
    navigate('/users/new');
  };

  if (isLoading) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loading size='lg' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-4'>
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Users</h1>
        <Button onClick={handleAddUser}>Add New User</Button>
      </div>

      {users.length === 0 ? (
        <div className='rounded-md border p-6 text-center text-gray-500'>
          No users found.
        </div>
      ) : (
        <div className='overflow-hidden rounded-lg border'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Name
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Email
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Role
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Created At
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center'>
                      <div className='h-8 w-8 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center'>
                        <span className='text-sm font-medium text-slate-600'>
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {user.email}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                        user.role === UserRole.LIBRARIAN
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.role === UserRole.LIBRARIAN
                        ? 'Librarian'
                        : 'Student'}
                    </span>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => navigate(`/users/${user._id}/edit`)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
