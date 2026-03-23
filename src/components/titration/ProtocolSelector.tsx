'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, ExternalLink, Loader2, AlertCircle, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react';
import protocolData from '@/data/titration-protocols.json';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { API_ROUTES, SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import type { TitrationProtocol, TitrationStep } from '@/types/titration.types';

interface Props {
  onSelect: (protocol: TitrationProtocol) => void;
}

interface RxNormDrug {
  rxcui: string;
  name: string;
  tty: string;
}

interface FdaLabel {
  brandName: string | null;
  genericName: string | null;
  route: string | null;
  dosageForm: string | null;
  manufacturer: string | null;
  indications: string | null;
  dosageAndAdministration: string | null;
  warnings: string | null;
  source: string;
  rxnormName: string;
  rxcui: string;
}

const protocols = protocolData.protocols as TitrationProtocol[];

// Group protocols by drug for a cleaner display
function groupProtocols(protos: TitrationProtocol[]) {
  const groups: Record<string, TitrationProtocol[]> = {};
  for (const p of protos) {
    const key = p.genericName || p.drugName;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }
  return Object.entries(groups);
}

export function ProtocolSelector({ onSelect }: Props) {
  const [showAllBuiltIn, setShowAllBuiltIn] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rxnormResults, setRxnormResults] = useState<RxNormDrug[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<FdaLabel | null>(null);
  const [isLoadingLabel, setIsLoadingLabel] = useState(false);
  const [labelError, setLabelError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const grouped = groupProtocols(protocols);
  // Show first 6 protocols (collapsed) or all
  const visibleGroups = showAllBuiltIn ? grouped : grouped.slice(0, 6);

  // RxNorm search via existing proxy
  const handleSearch = useCallback((rawValue: string) => {
    const sanitized = rawValue.replace(/[<>{}[\]\\]/g, '').trim().slice(0, 100);
    setSearchTerm(sanitized);
    setSelectedLabel(null);
    setLabelError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (sanitized.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_ROUTES.rxnorm}?action=search&name=${encodeURIComponent(sanitized)}`);
          if (res.ok) {
            const data = await res.json();
            setRxnormResults(parseRxNormResults(data));
          } else {
            setRxnormResults([]);
          }
        } catch {
          setRxnormResults([]);
        }
        setIsSearching(false);
      }, SEARCH_DEBOUNCE_MS);
    } else {
      setRxnormResults([]);
    }
  }, []);

  // Fetch FDA label via existing proxy
  const handleSelectDrug = useCallback(async (drug: RxNormDrug) => {
    setIsLoadingLabel(true);
    setLabelError(null);
    setSelectedLabel(null);

    const { ingredient, brand } = extractDrugNames(drug.name);
    const attempts = [brand, ingredient, drug.name].filter(Boolean) as string[];
    let foundLabel: FdaLabel | null = null;

    for (const name of attempts) {
      try {
        const res = await fetch(`${API_ROUTES.openfda}?drugName=${encodeURIComponent(name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            foundLabel = parseFdaLabel(data.results[0], drug.name, drug.rxcui);
            break;
          }
        }
      } catch { /* try next */ }
    }

    if (foundLabel) {
      setSelectedLabel(foundLabel);
    } else {
      setLabelError(`No FDA label data found for "${drug.name}". Try a different spelling or the generic name.`);
    }
    setIsLoadingLabel(false);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleResetSearch = () => {
    setSearchTerm('');
    setRxnormResults([]);
    setSelectedLabel(null);
    setLabelError(null);
  };

  return (
    <div className="space-y-6">
      {/* Built-in protocols */}
      <div>
        <h2 className="text-lg font-bold text-[#4E6F4E] mb-1">Select Titration Protocol</h2>
        <p className="text-xs text-[#8AB78A] mb-3">{protocols.length} built-in protocols available</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleGroups.map(([, groupProtos]) =>
            groupProtos.map((protocol) => (
              <button
                key={protocol.id}
                onClick={() => onSelect(protocol)}
                className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB78A] rounded-2xl"
              >
                <Card className={cn('cursor-pointer hover:border-[#8AB78A] hover:shadow-md transition-all duration-150 min-h-[44px]')}>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-bold text-gray-800 text-sm">{protocol.brandName || protocol.drugName}</h3>
                    {protocol.brandName && <span className="text-xs text-[#8AB78A] font-medium">({protocol.drugName})</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 italic">{protocol.genericName}</p>
                  <p className="text-xs text-gray-500 mt-1">{protocol.indication}</p>
                  <div className="flex gap-3 mt-2 text-xs text-[#8AB78A]">
                    <span>{protocol.steps.length} step{protocol.steps.length > 1 ? 's' : ''}</span>
                    <span>{protocol.diluentVolumeMl} mL {protocol.diluent}</span>
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>

        {grouped.length > 6 && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowAllBuiltIn(!showAllBuiltIn)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4E6F4E] hover:text-[#8AB78A] min-h-[44px] px-4 transition-colors"
            >
              {showAllBuiltIn ? (
                <><ChevronUp size={16} /> Show fewer protocols</>
              ) : (
                <><ChevronDown size={16} /> Show all {protocols.length} protocols</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#C1E1B1]" />
        <span className="text-xs text-[#8AB78A] font-medium uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-[#C1E1B1]" />
      </div>

      {/* FDA Drug Search */}
      {!showSearch ? (
        <div className="text-center">
          <Button variant="secondary" onClick={() => setShowSearch(true)} icon={<Search size={16} />}>
            Search Any Drug via FDA Database
          </Button>
          <p className="text-xs text-[#8AB78A]/70 mt-2">
            Look up any IV drug and auto-generate a titration protocol from FDA label data
          </p>
        </div>
      ) : (
        <Card className="border-[#8AB78A]/50 bg-[#E9F5E1]/30">
          <h3 className="font-semibold text-[#4E6F4E] mb-3 flex items-center gap-2">
            <ExternalLink size={16} className="text-[#8AB78A]" />
            Search FDA Drug Database
          </h3>
          <p className="text-xs text-[#8AB78A] mb-3">
            Search by generic or brand name. The system will fetch FDA label data and generate a conservative titration schedule.
          </p>

          {/* Search input */}
          <div className="relative mb-3">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AB78A] pointer-events-none">
              <Search size={16} aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="e.g. bevacizumab, pembrolizumab, cetuximab..."
              className={cn(
                'w-full min-h-[44px] pl-9 pr-4 py-2.5',
                'rounded-xl border border-[#C1E1B1] bg-white text-base',
                'placeholder:text-[#8AB78A]/50',
                'focus:outline-none focus:ring-2 focus:ring-[#8AB78A]'
              )}
              aria-label="Search drug by name"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={18} className="animate-spin text-[#8AB78A]" />
              </div>
            )}
          </div>

          {/* RxNorm results */}
          {rxnormResults.length > 0 && !selectedLabel && !isLoadingLabel && (
            <div className="space-y-1 mb-3 max-h-60 overflow-auto">
              {rxnormResults.slice(0, 10).map((drug) => (
                <button
                  key={drug.rxcui}
                  onClick={() => handleSelectDrug(drug)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl min-h-[44px]',
                    'hover:bg-[#E9F5E1] transition-colors',
                    'flex items-center justify-between gap-2'
                  )}
                >
                  <div>
                    <span className="text-sm font-medium text-gray-800">{drug.name}</span>
                    <span className="text-xs text-[#8AB78A] ml-2">
                      {drug.tty === 'BN' ? 'Brand' : drug.tty === 'IN' ? 'Ingredient' : drug.tty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {searchTerm.length >= 3 && !isSearching && rxnormResults.length === 0 && !selectedLabel && (
            <p className="text-sm text-gray-500 text-center py-3">
              No drugs found for &quot;{searchTerm}&quot;. Try a different spelling.
            </p>
          )}

          {/* Loading label */}
          {isLoadingLabel && (
            <div className="flex items-center justify-center gap-2 py-6 text-[#4E6F4E]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Fetching FDA label data...</span>
            </div>
          )}

          {/* Error */}
          {labelError && (
            <div className="flex items-start gap-2 py-3 px-3 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{labelError}</p>
            </div>
          )}

          {/* Generated protocol card */}
          {selectedLabel && (
            <GeneratedProtocolCard label={selectedLabel} onSelect={onSelect} onReset={handleResetSearch} />
          )}

          {/* Close search */}
          <div className="mt-3 text-center">
            <button
              onClick={() => { setShowSearch(false); handleResetSearch(); }}
              className="text-sm text-[#8AB78A] hover:text-[#4E6F4E] min-h-[44px] px-4"
            >
              Close search
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ——— Helpers ———

function parseRxNormResults(data: Record<string, unknown>): RxNormDrug[] {
  const drugGroup = data.drugGroup as { conceptGroup?: Array<{ tty: string; conceptProperties?: Array<{ rxcui: string; name: string }> }> } | undefined;
  if (!drugGroup?.conceptGroup) return [];
  const results: RxNormDrug[] = [];
  const seen = new Set<string>();
  for (const group of drugGroup.conceptGroup) {
    if (!group.conceptProperties) continue;
    if (!['IN', 'BN', 'SCD', 'SBD'].includes(group.tty)) continue;
    for (const prop of group.conceptProperties) {
      if (!seen.has(prop.rxcui)) {
        seen.add(prop.rxcui);
        results.push({ rxcui: prop.rxcui, name: prop.name, tty: group.tty });
      }
    }
  }
  return results;
}

function extractDrugNames(rxnormName: string) {
  const brandMatch = rxnormName.match(/\[([^\]]+)\]/);
  const brand = brandMatch ? brandMatch[1] : null;
  const ingredientMatch = rxnormName.match(/(?:\d+\s+ML\s+)?([a-z][a-z-]+(?:\s+[a-z][a-z-]+)*)/i);
  const ingredient = ingredientMatch ? ingredientMatch[1] : rxnormName;
  return { ingredient, brand };
}

function parseFdaLabel(label: Record<string, unknown>, rxnormName: string, rxcui: string): FdaLabel {
  const openfda = label.openfda as Record<string, string[]> | undefined;
  const brandNames = openfda?.brand_name || [];
  const genericNames = openfda?.generic_name || [];
  const routes = openfda?.route || [];
  const dosageForms = openfda?.dosage_form || [];
  const manufacturerNames = openfda?.manufacturer_name || [];

  const extractSection = (arr: unknown): string | null => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return (arr as string[]).join(' ').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 5000);
  };

  return {
    brandName: brandNames[0] || null,
    genericName: genericNames[0] || null,
    route: routes.join(', ') || null,
    dosageForm: dosageForms[0] || null,
    manufacturer: manufacturerNames[0] || null,
    indications: extractSection(label.indications_and_usage),
    dosageAndAdministration: extractSection(label.dosage_and_administration),
    warnings: extractSection(label.warnings),
    source: 'openFDA Drug Label',
    rxnormName,
    rxcui,
  };
}

function isIVRoute(route: string | null): boolean {
  if (!route) return true; // assume IV if no route data
  return route.toUpperCase().includes('INTRAVENOUS');
}

function buildProtocolFromLabel(label: FdaLabel): TitrationProtocol {
  const drugName = label.genericName || label.rxnormName;
  const brandName = label.brandName || '';

  const steps: TitrationStep[] = [
    { stepNumber: 1, rateMlHr: 50, durationMinutes: 30, triggerCondition: 'Begin infusion. Monitor vitals at baseline and every 15 minutes.', escalationNote: 'If tolerated without reaction, escalate to step 2.' },
    { stepNumber: 2, rateMlHr: 100, durationMinutes: 30, triggerCondition: 'No infusion reaction signs (no fever, chills, rigors, hypotension).', escalationNote: 'If tolerated, continue escalation.' },
    { stepNumber: 3, rateMlHr: 200, durationMinutes: 30, triggerCondition: 'No infusion reaction signs after step 2.', escalationNote: 'Approaching target rate. Continue monitoring.' },
    { stepNumber: 4, rateMlHr: 300, durationMinutes: 0, triggerCondition: 'No infusion reaction signs after step 3.', escalationNote: 'Maximum rate reached. Maintain until infusion complete.' },
  ];

  return {
    id: `fda-${label.rxcui}-${Date.now()}`,
    drugName,
    brandName,
    genericName: label.genericName || '',
    indication: label.indications ? label.indications.slice(0, 120) + (label.indications.length > 120 ? '...' : '') : 'IV infusion',
    totalDoseMg: null,
    diluentVolumeMl: 250,
    diluent: 'NS',
    premeds: 'Verify premedication requirements per institutional protocol and package insert before starting infusion.',
    steps,
  };
}

// ——— Sub-components ———

function GeneratedProtocolCard({ label, onSelect, onReset }: { label: FdaLabel; onSelect: (p: TitrationProtocol) => void; onReset: () => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const ivCompatible = isIVRoute(label.route);

  if (!ivCompatible) {
    return (
      <div className="space-y-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800 mb-1">Not an IV Infusion Drug</p>
              <h4 className="font-bold text-gray-800">{label.brandName || label.rxnormName}</h4>
              {label.route && (
                <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium mt-1">{label.route}</span>
              )}
              <p className="text-sm text-amber-700 mt-2">
                This drug is administered via <strong>{label.route?.toLowerCase()}</strong> route and is not suitable for IV infusion titration.
              </p>
            </div>
          </div>
        </Card>
        <div className="flex justify-center gap-3">
          <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-[#4E6F4E] hover:text-[#8AB78A] min-h-[44px] px-4 inline-flex items-center gap-1">
            <ExternalLink size={12} />
            {showDetails ? 'Hide FDA Label' : 'View FDA Label'}
          </button>
          <button onClick={onReset} className="text-xs text-[#8AB78A] hover:text-[#4E6F4E] min-h-[44px] px-4">Search again</button>
        </div>
        {showDetails && <FdaLabelDetails label={label} />}
      </div>
    );
  }

  const protocol = buildProtocolFromLabel(label);

  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelect(protocol)}
        className="text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8AB78A] rounded-2xl"
      >
        <Card className={cn('cursor-pointer hover:border-[#8AB78A] hover:shadow-md transition-all duration-150 border-[#8AB78A]/50 bg-[#E9F5E1]/40')}>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical size={14} className="text-[#4E6F4E] shrink-0" />
            <span className="text-xs text-[#4E6F4E] font-semibold uppercase tracking-wide">Auto-Generated from FDA Label</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-bold text-gray-800">{protocol.brandName || protocol.drugName}</h3>
            {protocol.brandName && <span className="text-xs text-[#8AB78A] font-medium">({protocol.drugName})</span>}
          </div>
          {label.manufacturer && <p className="text-xs text-gray-400 mt-0.5">{label.manufacturer}</p>}
          <div className="flex flex-wrap gap-2 mt-1.5">
            {label.route && <span className="text-xs bg-[#E9F5E1] text-[#4E6F4E] px-2 py-0.5 rounded-full font-medium">{label.route}</span>}
            {label.dosageForm && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{label.dosageForm}</span>}
          </div>
          <div className="flex gap-3 mt-2 text-xs text-[#8AB78A]">
            <span>{protocol.steps.length} steps</span>
            <span>{protocol.diluentVolumeMl} mL in {protocol.diluent}</span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#C1E1B1]">
            <p className="text-sm text-[#4E6F4E] font-semibold text-center">Tap to Use This Protocol</p>
          </div>
        </Card>
      </button>

      <div className="flex justify-center gap-3">
        <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-[#4E6F4E] hover:text-[#8AB78A] min-h-[44px] px-4 inline-flex items-center gap-1">
          <ExternalLink size={12} />
          {showDetails ? 'Hide FDA Label Details' : 'View FDA Label Details'}
        </button>
        <button onClick={onReset} className="text-xs text-[#8AB78A] hover:text-[#4E6F4E] min-h-[44px] px-4">Search again</button>
      </div>
      {showDetails && <FdaLabelDetails label={label} />}

      <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          This protocol uses a default conservative escalation schedule. Always verify rates and timing against the package insert and institutional protocols.
        </p>
      </div>
    </div>
  );
}

function FdaLabelDetails({ label }: { label: FdaLabel }) {
  return (
    <Card>
      {label.indications && <LabelSection title="Indications & Usage" content={label.indications} />}
      {label.dosageAndAdministration && <LabelSection title="Dosage & Administration" content={label.dosageAndAdministration} />}
      {label.warnings && <LabelSection title="Warnings" content={label.warnings} isWarning />}
      <div className="mt-3 pt-3 border-t border-[#C1E1B1]/30 flex items-center gap-1.5">
        <ExternalLink size={12} className="text-[#8AB78A]" />
        <span className="text-xs text-[#8AB78A]">Source: {label.source} | RxCUI: {label.rxcui}</span>
      </div>
    </Card>
  );
}

function LabelSection({ title, content, isWarning = false }: { title: string; content: string; isWarning?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const displayText = expanded ? content : content.slice(0, 300);
  const needsTruncation = content.length > 300;

  return (
    <div className={cn('mt-2 pt-2 border-t border-[#C1E1B1]/30', isWarning && 'bg-red-50 -mx-5 px-5 py-2 border-t-red-100')}>
      <p className={cn('text-xs font-semibold uppercase tracking-wide mb-1', isWarning ? 'text-red-700' : 'text-[#8AB78A]')}>{title}</p>
      <p className={cn('text-sm leading-relaxed', isWarning ? 'text-red-800' : 'text-gray-700')}>
        {displayText}
        {needsTruncation && !expanded && '...'}
      </p>
      {needsTruncation && (
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-[#4E6F4E] hover:text-[#8AB78A] mt-1 min-h-[44px] flex items-center">
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
