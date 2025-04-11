import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-8 text-center text-3xl font-bold'>
        Welcome to Library Management
      </h1>
      <LoginForm />
    </div>
  );
}
