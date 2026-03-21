'use client';

import { useEffect, useState } from 'react';
import { getCachedProfile } from '@/db/drug-cache';
import type { ReactionProfile } from '@/types/reaction.types';

export function useCachedDrug(cacheKey: string | null): {
  cachedProfile: ReactionProfile | null;
  isLoading: boolean;
} {
  const [cachedProfile, setCachedProfile] = useState<ReactionProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cacheKey) {
      setCachedProfile(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getCachedProfile(cacheKey).then((profile) => {
      if (!cancelled) {
        setCachedProfile(profile);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [cacheKey]);

  return { cachedProfile, isLoading };
}
