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
      infusionRates: [
        { setting: 'First infusion', initialRate: '50 mg/hr', maxRate: '400 mg/hr', stepUp: 'Increase by 50 mg/hr every 30 min', duration: '~4.25 hours' },
        { setting: 'Subsequent infusions', initialRate: '100 mg/hr', maxRate: '400 mg/hr', stepUp: 'Increase by 100 mg/hr every 30 min', duration: '~1.5 hours' },
      ],
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
      infusionRates: [
        { setting: 'Loading dose (400 mg/m²)', initialRate: '5 mL/min', maxRate: '5 mL/min', duration: '120 min' },
        { setting: 'Maintenance (250 mg/m²)', initialRate: '5 mL/min', maxRate: '10 mL/min', duration: '60 min' },
      ],
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
      infusionRates: [
        { setting: 'Pembrolizumab 200mg', initialRate: '200 mg over 30 min', maxRate: '200 mg over 30 min', duration: '30 min' },
        { setting: 'Nivolumab 240mg', initialRate: '240 mg over 30 min', maxRate: '240 mg over 30 min', duration: '30 min' },
        { setting: 'Nivolumab 480mg', initialRate: '480 mg over 30 min', maxRate: '480 mg over 30 min', duration: '30 min' },
      ],
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
      infusionRates: [
        { setting: 'Loading dose (4 mg/kg)', initialRate: '4 mg/kg over 90 min', maxRate: '4 mg/kg over 90 min', duration: '90 min' },
        { setting: 'Subsequent (2 mg/kg)', initialRate: '2 mg/kg over 30 min', maxRate: '2 mg/kg over 30 min', duration: '30 min' },
      ],
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
      infusionRates: [
        { setting: 'First infusion', initialRate: '10 mL/hr', maxRate: '150 mL/hr', stepUp: 'Increase by 15–30 mL/hr every 15 min', duration: '~2 hours' },
        { setting: 'Subsequent (if tolerated)', initialRate: '250 mL/hr', maxRate: '250 mL/hr', duration: '~1 hour' },
      ],
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
      infusionRates: [
        { setting: 'First infusion', initialRate: '5 mg/kg over 90 min', maxRate: '5 mg/kg over 90 min', duration: '90 min' },
        { setting: 'Second infusion', initialRate: '5 mg/kg over 60 min', maxRate: '5 mg/kg over 60 min', duration: '60 min' },
        { setting: 'Subsequent (if tolerated)', initialRate: '5 mg/kg over 30 min', maxRate: '5 mg/kg over 30 min', duration: '30 min' },
      ],
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
      infusionRates: [
        { setting: 'Standard', initialRate: '3 mg/kg over 30 min', maxRate: '3 mg/kg over 30 min', duration: '30 min' },
      ],
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
      infusionRates: [
        { setting: 'Standard (175 mg/m²)', initialRate: '~60 mg/m²/hr', maxRate: '~60 mg/m²/hr', duration: '3 hours' },
        { setting: 'Weekly (80 mg/m²)', initialRate: '80 mg/m²/hr', maxRate: '80 mg/m²/hr', duration: '1 hour' },
      ],
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

  // Use exact match or word-boundary prefix to prevent partial-name collisions.
  // e.g. "nab-paclitaxel" must NOT match the "paclitaxel" override (different reaction profile).
  // e.g. "trastuzumab pertuzumab" (Phesgo) must NOT match "trastuzumab" alone.
  const isExactOrPrefixMatch = (candidate: string): boolean => {
    if (normalized === candidate) return true;
    // Allow "rituximab-pvvr" biosimilar variants that start with the INN
    if (normalized.startsWith(candidate + '-')) return true;
    return false;
  };

  return (
    DRUG_OVERRIDES.find((override) =>
      override.matchGenericNames.some(isExactOrPrefixMatch)
    ) || null
  );
}
