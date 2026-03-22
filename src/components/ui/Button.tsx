'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles = {
  primary: 'bg-[#8AB78A] text-white hover:bg-[#4E6F4E] active:bg-[#3d5a3d]',
  secondary: 'bg-transparent text-[#4E6F4E] border border-[#8AB78A] hover:bg-[#E9F5E1] active:bg-[#C1E1B1]',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-[#4E6F4E] hover:bg-[#E9F5E1] active:bg-[#C1E1B1]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3.5 text-lg rounded-2xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB78A] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
