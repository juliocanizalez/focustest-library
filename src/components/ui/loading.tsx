import * as React from 'react';
import { motion } from 'framer-motion';

import { cn } from '../../lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ size = 'md', className, ...props }: LoadingProps) {
  const sizeClass = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div
      className={cn('flex justify-center items-center', className)}
      {...props}
    >
      <motion.div
        className={cn(
          'rounded-full border-t-transparent border-slate-200',
          sizeClass,
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
