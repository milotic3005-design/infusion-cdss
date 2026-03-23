import { create } from 'zustand';
import compatibilityData from '@/data/compatibility-pairs.json';
import { save, load } from '@/lib/session-state';
import { COMPAT_STORAGE_KEYS } from '@/lib/compatibility-constants';
import type { CompatibilityDrug, CompatibilityPair } from '@/types/compatibility.types';

interface CompatibilityState {
  drugA: CompatibilityDrug | null;
  drugB: CompatibilityDrug | null;
  results: CompatibilityPair[] | null;
  sameDrugError: boolean;
  selectDrugA: (drug: CompatibilityDrug) => void;
  selectDrugB: (drug: CompatibilityDrug) => void;
  swapDrugs: () => void;
  clearDrugA: () => void;
  clearDrugB: () => void;
  checkCompatibility: () => void;
  reset: () => void;
  restoreLastResult: () => void;
}

const data = compatibilityData as { drugs: CompatibilityDrug[]; pairs: CompatibilityPair[] };

function lookupCompatibility(drugAId: string, drugBId: string): CompatibilityPair[] {
  const matches = data.pairs.filter(
    (p) =>
      (p.drugA === drugAId && p.drugB === drugBId) ||
      (p.drugB === drugAId && p.drugA === drugBId)
  );
  if (matches.length === 0) {
    return [{
      drugA: drugAId,
      drugB: drugBId,
      result: 'N' as const,
      concentrationA: '—',
      concentrationB: '—',
      diluent: '—',
      method: 'Y-site',
      notes: 'No compatibility data found for this pair. Consult pharmacist before Y-site administration.',
      references: [],
    }];
  }
  return matches;
}

export const useCompatibilityStore = create<CompatibilityState>((set, get) => ({
  drugA: null,
  drugB: null,
  results: null,
  sameDrugError: false,

  selectDrugA: (drug) => set({ drugA: drug, results: null, sameDrugError: false }),
  selectDrugB: (drug) => set({ drugB: drug, results: null, sameDrugError: false }),
  swapDrugs: () => set((state) => ({ drugA: state.drugB, drugB: state.drugA, results: null, sameDrugError: false })),
  clearDrugA: () => set({ drugA: null, results: null, sameDrugError: false }),
  clearDrugB: () => set({ drugB: null, results: null, sameDrugError: false }),

  checkCompatibility: () => {
    const { drugA, drugB } = get();
    if (!drugA || !drugB) return;
    if (drugA.id === drugB.id) {
      set({ sameDrugError: true, results: null });
      return;
    }
    const results = lookupCompatibility(drugA.id, drugB.id);
    set({ results, sameDrugError: false });
    save(COMPAT_STORAGE_KEYS.COMPATIBILITY_LAST_RESULT, { drugA, drugB, results });
  },

  reset: () => set({ drugA: null, drugB: null, results: null, sameDrugError: false }),

  restoreLastResult: () => {
    const saved = load<{ drugA: CompatibilityDrug; drugB: CompatibilityDrug; results: CompatibilityPair[] }>(
      COMPAT_STORAGE_KEYS.COMPATIBILITY_LAST_RESULT
    );
    if (saved?.drugA && saved?.drugB && saved?.results) {
      set({ drugA: saved.drugA, drugB: saved.drugB, results: saved.results, sameDrugError: false });
    }
  },
}));
