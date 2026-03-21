'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DrugSearchCard } from '@/components/drug-search/DrugSearchCard';
import { SymptomChecklist } from '@/components/assessment/SymptomChecklist';
import { VitalSignsInput } from '@/components/assessment/VitalSignsInput';
import { GradePreview } from '@/components/assessment/GradePreview';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/store/session.store';
import { useDecisionEngine } from '@/hooks/useDecisionEngine';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function AssessPage() {
  const router = useRouter();
  const selectedDrug = useSessionStore((s) => s.selectedDrug);
  const reactionProfile = useSessionStore((s) => s.reactionProfile);
  const setDecisionResult = useSessionStore((s) => s.setDecisionResult);
  const decisionResult = useDecisionEngine();

  // Guard: redirect to home if no drug selected
  useEffect(() => {
    if (!selectedDrug) {
      router.replace('/');
    }
  }, [selectedDrug, router]);

  if (!selectedDrug) return null;

  const handleProceed = () => {
    if (decisionResult) {
      setDecisionResult(decisionResult);
      router.push('/decision');
    }
  };

  return (
    <div className="pb-24">
      {/* Back button + Drug summary */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft size={16} />
          Change drug
        </button>
        <DrugSearchCard
          drug={selectedDrug}
          profile={reactionProfile}
          isLoading={false}
          compact
        />
      </div>

      {/* Assessment Form */}
      <GlassPanel className="p-5 md:p-7 mb-6" intensity="medium">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          Symptom Assessment
        </h2>
        <SymptomChecklist />
      </GlassPanel>

      <GlassPanel className="p-5 md:p-7 mb-6" intensity="medium">
        <VitalSignsInput />
      </GlassPanel>

      {/* Proceed button */}
      <Button
        onClick={handleProceed}
        size="lg"
        variant={decisionResult && decisionResult.gradingResult.finalGrade.grade >= 4 ? 'danger' : 'primary'}
        className="w-full"
        disabled={!decisionResult}
        icon={<ArrowRight size={20} />}
      >
        {decisionResult
          ? `View Grade ${decisionResult.gradingResult.finalGrade.grade} Protocol`
          : 'Select symptoms to continue'}
      </Button>

      {/* Floating grade preview */}
      <GradePreview />
    </div>
  );
}
