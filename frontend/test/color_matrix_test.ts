/**
 * Visual Test Matrix for colorTransform.ts
 * 
 * Runs deriveDarkColor against 15 test colors × 7 semantic roles,
 * outputs an HTML file showing Light → Dark side-by-side for visual QA.
 */

import { deriveDarkColor } from '../src/shared/colorTransform.ts';

const TEST_COLORS = [
  '#FFFFFF', '#000000', '#F5F5F5', '#111111',
  '#7C3AED', '#6366F1', '#3B82F6', '#22C55E',
  '#EF4444', '#F59E0B', '#EC4899', '#14B8A6',
  '#FF5733', '#123456', '#808080',
];

const ROLES = [
  'background', 'text', 'border', 'accent', 'input', 'icon',
] as const;

// Build test matrix
const rows: string[] = [];
for (const hex of TEST_COLORS) {
  const cells: string[] = [];
  for (const role of ROLES) {
    const dark = deriveDarkColor(hex, role);
    cells.push(`
      <td style="padding:0">
        <div style="display:flex; height:52px">
          <div style="width:50%; background:${hex}; display:flex; align-items:center; justify-content:center">
            <span style="font-size:10px; color:${isLight(hex) ? '#000' : '#fff'}; font-family:monospace">${hex}</span>
          </div>
          <div style="width:50%; background:${dark}; display:flex; align-items:center; justify-content:center">
            <span style="font-size:10px; color:${isLight(dark) ? '#000' : '#fff'}; font-family:monospace">${dark}</span>
          </div>
        </div>
      </td>
    `);
  }
  rows.push(`<tr>${cells.join('')}</tr>`);
}

const headerCells = ROLES.map(r => `<th style="padding:8px 4px; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; color:#666; border-bottom:2px solid #ddd">${r}</th>`).join('');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Color Transform Test Matrix</title>
  <style>
    body { font-family: system-ui, sans-serif; margin:20px; background:#f9fafb }
    h1 { font-size:18px; margin-bottom:4px }
    p { font-size:13px; color:#666; margin-top:0 }
    table { border-collapse:collapse; width:100% }
    th, td { border:1px solid #e5e7eb; text-align:center }
    .legend { display:flex; gap:16px; margin:12px 0; font-size:12px; color:#888 }
    .legend span { display:inline-flex; align-items:center; gap:4px }
    .legend .box { width:14px; height:14px; border:1px solid #ccc; display:inline-block }
  </style>
</head>
<body>
  <h1>OKLCH Color Transform — Role-Aware Test Matrix</h1>
  <p>Each cell shows <strong>Light (left)</strong> → <strong>Dark (right)</strong>. Same source color, different role = different transformation.</p>
  <div class="legend">
    <span><div class="box" style="background:#fff"></div> Light source</span>
    <span><div class="box" style="background:#1a1a1e"></div> Dark derived</span>
  </div>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${rows.join('')}</tbody>
  </table>
</body>
</html>`;

// Simple lightness check for text contrast
function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
}

// Write output
// @ts-ignore: node types not installed for frontend
const fs = await import('node:fs');
const outPath = new URL('./color_matrix.html', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
fs.writeFileSync(outPath, html, 'utf-8');
console.log(`✅ Matrix written to: ${outPath}`);
console.log('');
console.log('=== Quick console summary ===');
for (const hex of TEST_COLORS) {
  const line = ROLES.map(r => `${r}: ${deriveDarkColor(hex, r)}`).join('  |  ');
  console.log(`${hex}  →  ${line}`);
}
