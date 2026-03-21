'use client';

import { useMemo } from 'react';
import { useSessionStore } from '@/store/session.store';
import { computeGrade } from '@/engine/grading-engine';
import { buildDecisionResult } from '@/engine/decision-tree-builder';
import type { DecisionResult } from '@/types/decision.types';

export function useDecisionEngine(): DecisionResult | null {
  const symptoms = useSessionStore((s) => s.symptoms);
  const vitalSigns = useSessionStore((s) => s.vitalSigns);
  const reactionProfile = useSessionStore((s) => s.reactionProfile);

  return useMemo(() => {
    const presentSymptoms = symptoms.filter((s) => s.isPresent);
    if (presentSymptoms.length === 0) return null;

    const protocol = reactionProfile?.protocol ?? null;
    const gradingResult = computeGrade(symptoms, vitalSigns, protocol);
    return buildDecisionResult(gradingResult, reactionProfile);
  }, [symptoms, vitalSigns, reactionProfile]);
}
