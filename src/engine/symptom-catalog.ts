import type { CTCAEGradeNumber } from '@/types/grading.types';

export interface SymptomDefinition {
  id: string;
  name: string;
  displayName: string;
  baseGrade: CTCAEGradeNumber;
  category: 'dermatologic' | 'respiratory' | 'cardiovascular' | 'systemic' | 'neurologic';
}

export const SYMPTOM_CATALOG: SymptomDefinition[] = [
  // Grade 1 — Mild, transient
  { id: 'flushing', name: 'flushing', displayName: 'Flushing', baseGrade: 1, category: 'dermatologic' },
  { id: 'mild_fever', name: 'mild_fever', displayName: 'Mild Fever (<38°C)', baseGrade: 1, category: 'systemic' },
  { id: 'transient_hypotension', name: 'transient_hypotension', displayName: 'Transient Hypotension', baseGrade: 1, category: 'cardiovascular' },
  { id: 'mild_pruritus', name: 'mild_pruritus', displayName: 'Mild Pruritus', baseGrade: 1, category: 'dermatologic' },
  { id: 'mild_chills', name: 'mild_chills', displayName: 'Mild Chills/Rigors', baseGrade: 1, category: 'systemic' },
  { id: 'mild_rash', name: 'mild_rash', displayName: 'Mild Localized Rash', baseGrade: 1, category: 'dermatologic' },

  // Grade 2 — Moderate, interruption indicated
  { id: 'fever_38plus', name: 'fever_38plus', displayName: 'Fever >38°C', baseGrade: 2, category: 'systemic' },
  { id: 'mild_bronchospasm', name: 'mild_bronchospasm', displayName: 'Mild Bronchospasm', baseGrade: 2, category: 'respiratory' },
  { id: 'dyspnea', name: 'dyspnea', displayName: 'Dyspnea', baseGrade: 2, category: 'respiratory' },
  { id: 'tachycardia', name: 'tachycardia', displayName: 'Tachycardia', baseGrade: 2, category: 'cardiovascular' },
  { id: 'mild_hypotension', name: 'mild_hypotension', displayName: 'Hypotension (Fluid-Responsive)', baseGrade: 2, category: 'cardiovascular' },
  { id: 'urticaria', name: 'urticaria', displayName: 'Urticaria', baseGrade: 2, category: 'dermatologic' },
  { id: 'chest_discomfort', name: 'chest_discomfort', displayName: 'Mild Chest Discomfort', baseGrade: 2, category: 'cardiovascular' },
  { id: 'nausea_vomiting', name: 'nausea_vomiting', displayName: 'Nausea/Vomiting', baseGrade: 2, category: 'systemic' },

  // Grade 3 — Severe, prolonged/recurrent
  { id: 'prolonged_fever', name: 'prolonged_fever', displayName: 'Prolonged/Recurrent Fever', baseGrade: 3, category: 'systemic' },
  { id: 'severe_bronchospasm', name: 'severe_bronchospasm', displayName: 'Significant Bronchospasm/Stridor', baseGrade: 3, category: 'respiratory' },
  { id: 'angioedema', name: 'angioedema', displayName: 'Angioedema', baseGrade: 3, category: 'dermatologic' },
  { id: 'refractory_hypotension', name: 'refractory_hypotension', displayName: 'Refractory Hypotension', baseGrade: 3, category: 'cardiovascular' },
  { id: 'severe_chest_pain', name: 'severe_chest_pain', displayName: 'Severe Chest Pain', baseGrade: 3, category: 'cardiovascular' },

  // Grade 4 — Life-threatening
  { id: 'anaphylaxis_cv', name: 'anaphylaxis_cv', displayName: 'Anaphylaxis w/ CV Collapse', baseGrade: 4, category: 'cardiovascular' },
  { id: 'severe_respiratory', name: 'severe_respiratory', displayName: 'Severe Respiratory Compromise', baseGrade: 4, category: 'respiratory' },
  { id: 'loss_of_consciousness', name: 'loss_of_consciousness', displayName: 'Loss of Consciousness', baseGrade: 4, category: 'neurologic' },
];

export const SYMPTOM_CATEGORIES = [
  { key: 'systemic' as const, label: 'Systemic' },
  { key: 'dermatologic' as const, label: 'Dermatologic' },
  { key: 'respiratory' as const, label: 'Respiratory' },
  { key: 'cardiovascular' as const, label: 'Cardiovascular' },
  { key: 'neurologic' as const, label: 'Neurologic' },
];
