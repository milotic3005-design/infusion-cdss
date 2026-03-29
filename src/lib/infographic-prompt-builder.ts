import type { InfographicData } from './infographic-data';

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Builds a fully pre-filled NanoBanana / Gemini image generation prompt
 * from parsed drug label data. No placeholders — all brackets replaced with real values.
 */
export function buildImagePrompt(data: InfographicData): string {
  const name = cap(data.genericName);
  const year = new Date().getFullYear();

  // BUD cards text
  const budCards = data.budEntries.map((e, i) => {
    const colorLabel = i === 0 ? 'green' : i === 1 ? 'teal' : 'amber';
    return `  Card ${i + 1}: "${e.condition}" | "${e.duration}" [${colorLabel}] | "${e.note}"`;
  }).join('\n');

  // Storage values
  const { intactVial, afterMixing, container, lightProtection } = data.storage;

  // Inspection bullets
  const releaseBullets = data.releaseItems.map(i => `  • ${i}`).join('\n');
  const rejectBullets = data.rejectItems.map(i => `  • ${i}`).join('\n');

  // Incompatibilities
  const incompats = data.incompatibilities.length > 0
    ? data.incompatibilities.map(cap).join(' · ')
    : 'Verify with current PI';

  return `Create a single-page portrait-orientation clinical pharmacy infographic (US Letter,
8.5×11 in, 300 DPI). Style: bold editorial medical poster — minimal text, maximum
visual impact. Think pharmacy journal cover or hospital department wall poster.
NOT a table-heavy document. Key values must be large, bold, and immediately readable.
Use icons and color blocks to carry meaning. Generous whitespace throughout.
Absolutely no paragraphs or sentence-length text anywhere on the page.

TYPEFACE: Bold geometric sans-serif (Syne or Bebas style) for all large values and
headers. Clean humanist sans (DM Sans style) for short supporting labels only.

─── HEADER (full-width dark navy #0F172A bar) ───
Left: small uppercase muted label "${data.drugClass.toUpperCase()}" with teal accent line.
Large bold white "${name}" at ~44px. Italic gray "${data.brandName} · IV Infusion".
Right: two stacked badge pills —
  "${data.uspCategory}" (navy bg, light blue text)
  "${data.riskBadge}" (dark red bg, light red text)

─── BUD SECTION (teal #0D7377 header bar "⏱ BEYOND-USE DATING") ───
NOT a table. Show as a visual bar chart with 2 cards per row.
Each card: condition label (small gray pill) + duration in HUGE BOLD TYPE (44px)
in teal/green/amber color + horizontal progress bar below (colored, scaled to longest BUD).
Bar colors: green #22C55E = longest, teal #0D7377 = mid, amber #F59E0B = shortest.
One label below each bar: ≤ 6 words only.

[Drug-specific BUD data:]
${budCards}

─── STORAGE SECTION (slate blue #2E4057 header bar "🌡 STORAGE") ───
4 icon cards in a 2×2 grid. Each card: large icon (48px+), bold uppercase label,
bold value text. NO sentences — values only.
  📦 INTACT VIAL → "${intactVial}"
  ❄️ AFTER MIXING → "${afterMixing}"
  💧 CONTAINER → "${container}"
  🌑 LIGHT PROTECTION → "${lightProtection}"

─── VISUAL INSPECTION (amber #B45309 header bar "🔍 VISUAL INSPECTION") ───
Two large side-by-side color blocks filling the full width.
LEFT block (green #DCFCE7 background): giant "✓" (64px, #22C55E) centered at top.
Bold green "RELEASE" header. 4 dot-points, ≤ 7 words each, green #22C55E dots:
${releaseBullets}
RIGHT block (red #FEE2E2 background): giant "✗" (64px, #EF4444) centered at top.
Bold red "REJECT" header. 4 dot-points, ≤ 7 words each, red #EF4444 dots:
${rejectBullets}

─── MIXING WORKFLOW (forest green #2D6A4F header bar "⚗️ MIXING WORKFLOW") ───
Horizontal 4-step flowchart with bold → arrows between equal-width white cards.
Each card: circle step number badge (dark green, white text) + large emoji + step name
(bold uppercase, green) + 1–2 lines of key detail (≤10 words, bold dark text).
Cards have green left border (4px). Arrow between each card must be visible and bold.

  Step 1 🧪 RECONSTITUTE → "${data.reconstitute}"
  Step 2 💉 DILUTE → "${data.dilute}"
  Step 3 🔍 INSPECT → "${data.inspect}"
  Step 4 🏷️ LABEL & STORE → "${data.labelStore}"

Below flowchart, 3 compact inline badges:
  🔵 FILTER: "${data.filterInfo}"
  🟢 CONC RANGE: "${data.concRange}"
  🔴 TOP INCOMPATIBILITIES (3 red pill tags only): ${incompats}

─── FOOTER (narrow dark navy strip) ───
Right-aligned tiny gray text only (10px):
"Sources: Manufacturer PI · Trissel's Handbook · King Guide · Lexicomp · OpenFDA · ${year}"

STRICT COLOR PALETTE:
#0F172A navy · #0D7377 teal · #2E4057 slate · #B45309 amber · #2D6A4F green
#22C55E accept · #EF4444 reject · #DCFCE7 green bg · #FEE2E2 red bg
#F59E0B conditional · #1A1A2E body · #64748B muted · #E2E8F0 border

OUTPUT: Portrait · US Letter · 300 DPI · white bg · no watermarks · no bleed.
CRITICAL REMINDER: MINIMAL TEXT. Bold values, icons, and color carry the message.
Whitespace is intentional. No paragraphs. No sentences. No tables.`;
}
