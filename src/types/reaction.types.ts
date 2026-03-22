import type { DrugInfo } from './drug.types';

export interface AdverseReaction {
  term: string;
  incidencePercent?: number;
  severity?: string;
  source: 'openfda' | 'dailymed' | 'override';
}

export interface PremedicationProtocol {
  medication: string;
  dose: string;
  timing: string;
}

export interface InfusionRate {
  setting: string;       // e.g., "First infusion", "Subsequent infusions"
  initialRate: string;   // e.g., "50 mg/hr"
  maxRate: string;       // e.g., "400 mg/hr"
  stepUp?: string;       // e.g., "Increase by 50 mg/hr every 30 min"
  duration?: string;     // e.g., "~4.25 hours"
}

export interface DrugProtocol {
  drugRxcui: string;
  reactionIncidence: number;
  premeds: PremedicationProtocol[];
  firstInfusionRisk: 'standard' | 'elevated';
  infusionRates: InfusionRate[];
  rateAdjustment: {
    grade2: string;
    grade3Plus: string;
  };
  desensitizationAvailable: boolean;
  specialNotes: string[];
}

export interface ReactionProfile {
  drug: DrugInfo;
  adverseReactions: AdverseReaction[];
  boxedWarning: string | null;
  warnings: string[];
  protocol: DrugProtocol | null;
  sources: {
    rxnorm: boolean;
    openfda: boolean;
    dailymed: boolean;
  };
  fetchedAt: number;
  cacheKey: string;
}
