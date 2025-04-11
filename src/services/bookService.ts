import api from './api';
import { Book } from '../types';

interface BookCreateParams {
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
  stock: number;
}

interface BookUpdateParams extends Partial<BookCreateParams> {
  _id: string;
}

class BookService {
  async getBooks(searchQueries?: {
    title: string;
    author: string;
    genre: string;
  }): Promise<Book[]> {
    let params = {};

    if (searchQueries) {
      // Only include non-empty search parameters in the request
      if (searchQueries.title.trim()) {
        params = { ...params, title: searchQueries.title };
      }

      if (searchQueries.author.trim()) {
        params = { ...params, author: searchQueries.author };
      }

      if (searchQueries.genre.trim()) {
        params = { ...params, genre: searchQueries.genre };
      }
    }

    const response = await api.get<Book[]>('/books', { params });
    return response.data;
  }

  async getBookById(id: string): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  }

  async createBook(params: BookCreateParams): Promise<Book> {
    const response = await api.post<Book>('/books', params);
    return response.data;
  }

  async updateBook(params: BookUpdateParams): Promise<Book> {
    const { _id, ...bookData } = params;
    const response = await api.put<Book>(`/books/${_id}`, bookData);
    return response.data;
  }

  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  }
}

export default new BookService();
