#!/usr/bin/env node
// Freshness check of the GTM OS. Read-only, no dependencies, Node 18 or later.
//
//   node scripts/freshness.mjs                    the report, as of today
//   node scripts/freshness.mjs --plan             the report, then the refresh plan: what to run, in which order
//   node scripts/freshness.mjs --brief            a few lines: the counts and the plan (the session-start hook uses it)
//   node scripts/freshness.mjs --date 2027-01-15  as of another day, to see what will go stale
//
// Exits 1 when a document is stale, has a source that changed, or is malformed; 0 otherwise.
// Drafts and empty templates don't fail the check: they're listed, to validate or to fill.
// --brief always exits 0: it informs, it doesn't judge.
//
// `verified_on` takes a date (2026-10-19) or a date and a time (2026-10-19T14:30), in local time.
// A date alone counts from midnight, so any source changed that day flags the document.
// That's on purpose: one re-check too many beats one change missed.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TABLE_FILE = join(ROOT, '.claude', 'lifetime.yaml');
// Where a skill named in refreshed_by can live: this repository, or the user's own skills folders.
const SKILL_DIRS = [
  join(ROOT, '.claude', 'skills'),
  join(ROOT, '.agents', 'skills'),
  ...['.claude', '.agents', '.hermes'].map((dir) => join(homedir(), dir, 'skills')),
];

// Every Markdown file in these folders carries a header, except the ones below.
const CONTROLLED_FOLDERS = ['foundations', 'workstreams'];
// No header by nature: folder maps, and raw data kept with its source and date.
const NO_HEADER = /(^|\/)(CLAUDE|README|AGENTS)\.md$|(^|\/)data\//;
// A deliverable may carry a header, to be flagged when its strategy changes, but doesn't have to.
const HEADER_OPTIONAL = /^workstreams\/[^/]+\/execution\//;
const SKIPPED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build']);
const VERIFIED_FORMAT = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/;
const LIFETIMES = /^(\d+|never|quarter|propagation)$/;
const MAP_MAX_LINES = 80;

const args = process.argv.slice(2);
const BRIEF = args.includes('--brief');
const PLAN = BRIEF || args.includes('--plan');

