export interface TitrationStep {
  stepNumber: number;
  rateMlHr: number;
  durationMinutes: number;
  triggerCondition: string;
  escalationNote: string;
}

export interface TitrationProtocol {
  id: string;
  drugName: string;
  brandName: string;
  genericName: string;
  indication: string;
  totalDoseMg: number | null;
  diluentVolumeMl: number;
  diluent: string;
  premeds: string;
  steps: TitrationStep[];
}

export interface CompletedStep {
  stepNumber: number;
  rateMlHr: number;
  durationMinutes: number;
  startedAt: number;
  completedAt: number;
}
