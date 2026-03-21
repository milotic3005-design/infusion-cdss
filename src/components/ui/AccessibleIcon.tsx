'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  size?: number;
  className?: string;
}

export function AccessibleIcon({
  icon: Icon,
  label,
  size = 24,
  className,
}: AccessibleIconProps) {
  return (
    <span role="img" aria-label={label} className={cn('inline-flex', className)}>
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}