const pad = (n) => String(n).padStart(2, '0');
const day = (d) => d.toISOString().slice(0, 10);
const dayUTC = (iso) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
const localDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const stamp = (d) => `${localDay(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
// When a document was checked, in local time: midnight if no time is given.
const instant = (value) => new Date(value.length === 10 ? `${value}T00:00` : value);
// Compare to the minute: the seconds of a commit or a file say nothing useful.
const toMinute = (d) => new Date(Math.floor(d.getTime() / 60_000) * 60_000);
const plusDays = (d, n) => new Date(d.getTime() + n * 86_400_000);
const endOfQuarter = (d) => new Date(Date.UTC(d.getUTCFullYear(), Math.floor(d.getUTCMonth() / 3) * 3 + 3, 0));

const iDate = args.indexOf('--date');
const TODAY = dayUTC(iDate > -1 ? args[iDate + 1] ?? '' : localDay(new Date()));
if (Number.isNaN(TODAY.getTime())) {
  console.error('Invalid date. Expected format: YYYY-MM-DD');
  process.exit(2);
}

const anomalies = [];

// The lifetime table: "type: days" lines, plus "repo.<name>: <path>" lines for other repositories.
function readTable() {
  if (!existsSync(TABLE_FILE)) {
    console.error(`Missing ${relative(ROOT, TABLE_FILE)}: the lifetime table. Run the gtm-os install first.`);
    process.exit(2);
  }
  const types = {};
  const repos = {};
  for (const line of readFileSync(TABLE_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.replace(/\s#.*$|^#.*$/, '').match(/^\s*([\w.-]+)\s*:\s*(.+?)\s*$/);
    if (!m) continue;
    if (m[1].startsWith('repo.')) repos[m[1].slice(5)] = resolve(ROOT, m[2]);
    else if (LIFETIMES.test(m[2])) types[m[1]] = /^\d+$/.test(m[2]) ? Number(m[2]) : m[2];
    else anomalies.push(`.claude/lifetime.yaml: "${m[1]}: ${m[2]}" is not a lifetime (a number of days, never, quarter, propagation)`);
  }
  return { types, repos };
}

// A minimal YAML header: "key: value" lines and "- item" lists.
function readHeader(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const header = {};
  let key = null;
  for (const raw of m[1].split('\n')) {
    const line = raw.replace(/\s+#.*$/, '');
    const item = line.match(/^\s*-\s+(.+)$/);
    if (item && key) {
      if (!Array.isArray(header[key])) header[key] = [];
      header[key].push(unquote(item[1].trim()));
      continue;
    }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      header[key] = kv[2].trim() === '[]' ? [] : unquote(kv[2].trim());
    }
  }
  return header;
}
const unquote = (s) => s.replace(/^(["'])(.*)\1$/, '$2');
const asList = (v) => [].concat(v ?? []).filter((s) => s && s !== '[]');

// A template nobody filled: nothing but headings, empty bullets and guidance comments.
function isEmpty(text) {
  const body = text.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n?/, '').replace(/<!--[\s\S]*?-->/g, '');
  return !body.split('\n').some((line) => {
    const t = line.trim();
    return t && !t.startsWith('#') && !/^[-*|:\s]+$/.test(t);
  });
}

function markdownFiles(folder) {
  if (!existsSync(folder)) return [];
  const found = [];
  for (const name of readdirSync(folder)) {
    if (SKIPPED_DIRS.has(name)) continue;
    const path = join(folder, name);
    if (statSync(path).isDirectory()) found.push(...markdownFiles(path));
    else if (name.endsWith('.md')) found.push(path);
  }
  return found;
}

const git = (dir, gitArgs) =>
  execFileSync('git', ['--no-optional-locks', '-C', dir, ...gitArgs], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

// When a source last changed. null: dated by nature (a web page read on a day, an answer, an outside file).
function sourceChange(ref) {
  if (/^(web|person|file):/.test(ref)) return null;
  let base = ROOT;
  let path = ref.replace(/^\.\//, '');
  const prefixed = ref.match(/^([\w-]+):(.+)$/);
  if (prefixed) {
    if (!(prefixed[1] in repos)) return { problem: `unknown prefix "${prefixed[1]}:" (declare repo.${prefixed[1]} in .claude/lifetime.yaml)` };
    base = repos[prefixed[1]];
    path = prefixed[2];
  }
  const full = join(base, path);
  if (!existsSync(full)) return { problem: `source not found, ${ref}` };
  // A document of this OS changes when it's checked again: its verified_on says when.
  if (base === ROOT && full.endsWith('.md')) {
    const h = readHeader(readFileSync(full, 'utf8'));
    if (h?.verified_on && VERIFIED_FORMAT.test(h.verified_on)) return { when: instant(h.verified_on) };
  }
  // Anything else changes with its last commit, or with the file itself when it has uncommitted edits.
  try {
    const edited = git(base, ['status', '--porcelain', '--', path]);
    const committed = edited ? '' : git(base, ['log', '-1', '--format=%cI', '--', path]);
    if (committed) return { when: toMinute(new Date(committed)) };
  } catch {
    // not a git repository: fall back on the file's date
  }
  return { when: toMinute(statSync(full).mtime) };
}

const { types, repos } = readTable();
const docs = new Map();

for (const file of [join(ROOT, 'CLAUDE.md'), ...CONTROLLED_FOLDERS.flatMap((f) => markdownFiles(join(ROOT, f)))]) {
  if (!existsSync(file)) continue;
  const rel = relative(ROOT, file).split('\\').join('/');
  const text = readFileSync(file, 'utf8');

  if (/(^|\/)CLAUDE\.md$/.test(rel)) {
    const lines = text.split('\n').length;
    if (lines > MAP_MAX_LINES) anomalies.push(`${rel}: ${lines} lines, a map stays on one page (${MAP_MAX_LINES})`);
    continue;
  }
  if (NO_HEADER.test(rel)) continue;

  const header = readHeader(text);
  if (!header) {
    if (!HEADER_OPTIONAL.test(rel)) anomalies.push(`${rel}: no header`);
    continue;
  }
  if (!header.type || !(header.type in types)) {
    anomalies.push(`${rel}: unknown type "${header.type ?? ''}" (see .claude/lifetime.yaml)`);
    continue;
  }
  if (!VERIFIED_FORMAT.test(header.verified_on ?? '')) {
    anomalies.push(`${rel}: verified_on missing or malformed`);
    continue;
  }

  const lifetime = types[header.type];
  const checkedDay = dayUTC(header.verified_on);
  const checkedAt = instant(header.verified_on);
  let due = null;
  if (typeof lifetime === 'number') due = plusDays(checkedDay, lifetime);
  else if (lifetime === 'quarter') due = endOfQuarter(checkedDay);

  const changed = [];
  const localSources = [];
  for (const source of asList(header.built_from)) {
    if (!/^[\w-]+:/.test(source) || /^\.\//.test(source)) localSources.push(source.replace(/^\.\//, '').replace(/\/$/, ''));
    const r = sourceChange(source);
    if (!r) continue;
    if (r.problem) {
      anomalies.push(`${rel}: ${r.problem}`);
      continue;
    }
    if (r.when > checkedAt) changed.push(`${source}, changed ${stamp(r.when)}`);
  }

  const doc = { rel, header, skill: header.refreshed_by || null, localSources };
  const label = `${rel} [${header.type}, checked ${header.verified_on.replace('T', ' ')} by ${header.verified_by || 'nobody'}]`;
  if (isEmpty(text)) Object.assign(doc, { state: 'empty', line: label, why: 'empty, to fill' });
  else if (due && TODAY > due) Object.assign(doc, { state: 'stale', line: `${label}: stale since ${day(due)}`, why: `stale since ${day(due)}` });
  else if (changed.length) Object.assign(doc, { state: 'changed', line: `${label}: ${changed.join('; ')}`, why: `source changed: ${changed.join('; ')}` });
  else if (header.status === 'draft') Object.assign(doc, { state: 'draft', line: `${label}${due ? `, to review by ${day(due)}` : ''}` });
  else Object.assign(doc, { state: 'valid', line: `${label}${due ? `, valid until ${day(due)}` : ''}` });
  docs.set(rel, doc);
}

if (docs.size === 0) anomalies.push('no document read: the check is blind (no foundations/ or workstreams/ with headers?)');

// --- The refresh plan -------------------------------------------------------------------------
// What to work on: every document stale, with a changed source, or empty; then everything built from
// them, directly or not, since it will need a re-check once they change. Sources come before what's
// built from them; among documents ready at the same time, the same skill continues, then the
// foundations come first, then research, strategy, execution.

function skillFound(name) {
  return SKILL_DIRS.some((dir) => existsSync(join(dir, name, 'SKILL.md')));
}

function buildPlan() {
  const work = new Map();
  for (const d of docs.values()) if (['stale', 'changed', 'empty'].includes(d.state)) work.set(d.rel, d.why);

  const sourcesOf = (d) =>
    [...docs.keys()].filter((other) => other !== d.rel && d.localSources.some((s) => other === s || other.startsWith(`${s}/`)));
  const queue = [...work.keys()];
  while (queue.length) {
    const changing = queue.shift();
    for (const d of docs.values()) {
      if (work.has(d.rel) || !sourcesOf(d).includes(changing)) continue;
      work.set(d.rel, `built from ${changing}, which will change`);
      queue.push(d.rel);
    }
  }

  const rank = (rel) =>
    rel.startsWith('foundations/') ? 0 : /\/research\//.test(rel) ? 1 : /\/strategy\//.test(rel) ? 2 : /\/execution\//.test(rel) ? 3 : 4;
  const byRank = (a, b) => rank(a) - rank(b) || a.localeCompare(b);
  const waitingOn = new Map([...work.keys()].map((rel) => [rel, new Set(sourcesOf(docs.get(rel)).filter((s) => work.has(s)))]));

  const order = [];
  let lastSkill;
  while (waitingOn.size) {
    const ready = [...waitingOn.keys()].filter((rel) => waitingOn.get(rel).size === 0).sort(byRank);
    if (!ready.length) {
      // Documents built from each other: no order is right, list them and say so.
      for (const rel of [...waitingOn.keys()].sort(byRank)) order.push({ rel, cycle: true });
      break;
    }
    const next = ready.find((rel) => docs.get(rel).skill === lastSkill) ?? ready[0];
    order.push({ rel: next });
    lastSkill = docs.get(next).skill;
    waitingOn.delete(next);
    for (const deps of waitingOn.values()) deps.delete(next);
  }

  const steps = [];
  for (const { rel, cycle } of order) {
    const skill = docs.get(rel).skill;
    const why = work.get(rel) + (cycle ? ' (built from each other: check them together)' : '');
    const last = steps[steps.length - 1];
    if (last && last.skill === skill) last.items.push({ rel, why });
    else steps.push({ skill, items: [{ rel, why }] });
  }
  return steps;
}

function latestInfo() {
  const file = join(ROOT, 'latest.md');
  if (!existsSync(file)) return 'latest.md: missing';
  const m = readFileSync(file, 'utf8').match(/^##\s+(\d{4}-\d{2}-\d{2})/m);
  if (!m) return 'latest.md: no dated entry';
  try {
    const out = git(ROOT, ['log', `--since=${m[1]}T23:59:59`, '--format=%h']);
    const n = out ? out.split('\n').length : 0;
    return `latest.md: last entry ${m[1]}${n ? `; ${n} commit${n > 1 ? 's' : ''} since, not recorded there` : ''}`;
  } catch {
    return `latest.md: last entry ${m[1]}`;
  }
}

// --- Output ----------------------------------------------------------------------------------
const by = (state) => [...docs.values()].filter((d) => d.state === state).map((d) => d.line);
const groups = {
  stale: by('stale'),
  changed: by('changed'),
  empty: by('empty'),
  draft: by('draft'),
  valid: by('valid'),
};
const steps = PLAN ? buildPlan() : [];

function printPlan(indent = '  ') {
  if (!steps.length) {
    console.log(`${indent}Nothing to refresh.`);
    return;
  }
  steps.forEach((step, i) => {
    const who = step.skill
      ? `Run \`${step.skill}\`${skillFound(step.skill) ? '' : ' (not found in the skills folders)'}`
      : 'Re-read by hand (no skill keeps these)';
    console.log(`${indent}${i + 1}. ${who}:`);
    for (const item of step.items) console.log(`${indent}     - ${item.rel}: ${item.why}`);
  });
}

