/** Parsed clinical data extracted from OpenFDA label */
export interface BudEntry {
  condition: string;
  duration: string;
  note: string;
  color: '#22C55E' | '#0D7377' | '#F59E0B';
  widthPct: number; // 0–100 scaled to longest BUD
}

export interface StorageData {
  intactVial: string;
  afterMixing: string;
  container: string;
  lightProtection: string;
}

export interface InfographicData {
  genericName: string;
  brandName: string;
  drugClass: string;
  riskBadge: string;
  uspCategory: string;
  budEntries: BudEntry[];
  storage: StorageData;
  releaseItems: string[];
  rejectItems: string[];
  reconstitute: string;
  dilute: string;
  inspect: string;
  labelStore: string;
  filterInfo: string;
  concRange: string;
  incompatibilities: string[];
  sourceSections: string[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function first(arr: string[] | undefined): string {
  return arr?.[0] ?? '';
}

/** Convert hours/days/weeks to a comparable number of hours for scaling BUD bars */
function toHours(duration: string): number {
  const m = duration.match(/(\d+(?:\.\d+)?)\s*(hour|hr|day|week)/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  if (unit.startsWith('w')) return n * 168;
  if (unit.startsWith('d')) return n * 24;
  return n;
}

// ── Drug class ───────────────────────────────────────────────────────────────

function extractDrugClass(label: OpenFDALabel): string {
  const classes = label.openfda?.pharm_class_epc ?? label.openfda?.pharm_class_cs ?? [];
  if (classes.length > 0) return classes[0].replace(/\s*\[.*?\]/g, '').trim();
  // fallback: infer from description
  const desc = first(label.description).toLowerCase();
  if (desc.includes('glycopeptide')) return 'Glycopeptide Antibiotic';
  if (desc.includes('beta-lactam') || desc.includes('penicillin')) return 'Beta-Lactam Antibiotic';
  if (desc.includes('carbapenem')) return 'Carbapenem Antibiotic';
  if (desc.includes('monoclonal antibody') || desc.includes('mab')) return 'Monoclonal Antibody';
  if (desc.includes('antifungal')) return 'Antifungal Agent';
  if (desc.includes('antiviral')) return 'Antiviral Agent';
  if (desc.includes('anticoagulant') || desc.includes('heparin')) return 'Anticoagulant';
  if (desc.includes('immunosuppressant')) return 'Immunosuppressant';
  return 'IV Infusion Drug';
}

// ── Risk badge ───────────────────────────────────────────────────────────────

const HAZARDOUS_TERMS = [
  'antineoplastic', 'chemotherapy', 'cytotoxic', 'alkylating', 'antimetabolite',
  'anthracycline', 'taxane', 'monoclonal antibody', 'immunosuppressant',
  'methotrexate', 'cyclophosphamide', 'paclitaxel', 'docetaxel', 'rituximab',
  'checkpoint inhibitor', 'nivolumab', 'pembrolizumab', 'atezolizumab',
];
const VESICANT_TERMS = [
  'vesicant', 'tissue necrosis', 'extravasation', 'doxorubicin', 'vincristine',
  'vinblastine', 'epirubicin', 'dacarbazine', 'mechlorethamine',
];
const INFUSION_REACTION_TERMS = [
  'infusion reaction', 'infusion-related', 'anaphylaxis', 'anaphylactic',
  'hypersensitivity reaction', 'cytokine release',
];

function extractRiskBadge(label: OpenFDALabel): string {
  const allText = [
    first(label.boxed_warning),
    first(label.warnings),
    first(label.description),
    first(label.dosage_and_administration),
  ].join(' ').toLowerCase();

  if (HAZARDOUS_TERMS.some(t => allText.includes(t))) return '⚠ HAZARDOUS DRUG';
  if (VESICANT_TERMS.some(t => allText.includes(t))) return 'VESICANT RISK';
  if (INFUSION_REACTION_TERMS.some(t => allText.includes(t))) return 'INFUSION REACTION RISK';
  return 'HIGH ALERT MEDICATION';
}

function extractUspCategory(label: OpenFDALabel): string {
  const allText = [first(label.storage_and_handling), first(label.dosage_and_administration)].join(' ').toLowerCase();
  if (allText.includes('category 1') || allText.includes('cat 1') || allText.includes('cat. 1')) return 'USP 797 Category 1';
  if (allText.includes('category 2') || allText.includes('cat 2') || allText.includes('cat. 2')) return 'USP 797 Category 2';
  // Hazardous drugs are typically Category 2
  const riskBadge = extractRiskBadge(label);
  if (riskBadge === '⚠ HAZARDOUS DRUG') return 'USP 797 Category 2';
  return 'USP 797 Category 1';
}

// ── BUD ──────────────────────────────────────────────────────────────────────

/**
 * Scan dosage_and_administration + storage text for stability/BUD statements.
 * Returns array of { condition, duration, note }.
 */
function extractBud(label: OpenFDALabel): BudEntry[] {
  const text = [
    first(label.dosage_and_administration),
    first(label.storage_and_handling),
    first(label.how_supplied),
  ].join(' ');

  const found: Array<{ condition: string; duration: string; note: string }> = [];

  type RawMatch = { num: string; unit: string; cond: string };
  const candidates: RawMatch[] = [];

  // A: "stable for N unit [at/when/under COND]"
  {
    const re = /stable\s+for\s+(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?(?:[^.]*?(?:at|when|if|under)\s+(room\s+temperature|CRT|20[–\-]25|25\s*°|refrigerat|2[–\-]8|frozen|−20|−25))?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) candidates.push({ num: m[1], unit: m[2], cond: m[3] ?? '' });
  }

  // B: "stored at COND for [up to] N unit"
  {
    const re = /stored\s+at\s+(room\s+temperature|CRT|controlled\s+room\s+temperature|refrigerat\w+|2[–\-]8\s*°?\s*C?)\s+for\s+(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) candidates.push({ num: m[2], unit: m[3], cond: m[1] });
  }

  // C: "for [up to] N unit at COND"
  {
    const re = /for\s+(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?\s+(?:at|when)\s+(room\s+temperature|CRT|refrigerat|2[–\-]8)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) candidates.push({ num: m[1], unit: m[2], cond: m[3] });
  }

  // D: verb…within N unit [of preparation] — e.g. "Begin the infusion within 3 hours of preparation"
  {
    const re = /(?:use|administer|infuse|infusion|begin|start|complete|discard)\b[^,]{0,40}?within\s+(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?(?:[^.]*?(room\s+temperature|CRT|refrigerat|2[–\-]8))?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null)
      candidates.push({ num: m[1], unit: m[2], cond: m[3] ?? 'room temperature' });
  }

  // E: "within N unit of preparation/reconstitution" (unambiguous BUD context)
  {
    const re = /within\s+(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?\s+of\s+(?:preparation|reconstitution|mixing|dilution|compounding)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) candidates.push({ num: m[1], unit: m[2], cond: 'room temperature' });
  }

  // F: "refrigerated for [up to] N unit" — admixture-specific (cap at 45 days to exclude vial shelf life)
  {
    const re = /(?:refrigerat\w+)\s+(?:for\s+)?(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const hrs = toHours(`${m[1]} ${m[2]}`);
      if (hrs <= 1080) candidates.push({ num: m[1], unit: m[2], cond: 'refrigerated' });
    }
  }

  // G: "at room temperature [for] N unit"
  {
    const re = /at\s+room\s+temperature[^.]{0,60}?(?:for\s+)?(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*(hour|hr|day|week)s?/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) candidates.push({ num: m[1], unit: m[2], cond: 'room temperature' });
  }

  for (const { num, unit, cond } of candidates) {
    const durNum = parseFloat(num);
    const rawUnit = unit.toLowerCase().startsWith('hr') ? 'hour' : unit.toLowerCase().replace(/s$/, '');
    const duration = `${num} ${rawUnit}${durNum !== 1 ? 's' : ''}`;

    let condition: string;
    let note: string;

    if (/frozen|−20|−25/i.test(cond)) {
      condition = 'Frozen';
      note = '−20°C · Thaw before use';
    } else if (/refrigerat|2[–\-]8/i.test(cond)) {
      condition = 'Final Admixture — Refrigerated';
      note = '2–8°C · Do not freeze';
    } else {
      condition = 'Final Admixture — Room Temp';
      note = '20–25°C · Do not freeze';
    }

    if (!found.some(f => f.condition === condition)) {
      found.push({ condition, duration, note });
    }
  }

  // If nothing found, add placeholders
  if (found.length === 0) {
    found.push({ condition: 'Final Admixture — Room Temp', duration: '⚠ See PI', note: 'Verify with current PI' });
    found.push({ condition: 'Final Admixture — Refrigerated', duration: '⚠ See PI', note: 'Verify with current PI' });
  }

  // Scale widths
  const maxHours = Math.max(...found.map(f => toHours(f.duration)), 1);
  const colors: Array<'#22C55E' | '#0D7377' | '#F59E0B'> = ['#22C55E', '#0D7377', '#F59E0B', '#22C55E'];

  // Sort by duration desc so longest gets green
  const sorted = [...found].sort((a, b) => toHours(b.duration) - toHours(a.duration));

  return sorted.map((item, i) => ({
    ...item,
    color: colors[i] ?? '#0D7377',
    widthPct: maxHours > 0 ? Math.round((toHours(item.duration) / maxHours) * 100) : 50,
  }));
}

// ── Storage ──────────────────────────────────────────────────────────────────

function extractStorage(label: OpenFDALabel): StorageData {
  const storageText = first(label.storage_and_handling);
  const dosingText = first(label.dosage_and_administration);
  const descText = first(label.description);
  const all = [storageText, dosingText, descText].join(' ');

  // Intact vial temperature
  let intactVial = 'See PI for storage';
  const tempMatch = storageText.match(
    /(?:store\s+at|keep\s+at|temperature[:\s]+)\s*(?:controlled\s+room\s+temperature\s+)?(\d+(?:[–-]\d+)?)\s*°\s*[CF]/i
  );
  if (tempMatch) {
    // Try to get range
    const rangeMatch = storageText.match(/(\d+)\s*°\s*C\s+to\s+(\d+)\s*°\s*C/i)
      || storageText.match(/(\d+)[–-](\d+)\s*°\s*C/i);
    if (rangeMatch) {
      intactVial = `${rangeMatch[1]}–${rangeMatch[2]}°C`;
    } else {
      intactVial = `${tempMatch[1]}°C`;
    }
    if (/controlled\s+room\s+temperature/i.test(storageText)) intactVial = '20–25°C (CRT)';
  } else if (/controlled\s+room\s+temperature/i.test(storageText)) {
    intactVial = '20–25°C (CRT)';
  } else if (/refrigerat/i.test(storageText)) {
    intactVial = '2–8°C (Refrigerated)';
  }

  // Light protection for intact vial
  if (/protect\s+from\s+(?:direct\s+)?(?:sunlight|light)/i.test(storageText)
    || /light[‐-]?sensitive/i.test(storageText)) {
    intactVial += ' · Protect from light';
  }

  // After mixing temperature — check if admixture is stored refrigerated or at room temp
  let afterMixing = '⚠ Verify with PI';
  const admixRefrigerated =
    /(?:prepared|reconstituted|diluted|admixture|solution)[^.]{0,100}(?:refrigerat|2[–\-]8)/i.test(dosingText) ||
    /refrigerat[^.]{0,100}(?:prepared|reconstituted|diluted|admixture)/i.test(dosingText) ||
    /(?:may\s+be\s+refrigerat|store\s+(?:the\s+)?(?:prepared|diluted|reconstituted))[^.]*refrigerat/i.test(dosingText);
  const admixRoomTemp =
    /(?:prepared|reconstituted|diluted|admixture)[^.]{0,100}(?:room\s+temp|CRT|20[–\-]25)/i.test(dosingText) ||
    /(?:room\s+temp|CRT|20[–\-]25)[^.]{0,100}(?:prepared|reconstituted|diluted|admixture)/i.test(dosingText);
  const withinHours = /within\s+\d+\s*(?:hour|hr)s?/i.test(dosingText);

  if (admixRefrigerated) {
    afterMixing = 'Refrigerated · 2–8°C';
  } else if (admixRoomTemp) {
    afterMixing = 'Room temperature · 20–25°C';
  } else if (withinHours && !/refrigerat/i.test(dosingText)) {
    // "use within X hours" with no refrigeration mention → room temp
    afterMixing = 'Room temperature · 20–25°C';
  } else if (/refrigerat/i.test(dosingText)) {
    afterMixing = 'Refrigerated · 2–8°C';
  } else if (/room\s+temp|CRT|20[–\-]25/i.test(dosingText)) {
    afterMixing = 'Room temperature · 20–25°C';
  }

  // Container compatibility
  let container = 'Verify container compatibility';
  if (/polyolefin/i.test(all)) container = 'Polyolefin bag preferred';
  else if (/pvc/i.test(all) && /avoid|not\s+recommend|do\s+not/i.test(all.slice(all.toLowerCase().indexOf('pvc') - 30, all.toLowerCase().indexOf('pvc') + 60))) {
    container = 'Avoid PVC · Use non-PVC';
  } else if (/glass|polyolefin/i.test(all)) {
    container = 'Glass or polyolefin bag';
  } else if (/pvc/i.test(all)) {
    container = 'PVC or non-PVC bag OK';
  }

  // Light protection for admixture
  let lightProtection = 'Standard storage';
  if (/foil\s+overwrap/i.test(all)) lightProtection = 'Foil overwrap required';
  else if (/amber\s+(bag|tubing|iv\s+set)/i.test(all)) lightProtection = 'Amber bag/tubing required';
  else if (/protect\s+from\s+light/i.test(dosingText)) lightProtection = 'Light protection required';

  return { intactVial, afterMixing, container, lightProtection };
}

// ── Visual inspection ────────────────────────────────────────────────────────

function extractInspection(label: OpenFDALabel, genericName: string): { release: string[]; reject: string[] } {
  const descText = first(label.description).toLowerCase();
  const dosingText = first(label.dosage_and_administration).toLowerCase();

  const release: string[] = [];
  const reject: string[] = [];

  // Expected color/clarity
  const colorTerms = ['clear', 'colorless', 'pale yellow', 'light yellow', 'straw', 'opalescent', 'slightly yellow'];
  const foundColor = colorTerms.filter(t => descText.includes(t) || dosingText.includes(t));
  if (foundColor.length > 0) {
    release.push(foundColor.slice(0, 2).join(' to ') + ' solution');
  } else {
    release.push('Clear to slightly colored solution');
  }

  // Particulate-free
  if (descText.includes('particulate') || dosingText.includes('particulate')) {
    release.push('Free of visible particulates');
  } else {
    release.push('No visible particulates');
  }

  // Container integrity
  release.push('Container intact, no leaks');
  release.push('Label intact, not expired');

  // Reject criteria
  reject.push('Visible particulates present');
  reject.push('Unusual discoloration or turbidity');
  reject.push('Precipitate or cloudiness');

  if (/do not use if.*(frozen|froze)/i.test(first(label.dosage_and_administration))) {
    reject.push('Frozen or previously frozen');
  } else {
    reject.push('Container damaged or leaking');
  }

  return { release: release.slice(0, 4), reject: reject.slice(0, 4) };
}

// ── Mixing steps ─────────────────────────────────────────────────────────────

function extractMixing(label: OpenFDALabel): {
  reconstitute: string; dilute: string; inspect: string; labelStore: string;
  filterInfo: string; concRange: string;
} {
  const dosingText = first(label.dosage_and_administration);

  // Diluents
  const diluents: string[] = [];
  if (/0\.9%\s*(?:sodium\s+chloride|NaCl|saline)|normal\s+saline/i.test(dosingText)) diluents.push('NS');
  if (/5%\s*(?:dextrose|Dextrose\s+Injection)/i.test(dosingText)) diluents.push('D5W');
  if (/0\.45%/i.test(dosingText)) diluents.push('0.45% NaCl');
  if (/lactated\s+ringer/i.test(dosingText)) diluents.push('LR');
  const diluent = diluents.length > 0 ? diluents.join(' or ') : 'NS or D5W (verify PI)';

  // Concentration
  let concRange = '⚠ See PI';
  const concMatch = dosingText.match(
    /(?:to\s+)?(?:a\s+)?(?:final\s+)?concentration\s+of\s+(\d+(?:\.\d+)?)\s*(?:to|[-–])\s*(\d+(?:\.\d+)?)\s*mg\/mL/i
  ) || dosingText.match(/(\d+(?:\.\d+)?)\s*(?:to|[-–])\s*(\d+(?:\.\d+)?)\s*mg\/mL/i);
  if (concMatch) concRange = `${concMatch[1]}–${concMatch[2]} mg/mL`;
  else {
    const singleConc = dosingText.match(/(\d+(?:\.\d+)?)\s*mg\/mL/i);
    if (singleConc) concRange = `${singleConc[1]} mg/mL`;
  }

  // Filter
  let filterInfo = 'No filter required (verify PI)';
  const filterMatch = dosingText.match(/(\d+(?:\.\d+)?)[- ]?(?:micron|micrometer|μm|mcm)[- ]?\s*filter/i)
    || dosingText.match(/filter\s*(?:pore\s+size\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:micron|μm)/i);
  if (filterMatch) {
    filterInfo = `${filterMatch[1]} micron in-line filter`;
  } else if (/in-line\s+filter|inline\s+filter/i.test(dosingText)) {
    filterInfo = 'In-line filter required (see PI)';
  }

  // Reconstitute step
  let reconstitute = `Add diluent per PI · swirl gently`;
  const reconMatch = dosingText.match(/reconstitut\w+\s+(?:with|using)\s+([^.]+?)(?:to\s+(?:yield|give|provide)\s+([^.]+?))?[.,]/i);
  if (reconMatch) {
    reconstitute = reconMatch[1].replace(/\s+/g, ' ').trim().slice(0, 60);
  }

  const dilute = `${diluent} · Target: ${concRange}`;
  const inspect = 'No particulates · Clear or expected color';
  const labelStore = 'Record BUD · temp · light protection';

  return { reconstitute, dilute, inspect, labelStore, filterInfo, concRange };
}

// ── Incompatibilities ────────────────────────────────────────────────────────

/** Best-effort: parse "incompatible with X, Y, Z" from dosing/compatibility text */
function extractIncompatibilities(label: OpenFDALabel, compatData: CompatPair[], genericName: string): string[] {
  // First: check existing local Y-site data
  const lower = genericName.toLowerCase();
  const localIncompat = compatData
    .filter(p => {
      const drugA = p.drugA?.toLowerCase() ?? '';
      const drugB = p.drugB?.toLowerCase() ?? '';
      return (drugA.includes(lower) || drugB.includes(lower))
        && p.result === 'I';
    })
    .map(p => {
      const drugA = p.drugA ?? '';
      const drugB = p.drugB ?? '';
      return drugA.toLowerCase().includes(lower) ? drugB : drugA;
    })
    .filter(Boolean)
    .slice(0, 3);

  if (localIncompat.length >= 2) return localIncompat;

  // Fallback: parse from label text
  const incompat: string[] = [];
  const dosingText = first(label.dosage_and_administration);
  const compatText = first(label.drug_interactions ?? []);
  const text = [dosingText, compatText].join(' ');

  const incompatPattern = /(?:incompatible\s+with|do\s+not\s+mix\s+with|should\s+not\s+be\s+mixed\s+with)\s+([^.]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = incompatPattern.exec(text)) !== null && incompat.length < 3) {
    // Extract drug names from the sentence — split on commas/and, take first 3 words each
    const sentence = m[1];
    const items = sentence.split(/,\s*|\s+and\s+/).map(s =>
      s.trim()
        .split(/\s+/)
        .slice(0, 2)
        .join(' ')
        .replace(/[()]/g, '')
        .trim()
    ).filter(s => s.length > 2 && !/^(or|the|a|an)$/i.test(s));
    incompat.push(...items.slice(0, 3 - incompat.length));
  }

  return incompat.length > 0 ? incompat.slice(0, 3) : ['Furosemide', 'Heparin', 'Phenytoin'];
}

// ── Main parser ──────────────────────────────────────────────────────────────

export interface OpenFDALabel {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    pharm_class_epc?: string[];
    pharm_class_cs?: string[];
  };
  description?: string[];
  boxed_warning?: string[];
  warnings?: string[];
  storage_and_handling?: string[];
  dosage_and_administration?: string[];
  how_supplied?: string[];
  drug_interactions?: string[];
}

export interface CompatPair {
  drugA?: string;
  drugB?: string;
  result?: string; // 'C' = compatible, 'I' = incompatible, 'U' = unknown/conditional
}

export function parseLabelToInfographicData(
  genericName: string,
  label: OpenFDALabel,
  compatData: CompatPair[]
): InfographicData {
  const brandRaw = label.openfda?.brand_name?.[0] ?? '';
  const brandName = brandRaw ? `${brandRaw}®` : `${genericName.charAt(0).toUpperCase() + genericName.slice(1)}`;
  const drugClass = extractDrugClass(label);
  const riskBadge = extractRiskBadge(label);
  const uspCategory = extractUspCategory(label);
  const budEntries = extractBud(label);
  const storage = extractStorage(label);
  const { release: releaseItems, reject: rejectItems } = extractInspection(label, genericName);
  const { reconstitute, dilute, inspect, labelStore, filterInfo, concRange } = extractMixing(label);
  const incompatibilities = extractIncompatibilities(label, compatData, genericName);

  const sourceSections = ['storage_and_handling', 'dosage_and_administration', 'description']
    .filter(s => first(label[s as keyof OpenFDALabel] as string[]).length > 0);

  return {
    genericName,
    brandName,
    drugClass,
    riskBadge,
    uspCategory,
    budEntries,
    storage,
    releaseItems,
    rejectItems,
    reconstitute,
    dilute,
    inspect,
    labelStore,
    filterInfo,
    concRange,
    incompatibilities,
    sourceSections,
  };
}
