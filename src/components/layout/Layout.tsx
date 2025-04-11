import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar />
      <main className='pb-12 pt-6'>{children}</main>
    </div>
  );
}
