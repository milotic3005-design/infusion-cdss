'use client';

import { useQuery } from '@tanstack/react-query';
import { buildReactionProfile } from '@/services/drug-profile.service';
import { CACHE_TTL } from '@/lib/constants';

export function useDrugProfile(rxcui: string | null, drugName: string | null) {
  return useQuery({
    queryKey: ['drug-profile', rxcui, drugName],
    queryFn: () => buildReactionProfile(rxcui!, drugName!),
    enabled: !!rxcui && !!drugName,
    staleTime: CACHE_TTL.drugProfile,
  });
}
