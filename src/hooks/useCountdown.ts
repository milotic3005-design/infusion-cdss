'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useTitrationStore } from '@/store/titration.store';

export function useCountdown() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunning = useTitrationStore((s) => s.isRunning);
  const isPaused = useTitrationStore((s) => s.isPaused);
  const isTimerExpired = useTitrationStore((s) => s.isTimerExpired);
  const tick = useTitrationStore((s) => s.tick);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && !isTimerExpired) {
      clearTimer();
      intervalRef.current = setInterval(() => { tick(); }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, isPaused, isTimerExpired, tick, clearTimer]);
}
