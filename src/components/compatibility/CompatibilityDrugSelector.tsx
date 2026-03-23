'use client';

import { ArrowRightLeft } from 'lucide-react';
import { useCompatibilityStore } from '@/store/compatibility.store';
import { CompatibilityDrugAutocomplete } from './CompatibilityDrugAutocomplete';
import { Button } from '@/components/ui/Button';

export function CompatibilityDrugSelector() {
  const drugA = useCompatibilityStore((s) => s.drugA);
  const drugB = useCompatibilityStore((s) => s.drugB);
  const sameDrugError = useCompatibilityStore((s) => s.sameDrugError);
  const selectDrugA = useCompatibilityStore((s) => s.selectDrugA);
  const selectDrugB = useCompatibilityStore((s) => s.selectDrugB);
  const clearDrugA = useCompatibilityStore((s) => s.clearDrugA);
  const clearDrugB = useCompatibilityStore((s) => s.clearDrugB);
  const swapDrugs = useCompatibilityStore((s) => s.swapDrugs);
  const checkCompatibility = useCompatibilityStore((s) => s.checkCompatibility);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1">
          <CompatibilityDrugAutocomplete label="Drug A (Line 1)" id="drug-a-search" selectedDrug={drugA} onSelect={selectDrugA} onClear={clearDrugA} />
        </div>
        <div className="flex items-end justify-center sm:pb-0.5">
          <button onClick={swapDrugs} disabled={!drugA && !drugB} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#5A7A5A] hover:text-[#4E6F4E] hover:bg-[#E9F5E1] disabled:opacity-30 disabled:cursor-not-allowed transition-colors" aria-label="Swap drugs">
            <ArrowRightLeft size={22} />
          </button>
        </div>
        <div className="flex-1">
          <CompatibilityDrugAutocomplete label="Drug B (Line 2)" id="drug-b-search" selectedDrug={drugB} onSelect={selectDrugB} onClear={clearDrugB} />
        </div>
      </div>
      {sameDrugError && (
        <p role="alert" className="text-sm font-medium text-red-600 text-center">Cannot check a drug against itself. Select two different drugs.</p>
      )}
      <div className="flex justify-center pt-2">
        <Button onClick={checkCompatibility} disabled={!drugA || !drugB} className="w-full sm:w-auto sm:min-w-[240px]">
          Check Y-Site Compatibility
        </Button>
      </div>
    </div>
  );
}
