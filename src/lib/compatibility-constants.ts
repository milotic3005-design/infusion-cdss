import type { ResultColorConfig } from '@/types/compatibility.types';

// Matcha-themed compatibility result colors
export const RESULT_COLORS: Record<string, ResultColorConfig> = {
  C: {
    bg: 'bg-[#4E6F4E]',
    text: 'text-white',
    label: 'Compatible',
    description: 'These drugs may be co-administered via Y-site at the tested concentrations.',
  },
  I: {
    bg: 'bg-red-700',
    text: 'text-white',
    label: 'Incompatible',
    description: 'Do NOT co-administer via Y-site. Precipitation, color change, or degradation observed.',
  },
  U: {
    bg: 'bg-yellow-500',
    text: 'text-black',
    label: 'Conditional',
    description: 'Compatibility depends on specific conditions. Review notes carefully before administration.',
  },
  N: {
    bg: 'bg-gray-500',
    text: 'text-white',
    label: 'No Data',
    description: 'No compatibility data found for this pair. Consult pharmacist before Y-site administration.',
  },
};

export const COMPAT_STORAGE_KEYS = {
  COMPATIBILITY_LAST_RESULT: 'oic-cdss:compatibility:lastResult',
  TITRATION_STATE: 'oic-cdss:titration:state',
};

export const MAX_STATE_AGE_MS = 24 * 60 * 60 * 1000;

export const TIMER_ANNOUNCE_THRESHOLDS = [300, 240, 180, 120, 60, 30, 10, 5, 4, 3, 2, 1, 0];

export const SEARCH_MIN_CHARS = 2;
export const COMPAT_SEARCH_DEBOUNCE_MS = 250;
