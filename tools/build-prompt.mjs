#!/usr/bin/env node
// Builds prompt-installation.md, the all-in-one install prompt, from the files of gtm-os/, after writing
// gtm-os/checksums.txt, which install.mjs uses to catch a file mis-copied from the prompt.
// The skill folder is the only source: run this after any change to it.
//
//   node tools/build-prompt.mjs          writes prompt-installation.md next to tools/
//   node tools/build-prompt.mjs --check  exits 1 if checksums.txt or prompt-installation.md is out of date

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = join(HERE, 'gtm-os');
const OUT = join(HERE, 'prompt-installation.md');
const SUMS = join(SKILL, 'checksums.txt');

// The same normalization as install.mjs: line endings, trailing spaces and final newlines don't count.
const normalized = (text) => text.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd()).join('\n').trimEnd();
const sha256 = (text) => createHash('sha256').update(normalized(text)).digest('hex');

const HEAD = `Set up a GTM OS in this project with the "gtm-os" skill below, then install it with me. Follow these steps in order, and ask me before anything that isn't in them.

1. Check what you can do. This skill writes files into a repository and runs Node scripts, so it needs an agent that can do both: Claude Code, Codex or Hermes Agent. If you can't write files or run commands (Dust, a chat window), stop and tell me: I'll install it from one of those.
2. Create the folder \`.claude/skills/gtm-os/\` in this project. It's where Claude Code reads skills; the install links it for Codex and Hermes Agent.
3. Write every file below into that folder, exactly as written, with the same paths (\`templates/dot-claude/...\` stays as it is: the install script renames it). Don't change the two scripts. The install script checks every file against \`checksums.txt\` and names any file that differs.
4. Read \`.claude/skills/gtm-os/SKILL.md\` and run its install mode with me, following \`references/install.md\`.

Throughout: one question at a time; never overwrite one of my files without asking; no commit, no push, no publishing, no paid tool and no message sent without my OK.
`;

// SKILL.md first, then the references, the scripts, and the templates.
const weight = (rel) => (rel === 'SKILL.md' ? 0 : rel.startsWith('references/') ? 1 : rel.startsWith('scripts/') ? 2 : 3);

function files(folder) {
  return readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? files(path) : [relative(SKILL, path).split('\\').join('/')];
  });
}

const list = files(SKILL)
  .filter((rel) => !rel.endsWith('.DS_Store') && !rel.endsWith('.gitkeep') && rel !== 'checksums.txt')
  .sort((a, b) => weight(a) - weight(b) || a.localeCompare(b));
const sums =
  '# sha256 of each file of this skill, after normalizing line endings and trailing spaces. install.mjs checks them.\n' +
  list.map((rel) => `${sha256(readFileSync(join(SKILL, rel), 'utf8'))}  ${rel}`).join('\n') +
  '\n';

let prompt = HEAD;
for (const rel of [...list, 'checksums.txt']) {
  if (rel === 'checksums.txt') {
    prompt += `\n===== FILE: ${rel} =====\n${sums}===== END OF ${rel} =====\n`;
    continue;
  }
  const content = readFileSync(join(SKILL, rel), 'utf8').replace(/\n*$/, '\n');
  prompt += `\n===== FILE: ${rel} =====\n${content}===== END OF ${rel} =====\n`;
}

if (process.argv.includes('--check')) {
  const read = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
  if (read(SUMS) !== sums || read(OUT) !== prompt) {
    console.error('checksums.txt or prompt-installation.md is out of date: run node tools/build-prompt.mjs');
    process.exit(1);
  }
  console.log(`checksums.txt and prompt-installation.md are up to date: ${list.length + 1} files.`);
} else {
  writeFileSync(SUMS, sums);
  writeFileSync(OUT, prompt);
  console.log(`checksums.txt and prompt-installation.md written: ${list.length + 1} files, ${prompt.split('\n').length} lines, ${prompt.length} characters.`);
}
