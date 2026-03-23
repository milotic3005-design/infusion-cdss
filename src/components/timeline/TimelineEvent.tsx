'use client';

import { CTCAE_COLORS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';
import type { TimelineEvent as TimelineEventType } from '@/types/session.types';

interface TimelineEventProps {
  event: TimelineEventType;
}

export function TimelineEvent({ event }: TimelineEventProps) {
  const color = event.grade ? CTCAE_COLORS[event.grade] : '#9ca3af';

  return (
    <div className="flex flex-col items-center min-w-[100px]">
      <span className="text-[10px] text-gray-500 mb-1">
        {formatTimestamp(event.timestamp)}
      </span>
      <div
        className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-700 font-medium mt-1 text-center leading-tight max-w-[90px]">
        {event.label}
      </span>
    </div>
  );
}
