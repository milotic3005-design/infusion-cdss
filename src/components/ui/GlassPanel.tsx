'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

const intensityStyles = {
  light: 'bg-white/60 backdrop-blur-md border-white/30',
  medium: 'bg-white/75 backdrop-blur-xl border-white/20',
  heavy: 'bg-white/90 backdrop-blur-2xl border-white/10',
};

export function GlassPanel({
  children,
  intensity = 'medium',
  className,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-lg',
        intensityStyles[intensity],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
