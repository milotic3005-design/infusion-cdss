'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { ActionCardGrid } from '@/components/action-cards/ActionCardGrid';
import { PharmacistFallback } from '@/components/action-cards/PharmacistFallback';
import { DrugReactionCard } from '@/components/drug-reaction/DrugReactionCard';
import { Button } from '@/components/ui/Button';
import { SeverityGauge } from '@/components/severity/SeverityGauge';
import { DecisionFlowchart } from '@/components/decision-tree/DecisionFlowchart';
import { TimelineStrip } from '@/components/timeline/TimelineStrip';
import { useSessionStore } from '@/store/session.store';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export default function DecisionPage() {
  const router = useRouter();
  const decisionResult = useSessionStore((s) => s.decisionResult);
  const selectedDrug = useSessionStore((s) => s.selectedDrug);
  const reactionProfile = useSessionStore((s) => s.reactionProfile);
  const timeline = useSessionStore((s) => s.timeline);
  const resetSession = useSessionStore((s) => s.resetSession);

  // Guard: redirect if no decision result
  useEffect(() => {
    if (!decisionResult) {
      router.replace('/assess');
    }
  }, [decisionResult, router]);

  if (!decisionResult) return null;

  const { gradingResult, actions, decisionNodes, decisionEdges, drugProtocol, fallbackToPharmacist } = decisionResult;
  const grade = gradingResult.finalGrade;

  const handleNewSession = () => {
    resetSession();
    router.push('/');
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/assess')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to assessment
        </button>
        <Button onClick={handleNewSession} variant="ghost" size="sm" icon={<RotateCcw size={16} />}>
          New Session
        </Button>
      </div>

      {/* Grade + Gauge Hero */}
      <GlassPanel className="p-6 md:p-8" intensity="heavy">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <SeverityGauge grade={grade.grade} />
          <div className="text-center md:text-left flex-1">
            <Badge grade={grade.grade} size="lg" />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              {grade.label}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {grade.description}
            </p>
            {gradingResult.confidence !== 'high' && (
              <p className="text-xs text-amber-600 mt-2">
                Confidence: {gradingResult.confidence} — consider additional assessment
              </p>
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Pharmacist Fallback */}
      {fallbackToPharmacist && <PharmacistFallback />}

      {/* Immediate Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Immediate Actions</h2>
        <ActionCardGrid actions={actions} />
      </div>

      {/* Decision Flowchart */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Decision Pathway</h2>
        <GlassPanel className="p-2 md:p-4" intensity="light">
          <div className="h-[400px] md:h-[500px]">
            <DecisionFlowchart nodes={decisionNodes} edges={decisionEdges} />
          </div>
        </GlassPanel>
      </div>

      {/* Drug Protocol Card */}
      {drugProtocol && selectedDrug && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Drug Protocol</h2>
          <DrugReactionCard
            protocol={drugProtocol}
            drugName={selectedDrug.genericName}
          />
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Session Timeline</h2>
          <TimelineStrip events={timeline} />
        </div>
      )}
    </div>
  );
}
