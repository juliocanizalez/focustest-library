import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { Button } from '../ui/button';
import { UserRole } from '../../types';

export function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true, state: {} });
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className='border-b bg-white shadow-sm'
    >
      <div className='container mx-auto flex h-16 items-center justify-between px-4'>
        <Link
          to='/'
          className='text-xl font-bold'
        >
          Library Management
        </Link>

        <div className='flex items-center space-x-4'>
          {isAuthenticated ? (
            <>
              <div className='flex items-center space-x-6'>
                <Link
                  to='/books'
                  className='text-slate-700 transition-colors hover:text-slate-900'
                >
                  Books
                </Link>

                {user?.role === UserRole.STUDENT && (
                  <Link
                    to='/my-checkouts'
                    className='text-slate-700 transition-colors hover:text-slate-900'
                  >
                    My Checkouts
                  </Link>
                )}

                {user?.role === UserRole.LIBRARIAN && (
                  <>
                    <Link
                      to='/checkouts'
                      className='text-slate-700 transition-colors hover:text-slate-900'
                    >
                      All Checkouts
                    </Link>
                    <Link
                      to='/users'
                      className='text-slate-700 transition-colors hover:text-slate-900'
                    >
                      Users
                    </Link>
                  </>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <span className='text-sm text-slate-600'>
                  {user?.firstName} {user?.lastName}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className='flex space-x-2'>
              <Button
                variant='outline'
                size='sm'
                asChild
              >
                <Link to='/login'>Login</Link>
              </Button>
              <Button
                size='sm'
                asChild
              >
                <Link to='/register'>Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
