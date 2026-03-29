import type { InfographicData } from './infographic-data';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function budCard(entry: ReturnType<InfographicData['budEntries']['slice']>[number], barWidthPct: number): string {
  return `
    <div style="background:white;border-radius:10px;padding:16px;border:1px solid #B2DFDF;display:flex;flex-direction:column;gap:6px;">
      <span style="background:#E2E8F0;color:#475569;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;display:inline-block;align-self:flex-start;">${entry.condition}</span>
      <div style="font-family:'Syne',sans-serif;font-size:34px;font-weight:800;color:${entry.color};line-height:1;">${entry.duration}</div>
      <div style="background:#E2E8F0;border-radius:5px;height:10px;overflow:hidden;">
        <div style="height:10px;border-radius:5px;width:${barWidthPct}%;background:${entry.color};transition:width 0.6s;"></div>
      </div>
      <div style="font-size:11px;color:#64748B;">${entry.note}</div>
    </div>`;
}

function storageCard(emoji: string, label: string, value: string): string {
  return `
    <div style="background:white;border-radius:10px;padding:18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;border:1px solid #CBD5E1;">
      <span style="font-size:32px;line-height:1;">${emoji}</span>
      <div style="font-size:10px;font-weight:700;color:#64748B;letter-spacing:1.5px;text-transform:uppercase;">${label}</div>
      <div style="font-size:13px;font-weight:700;color:#1A1A2E;">${value}</div>
    </div>`;
}

function bulletList(items: string[], dotColor: string): string {
  return items.map(item =>
    `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;">
      <span style="color:${dotColor};font-size:16px;line-height:1.3;flex-shrink:0;">●</span>
      <span style="font-size:13px;color:#1A1A2E;line-height:1.4;">${item}</span>
    </div>`
  ).join('');
}

function stepCard(num: number, emoji: string, name: string, detail: string): string {
  return `
    <div style="flex:1;background:white;border-left:4px solid #2D6A4F;border-radius:8px;padding:14px 12px;position:relative;min-width:0;">
      <div style="position:absolute;top:-11px;left:10px;background:#2D6A4F;color:white;font-family:'Syne',sans-serif;font-weight:700;font-size:10px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${num}</div>
      <div style="font-size:26px;text-align:center;margin:8px 0 6px;">${emoji}</div>
      <div style="font-size:10px;font-weight:700;color:#2D6A4F;letter-spacing:1.2px;text-transform:uppercase;text-align:center;margin-bottom:8px;">${name}</div>
      <div style="font-size:11px;font-weight:600;color:#1A1A2E;text-align:center;line-height:1.5;">${detail}</div>
    </div>`;
}

function badge(bg: string, color: string, text: string): string {
  return `<span style="background:${bg};color:${color};font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;white-space:nowrap;">${text}</span>`;
}

