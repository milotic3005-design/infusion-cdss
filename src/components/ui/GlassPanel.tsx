'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
}

const intensityStyles = {
  light: 'bg-[#E9F5E1]/60 backdrop-blur-md border-[#B8D4B8]/50',
  medium: 'bg-[#E9F5E1]/75 backdrop-blur-xl border-[#B8D4B8]/40',
  heavy: 'bg-white/90 backdrop-blur-2xl border-[#B8D4B8]/30',
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
