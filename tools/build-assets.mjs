#!/usr/bin/env node
// Draws the README's images, in light and dark, in the look of the author's GitHub profile: an Electric
// Blue header, Manrope, flat white or graphite cards with thin edges, lime as a highlighter.
//
//   node tools/build-assets.mjs     writes assets/*.svg
//
// Manrope (SIL Open Font License, tools/fonts/OFL.txt) is embedded in each image, since GitHub shows
// README images without loading web fonts. tools/fonts/manrope-metrics.json holds its glyph widths, so
// text is measured, not guessed. SVG text doesn't wrap: every line below is cut by hand.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = join(ROOT, 'tools', 'fonts');
const OUT = join(ROOT, 'assets');
const W = 1200;

const INK = '#1A1A1E', BLUE = '#305CFF', SKY = '#84A6FF', LIME = '#B8FA4E', PAPER = '#F5F5F6', LINE = '#DEDFE6';
const WHITE = '#FFFFFF';
const SANS = "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace";

const METRICS = JSON.parse(readFileSync(join(FONTS, 'manrope-metrics.json'), 'utf8'));
const FACES = [500, 700, 800]
  .map((w) => `@font-face { font-family: Manrope; font-weight: ${w}; src: url(data:font/woff;base64,${readFileSync(join(FONTS, `manrope-${w}.woff`)).toString('base64')}) format('woff'); }`)
  .join('');

const CARDS = {
  light: { card: WHITE, edge: LINE, text: INK, muted: '#64646F', accent: BLUE, chip: PAPER, chipEdge: LINE, file: INK, faint: '#C9CBD3', node: PAPER },
  dark: { card: INK, edge: '#2E2E36', text: WHITE, muted: '#A1A1AA', accent: SKY, chip: '#25252C', chipEdge: '#3A3A44', file: WHITE, faint: '#41414B', node: '#25252C' },
};
// The layer this skill adds, lit the same way in both modes.
const HOT = { card: BLUE, edge: BLUE, text: WHITE, muted: '#D6E0FF', accent: LIME, chip: '#4A71FF', chipEdge: '#7E99FF', file: WHITE };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sans = (label, size, weight = 500, spacing = 0) => [...label].reduce((sum, c) => sum + (METRICS[weight][c] ?? 0.6) * size + spacing, 0);
const mono = (label, size) => label.length * size * 0.6;
const style = (extra = '') => `<style>${FACES} text { font-family: ${SANS}; } .mono { font-family: ${MONO}; } ${extra}</style>`;

function svg(width, height, title, body) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">\n` +
    `<title>${esc(title)}</title>\n${body.join('\n')}\n</svg>\n`
  );
}

const text = (x, y, content, { size = 16, weight = 500, fill = INK, anchor, spacing, cls } = {}) =>
  `<text x="${x}" y="${y}"${cls ? ` class="${cls}"` : ''} font-size="${size}" font-weight="${weight}" fill="${fill}"` +
  `${anchor ? ` text-anchor="${anchor}"` : ''}${spacing !== undefined ? ` letter-spacing="${spacing}"` : ''}>${content}</text>`;

