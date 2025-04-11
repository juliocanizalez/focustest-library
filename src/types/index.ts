export enum UserRole {
  STUDENT = 'student',
  LIBRARIAN = 'librarian',
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  publishedYear: number;
  genre: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Checkout {
  _id: string;
  user: string | User;
  book: string | Book;
  checkoutDate: string;
  returnDate: string | null;
  returned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
}
