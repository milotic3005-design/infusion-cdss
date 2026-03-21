import { create } from 'zustand';
import type { DrugInfo } from '@/types/drug.types';
import type { ReactionProfile } from '@/types/reaction.types';
import type { SymptomInput, VitalSigns } from '@/types/grading.types';
import type { DecisionResult } from '@/types/decision.types';
import type { TimelineEvent } from '@/types/session.types';
import { generateId } from '@/lib/utils';

interface SessionState {
  // Data
  selectedDrug: DrugInfo | null;
  reactionProfile: ReactionProfile | null;
  symptoms: SymptomInput[];
  vitalSigns: VitalSigns;
  decisionResult: DecisionResult | null;
  timeline: TimelineEvent[];
  sessionId: string;
  sessionStartedAt: number;

  // Actions
  setDrug: (drug: DrugInfo) => void;
  setReactionProfile: (profile: ReactionProfile) => void;
  setSymptoms: (symptoms: SymptomInput[]) => void;
  toggleSymptom: (symptomId: string) => void;
  updateVitals: (vitals: Partial<VitalSigns>) => void;
  setDecisionResult: (result: DecisionResult) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void;
  resetSession: () => void;
}

const initialVitals: VitalSigns = {};

export const useSessionStore = create<SessionState>((set) => ({
  selectedDrug: null,
  reactionProfile: null,
  symptoms: [],
  vitalSigns: initialVitals,
  decisionResult: null,
  timeline: [],
  sessionId: generateId(),
  sessionStartedAt: Date.now(),

  setDrug: (drug) =>
    set((state) => ({
      selectedDrug: drug,
      timeline: [
        ...state.timeline,
        {
          id: generateId(),
          timestamp: Date.now(),
          type: 'drug_selected' as const,
          label: `Selected ${drug.genericName}`,
        },
      ],
    })),

  setReactionProfile: (profile) => set({ reactionProfile: profile }),

  setSymptoms: (symptoms) => set({ symptoms }),

  toggleSymptom: (symptomId) =>
    set((state) => ({
      symptoms: state.symptoms.map((s) =>
        s.symptomId === symptomId ? { ...s, isPresent: !s.isPresent } : s
      ),
    })),

  updateVitals: (vitals) =>
    set((state) => ({
      vitalSigns: { ...state.vitalSigns, ...vitals },
    })),

  setDecisionResult: (result) =>
    set((state) => ({
      decisionResult: result,
      timeline: [
        ...state.timeline,
        {
          id: generateId(),
          timestamp: Date.now(),
          type: 'grade_assigned' as const,
          label: `Grade ${result.gradingResult.finalGrade.grade} — ${result.gradingResult.finalGrade.label}`,
          grade: result.gradingResult.finalGrade.grade,
        },
      ],
    })),

  addTimelineEvent: (event) =>
    set((state) => ({
      timeline: [
        ...state.timeline,
        { ...event, id: generateId(), timestamp: Date.now() },
      ],
    })),

  resetSession: () =>
    set({
      selectedDrug: null,
      reactionProfile: null,
      symptoms: [],
      vitalSigns: initialVitals,
      decisionResult: null,
      timeline: [],
      sessionId: generateId(),
      sessionStartedAt: Date.now(),
    }),
}));
