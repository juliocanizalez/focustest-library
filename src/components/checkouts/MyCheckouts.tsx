import { useEffect } from 'react';
import { motion } from 'framer-motion';
import checkoutService from '../../services/checkoutService';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchCheckoutsStart,
  fetchCheckoutsSuccess,
  fetchCheckoutsFailure,
} from '../../store/slices/checkoutSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/loading';

export function MyCheckouts() {
  const dispatch = useAppDispatch();
  const { checkouts, isLoading, error } = useAppSelector(
    (state) => state.checkouts,
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        dispatch(fetchCheckoutsStart());
        const data = await checkoutService.getStudentCheckouts();
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Sort checkouts to show non-returned first
  const sortedCheckouts = [...checkouts].sort((a, b) =>
    a.returned === b.returned ? 0 : a.returned ? 1 : -1,
  );

  return (
    <div className='container mx-auto p-4'>
      <h1 className='mb-6 text-3xl font-bold'>My Checkouts</h1>

      {sortedCheckouts.length === 0 ? (
        <div className='rounded-md border p-6 text-center text-gray-500'>
          You haven't checked out any books yet.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'
        >
          {sortedCheckouts.map((checkout) => {
            const book =
              typeof checkout.book === 'object' ? checkout.book : null;

            if (!book) return null;

            return (
              <motion.div
                key={checkout._id}
                variants={item}
                className='h-full'
              >
                <Card
                  className={`h-full ${checkout.returned ? 'opacity-75' : ''}`}
                >
                  <CardHeader>
                    <CardTitle className='line-clamp-1'>{book.title}</CardTitle>
                    <CardDescription>
                      by {book.author} • {book.genre}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-sm text-gray-500'>
                          Checkout Date:
                        </span>
                        <span className='text-sm'>
                          {new Date(checkout.checkoutDate).toLocaleDateString()}
                        </span>
                      </div>

                      {checkout.returned && (
                        <div className='flex justify-between'>
                          <span className='text-sm text-gray-500'>
                            Return Date:
                          </span>
                          <span className='text-sm'>
                            {checkout.returnDate
                              ? new Date(
                                  checkout.returnDate,
                                ).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      )}

                      <div className='mt-2'>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs ${
                            checkout.returned
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {checkout.returned ? 'Returned' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
