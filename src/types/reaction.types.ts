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

export interface DrugProtocol {
  drugRxcui: string;
  reactionIncidence: number;
  premeds: PremedicationProtocol[];
  firstInfusionRisk: 'standard' | 'elevated';
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