export function buildInfographicHtml(data: InfographicData): string {
  const title = capitalize(data.genericName);
  const year = new Date().getFullYear();

  const budCards = data.budEntries.map(e => budCard(e, e.widthPct)).join('');

  const incompatPills = data.incompatibilities.length > 0
    ? data.incompatibilities.map(d =>
        `<span style="background:#FEE2E2;color:#991B1B;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;">${capitalize(d)}</span>`
      ).join(' ')
    : `<span style="background:#FEE2E2;color:#991B1B;font-size:11px;padding:4px 10px;border-radius:20px;">⚠ Verify with PI</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Pharmacist Reference Card</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F0F4F8; font-family: 'DM Sans', sans-serif; padding: 20px; }
  .page-card { max-width: 820px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.10); overflow: hidden; }
  .section-header { width: 100%; padding: 10px 20px; color: white; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; }
  .section-body { padding: 20px; }
  .toolbar { display: flex; justify-content: flex-end; margin-bottom: 12px; }
  .export-btn { background: #0D7377; color: white; border: none; padding: 9px 20px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
  .export-btn:hover { background: #0a5f62; }
  .export-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media print {
    .toolbar { display: none !important; }
    body { background: white; padding: 0; }
    .page-card { box-shadow: none; border-radius: 0; }
  }
</style>
</head>
<body>

<div class="toolbar">
  <button class="export-btn" id="exportBtn" onclick="exportPdf()">⬇ Export PDF</button>
</div>

<div class="page-card" id="infographic">

  <!-- ── SECTION 1: HEADER ─────────────────────────────────────────────── -->
  <div style="background:#0F172A;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
    <div style="display:flex;align-items:flex-start;gap:0;">
      <div style="width:3px;background:#0D7377;align-self:stretch;margin-right:14px;border-radius:2px;"></div>
      <div>
        <div style="font-size:11px;color:#64748B;letter-spacing:2px;text-transform:uppercase;font-weight:600;margin-bottom:4px;">${data.drugClass}</div>
        <div style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:white;line-height:1.1;margin-bottom:4px;">${title}</div>
        <div style="font-size:14px;color:#94A3B8;font-style:italic;">${data.brandName} &middot; IV Infusion</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;">
      <span style="background:#1E293B;color:#93C5FD;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">${data.uspCategory}</span>
      <span style="background:#7F1D1D;color:#FCA5A5;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;">${data.riskBadge}</span>
    </div>
  </div>

  <!-- ── SECTION 2: BUD ────────────────────────────────────────────────── -->
  <div class="section-header" style="background:#0D7377;">⏱ BEYOND-USE DATING</div>
  <div class="section-body" style="background:#E6F4F4;">
    <div class="grid-2">
      ${budCards}
    </div>
    <div style="margin-top:10px;font-size:11px;color:#0D7377;font-weight:500;">⚠ Always verify BUD against current manufacturer PI and institutional USP 797 SOPs.</div>
  </div>

  <!-- ── SECTION 3: STORAGE ────────────────────────────────────────────── -->
  <div class="section-header" style="background:#2E4057;">🌡 STORAGE</div>
  <div class="section-body" style="background:#EEF2F9;">
    <div class="grid-2">
      ${storageCard('📦', 'INTACT VIAL', data.storage.intactVial)}
      ${storageCard('❄️', 'AFTER MIXING', data.storage.afterMixing)}
      ${storageCard('💧', 'CONTAINER', data.storage.container)}
      ${storageCard('🌑', 'LIGHT PROTECTION', data.storage.lightProtection)}
    </div>
  </div>

  <!-- ── SECTION 4: VISUAL INSPECTION ─────────────────────────────────── -->
  <div class="section-header" style="background:#B45309;">🔍 VISUAL INSPECTION</div>
  <div class="section-body" style="background:#FFF8EE;padding:20px;">
    <div style="display:flex;gap:0;border-radius:10px;overflow:hidden;">
      <!-- RELEASE -->
      <div style="flex:1;background:#DCFCE7;padding:20px;">
        <div style="font-size:52px;text-align:center;color:#22C55E;line-height:1;margin-bottom:4px;">✓</div>
        <div style="font-size:13px;font-weight:800;color:#166534;text-align:center;margin-bottom:16px;letter-spacing:0.5px;">RELEASE</div>
        ${bulletList(data.releaseItems, '#22C55E')}
      </div>
      <!-- Divider -->
      <div style="width:2px;background:#F0F4F8;flex-shrink:0;"></div>
      <!-- REJECT -->
      <div style="flex:1;background:#FEE2E2;padding:20px;">
        <div style="font-size:52px;text-align:center;color:#EF4444;line-height:1;margin-bottom:4px;">✗</div>
        <div style="font-size:13px;font-weight:800;color:#991B1B;text-align:center;margin-bottom:16px;letter-spacing:0.5px;">REJECT</div>
        ${bulletList(data.rejectItems, '#EF4444')}
      </div>
    </div>
  </div>

  <!-- ── SECTION 5: MIXING WORKFLOW ────────────────────────────────────── -->
  <div class="section-header" style="background:#2D6A4F;">⚗️ MIXING WORKFLOW</div>
  <div class="section-body" style="background:#F0FAF4;">
    <!-- 4-step flowchart -->
    <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
      ${stepCard(1, '🧪', 'RECONSTITUTE', data.reconstitute)}
      <div style="font-size:22px;color:#2D6A4F;font-weight:800;flex-shrink:0;">→</div>
      ${stepCard(2, '💉', 'DILUTE', data.dilute)}
      <div style="font-size:22px;color:#2D6A4F;font-weight:800;flex-shrink:0;">→</div>
      ${stepCard(3, '🔍', 'INSPECT', data.inspect)}
      <div style="font-size:22px;color:#2D6A4F;font-weight:800;flex-shrink:0;">→</div>
      ${stepCard(4, '🏷️', 'LABEL & STORE', data.labelStore)}
    </div>
    <!-- Info strip -->
    <div style="display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:16px;padding-top:14px;border-top:1px solid #B2DFC7;">
      ${badge('#DBEAFE', '#1D4ED8', '🔵 FILTER: ' + data.filterInfo)}
      ${badge('#DCFCE7', '#166534', '🟢 CONC: ' + data.concRange)}
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <span style="font-size:11px;font-weight:700;color:#991B1B;">🔴 TOP INCOMPATIBILITIES:</span>
        ${incompatPills}
      </div>
    </div>
  </div>

  <!-- ── SECTION 6: FOOTER ─────────────────────────────────────────────── -->
  <div style="background:#0F172A;padding:10px 24px;text-align:right;">
    <span style="font-size:10px;color:#64748B;">Sources: Manufacturer PI &middot; Trissel&apos;s Handbook &middot; King Guide &middot; Lexicomp &middot; OpenFDA Label Data &middot; ${year}</span>
  </div>

</div>

<script>
function exportPdf() {
  const btn = document.getElementById('exportBtn');
  btn.disabled = true;
  btn.textContent = 'Generating…';
  const el = document.getElementById('infographic');
  const opt = {
    margin: 0,
    filename: '${title}-Pharmacist-Cheatsheet.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(el).save().then(() => {
    btn.textContent = '✓ Downloaded!';
    setTimeout(() => { btn.disabled = false; btn.textContent = '⬇ Export PDF'; }, 2000);
  }).catch(() => {
    btn.textContent = '⬇ Export PDF';
    btn.disabled = false;
  });
}
</script>
</body>
</html>`;
}
