import { apiFetch } from './api-client';
import { API_ROUTES } from '@/lib/constants';
import type { RxNormConcept, DrugClass, DrugInteraction } from '@/types/drug.types';
import type { RxNormDrugResponse, RxClassResponse, RxInteractionResponse } from '@/types/api.types';

export async function searchDrugs(name: string): Promise<RxNormConcept[]> {
  const data = await apiFetch<RxNormDrugResponse>(
    `${API_ROUTES.rxnorm}?action=search&name=${encodeURIComponent(name)}`
  );

  if (!data.drugGroup?.conceptGroup) return [];

  const concepts: RxNormConcept[] = [];
  const seen = new Set<string>();

  for (const group of data.drugGroup.conceptGroup) {
    if (!group.conceptProperties) continue;
    // Only include relevant term types
    if (!['SBD', 'SCD', 'IN', 'BN'].includes(group.tty)) continue;

    for (const prop of group.conceptProperties) {
      if (!seen.has(prop.rxcui)) {
        seen.add(prop.rxcui);
        concepts.push({
          rxcui: prop.rxcui,
          name: prop.name,
          tty: prop.tty,
          synonym: prop.synonym,
        });
      }
    }
  }

  return concepts;
}

export async function getDrugClasses(drugName: string): Promise<DrugClass[]> {
  try {
    const data = await apiFetch<RxClassResponse>(
      `${API_ROUTES.rxnorm}?action=class&drugName=${encodeURIComponent(drugName)}`
    );

    if (!data.rxclassDrugInfoList?.rxclassDrugInfo) return [];

    const seen = new Set<string>();
    return data.rxclassDrugInfoList.rxclassDrugInfo
      .filter((info) => {
        const key = info.rxclassMinConceptItem.classId;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((info) => ({
        classId: info.rxclassMinConceptItem.classId,
        className: info.rxclassMinConceptItem.className,
        classType: info.rxclassMinConceptItem.classType,
      }));
  } catch {
    return [];
  }
}

export async function getDrugInteractions(rxcui: string): Promise<DrugInteraction[]> {
  try {
    const data = await apiFetch<RxInteractionResponse>(
      `${API_ROUTES.rxnorm}?action=interactions&rxcui=${encodeURIComponent(rxcui)}`
    );

    if (!data.interactionTypeGroup) return [];

    const interactions: DrugInteraction[] = [];

    for (const group of data.interactionTypeGroup) {
      for (const type of group.interactionType) {
        for (const pair of type.interactionPair) {
          const otherDrug = pair.interactionConcept.find(
            (c) => c.minConceptItem.rxcui !== rxcui
          );
          if (otherDrug) {
            interactions.push({
              rxcui: otherDrug.minConceptItem.rxcui,
              drugName: otherDrug.minConceptItem.name,
              description: pair.description,
              severity: pair.severity?.toLowerCase() === 'high' ? 'high' :
                pair.severity?.toLowerCase() === 'low' ? 'low' : 'moderate',
            });
          }
        }
      }
    }

    return interactions;
  } catch {
    return [];
  }
}
