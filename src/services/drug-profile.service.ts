import { searchDrugs, getDrugClasses, getDrugInteractions } from './rxnorm.service';
import { getDrugLabel } from './openfda.service';
import { getSPLList, getSPLContent } from './dailymed.service';
import { parseAdverseReactions, parseBoxedWarning, parseDailyMedXML } from '@/lib/parsers';
import { findDrugOverride } from '@/engine/drug-overrides';
import type { DrugInfo } from '@/types/drug.types';
import type { ReactionProfile, AdverseReaction } from '@/types/reaction.types';

export async function buildReactionProfile(
  rxcui: string,
  drugName: string
): Promise<ReactionProfile> {
  const genericName = drugName.toLowerCase();

  // Parallel fetch all three API sources
  const [rxnormResult, fdaResult, dailymedResult] = await Promise.allSettled([
    fetchRxNormData(rxcui, genericName),
    getDrugLabel(genericName),
    fetchDailyMedData(genericName),
  ]);

  // Build DrugInfo from RxNorm
  const rxnormData = rxnormResult.status === 'fulfilled' ? rxnormResult.value : null;
  const drug: DrugInfo = rxnormData?.drug ?? {
    rxcui,
    genericName,
    brandNames: [],
    drugClasses: [],
    interactions: [],
    route: 'intravenous',
    dosageForm: '',
  };

  // Parse FDA label data
  const fdaLabel = fdaResult.status === 'fulfilled' ? fdaResult.value : null;
  let adverseReactions: AdverseReaction[] = [];
  let boxedWarning: string | null = null;
  let warnings: string[] = [];

  if (fdaLabel) {
    adverseReactions = parseAdverseReactions(fdaLabel.adverse_reactions || []);
    boxedWarning = parseBoxedWarning(fdaLabel.boxed_warning);
    warnings = fdaLabel.warnings || [];

    // Enrich drug info from FDA
    if (fdaLabel.openfda.brand_name?.length) {
      drug.brandNames = fdaLabel.openfda.brand_name;
    }
    if (fdaLabel.openfda.route?.length) {
      drug.route = fdaLabel.openfda.route[0].toLowerCase();
    }
  }

  // Parse DailyMed SPL data
  const dailymedData = dailymedResult.status === 'fulfilled' ? dailymedResult.value : null;
  if (dailymedData) {
    const dmReactions = dailymedData.adverseReactions
      .split(/[,;.]/)
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 2 && t.length < 50)
      .map((term): AdverseReaction => ({ term, source: 'dailymed' }));

    // Merge, dedup by term
    const existingTerms = new Set(adverseReactions.map((r) => r.term));
    for (const r of dmReactions) {
      if (!existingTerms.has(r.term)) {
        existingTerms.add(r.term);
        adverseReactions.push(r);
      }
    }
  }

  // Apply drug-specific overrides
  const override = findDrugOverride(genericName, rxcui);
  const protocol = override
    ? { ...override.protocol, drugRxcui: rxcui }
    : null;

  return {
    drug,
    adverseReactions,
    boxedWarning,
    warnings,
    protocol,
    sources: {
      rxnorm: rxnormResult.status === 'fulfilled',
      openfda: fdaResult.status === 'fulfilled' && fdaLabel !== null,
      dailymed: dailymedResult.status === 'fulfilled' && dailymedData !== null,
    },
    fetchedAt: Date.now(),
    cacheKey: `${rxcui}-${genericName}`,
  };
}

async function fetchRxNormData(rxcui: string, genericName: string) {
  const [classes, interactions] = await Promise.allSettled([
    getDrugClasses(genericName),
    getDrugInteractions(rxcui),
  ]);

  const drug: DrugInfo = {
    rxcui,
    genericName,
    brandNames: [],
    drugClasses: classes.status === 'fulfilled' ? classes.value : [],
    interactions: interactions.status === 'fulfilled' ? interactions.value : [],
    route: 'intravenous',
    dosageForm: '',
  };

  return { drug };
}

async function fetchDailyMedData(drugName: string) {
  const splList = await getSPLList(drugName);
  if (splList.length === 0) return null;

  // Get the first (most relevant) SPL
  const xmlContent = await getSPLContent(splList[0].setid);
  if (!xmlContent) return null;

  return parseDailyMedXML(xmlContent);
}
