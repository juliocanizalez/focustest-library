import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Layout } from '../components/layout/Layout';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className='container mx-auto flex flex-col items-center justify-center px-4 py-16'>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className='text-center'
        >
          <h1 className='mb-6 text-6xl font-bold text-red-500'>403</h1>
          <h2 className='mb-4 text-3xl font-semibold'>Access Denied</h2>
          <p className='mb-8 text-lg text-gray-600'>
            You don't have permission to access this page.
          </p>

          <div className='flex justify-center space-x-4'>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button
              variant='outline'
              onClick={() => navigate('/')}
            >
              Home Page
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
