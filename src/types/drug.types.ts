export interface RxNormConcept {
  rxcui: string;
  name: string;
  tty: string; // SBD, SCD, IN, etc.
  synonym?: string;
}

export interface DrugClass {
  classId: string;
  className: string;
  classType: string; // 'ATC' | 'EPC' | 'MOA' | 'PE'
}

export interface DrugInteraction {
  rxcui: string;
  drugName: string;
  description: string;
  severity: 'high' | 'moderate' | 'low';
}

export interface DrugInfo {
  rxcui: string;
  genericName: string;
  brandNames: string[];
  drugClasses: DrugClass[];
  interactions: DrugInteraction[];
  route: string;
  dosageForm: string;
}
