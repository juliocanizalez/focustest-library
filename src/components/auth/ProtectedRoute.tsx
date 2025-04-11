import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types';
import { Loading } from '../ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, token } = useAppSelector(
    (state) => state.auth,
  );
  const location = useLocation();

  // If we have a token but auth is still loading, show loading state
  // This prevents premature redirects to login during token validation
  if (isLoading || (token && !user)) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loading size='lg' />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Exclude redirects from role-specific pages that might cause issues on role switching
    const path = location.pathname;
    const isRoleSpecificPath =
      path.startsWith('/my-checkouts') ||
      path.startsWith('/checkouts') ||
      path.startsWith('/users') ||
      path.includes('/edit') ||
      path.includes('/new');

    return (
      <Navigate
        to='/login'
        state={{ from: isRoleSpecificPath ? undefined : location }}
        replace
      />
    );
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to='/unauthorized'
        replace
        state={{}}
      />
    );
  }

  // If everything is fine, render the children
  return <>{children}</>;
}
