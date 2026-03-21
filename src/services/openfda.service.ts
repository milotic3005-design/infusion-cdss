import { apiFetch, ApiError } from './api-client';
import { API_ROUTES } from '@/lib/constants';
import type { OpenFDALabelResponse } from '@/types/api.types';

type LabelResult = OpenFDALabelResponse['results'][0];

export async function getDrugLabel(drugName: string): Promise<LabelResult | null> {
  try {
    const data = await apiFetch<OpenFDALabelResponse>(
      `${API_ROUTES.openfda}?drugName=${encodeURIComponent(drugName)}`
    );

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