const box = (x, y, w, h, fill, edge, r = 12, stroke = 1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${edge}" stroke-width="${stroke}"/>`;

// ------------------------------------------------------------------ banner

function banner() {
  const h = 340;
  const layers = ['Context', 'Skills', 'Orchestration', 'Integrations'];
  const hot = 2, top = 52, step = 62, nh = 46, nw = 330, nx = 816, px = nx + 26;
  const flow = `M${px} ${top + nh / 2} V${top + (layers.length - 1) * step + nh / 2}`;
  const size = 30, spacing = -0.4;
  const lead = 'and that tells them when it ', hot2 = 'goes stale.';
  const hx = 56 + sans(lead, size, 500, spacing);
  const body = [
    style(
      `.dot { offset-path: path('${flow}'); animation: run 3.6s ease-in-out infinite; }` +
        '@keyframes run { 0% { offset-distance: 0%; opacity: 0; } 8% { opacity: 1; } 85% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }' +
        '@media (prefers-reduced-motion: reduce) { .dot { display: none; } }',
    ),
    `<defs><clipPath id="c"><rect x="0" y="0" width="${W}" height="${h}" rx="24"/></clipPath>` +
      '<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#4A71FF"/></pattern></defs>',
    `<rect x="0" y="0" width="${W}" height="${h}" rx="24" fill="${BLUE}"/>`,
    `<rect x="0" y="0" width="${W}" height="${h}" fill="url(#p)" clip-path="url(#c)"/>`,
    text(56, 70, 'OPEN SOURCE · AGENT SKILL', { size: 13, weight: 700, fill: '#D6E0FF', spacing: 1.6 }),
    text(50, 152, 'GTM OS', { size: 96, weight: 800, fill: WHITE, spacing: -3 }),
    text(56, 214, 'The go-to-market memory your agents read first,', { size, weight: 500, fill: WHITE, spacing }),
    // A highlighter stroke behind the last words, which turn dark on it.
    `<rect x="${(hx - 5).toFixed(1)}" y="234" width="${(sans(hot2, size, 800, spacing) + 9).toFixed(1)}" height="36" rx="7" fill="${LIME}"/>`,
    text(56, 260, `${esc(lead)}<tspan font-weight="800" fill="${INK}">${esc(hot2)}</tspan>`, { size, weight: 500, fill: WHITE, spacing }),
    text(56, 304, 'Works in Claude Code, Codex and Hermes Agent.', { size: 18, weight: 500, fill: '#D6E0FF' }),
    `<path d="${flow}" stroke="#7E99FF" stroke-width="2" stroke-dasharray="3 5" fill="none"/>`,
  ];
  layers.forEach((layer, i) => {
    const y = top + i * step, lit = i === hot;
    const [fill, edge, fg] = lit ? [WHITE, WHITE, BLUE] : ['#4A71FF', '#7E99FF', WHITE];
    body.push(box(nx, y, nw, nh, fill, edge, 13));
    body.push(`<circle cx="${px}" cy="${y + nh / 2}" r="5" fill="${fg}" opacity="${lit ? 1 : 0.55}"/>`);
    body.push(text(nx + 46, y + 29, layer, { size: 17, weight: 700, fill: fg, spacing: -0.2 }));
    body.push(text(nx + nw - 18, y + 29, `0${i + 1}`, { size: 13, weight: 700, fill: fg, anchor: 'end', spacing: 1 }));
  });
  body.push(`<circle class="dot" r="6" fill="${LIME}"/>`);
  return svg(W, h, 'GTM OS. The go-to-market memory your agents read first, and that tells them when it goes stale. Works in Claude Code, Codex and Hermes Agent.', body);
}

// ------------------------------------------------------------------ the four layers

const LAYERS = [
  {
    name: 'Context',
    role: ['What every agent', 'reads first'],
    items: [
      ['CLAUDE.md', ['the one-page map']],
      ['latest.md · history.md', ['short and long memory']],
      ['foundations/', ['product · proof · ICP · competitors', 'positioning · messaging · brand']],
      ['workstreams/', ['research → strategy → execution']],
    ],
  },
  {
    name: 'Skills',
    role: ['One job each, reading', 'the foundations'],
    items: [
      ['gtm-os', ['install · refresh · update']],
      ['competitor-card', ['one dated card per competitor']],
      ['your next skill', ['a copy of competitor-card,', 'rewritten for the new job']],
    ],
  },
  {
    name: 'Orchestration',
    role: ["Says what's stale,", 'and what to run next'],
    items: [
      ['lifetime.yaml', ['how long each type stays true']],
      ['built_from', ['what each document is built on']],
      ['freshness.mjs --plan', ['the skills to run, sources first']],
      ['session-start hook', ['the plan, at every session']],
    ],
  },
  {
    name: 'Integrations',
    role: ['What flows in and out,', 'never a key'],
    items: [
      ['connections.md', ['each tool: what it brings,', 'who uses it, its guardrail']],
      ['your tools', ['CRM · call notes · web', 'email · ads · CMS']],
    ],
  },
];

function layers(base) {
  const left = 40, chipsX = 330, chipsW = W - chipsX - 32, gap = 14, pad = 24, bandGap = 18;
  const body = [style()];
  let y = 0;
  LAYERS.forEach((layer, i) => {
    const t = i === 2 ? HOT : base;
    const chips = layer.items.map(([file, desc]) => {
      const width = Math.round(Math.max(mono(file, 17), ...desc.map((d) => sans(d, 15.5))) + 36);
      return { file, desc, width, height: 50 + desc.length * 21 };
    });
    const rows = [];
    let row = [], used = 0;
    for (const chip of chips) {
      if (row.length && used + gap + chip.width > chipsW) {
        rows.push(row);
        row = [];
        used = 0;
      }
      used += (row.length ? gap : 0) + chip.width;
      row.push(chip);
    }
    rows.push(row);
    const heights = rows.map((r) => Math.max(...r.map((c) => c.height)));
    const h = Math.max(156, heights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1) + 2 * pad);

    body.push(box(0.75, y + 0.75, W - 1.5, h - 1.5, t.card, t.edge, 20));
    body.push(text(left, y + 46, `0${i + 1}`, { size: 14, weight: 700, fill: t.accent, spacing: 1.6 }));
    body.push(text(left - 2, y + 86, layer.name, { size: 32, weight: 800, fill: t.text, spacing: -1 }));
    layer.role.forEach((line, k) => body.push(text(left, y + 116 + k * 23, esc(line), { size: 17, weight: 500, fill: t.muted })));

    let cy = y + pad;
    rows.forEach((r, k) => {
      let cx = chipsX;
      for (const chip of r) {
        body.push(box(cx, cy, chip.width, heights[k], t.chip, t.chipEdge, 12));
        body.push(text(cx + 18, cy + 30, esc(chip.file), { size: 17, weight: 700, fill: t.file, cls: 'mono' }));
        chip.desc.forEach((d, j) => body.push(text(cx + 18, cy + 55 + j * 21, esc(d), { size: 15.5, weight: 500, fill: t.muted })));
        cx += chip.width + gap;
      }
      cy += heights[k] + gap;
    });
    y += h + bandGap;
  });
  const summary =
    'The four layers of the GTM OS. 1, context: CLAUDE.md, latest.md and history.md, the foundations, the workstreams. ' +
    '2, skills: gtm-os, competitor-card, and your next skill. 3, orchestration: lifetime.yaml, built_from, freshness.mjs --plan, the session-start hook. ' +
    '4, integrations: connections.md and your tools.';
  return svg(W, y - bandGap, summary, body);
}

