import type { CTCAEGradeNumber } from './grading.types';
import type { DrugProtocol } from './reaction.types';
import type { GradingResult } from './grading.types';

export interface DecisionNodeData {
  id: string;
  type: 'assessment' | 'action' | 'branch' | 'terminal';
  label: string;
  description?: string;
  icon?: string;
  grade?: CTCAEGradeNumber;
  isHighlighted: boolean;
}

export interface DecisionEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated: boolean;
}

export interface ActionStep {
  id: string;
  order: number;
  action: string;
  detail: string;
  icon: string;
  urgency: 'immediate' | 'soon' | 'monitor';
  grade: CTCAEGradeNumber;
}

export interface DecisionResult {
  gradingResult: GradingResult;
  actions: ActionStep[];
  decisionNodes: DecisionNodeData[];
  decisionEdges: DecisionEdgeData[];
  drugProtocol: DrugProtocol | null;
  fallbackToPharmacist: boolean;
  generatedAt: number;
}
