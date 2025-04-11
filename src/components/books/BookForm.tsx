import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';

import bookService from '../../services/bookService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/loading';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publishedYear: z.coerce
    .number()
    .int('Published year must be an integer')
    .min(1, 'Published year is required')
    .max(new Date().getFullYear(), `Published year can't be in the future`),
  genre: z.string().min(1, 'Genre is required'),
  stock: z.coerce
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

type BookFormValues = z.infer<typeof bookSchema>;

export function BookForm() {
  const { bookId } = useParams<{ bookId: string }>();
  const isEditMode = bookId !== undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      publishedYear: new Date().getFullYear(),
      genre: '',
      stock: 1,
    },
  });

  useEffect(() => {
    // If we're in edit mode, fetch the book data
    if (isEditMode && bookId) {
      const fetchBook = async () => {
        setIsLoading(true);
        try {
          const book = await bookService.getBookById(bookId);
          reset({
            title: book.title,
            author: book.author,
            publishedYear: book.publishedYear,
            genre: book.genre,
            stock: book.stock,
          });
        } catch (error) {
          toast({
            title: 'Error',
            description: (error as Error).message,
            variant: 'destructive',
          });
          navigate('/books');
        } finally {
          setIsLoading(false);
        }
      };

      fetchBook();
    }
  }, [bookId, isEditMode, navigate, reset, toast]);

  const onSubmit = async (data: BookFormValues) => {
    setIsLoading(true);
    try {
      if (isEditMode && bookId) {
        await bookService.updateBook({
          _id: bookId,
          ...data,
        });
        toast({
          title: 'Success',
          description: 'Book updated successfully',
        });
      } else {
        await bookService.createBook(data);
        toast({
          title: 'Success',
          description: 'Book created successfully',
        });
      }
      navigate('/books');
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
    navigate('/books');
  };

  const handleDelete = async () => {
    if (!bookId) return;

    setIsLoading(true);
    try {
      await bookService.deleteBook(bookId);
      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
      navigate('/books');
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
          <CardTitle>{isEditMode ? 'Edit Book' : 'Add New Book'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <div>
              <label
                htmlFor='title'
                className='mb-1 block text-sm font-medium'
              >
                Title
              </label>
              <Input
                id='title'
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='author'
                className='mb-1 block text-sm font-medium'
              >
                Author
              </label>
              <Input
                id='author'
                {...register('author')}
                className={errors.author ? 'border-red-500' : ''}
              />
              {errors.author && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.author.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='publishedYear'
                className='mb-1 block text-sm font-medium'
              >
                Published Year
              </label>
              <Input
                id='publishedYear'
                type='number'
                {...register('publishedYear')}
                className={errors.publishedYear ? 'border-red-500' : ''}
              />
              {errors.publishedYear && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.publishedYear.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='genre'
                className='mb-1 block text-sm font-medium'
              >
                Genre
              </label>
              <Input
                id='genre'
                {...register('genre')}
                className={errors.genre ? 'border-red-500' : ''}
              />
              {errors.genre && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.genre.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='stock'
                className='mb-1 block text-sm font-medium'
              >
                Stock (Available Copies)
              </label>
              <Input
                id='stock'
                type='number'
                {...register('stock')}
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className='mt-1 text-xs text-red-500'>
                  {errors.stock.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className='flex justify-between gap-2'>
            {isEditMode && (
              <Button
                type='button'
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <div className='flex justify-end gap-2'>
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
            </div>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              book from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
