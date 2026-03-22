'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export function Card({ children, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[#C1E1B1] bg-white shadow-sm',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
