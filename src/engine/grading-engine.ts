import type {
  CTCAEGradeNumber,
  CTCAEGrade,
  SymptomInput,
  VitalSigns,
  VitalSignFlag,
  GradingResult,
} from '@/types/grading.types';
import type { DrugProtocol } from '@/types/reaction.types';
import { CTCAE_GRADES, VITAL_THRESHOLDS } from '@/lib/constants';
import { isVitalsProvided } from '@/lib/validators';

/**
 * Core grading algorithm — maps symptoms and vital signs to CTCAE Grade 1-5.
 *
 * Algorithm:
 * 1. Take max base grade from all present symptoms
 * 2. Check vital signs against thresholds (can only escalate, never downgrade)
 * 3. Final grade = max(symptom grade, vital sign grade)
 * 4. Apply drug-specific overrides if applicable
 */
export function computeGrade(
  symptoms: SymptomInput[],
  vitals: VitalSigns,
  drugOverrides: DrugProtocol | null
): GradingResult {
  const presentSymptoms = symptoms.filter((s) => s.isPresent);

  // Step 1: Symptom max-grade
  let symptomMaxGrade: CTCAEGradeNumber = 1;
  for (const symptom of presentSymptoms) {
    if (symptom.baseGrade > symptomMaxGrade) {
      symptomMaxGrade = symptom.baseGrade;
    }
  }

  // Step 2: Vital sign escalation
  const vitalFlags: VitalSignFlag[] = [];
  let vitalMaxGrade: CTCAEGradeNumber = 1;

  if (vitals.temperature !== undefined) {
    if (vitals.temperature > VITAL_THRESHOLDS.temperature.grade3) {
      // CTCAE Grade 3: >40.0°C
      vitalFlags.push({ parameter: 'temperature', value: vitals.temperature, threshold: '>40°C', escalatesTo: 3 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 3) as CTCAEGradeNumber;
    } else if (vitals.temperature >= VITAL_THRESHOLDS.temperature.grade2) {
      // CTCAE Grade 2: ≥38.0°C (inclusive per CTCAE v5/v6 fever definition)
      vitalFlags.push({ parameter: 'temperature', value: vitals.temperature, threshold: '≥38°C', escalatesTo: 2 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 2) as CTCAEGradeNumber;
    }
  }

  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate > VITAL_THRESHOLDS.heartRate.grade3) {
      vitalFlags.push({ parameter: 'heartRate', value: vitals.heartRate, threshold: '>150 bpm', escalatesTo: 3 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 3) as CTCAEGradeNumber;
    } else if (vitals.heartRate > VITAL_THRESHOLDS.heartRate.grade2) {
      vitalFlags.push({ parameter: 'heartRate', value: vitals.heartRate, threshold: '>120 bpm', escalatesTo: 2 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 2) as CTCAEGradeNumber;
    }
  }

  if (vitals.systolicBP !== undefined) {
    if (vitals.systolicBP < VITAL_THRESHOLDS.systolicBP.grade3) {
      vitalFlags.push({ parameter: 'systolicBP', value: vitals.systolicBP, threshold: '<70 mmHg', escalatesTo: 3 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 3) as CTCAEGradeNumber;
    } else if (vitals.systolicBP < VITAL_THRESHOLDS.systolicBP.grade2) {
      vitalFlags.push({ parameter: 'systolicBP', value: vitals.systolicBP, threshold: '<90 mmHg', escalatesTo: 2 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 2) as CTCAEGradeNumber;
    }
  }

  if (vitals.spO2 !== undefined) {
    if (vitals.spO2 < VITAL_THRESHOLDS.spO2.grade3) {
      vitalFlags.push({ parameter: 'spO2', value: vitals.spO2, threshold: '<88%', escalatesTo: 3 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 3) as CTCAEGradeNumber;
    } else if (vitals.spO2 < VITAL_THRESHOLDS.spO2.grade2) {
      vitalFlags.push({ parameter: 'spO2', value: vitals.spO2, threshold: '<94%', escalatesTo: 2 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 2) as CTCAEGradeNumber;
    }
  }

  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > VITAL_THRESHOLDS.respiratoryRate.grade3) {
      vitalFlags.push({ parameter: 'respiratoryRate', value: vitals.respiratoryRate, threshold: '>30/min', escalatesTo: 3 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 3) as CTCAEGradeNumber;
    } else if (vitals.respiratoryRate > VITAL_THRESHOLDS.respiratoryRate.grade2) {
      vitalFlags.push({ parameter: 'respiratoryRate', value: vitals.respiratoryRate, threshold: '>24/min', escalatesTo: 2 });
      vitalMaxGrade = Math.max(vitalMaxGrade, 2) as CTCAEGradeNumber;
    }
  }

  // Step 3: Combined grade
  let finalGradeNumber = Math.max(symptomMaxGrade, vitalMaxGrade) as CTCAEGradeNumber;

  // Step 4: Drug-specific flag (informational only — does not alter CTCAE grade)
  // The drug's firstInfusionRisk is surfaced in the protocol recommendations,
  // but the computed grade must reflect actual symptom severity per CTCAE v6.0.
  const drugOverrideApplied = false;

  // Clamp to valid range
  finalGradeNumber = Math.min(Math.max(finalGradeNumber, 1), 5) as CTCAEGradeNumber;

  // Step 5: Confidence score
  const hasVitals = isVitalsProvided(vitals);
  let confidence: 'high' | 'moderate' | 'low';
  if (presentSymptoms.length >= 3 && hasVitals) {
    confidence = 'high';
  } else if (presentSymptoms.length >= 1 || hasVitals) {
    confidence = 'moderate';
  } else {
    confidence = 'low';
  }

  const finalGrade: CTCAEGrade = CTCAE_GRADES[finalGradeNumber];

  return {
    finalGrade,
    contributingSymptoms: presentSymptoms,
    vitalSignFlags: vitalFlags,
    drugOverrideApplied,
    confidence,
  };
}
