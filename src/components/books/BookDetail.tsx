import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import bookService from '../../services/bookService';
import checkoutService from '../../services/checkoutService';
import { setSelectedBook } from '../../store/slices/bookSlice';
import { addCheckoutSuccess } from '../../store/slices/checkoutSlice';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { UserRole } from '../../types';
import { Loading } from '../ui/loading';
import { useToast } from '../../hooks/useToast';

export function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedBook, isLoading } = useAppSelector((state) => state.books);
  const { user } = useAppSelector((state) => state.auth);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        const book = await bookService.getBookById(bookId);
        dispatch(setSelectedBook(book));
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          variant: 'destructive',
        });
        navigate('/books');
      }
    };

    fetchBook();

    return () => {
      dispatch(setSelectedBook(null));
    };
  }, [bookId, dispatch, navigate, toast]);

  const handleCheckout = async () => {
    if (!bookId) return;
    setCheckoutLoading(true);
    try {
      const checkout = await checkoutService.createCheckout({ book: bookId });
      dispatch(addCheckoutSuccess(checkout));

      // Update the selected book to reflect the stock change
      if (selectedBook) {
        dispatch(
          setSelectedBook({
            ...selectedBook,
            stock: selectedBook.stock - 1,
          }),
        );
      }

      toast({
        title: 'Success',
        description: 'Book checked out successfully',
      });

      if (user?.role === UserRole.STUDENT) {
        navigate('/my-checkouts');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/books/${bookId}/edit`);
  };

  const handleBack = () => {
    navigate('/books');
  };

  if (isLoading || !selectedBook) {
    return (
      <div className='flex h-[50vh] items-center justify-center'>
        <Loading size='lg' />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='container mx-auto max-w-3xl p-4'
    >
      <Button
        variant='ghost'
        onClick={handleBack}
        className='mb-4'
      >
        ← Back to Books
      </Button>

      <Card className='overflow-hidden'>
        <CardHeader className='bg-blue-50'>
          <CardTitle className='text-2xl'>{selectedBook.title}</CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <h3 className='font-medium text-gray-500'>Author</h3>
              <p className='mt-1 text-lg'>{selectedBook.author}</p>
            </div>
            <div>
              <h3 className='font-medium text-gray-500'>Published Year</h3>
              <p className='mt-1 text-lg'>{selectedBook.publishedYear}</p>
            </div>
            <div>
              <h3 className='font-medium text-gray-500'>Genre</h3>
              <p className='mt-1 text-lg'>{selectedBook.genre}</p>
            </div>
            <div>
              <h3 className='font-medium text-gray-500'>Available Copies</h3>
              <p className='mt-1 text-lg'>
                <span
                  className={
                    selectedBook.stock === 0 ? 'text-red-500' : 'text-green-600'
                  }
                >
                  {selectedBook.stock}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-end space-x-2 bg-gray-50 py-4'>
          {user?.role === UserRole.LIBRARIAN && (
            <Button
              onClick={handleEdit}
              variant='outline'
            >
              Edit Book
            </Button>
          )}
          <Button
            onClick={handleCheckout}
            disabled={selectedBook.stock === 0 || checkoutLoading}
          >
            {checkoutLoading ? <Loading size='sm' /> : 'Check Out Book'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
