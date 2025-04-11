import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from './store';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { BookFormPage } from './pages/BookFormPage';
import { MyCheckoutsPage } from './pages/MyCheckoutsPage';
import { CheckoutsPage } from './pages/CheckoutsPage';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAppDispatch } from './hooks/redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from './store/slices/authSlice';
import authService from './services/authService';
import { UserRole, ApiError } from './types';
import { Toaster } from './components/ui/toaster';
import './index.css';

const queryClient = new QueryClient();

function AuthVerify() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      dispatch(loginStart());

      const verifyToken = async () => {
        try {
          const data = await authService.validateToken();
          dispatch(
            loginSuccess({
              user: data.user,
              token: data.token,
            }),
          );
        } catch (error) {
          console.error('Token validation failed:', error);
          if ((error as ApiError)?.statusCode === 401) {
            localStorage.removeItem('token');
            dispatch(loginFailure((error as Error).message));
          } else {
            dispatch(loginFailure('Error connecting to server'));
          }
        }
      };

      verifyToken();
    }
  }, [dispatch]);

  return null;
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthVerify />
          <Routes>
            {/* Public routes */}
            <Route
              path='/login'
              element={<LoginPage />}
            />
            <Route
              path='/register'
              element={<RegisterPage />}
            />
            <Route
              path='/unauthorized'
              element={<UnauthorizedPage />}
            />

            {/* Protected routes for all authenticated users */}
            <Route
              path='/books'
              element={
                <ProtectedRoute>
                  <BooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/books/:bookId'
              element={
                <ProtectedRoute>
                  <BookDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Student-specific routes */}
            <Route
              path='/my-checkouts'
              element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <MyCheckoutsPage />
                </ProtectedRoute>
              }
            />

            {/* Librarian-specific routes */}
            <Route
              path='/books/:bookId/edit'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <BookFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/books/new'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <BookFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/checkouts'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <CheckoutsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/users'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/users/:userId/edit'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/users/new'
              element={
                <ProtectedRoute allowedRoles={[UserRole.LIBRARIAN]}>
                  <UserFormPage />
                </ProtectedRoute>
              }
            />

            {/* Default redirects */}
            <Route
              path='/'
              element={
                <Navigate
                  to='/books'
                  replace
                />
              }
            />
            <Route
              path='*'
              element={
                <Navigate
                  to='/books'
                  replace
                />
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
