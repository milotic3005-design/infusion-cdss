'use client';

import { useSessionStore } from '@/store/session.store';
import { SYMPTOM_CATALOG, SYMPTOM_CATEGORIES } from '@/engine/symptom-catalog';
import { CTCAE_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useEffect } from 'react';
import type { SymptomInput } from '@/types/grading.types';

export function SymptomChecklist() {
  const symptoms = useSessionStore((s) => s.symptoms);
  const setSymptoms = useSessionStore((s) => s.setSymptoms);
  const toggleSymptom = useSessionStore((s) => s.toggleSymptom);

  // Initialize symptoms from catalog on mount
  useEffect(() => {
    if (symptoms.length === 0) {
      const initial: SymptomInput[] = SYMPTOM_CATALOG.map((def) => ({
        symptomId: def.id,
        symptomName: def.displayName,
        baseGrade: def.baseGrade,
        isPresent: false,
      }));
      setSymptoms(initial);
    }
  }, [symptoms.length, setSymptoms]);

  return (
    <div className="space-y-6">
      {SYMPTOM_CATEGORIES.map((category) => {
        const categorySymptoms = SYMPTOM_CATALOG.filter((s) => s.category === category.key);
        if (categorySymptoms.length === 0) return null;

        return (
          <div key={category.key}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {category.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categorySymptoms.map((def) => {
                const symptom = symptoms.find((s) => s.symptomId === def.id);
                const isChecked = symptom?.isPresent ?? false;

                return (
                  <button
                    key={def.id}
                    role="checkbox"
                    aria-checked={isChecked}
                    aria-label={`${def.displayName} - Grade ${def.baseGrade}`}
                    onClick={() => toggleSymptom(def.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                      isChecked
                        ? 'border-current bg-opacity-10 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    )}
                    style={isChecked ? {
                      borderColor: CTCAE_COLORS[def.baseGrade],
                      backgroundColor: `${CTCAE_COLORS[def.baseGrade]}15`,
                    } : undefined}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        isChecked ? 'border-current' : 'border-gray-300'
                      )}
                      style={isChecked ? { borderColor: CTCAE_COLORS[def.baseGrade], backgroundColor: CTCAE_COLORS[def.baseGrade] } : undefined}
                    >
                      {isChecked && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{def.displayName}</span>
                    </div>
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ color: CTCAE_COLORS[def.baseGrade], backgroundColor: `${CTCAE_COLORS[def.baseGrade]}15` }}
                    >
                      G{def.baseGrade}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