// ------------------------------------------------------------------ one change, the whole chain

function chain(t) {
  const nw = 196, nh = 62, h = 470;
  const col = (k) => 40 + k * 232;
  const N = {
    product: { x: col(0), y: 96, label: 'product.md', state: 'calm' },
    icp: { x: col(0), y: 240, label: 'icp.md', state: 0 },
    proof: { x: col(1), y: 96, label: 'proof.md', state: 'calm' },
    competitors: { x: col(1), y: 240, label: 'competitors.md', state: 1 },
    positioning: { x: col(2), y: 168, label: 'positioning.md', state: 2 },
    messaging: { x: col(3), y: 96, label: 'messaging.md', state: 2 },
    brand: { x: col(3), y: 240, label: 'brand.md', state: 2 },
    plan: { x: col(4), y: 168, label: 'content plan', sub: 'workstreams/', state: 3 },
  };
  const EDGES = [
    ['product', 'proof', null],
    ['product', 'positioning', null],
    ['proof', 'positioning', null],
    ['icp', 'competitors', 1],
    ['competitors', 'positioning', 2],
    ['positioning', 'messaging', 2],
    ['positioning', 'brand', 2],
    ['positioning', 'plan', 3],
    ['messaging', 'plan', 3],
  ];
  // Each step lights up at its moment of a 9-second loop and stays lit until the loop restarts.
  const keyframes = [0.4, 1.6, 2.8, 4.0]
    .map((s, k) => {
      const p = (s / 9) * 100;
      return `.s${k} { animation: s${k} 9s infinite both; } @keyframes s${k} { 0%, ${(p - 0.1).toFixed(1)}% { opacity: 0; } ${p.toFixed(1)}%, 88% { opacity: 1; } 94%, 100% { opacity: 0; } }`;
    })
    .join(' ');
  const body = [
    style(`${keyframes} @media (prefers-reduced-motion: reduce) { .s0, .s1, .s2, .s3 { animation: none; opacity: 1; } }`),
    `<defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${t.faint}"/></marker>` +
      `<marker id="b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${BLUE}"/></marker></defs>`,
    box(0.75, 0.75, W - 1.5, h - 1.5, t.card, t.edge, 22),
    text(40, 52, 'HOW ONE CHANGE TRAVELS', { size: 13, weight: 700, fill: t.accent, spacing: 1.6 }),
  ];
  const path = (a, b) => {
    const x1 = N[a].x + nw, y1 = N[a].y + nh / 2, x2 = N[b].x - 4, y2 = N[b].y + nh / 2;
    return `M${x1} ${y1} C${x1 + 30} ${y1}, ${x2 - 30} ${y2}, ${x2} ${y2}`;
  };
  for (const [a, b] of EDGES) body.push(`<path d="${path(a, b)}" fill="none" stroke="${t.faint}" stroke-width="2" marker-end="url(#a)"/>`);
  for (const [a, b, s] of EDGES) if (s !== null) body.push(`<path class="s${s}" d="${path(a, b)}" fill="none" stroke="${BLUE}" stroke-width="3" marker-end="url(#b)"/>`);

  for (const n of Object.values(N)) {
    const calm = n.state === 'calm';
    const labelY = n.y + (n.sub ? 28 : 37);
    const label = (fill) =>
      text(n.x + nw / 2, labelY, esc(n.label), { size: 16, weight: 700, fill, anchor: 'middle', cls: 'mono' }) +
      (n.sub ? text(n.x + nw / 2, n.y + 48, esc(n.sub), { size: 12.5, weight: 500, fill, anchor: 'middle', cls: 'mono' }) : '');
    body.push(box(n.x, n.y, nw, nh, t.node, t.chipEdge, 14));
    body.push(label(calm ? t.muted : t.text));
    if (calm) continue;
    const s = n.state;
    // The updated document in blue; what it sets off, highlighted in lime.
    const [fill, fg] = s === 0 ? [BLUE, WHITE] : [LIME, INK];
    body.push(`<g class="s${s}">${box(n.x, n.y, nw, nh, fill, fill, 14)}${label(fg)}</g>`);
    const tag = s === 0 ? 'UPDATED' : s === 3 ? 'RE-READ' : 'RE-CHECK';
    const tw = Math.round(sans(tag, 11.5, 700, 1.2) + 22);
    const [tagFill, tagText] = s === 0 ? [INK, LIME] : [BLUE, WHITE];
    body.push(
      `<g class="s${s}"><rect x="${n.x + nw / 2 - tw / 2}" y="${n.y - 13}" width="${tw}" height="24" rx="12" fill="${tagFill}"/>` +
        text(n.x + nw / 2, n.y + 3.5, tag, { size: 11.5, weight: 700, fill: tagText, anchor: 'middle', spacing: 1.2 }) +
        '</g>',
    );
  }

  const steps = [
    ['1', 'competitor-card', 'competitors.md'],
    ['2', 'gtm-os', 'positioning · brand · messaging'],
    ['3', 'by hand', 'the content plan'],
  ];
  body.push(`<line x1="40" y1="338" x2="${W - 40}" y2="338" stroke="${t.chipEdge}" stroke-width="1.5"/>`);
  body.push(text(40, 372, 'THE PLAN, SOURCES FIRST', { size: 13, weight: 700, fill: t.accent, spacing: 1.6 }));
  let x = 40;
  steps.forEach(([num, skill, what], k) => {
    const label = `${skill} → ${what}`;
    const sw = Math.round(mono(label, 14.5) + 60);
    const chip = (fill, edge, circle, numColor, fg) =>
      box(x, 388, sw, 46, fill, edge, 12) +
      `<circle cx="${x + 24}" cy="411" r="12" fill="${circle}"/>` +
      text(x + 24, 416, num, { size: 13, weight: 800, fill: numColor, anchor: 'middle' }) +
      text(x + 46, 416, esc(label), { size: 14.5, weight: 700, fill: fg, cls: 'mono' });
    // A grey version waits underneath, so the row never looks empty between two loops.
    body.push(chip(t.node, t.chipEdge, t.faint, t.card, t.muted));
    body.push(`<g class="s${k + 1}">${chip(BLUE, BLUE, LIME, INK, WHITE)}</g>`);
    x += sw + 14;
  });
  body.push(text(W - 40, 52, 'product.md and proof.md are not built from the ICP: the plan leaves them alone.', { size: 14, weight: 500, fill: t.muted, anchor: 'end' }));
  const summary =
    'One change, the whole chain. The ICP is updated; the competitor overview, the positioning, the messaging, the brand and the content plan are built from it, ' +
    'directly or not, and get flagged. The plan: 1, competitor-card on competitors.md; 2, gtm-os on positioning, brand and messaging; 3, re-read the content plan by hand. ' +
    'Product and proof are untouched.';
  return svg(W, h, summary, body);
}

mkdirSync(OUT, { recursive: true });
for (const mode of ['light', 'dark']) {
  writeFileSync(join(OUT, `banner-${mode}.svg`), banner());
  writeFileSync(join(OUT, `layers-${mode}.svg`), layers(CARDS[mode]));
  writeFileSync(join(OUT, `chain-${mode}.svg`), chain(CARDS[mode]));
}
console.log('assets/: banner, layers and chain, light and dark (6 files)');
