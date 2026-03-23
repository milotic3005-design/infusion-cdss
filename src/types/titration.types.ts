export interface TitrationStep {
  stepNumber: number;
  rateMlHr: number;
  durationMinutes: number;
  triggerCondition: string;
  escalationNote: string;
  /** When present, rate is weight-based (mL/kg/hr). rateMlHr becomes the default for a ~60 kg reference patient. */
  rateMlKgHr?: number;
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
