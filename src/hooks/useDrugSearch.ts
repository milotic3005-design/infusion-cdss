'use client';

import { useQuery } from '@tanstack/react-query';
import { searchDrugs } from '@/services/rxnorm.service';
import { CACHE_TTL } from '@/lib/constants';

export function useDrugSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['drug-search', searchTerm],
    queryFn: () => searchDrugs(searchTerm),
    enabled: searchTerm.length >= 3,
    staleTime: CACHE_TTL.drugSearch,
    placeholderData: (prev) => prev,
  });
}
