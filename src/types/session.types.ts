import type { CTCAEGradeNumber, SymptomInput, VitalSigns } from './grading.types';

export interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'drug_selected' | 'symptoms_entered' | 'grade_assigned' | 'action_taken' | 'note_added';
  label: string;
  detail?: string;
  grade?: CTCAEGradeNumber;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  drugRxcui: string;
  drugName: string;
  symptoms: SymptomInput[];
  vitalSigns: VitalSigns;
  finalGrade: CTCAEGradeNumber;
  actionsTaken: string[];
  timeline: TimelineEvent[];
  completedAt?: number;
}
