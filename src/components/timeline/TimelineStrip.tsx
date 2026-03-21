'use client';

import { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CTCAE_COLORS } from '@/lib/constants';
import { formatTimestamp } from '@/lib/utils';
import type { TimelineEvent } from '@/types/session.types';

interface TimelineStripProps {
  events: TimelineEvent[];
}

export function TimelineStrip({ events }: TimelineStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [events.length]);

  if (events.length === 0) return null;

  return (
    <Card padding="sm">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-0 items-center py-2 scrollbar-hide"
        role="list"
        aria-label="Session timeline"
      >
        {events.map((event, i) => (
          <div key={event.id} className="flex items-center flex-shrink-0" role="listitem">
            {/* Event node */}
            <div className="flex flex-col items-center min-w-[100px]">
              <span className="text-[10px] text-gray-400 mb-1">
                {formatTimestamp(event.timestamp)}
              </span>
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                style={{
                  backgroundColor: event.grade ? CTCAE_COLORS[event.grade] : '#9ca3af',
                }}
              />
              <span className="text-xs text-gray-700 font-medium mt-1 text-center leading-tight max-w-[90px]">
                {event.label}
              </span>
            </div>

            {/* Connector line */}
            {i < events.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-200 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
