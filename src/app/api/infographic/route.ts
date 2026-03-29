import { EXTERNAL_APIS } from '@/lib/constants';
import { parseLabelToInfographicData, type OpenFDALabel, type CompatPair } from '@/lib/infographic-data';
import { buildInfographicHtml } from '@/lib/infographic-html';
import { buildImagePrompt } from '@/lib/infographic-prompt-builder';
import rawCompatData from '@/data/compatibility-pairs.json';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { drugName } = await req.json() as { drugName: string };

  if (!drugName || typeof drugName !== 'string' || drugName.trim().length < 2) {
    return Response.json({ error: 'Drug name is required' }, { status: 400 });
  }

  const name = drugName.trim().toLowerCase();

  // ── Fetch from OpenFDA (try generic then brand) ──────────────────────────
  const queries = [
    `${EXTERNAL_APIS.openfda}?search=openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`,
    `${EXTERNAL_APIS.openfda}?search=openfda.brand_name:"${encodeURIComponent(name)}"&limit=1`,
    // Broader fallback search
    `${EXTERNAL_APIS.openfda}?search=${encodeURIComponent(name)}&limit=1`,
  ];

  let label: OpenFDALabel | null = null;

  for (const url of queries) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json() as { results?: OpenFDALabel[] };
        if (data.results && data.results.length > 0) {
          label = data.results[0];
          break;
        }
      }
    } catch {
      // try next query
    }
  }

  // ── Build infographic data ───────────────────────────────────────────────
  // Even with no label, we can generate a placeholder infographic
  const resolvedLabel: OpenFDALabel = label ?? {};
  const resolvedName = label?.openfda?.generic_name?.[0]?.toLowerCase() ?? name;

  const infographicData = parseLabelToInfographicData(
    resolvedName,
    resolvedLabel,
    (rawCompatData.pairs ?? []) as CompatPair[]
  );

  const html = buildInfographicHtml(infographicData);
  const prompt = buildImagePrompt(infographicData);

  return Response.json({ html, prompt, foundInFda: label !== null });
}
