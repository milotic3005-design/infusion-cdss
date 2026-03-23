'use client';

import { useCompatibilityStore } from '@/store/compatibility.store';
import { Card } from '@/components/ui/Card';
import { RESULT_COLORS } from '@/lib/compatibility-constants';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import type { CompatibilityResult } from '@/types/compatibility.types';

const iconMap: Record<string, typeof CheckCircle> = { C: CheckCircle, I: XCircle, U: AlertTriangle, N: HelpCircle };

function StatusIcon({ result, size = 28 }: { result: string; size?: number }) {
  const Icon = iconMap[result] || HelpCircle;
  return <Icon size={size} className="shrink-0" />;
}

export function CompatibilityResultCard() {
  const drugA = useCompatibilityStore((s) => s.drugA);
  const drugB = useCompatibilityStore((s) => s.drugB);
  const results = useCompatibilityStore((s) => s.results);

  if (!results || results.length === 0) {
    return (
      <div aria-live="polite" className="mt-6">
        <Card className="border-dashed border-[#C1E1B1] bg-[#FAFAF5] text-center py-8">
          <p className="text-[#8AB78A] text-base">Select two drugs above and check compatibility to see results.</p>
        </Card>
      </div>
    );
  }

  const primaryResult = results[0].result as CompatibilityResult;
  const colorConfig = RESULT_COLORS[primaryResult] || RESULT_COLORS.N;

  return (
    <div aria-live="polite" className="mt-6 space-y-3">
      <Card className={cn('border-none p-0 overflow-hidden rounded-2xl', colorConfig.bg, colorConfig.text)} padding="sm">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <StatusIcon result={primaryResult} size={32} />
            <div className="flex-1">
              <h3 className="text-lg font-bold">{drugA?.name} + {drugB?.name}</h3>
              <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-1', primaryResult === 'U' ? 'bg-yellow-700 text-white' : 'bg-white/20 text-inherit')}>
                {colorConfig.label}
              </span>
            </div>
          </div>
          <p className="text-sm opacity-90">{colorConfig.description}</p>
        </div>
      </Card>

      {results.map((entry, index) => (
        <Card key={index}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailRow label={`${drugA?.name} Conc.`} value={entry.concentrationA} />
            <DetailRow label={`${drugB?.name} Conc.`} value={entry.concentrationB} />
            <DetailRow label="Diluent" value={entry.diluent} />
            <DetailRow label="Method" value={entry.method} />
          </div>
          {entry.notes && (
            <div className="mt-3 pt-3 border-t border-[#C1E1B1]/50">
              <p className="text-sm font-medium text-[#4E6F4E] mb-1">Clinical Notes</p>
              <p className="text-sm text-gray-600 leading-relaxed">{entry.notes}</p>
            </div>
          )}
          {entry.references && entry.references.length > 0 && (
            <div className="mt-2 pt-2 border-t border-[#C1E1B1]/30">
              <p className="text-xs text-[#8AB78A]">{entry.references.join('; ')}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs text-[#8AB78A] font-medium uppercase tracking-wide">{label}</span>
      <span className="block text-gray-800 font-medium">{value || '—'}</span>
    </div>
  );
}
