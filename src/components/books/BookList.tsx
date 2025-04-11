import { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchBooksStart,
  fetchBooksSuccess,
  fetchBooksFailure,
  setSearchQuery,
  clearSearchQueries,
} from '../../store/slices/bookSlice';
import bookService from '../../services/bookService';
import { useThrottledSearch } from '../../hooks/useThrottledSearch';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Loading } from '../ui/loading';
import { UserRole } from '../../types';

export function BookList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { books, isLoading, error, searchQueries } = useAppSelector(
    (state) => state.books,
  );
  const { user } = useAppSelector((state) => state.auth);
  const initialLoadDone = useRef(false);

  const handleSearch = async (queries: {
    title: string;
    author: string;
    genre: string;
  }) => {
    try {
      dispatch(fetchBooksStart());
      const data = await bookService.getBooks(queries);
      dispatch(fetchBooksSuccess(data));
    } catch (err) {
      dispatch(fetchBooksFailure((err as Error).message));
    }
  };

  const {
    updateSearchQuery,
    clearSearchQueries: clearLocalSearchQueries,
    triggerSearch,
  } = useThrottledSearch({
    onSearch: handleSearch,
    initialQueries: searchQueries,
  });

  // Move the check for existing filters to a useMemo
  const hasExistingFilters = useMemo(
    () =>
      searchQueries.title.trim() !== '' ||
      searchQueries.author.trim() !== '' ||
      searchQueries.genre.trim() !== '',
    [searchQueries.title, searchQueries.author, searchQueries.genre],
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        if (!initialLoadDone.current && hasExistingFilters) {
          triggerSearch();
        } else if (!initialLoadDone.current) {
          dispatch(fetchBooksStart());
          const data = await bookService.getBooks();
          dispatch(fetchBooksSuccess(data));
        }
        initialLoadDone.current = true;
      } catch (err) {
        dispatch(fetchBooksFailure((err as Error).message));
      }
    };

    fetchBooks();
  }, [dispatch, triggerSearch, hasExistingFilters]);

  const handleSearchChange = (
    field: 'title' | 'author' | 'genre',
    value: string,
  ) => {
    updateSearchQuery(field, value);
    dispatch(setSearchQuery({ field, value }));
  };

  const handleClearSearch = () => {
    clearLocalSearchQueries();
    dispatch(clearSearchQueries());
  };

  const handleViewBook = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  const handleCheckout = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/books/${bookId}`);
  };

  const handleEdit = (e: React.MouseEvent, bookId: string) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/books/${bookId}/edit`);
  };

  const handleAddNew = () => {
    navigate('/books/new');
  };

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

  const isFilterActive =
    searchQueries.title.trim() !== '' ||
    searchQueries.author.trim() !== '' ||
    searchQueries.genre.trim() !== '';

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Books</h1>
        {user?.role === UserRole.LIBRARIAN && (
          <Button onClick={handleAddNew}>Add New Book</Button>
        )}
      </div>

      <div className='mb-6 space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div className='relative'>
            <Input
              type='text'
              placeholder='Search by title...'
              value={searchQueries.title}
              onChange={(e) => handleSearchChange('title', e.target.value)}
              className='pl-10'
            />
            <svg
              className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <div className='relative'>
            <Input
              type='text'
              placeholder='Search by author...'
              value={searchQueries.author}
              onChange={(e) => handleSearchChange('author', e.target.value)}
              className='pl-10'
            />
            <svg
              className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <div className='relative'>
            <Input
              type='text'
              placeholder='Search by genre...'
              value={searchQueries.genre}
              onChange={(e) => handleSearchChange('genre', e.target.value)}
              className='pl-10'
            />
            <svg
              className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        {isFilterActive && (
          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleClearSearch}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className='flex h-64 items-center justify-center'>
          <Loading size='lg' />
        </div>
      ) : error ? (
        <div className='rounded-md border border-red-200 bg-red-50 p-4 text-red-800'>
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className='rounded-md border p-6 text-center text-gray-500'>
          No books found.
        </div>
      ) : (
        <motion.div
          variants={container}
          initial='hidden'
          animate='show'
          className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'
        >
          {books.map((book) => (
            <motion.div
              key={book._id}
              variants={item}
              className='h-full'
            >
              <Card
                className='h-full cursor-pointer transition-all hover:shadow-md'
                onClick={() => handleViewBook(book._id)}
              >
                <CardHeader>
                  <CardTitle className='line-clamp-1'>{book.title}</CardTitle>
                  <CardDescription>by {book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Published:</span>
                      <span className='text-sm'>{book.publishedYear}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Genre:</span>
                      <span className='text-sm'>{book.genre}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-sm text-gray-500'>Available:</span>
                      <span
                        className={`text-sm ${
                          book.stock === 0 ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        {book.stock} copies
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='flex justify-end space-x-2'>
                  {user?.role === UserRole.LIBRARIAN && (
                    <Button
                      onClick={(e) => handleEdit(e, book._id)}
                      variant='outline'
                    >
                      Edit
                    </Button>
                  )}
                  {user?.role === UserRole.STUDENT && (
                    <Button
                      onClick={(e) => handleCheckout(e, book._id)}
                      disabled={book.stock === 0}
                    >
                      {book.stock === 0 ? 'Out of Stock' : 'Checkout'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
