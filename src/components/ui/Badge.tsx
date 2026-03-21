'use client';

import { cn } from '@/lib/utils';
import { CTCAE_BG_COLORS, CTCAE_TEXT_COLORS, CTCAE_BORDER_COLORS } from '@/lib/constants';
import type { CTCAEGradeNumber } from '@/types/grading.types';

interface BadgeProps {
  grade: CTCAEGradeNumber;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function Badge({ grade, label, size = 'md' }: BadgeProps) {
  const displayLabel = label || `Grade ${grade}`;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        CTCAE_BG_COLORS[grade],
        CTCAE_TEXT_COLORS[grade],
        CTCAE_BORDER_COLORS[grade],
        sizeStyles[size]
      )}
      role="status"
      aria-label={`CTCAE ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
}
