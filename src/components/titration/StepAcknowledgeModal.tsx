'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { TitrationStep } from '@/types/titration.types';

interface Props {
  step: TitrationStep;
  nextStep: TitrationStep | null;
  isFinalStep: boolean;
  onAcknowledge: () => void;
}

export function StepAcknowledgeModal({ step, nextStep, isFinalStep, onAcknowledge }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const btn = document.querySelector('[data-ack-button]') as HTMLButtonElement | null;
      btn?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Step completion acknowledgment">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-red-700 text-white px-6 py-4 flex items-center gap-3">
          <AlertTriangle size={28} />
          <div>
            <h2 className="text-lg font-bold">{isFinalStep ? 'Infusion Complete' : 'Step Complete'}</h2>
            <p className="text-sm opacity-90">Step {step.stepNumber} — {step.rateMlHr} mL/hr</p>
          </div>
        </div>
        <div className="px-6 py-5">
          {isFinalStep ? (
            <div className="text-center">
              <p className="text-base text-gray-700 mb-2">All steps of this titration protocol have been completed.</p>
              <p className="text-sm text-gray-500">Document completion per institutional policy.</p>
            </div>
          ) : (
            <div>
              <p className="text-base text-gray-700 mb-3">Confirm this step is complete to advance to the next step.</p>
              {nextStep && (
                <div className="bg-[#E9F5E1] rounded-xl p-3 border border-[#C1E1B1]">
                  <p className="text-sm font-semibold text-[#4E6F4E]">Next: Step {nextStep.stepNumber}</p>
                  <p className="text-sm text-[#8AB78A] mt-0.5">{nextStep.rateMlHr} mL/hr for {nextStep.durationMinutes > 0 ? `${nextStep.durationMinutes} min` : 'until complete'}</p>
                  <p className="text-xs text-[#8AB78A]/70 mt-1">{nextStep.triggerCondition}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-6 pb-5">
          <button
            data-ack-button
            onClick={onAcknowledge}
            className="w-full min-h-[44px] px-5 py-3 rounded-xl font-semibold text-base bg-[#8AB78A] text-white hover:bg-[#4E6F4E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB78A] focus-visible:ring-offset-2"
          >
            {isFinalStep ? 'Acknowledge Completion' : 'Acknowledge & Advance to Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
}
