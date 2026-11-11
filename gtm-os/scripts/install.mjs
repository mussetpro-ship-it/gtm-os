#!/usr/bin/env node
// Installs the GTM OS templates into a repository. No dependencies, Node 18 or later.
//
//   node install.mjs --target <repo> --company "Acme" --owner "Jane Doe" [--workstreams content,outbound]
//
// First checks the skill's files against checksums.txt, and stops if one was mis-copied.
// Never overwrites a file: an existing file is skipped and listed.
// In templates/, a "dot-" folder becomes a hidden one (dot-claude → .claude) and a ".template" suffix is
// dropped (CLAUDE.md.template → CLAUDE.md). That keeps the templates from being read as a live map or a live
// skill while they sit inside this skill.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, lstatSync, symlinkSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const SKILL = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(SKILL, 'templates');

// Line endings, trailing spaces and final newlines don't count: an editor may change them.
const normalized = (text) => text.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trimEnd();
const sumsFile = join(SKILL, 'checksums.txt');
if (existsSync(sumsFile)) {
  const wrong = [];
  for (const line of readFileSync(sumsFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([0-9a-f]{64})\s+(.+)$/);
    if (!m) continue;
    const path = join(SKILL, m[2]);
    const actual = existsSync(path) ? createHash('sha256').update(normalized(readFileSync(path, 'utf8'))).digest('hex') : 'missing';
    if (actual !== m[1]) wrong.push(`${m[2]}${actual === 'missing' ? ' (missing)' : ''}`);
  }
  if (wrong.length) {
    console.error(`These files of the skill don't match the originals, so nothing was installed:\n${wrong.map((w) => `  - ${w}`).join('\n')}`);
    console.error('Rewrite each one exactly from its source (the prompt or the repository), then run this command again.');
    process.exit(3);
  }
} else {
  console.log('No checksums.txt: the skill files are not checked.');
}

function option(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  const value = i > -1 ? process.argv[i + 1] : undefined;
  return value && !value.startsWith('--') ? value : fallback;
}

const target = resolve(option('target', process.cwd()));
const company = option('company');
const owner = option('owner');
const workstreams = option('workstreams', 'content')
  .split(',')
  .map((w) => w.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  .filter(Boolean);
if (!company || !owner) {
  console.error('Usage: node install.mjs --target <repo> --company "<company>" --owner "<owner>" [--workstreams content,outbound]');
  process.exit(2);
}

const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const values = {
  COMPANY: company,
  OWNER: owner,
  TODAY: today,
  NOW: `${today}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
  WORKSTREAM_ROWS: workstreams.map((w) => `| [${w}](${w}/) | | |`).join('\n'),
};
const fill = (text) => text.replace(/\{\{(\w+)\}\}/g, (all, key) => values[key] ?? all);
const destination = (rel) =>
  rel
    .split('/')
    .map((part) => part.replace(/^dot-/, '.').replace(/\.template$/, ''))
    .join('/');

const created = [];
const skipped = [];

function write(rel, content) {
  const full = join(target, rel);
  if (existsSync(full)) {
    skipped.push(rel);
    return;
  }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  created.push(rel);
}

function copy(folder) {
  for (const name of readdirSync(folder).sort()) {
    const source = join(folder, name);
    if (statSync(source).isDirectory()) copy(source);
    else write(destination(relative(TEMPLATES, source).split('\\').join('/')), fill(readFileSync(source, 'utf8')));
  }
}

mkdirSync(target, { recursive: true });
copy(TEMPLATES);
for (const w of workstreams) for (const stage of ['research', 'strategy', 'execution']) write(`workstreams/${w}/${stage}/.gitkeep`, '');

// Codex and Hermes Agent read a project's skills in .agents/skills: point it to .claude/skills.
let link = '.agents/skills → .claude/skills: linked';
const agentsSkills = join(target, '.agents', 'skills');
let exists = false;
try {
  lstatSync(agentsSkills);
  exists = true;
} catch {}
if (exists) link = '.agents/skills already exists: not linked; Codex and Hermes Agent read the skills there';
else {
  try {
    mkdirSync(join(target, '.agents'), { recursive: true });
    symlinkSync(join('..', '.claude', 'skills'), agentsSkills, 'junction');
  } catch (e) {
    link = `.agents/skills could not be linked (${e.code}): Codex and Hermes Agent won't see the skills until it is`;
  }
}

console.log(`GTM OS installed in ${target}`);
console.log(`Created: ${created.length} files`);
for (const f of created) console.log(`  + ${f}`);
console.log(`Skipped, already there: ${skipped.length}`);
for (const f of skipped) console.log(`  = ${f}`);
console.log(link);
if (skipped.includes('.claude/settings.json')) {
  console.log('\n.claude/settings.json was already there: the session-start hook is not added. To add it, merge this block:');
  console.log(readFileSync(join(TEMPLATES, 'dot-claude', 'settings.json'), 'utf8'));
}
console.log('\nNext: node scripts/freshness.mjs --plan');