if (BRIEF) {
  console.log(
    `GTM OS freshness on ${day(TODAY)}: ${docs.size} documents. Stale ${groups.stale.length} · source changed ${groups.changed.length} · ` +
      `empty ${groups.empty.length} · drafts to validate ${groups.draft.length} · anomalies ${anomalies.length}. ${latestInfo()}.`,
  );
  for (const a of anomalies) console.log(`  ! ${a}`);
  console.log('Refresh plan:');
  printPlan();
  if (steps.length) console.log('Say "refresh the GTM OS" to review this plan and run it.');
  process.exit(0);
}

const block = (title, lines) => {
  console.log(`\n${title}: ${lines.length}`);
  for (const l of lines) console.log(`  - ${l}`);
};
console.log(`GTM OS freshness on ${day(TODAY)}, ${docs.size} documents read. ${latestInfo()}.`);
block('Stale', groups.stale);
block('To re-check, a source changed since', groups.changed);
block('Empty, to fill', groups.empty);
block("Drafts awaiting the owner's validation", groups.draft);
block('Valid', groups.valid);
block('Anomalies', anomalies);
if (PLAN) {
  console.log('\nRefresh plan, in this order:');
  printPlan();
}

const failing = groups.stale.length + groups.changed.length + anomalies.length;
process.exit(failing > 0 ? 1 : 0);
