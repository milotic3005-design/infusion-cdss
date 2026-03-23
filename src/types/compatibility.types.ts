export interface CompatibilityDrug {
  id: string;
  name: string;
  genericName: string;
  aliases: string[];
  rxcui?: string;
  rxnormName?: string;
}

export type CompatibilityResult = 'C' | 'I' | 'U' | 'N';

export interface CompatibilityPair {
  drugA: string;
  drugB: string;
  result: CompatibilityResult;
  concentrationA: string;
  concentrationB: string;
  diluent: string;
  method: string;
  notes: string;
  references: string[];
}

export interface CompatibilityData {
  meta: {
    classificationKey: Record<string, string>;
    source: string;
    version: string;
    lastUpdated: string;
  };
  drugs: CompatibilityDrug[];
  pairs: CompatibilityPair[];
}

export interface ResultColorConfig {
  bg: string;
  text: string;
  label: string;
  description: string;
}
