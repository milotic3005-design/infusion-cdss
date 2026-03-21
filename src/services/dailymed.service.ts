import { apiFetch } from './api-client';
import { API_ROUTES } from '@/lib/constants';
import type { DailyMedSPLListResponse } from '@/types/api.types';

export async function getSPLList(drugName: string): Promise<DailyMedSPLListResponse['data']> {
  try {
    const data = await apiFetch<DailyMedSPLListResponse>(
      `${API_ROUTES.dailymed}?action=list&drugName=${encodeURIComponent(drugName)}`
    );
    return data.data || [];
  } catch {
    return [];
  }
}

export async function getSPLContent(setid: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${API_ROUTES.dailymed}?action=content&setid=${encodeURIComponent(setid)}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}
