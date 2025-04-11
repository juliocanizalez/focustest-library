import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Book } from '../../types';

interface BooksState {
  books: Book[];
  selectedBook: Book | null;
  isLoading: boolean;
  error: string | null;
  searchQueries: {
    title: string;
    author: string;
    genre: string;
  };
}

const initialState: BooksState = {
  books: [],
  selectedBook: null,
  isLoading: false,
  error: null,
  searchQueries: {
    title: '',
    author: '',
    genre: '',
  },
};

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    fetchBooksStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    fetchBooksSuccess(state, action: PayloadAction<Book[]>) {
      state.books = action.payload;
      state.isLoading = false;
    },
    fetchBooksFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    setSelectedBook(state, action: PayloadAction<Book | null>) {
      state.selectedBook = action.payload;
    },
    setSearchQuery(
      state,
      action: PayloadAction<{
        field: 'title' | 'author' | 'genre';
        value: string;
      }>,
    ) {
      state.searchQueries[action.payload.field] = action.payload.value;
    },
    clearSearchQueries(state) {
      state.searchQueries = initialState.searchQueries;
    },
  },
});

export const {
  fetchBooksStart,
  fetchBooksSuccess,
  fetchBooksFailure,
  setSelectedBook,
  setSearchQuery,
  clearSearchQueries,
} = bookSlice.actions;

export default bookSlice.reducer;
