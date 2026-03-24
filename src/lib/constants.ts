import type { CTCAEGrade, CTCAEGradeNumber } from '@/types/grading.types';

// CTCAE v6.0 Color Semantic System
export const CTCAE_COLORS: Record<CTCAEGradeNumber, string> = {
  1: '#34C759', // System Green
  2: '#FFD60A', // System Yellow
  3: '#FF9F0A', // System Orange
  4: '#FF3B30', // System Red
  5: '#FF3B30', // System Red
};

export const CTCAE_BG_COLORS: Record<CTCAEGradeNumber, string> = {
  1: 'bg-green-50',
  2: 'bg-yellow-50',
  3: 'bg-orange-50',
  4: 'bg-red-50',
  5: 'bg-red-50',
};

export const CTCAE_TEXT_COLORS: Record<CTCAEGradeNumber, string> = {
  1: 'text-green-700',
  2: 'text-yellow-800',
  3: 'text-orange-700',
  4: 'text-red-700',
  5: 'text-red-700',
};

export const CTCAE_BORDER_COLORS: Record<CTCAEGradeNumber, string> = {
  1: 'border-green-300',
  2: 'border-yellow-300',
  3: 'border-orange-300',
  4: 'border-red-400',
  5: 'border-red-400',
};

export const CTCAE_GRADES: Record<CTCAEGradeNumber, CTCAEGrade> = {
  1: {
    grade: 1,
    label: 'Mild',
    color: CTCAE_COLORS[1],
    description: 'Mild, transient reaction — no infusion interruption needed',
  },
  2: {
    grade: 2,
    label: 'Moderate',
    color: CTCAE_COLORS[2],
    description: 'Interruption indicated — responds to symptomatic treatment',
  },
  3: {
    grade: 3,
    label: 'Severe',
    color: CTCAE_COLORS[3],
    description: 'Prolonged or recurrent — hospitalization may be indicated',
  },
  4: {
    grade: 4,
    label: 'Life-Threatening',
    color: CTCAE_COLORS[4],
    description: 'Life-threatening — urgent intervention required',
  },
  5: {
    grade: 5,
    label: 'Death',
    color: CTCAE_COLORS[5],
    description: 'Fatal outcome',
  },
};

// API Base URLs (proxied through Next.js route handlers)
export const API_ROUTES = {
  rxnorm: '/api/rxnorm',
  openfda: '/api/openfda',
  dailymed: '/api/dailymed',
} as const;

// External API base URLs (used in route handlers)
export const EXTERNAL_APIS = {
  rxnorm: 'https://rxnav.nlm.nih.gov/REST',
  openfda: 'https://api.fda.gov/drug/label.json',
  dailymed: 'https://dailymed.nlm.nih.gov/dailymed/services/v2',
} as const;

// Cache TTLs
export const CACHE_TTL = {
  drugSearch: 5 * 60 * 1000,         // 5 minutes
  drugProfile: 30 * 60 * 1000,       // 30 minutes
  indexedDBCommon: 30 * 24 * 60 * 60 * 1000, // 30 days
  indexedDBOther: 7 * 24 * 60 * 60 * 1000,   // 7 days
} as const;

// Top 20 infusion drugs for pre-seeding
export const COMMON_INFUSION_DRUGS = [
  'rituximab', 'cetuximab', 'pembrolizumab', 'nivolumab',
  'infliximab', 'trastuzumab', 'bevacizumab', 'paclitaxel',
  'docetaxel', 'carboplatin', 'cisplatin', 'oxaliplatin',
  'doxorubicin', 'etoposide', 'irinotecan', 'gemcitabine',
  'cyclophosphamide', 'methotrexate', 'ipilimumab', 'atezolizumab',
] as const;

// Debounce delay for drug search input
export const SEARCH_DEBOUNCE_MS = 300;

// Weight conversion — USP standard (exact pharmacopeial value)
export const LBS_PER_KG = 2.20462;

// Vital sign thresholds for grade escalation
export const VITAL_THRESHOLDS = {
  temperature: { grade2: 38.0, grade3: 40.0 },  // CTCAE v5/v6: G1=38–39°C, G2=>39–40°C, G3=>40°C
  heartRate: { grade2: 120, grade3: 150 },
  systolicBP: { grade2: 90, grade3: 70 },  // below these values
  spO2: { grade2: 94, grade3: 88 },        // below these values
  respiratoryRate: { grade2: 24, grade3: 30 },
} as const;
