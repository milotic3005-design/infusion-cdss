'use client';

import { useEffect, useRef } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/clinical-math';
import { TIMER_ANNOUNCE_THRESHOLDS } from '@/lib/compatibility-constants';
import { Button } from '@/components/ui/Button';
import type { TitrationStep } from '@/types/titration.types';

interface Props {
  step: TitrationStep;
  remainingSeconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  soundBlocked: boolean;
  onEnableSound: () => void;
}

export function TitrationStepTimer({ step, remainingSeconds, totalSeconds, isExpired, isPaused, onPause, onResume, soundBlocked, onEnableSound }: Props) {
  const announceRef = useRef<HTMLSpanElement>(null);
  const lastAnnouncedRef = useRef<number | null>(null);

  useEffect(() => {
    if (TIMER_ANNOUNCE_THRESHOLDS.includes(remainingSeconds) && lastAnnouncedRef.current !== remainingSeconds && announceRef.current) {
      lastAnnouncedRef.current = remainingSeconds;
      if (remainingSeconds === 0) {
        announceRef.current.textContent = `Step ${step.stepNumber} complete. Nurse acknowledgment required.`;
      } else {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        announceRef.current.textContent = mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''} ${secs > 0 ? `${secs} seconds` : ''} remaining` : `${secs} second${secs !== 1 ? 's' : ''} remaining`;
      }
    }
  }, [remainingSeconds, step.stepNumber]);

  const progressPercent = totalSeconds > 0 ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100) : 100;

  return (
    <div className={cn('rounded-2xl p-5 text-center transition-colors duration-300', isExpired ? 'bg-red-600 text-white animate-pulse' : isPaused ? 'bg-gray-100 text-gray-700' : 'bg-[#E9F5E1] text-[#4E6F4E]')}>
      <span ref={announceRef} aria-live="assertive" aria-atomic="true" className="sr-only" />
      <div className="mb-2">
        <span className="text-sm font-semibold uppercase tracking-wide opacity-70">Step {step.stepNumber}</span>
        <p className="text-base font-medium mt-1">{step.rateMlHr} mL/hr for {step.durationMinutes} min</p>
      </div>
      <div className={cn('text-5xl font-mono font-bold tabular-nums py-4', isExpired && 'animate-pulse')} aria-label={`Time remaining: ${formatDuration(remainingSeconds)}`}>
        {formatDuration(remainingSeconds)}
      </div>
      {isExpired && <p className="text-lg font-bold mb-3 animate-pulse">STEP COMPLETE — AWAITING ACKNOWLEDGMENT</p>}
      {isPaused && !isExpired && <p className="text-base font-semibold text-gray-500 mb-3">PAUSED</p>}
      {!isExpired && (
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className={cn('h-full rounded-full transition-all duration-1000 ease-linear', isPaused ? 'bg-gray-400' : 'bg-[#4E6F4E]')} style={{ width: `${progressPercent}%` }} role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100} />
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        {!isExpired && (
          <Button variant={isPaused ? 'primary' : 'secondary'} onClick={isPaused ? onResume : onPause}>
            {isPaused ? <><Play size={18} /> Resume</> : <><Pause size={18} /> Pause</>}
          </Button>
        )}
        {isExpired && soundBlocked && (
          <Button variant="secondary" onClick={onEnableSound}>
            <Volume2 size={18} /> Enable Sound
          </Button>
        )}
      </div>
      {step.escalationNote && !isExpired && <p className="mt-3 text-xs opacity-60 italic">{step.escalationNote}</p>}
    </div>
  );
}
