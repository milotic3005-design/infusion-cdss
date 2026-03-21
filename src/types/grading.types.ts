export type CTCAEGradeNumber = 1 | 2 | 3 | 4 | 5;

export interface CTCAEGrade {
  grade: CTCAEGradeNumber;
  label: 'Mild' | 'Moderate' | 'Severe' | 'Life-Threatening' | 'Death';
  color: string;
  description: string;
}

export interface SymptomInput {
  symptomId: string;
  symptomName: string;
  baseGrade: CTCAEGradeNumber;
  isPresent: boolean;
  onset?: 'immediate' | 'delayed';
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface VitalSigns {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  temperature?: number;
  spO2?: number;
  respiratoryRate?: number;
}

export interface VitalSignFlag {
  parameter: keyof VitalSigns;
  value: number;
  threshold: string;
  escalatesTo: CTCAEGradeNumber;
}

export interface GradingResult {
  finalGrade: CTCAEGrade;
  contributingSymptoms: SymptomInput[];
  vitalSignFlags: VitalSignFlag[];
  drugOverrideApplied: boolean;
  confidence: 'high' | 'moderate' | 'low';
}
