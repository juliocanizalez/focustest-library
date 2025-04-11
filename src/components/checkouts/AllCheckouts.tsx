import { useEffect, useState } from 'react';
import checkoutService from '../../services/checkoutService';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCheckoutsStart,
  fetchCheckoutsSuccess,
  fetchCheckoutsFailure,
  returnBookSuccess,
} from '../../store/slices/checkoutSlice';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/loading';

export function AllCheckouts() {
  const dispatch = useAppDispatch();
  const { checkouts, isLoading, error } = useAppSelector(
    (state) => state.checkouts,
  );
  const { toast } = useToast();
  const [processingReturn, setProcessingReturn] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('active');

  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        dispatch(fetchCheckoutsStart());
        const data = await checkoutService.getCheckouts();
        dispatch(fetchCheckoutsSuccess(data));
      } catch (err) {
        dispatch(fetchCheckoutsFailure((err as Error).message));
        toast({
          title: 'Error',
          description: (err as Error).message,
          variant: 'destructive',
        });
      }
    };

    fetchCheckouts();
  }, [dispatch, toast]);

  const handleReturnBook = async (checkoutId: string) => {
    setProcessingReturn(checkoutId);
    try {
      const updatedCheckout = await checkoutService.returnBook({
        checkoutId,
      });
      dispatch(returnBookSuccess(updatedCheckout));
      toast({
        title: 'Success',
        description: 'Book marked as returned successfully',
      });
      dispatch(fetchCheckoutsStart());
      const data = await checkoutService.getCheckouts();
      dispatch(fetchCheckoutsSuccess(data));
    } catch (err) {
      toast({
        title: 'Error',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setProcessingReturn(null);
    }
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

  const filteredCheckouts = checkouts.filter((checkout) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !checkout.returned;
    if (filter === 'returned') return checkout.returned;
    return true;
  });

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='text-3xl font-bold'>All Checkouts</h1>

        <div className='flex space-x-2'>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'returned' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('returned')}
          >
            Returned
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {filteredCheckouts.length === 0 ? (
        <div className='rounded-md border p-6 text-center text-gray-500'>
          No checkouts found.
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
                  Book
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  User
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Checkout Date
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                >
                  Status
                </th>
                {(filter === 'active' || filter === 'all') && (
                  <th
                    scope='col'
                    className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500'
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {filteredCheckouts.map((checkout) => {
                const book =
                  typeof checkout.book === 'object' ? checkout.book : null;
                const user =
                  typeof checkout.user === 'object' ? checkout.user : null;

                if (!book || !user) return null;

                return (
                  <tr key={checkout._id}>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='flex flex-col'>
                        <div className='font-medium text-gray-900'>
                          {book.title}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {book.author}
                        </div>
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm text-gray-900'>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className='text-xs text-gray-500'>{user.email}</div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {new Date(checkout.checkoutDate).toLocaleDateString()}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                          checkout.returned
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {checkout.returned ? 'Returned' : 'Active'}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-right text-sm font-medium'>
                      {!checkout.returned && (
                        <Button
                          size='sm'
                          onClick={() => handleReturnBook(checkout._id)}
                          disabled={processingReturn === checkout._id}
                        >
                          {processingReturn === checkout._id ? (
                            <Loading size='sm' />
                          ) : (
                            'Mark as Returned'
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
