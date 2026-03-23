'use client';
import { useRef, useCallback, useEffect } from 'react';

export function useAudibleAlert() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isBlockedRef = useRef(false);
  const isPlayingRef = useRef(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/alert.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.8;
    }
    return audioRef.current;
  }, []);

  const play = useCallback(() => {
    if (isPlayingRef.current) return;
    const audio = getAudio();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => { isPlayingRef.current = true; isBlockedRef.current = false; })
        .catch(() => { isBlockedRef.current = true; isPlayingRef.current = false; });
    }
  }, [getAudio]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    isPlayingRef.current = false;
  }, []);

  const enableSound = useCallback(() => {
    isBlockedRef.current = false;
    play();
  }, [play]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { play, stop, isBlocked: () => isBlockedRef.current, enableSound };
}
