import type { VitalSigns } from '@/types/grading.types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VITAL_RANGES = {
  systolicBP: { min: 40, max: 300, unit: 'mmHg' },
  diastolicBP: { min: 20, max: 200, unit: 'mmHg' },
  heartRate: { min: 20, max: 250, unit: 'bpm' },
  temperature: { min: 30, max: 45, unit: '°C' },
  spO2: { min: 50, max: 100, unit: '%' },
  respiratoryRate: { min: 4, max: 60, unit: '/min' },
} as const;

export function validateVitalSigns(vitals: VitalSigns): ValidationResult {
  const errors: string[] = [];

  for (const [key, range] of Object.entries(VITAL_RANGES)) {
    const value = vitals[key as keyof VitalSigns];
    if (value !== undefined && value !== null) {
      if (value < range.min || value > range.max) {
        errors.push(
          `${key}: ${value} is outside valid range (${range.min}–${range.max} ${range.unit})`
        );
      }
    }
  }

  if (
    vitals.systolicBP !== undefined &&
    vitals.diastolicBP !== undefined &&
    vitals.systolicBP <= vitals.diastolicBP
  ) {
    errors.push('Systolic BP must be greater than diastolic BP');
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeDrugSearchInput(input: string): string {
  return input
    .trim()
    .replace(/[<>{}[\]\\]/g, '')
    .slice(0, 100);
}

export function isVitalsProvided(vitals: VitalSigns): boolean {
  return Object.values(vitals).some((v) => v !== undefined && v !== null);
}
