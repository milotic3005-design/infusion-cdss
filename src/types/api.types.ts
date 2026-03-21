// Raw RxNorm API response shapes
export interface RxNormDrugResponse {
  drugGroup: {
    name: string;
    conceptGroup?: Array<{
      tty: string;
      conceptProperties?: Array<{
        rxcui: string;
        name: string;
        synonym?: string;
        tty: string;
        language: string;
        suppress: string;
      }>;
    }>;
  };
}

export interface RxNormRelatedResponse {
  relatedGroup: {
    rxcui: string;
    conceptGroup: Array<{
      tty: string;
      conceptProperties?: Array<{
        rxcui: string;
        name: string;
        tty: string;
      }>;
    }>;
  };
}

export interface RxClassResponse {
  rxclassDrugInfoList?: {
    rxclassDrugInfo: Array<{
      rxclassMinConceptItem: {
        classId: string;
        className: string;
        classType: string;
      };
      minConcept: {
        rxcui: string;
        name: string;
        tty: string;
      };
    }>;
  };
}

export interface RxInteractionResponse {
  interactionTypeGroup?: Array<{
    interactionType: Array<{
      interactionPair: Array<{
        severity: string;
        description: string;
        interactionConcept: Array<{
          minConceptItem: {
            rxcui: string;
            name: string;
            tty: string;
          };
        }>;
      }>;
    }>;
  }>;
}

// Raw openFDA API response shape
export interface OpenFDALabelResponse {
  meta: {
    results: { skip: number; limit: number; total: number };
  };
  results: Array<{
    adverse_reactions?: string[];
    boxed_warning?: string[];
    warnings?: string[];
    warnings_and_cautions?: string[];
    dosage_and_administration?: string[];
    indications_and_usage?: string[];
    openfda: {
      brand_name?: string[];
      generic_name?: string[];
      route?: string[];
      rxcui?: string[];
    };
  }>;
}

// Raw DailyMed API response shape
export interface DailyMedSPLListResponse {
  metadata: {
    db_published_date: string;
    total_elements: number;
    total_pages: number;
  };
  data: Array<{
    spl_version: number;
    published_date: string;
    title: string;
    setid: string;
  }>;
}
