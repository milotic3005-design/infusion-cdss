import type { AdverseReaction } from '@/types/reaction.types';

/**
 * Parse adverse reactions from openFDA narrative text.
 * Extracts reaction terms and optional incidence percentages.
 * Pattern matches: "term (XX%)", "term (incidence ≥ XX%)", "term (XX.X%)"
 */
export function parseAdverseReactions(rawText: string[]): AdverseReaction[] {
  if (!rawText || rawText.length === 0) return [];

  const combined = rawText.join(' ');
  const reactions: AdverseReaction[] = [];
  const seen = new Set<string>();

  // Match patterns like "nausea (45%)" or "fever (incidence ≥ 30%)"
  const percentPattern = /([a-zA-Z][a-zA-Z\s-]{2,40}?)\s*\((?:incidence\s*[≥>]?\s*)?(\d+(?:\.\d+)?)\s*%\)/gi;
  let match;

  while ((match = percentPattern.exec(combined)) !== null) {
    const term = match[1].trim().toLowerCase();
    const incidence = parseFloat(match[2]);

    if (!seen.has(term) && isValidReactionTerm(term)) {
      seen.add(term);
      reactions.push({
        term,
        incidencePercent: incidence,
        source: 'openfda',
      });
    }
  }

  // Also extract standalone reaction terms from common patterns
  const infusionTerms = [
    'infusion related reaction', 'infusion reaction', 'hypersensitivity',
    'anaphylaxis', 'anaphylactic', 'cytokine release syndrome',
    'bronchospasm', 'angioedema', 'urticaria', 'dyspnea',
    'hypotension', 'fever', 'chills', 'rigors', 'flushing',
    'pruritus', 'rash', 'nausea', 'vomiting', 'tachycardia',
    'wheezing', 'stridor', 'laryngeal edema',
  ];

  for (const term of infusionTerms) {
    if (!seen.has(term) && combined.toLowerCase().includes(term)) {
      seen.add(term);
      reactions.push({
        term,
        source: 'openfda',
      });
    }
  }

  return reactions;
}

/**
 * Parse boxed warning from openFDA array field.
 */
export function parseBoxedWarning(rawText: string[] | undefined): string | null {
  if (!rawText || rawText.length === 0) return null;
  return rawText.join(' ').trim() || null;
}

/**
 * Parse DailyMed SPL XML to extract adverse reactions and warnings sections.
 * SPL section codes: 34084-4 = adverse reactions, 34071-1 = warnings
 */
export function parseDailyMedXML(xmlString: string): {
  adverseReactions: string;
  warnings: string;
} {
  const result = { adverseReactions: '', warnings: '' };

  // Extract adverse reactions section (code 34084-4)
  const arMatch = xmlString.match(
    /<component>[\s\S]*?<code[^>]*code="34084-4"[^>]*\/>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/component>/i
  );
  if (arMatch) {
    result.adverseReactions = stripXMLTags(arMatch[1]);
  }

  // Extract warnings section (code 34071-1)
  const warnMatch = xmlString.match(
    /<component>[\s\S]*?<code[^>]*code="34071-1"[^>]*\/>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<\/component>/i
  );
  if (warnMatch) {
    result.warnings = stripXMLTags(warnMatch[1]);
  }

  return result;
}

function stripXMLTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isValidReactionTerm(term: string): boolean {
  if (term.length < 3 || term.length > 50) return false;
  if (/^\d/.test(term)) return false;
  const stopWords = ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'were', 'have', 'been'];
  return !stopWords.includes(term.toLowerCase());
}
