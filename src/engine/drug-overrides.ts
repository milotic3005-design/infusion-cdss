import type { DrugProtocol } from '@/types/reaction.types';

export interface DrugOverrideConfig {
  matchGenericNames: string[];
  protocol: DrugProtocol;
}

const DRUG_OVERRIDES: DrugOverrideConfig[] = [
  {
    matchGenericNames: ['rituximab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 77,
      premeds: [
        { medication: 'Diphenhydramine', dose: '50mg IV/PO', timing: '30 min before infusion' },
        { medication: 'Acetaminophen', dose: '650mg PO', timing: '30 min before infusion' },
        { medication: 'Methylprednisolone', dose: '100mg IV', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'elevated',
      rateAdjustment: {
        grade2: 'Stop infusion. Resume at 50% rate when symptoms resolve.',
        grade3Plus: 'Discontinue infusion. Do not restart.',
      },
      desensitizationAvailable: true,
      specialNotes: [
        '77% incidence of infusion reactions',
        'Most reactions occur during first infusion',
        'Consider 4-drug enhanced premedication protocol',
      ],
    },
  },
  {
    matchGenericNames: ['cetuximab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 15,
      premeds: [
        { medication: 'Diphenhydramine', dose: '50mg IV', timing: '30 min before infusion' },
        { medication: 'Dexamethasone', dose: '10mg IV', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'elevated',
      rateAdjustment: {
        grade2: 'Reduce infusion rate by 50%.',
        grade3Plus: 'Discontinue permanently.',
      },
      desensitizationAvailable: false,
      specialNotes: [
        '90% of severe reactions occur on first infusion',
        'Monitor for 1 hour post-infusion',
        'Can omit antihistamine premedication after first 2 infusions',
      ],
    },
  },
  {
    matchGenericNames: ['pembrolizumab', 'nivolumab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 10,
      premeds: [],
      firstInfusionRisk: 'standard',
      rateAdjustment: {
        grade2: 'Hold infusion. Resume at slower rate after symptom resolution.',
        grade3Plus: 'Discontinue. Consider desensitization for future doses.',
      },
      desensitizationAvailable: true,
      specialNotes: [
        '<10% incidence of infusion reactions',
        'Accelerated infusion protocols available',
        '3-bag 12-step or 1-bag 15-step desensitization available',
      ],
    },
  },
  {
    matchGenericNames: ['trastuzumab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 40,
      premeds: [
        { medication: 'Diphenhydramine', dose: '50mg IV/PO', timing: '30 min before infusion' },
        { medication: 'Acetaminophen', dose: '650mg PO', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'elevated',
      rateAdjustment: {
        grade2: 'Stop infusion. Resume at 50% rate when symptoms resolve.',
        grade3Plus: 'Discontinue. Consider desensitization.',
      },
      desensitizationAvailable: true,
      specialNotes: [
        '40% incidence — most reactions with first infusion',
        'Subsequent infusions can be given over 30 min if first tolerated',
      ],
    },
  },
  {
    matchGenericNames: ['infliximab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 20,
      premeds: [
        { medication: 'Diphenhydramine', dose: '50mg IV', timing: '30 min before infusion' },
        { medication: 'Acetaminophen', dose: '650mg PO', timing: '30 min before infusion' },
        { medication: 'Hydrocortisone', dose: '100mg IV', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'standard',
      rateAdjustment: {
        grade2: 'Stop infusion. Treat symptoms. Resume at lower rate.',
        grade3Plus: 'Discontinue. Do not restart.',
      },
      desensitizationAvailable: true,
      specialNotes: [
        'Anti-drug antibodies increase reaction risk',
        'Check for latent TB before initiating',
      ],
    },
  },
  {
    matchGenericNames: ['bevacizumab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 3,
      premeds: [],
      firstInfusionRisk: 'standard',
      rateAdjustment: {
        grade2: 'Hold infusion. Resume at slower rate.',
        grade3Plus: 'Discontinue.',
      },
      desensitizationAvailable: false,
      specialNotes: [
        '<3% incidence (0.2% severe)',
        'Safe accelerated infusion rates possible',
      ],
    },
  },
  {
    matchGenericNames: ['ipilimumab'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 4,
      premeds: [
        { medication: 'Acetaminophen', dose: '650mg PO', timing: '30 min before infusion' },
        { medication: 'Diphenhydramine', dose: '25-50mg IV/PO', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'standard',
      rateAdjustment: {
        grade2: 'Hold infusion. Treat symptoms. Resume at slower rate.',
        grade3Plus: 'Discontinue.',
      },
      desensitizationAvailable: false,
      specialNotes: [
        '0.6-4.1% incidence — usually drug fever',
        'Safe accelerated infusion rates possible',
      ],
    },
  },
  {
    matchGenericNames: ['paclitaxel'],
    protocol: {
      drugRxcui: '',
      reactionIncidence: 30,
      premeds: [
        { medication: 'Dexamethasone', dose: '20mg IV', timing: '30-60 min before infusion' },
        { medication: 'Diphenhydramine', dose: '50mg IV', timing: '30 min before infusion' },
        { medication: 'Famotidine', dose: '20mg IV', timing: '30 min before infusion' },
      ],
      firstInfusionRisk: 'elevated',
      rateAdjustment: {
        grade2: 'Stop infusion. Treat. Resume at 50% rate.',
        grade3Plus: 'Discontinue. Consider desensitization or switch to nab-paclitaxel.',
      },
      desensitizationAvailable: true,
      specialNotes: [
        'Most reactions within first 10 minutes of first/second cycle',
        'Three-drug premedication is standard',
        'Cremophor EL vehicle is primary allergen',
      ],
    },
  },
];

export function findDrugOverride(
  genericName: string,
  _rxcui?: string
): DrugOverrideConfig | null {
  const normalized = genericName.toLowerCase().trim();
  return (
    DRUG_OVERRIDES.find((override) =>
      override.matchGenericNames.some((name) => normalized.includes(name))
    ) || null
  );
}
