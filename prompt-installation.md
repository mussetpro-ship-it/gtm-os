Set up a GTM OS in this project with the "gtm-os" skill below, then install it with me. Follow these steps in order, and ask me before anything that isn't in them.

1. Check what you can do. This skill writes files into a repository and runs Node scripts, so it needs an agent that can do both: Claude Code, Codex or Hermes Agent. If you can't write files or run commands (Dust, a chat window), stop and tell me: I'll install it from one of those.
2. Create the folder `.claude/skills/gtm-os/` in this project. It's where Claude Code reads skills; the install links it for Codex and Hermes Agent.
3. Write every file below into that folder, exactly as written, with the same paths (`templates/dot-claude/...` stays as it is: the install script renames it). Don't change the two scripts. The install script checks every file against `checksums.txt` and names any file that differs.
4. Read `.claude/skills/gtm-os/SKILL.md` and run its install mode with me, following `references/install.md`.

Throughout: one question at a time; never overwrite one of my files without asking; no commit, no push, no publishing, no paid tool and no message sent without my OK.

===== FILE: SKILL.md =====
---
name: gtm-os
description: Install and run a four-layer GTM OS (context, skills, orchestration, integrations) in this repository, so agents read the same go-to-market context and know when it goes stale. Use when the user says "install the GTM OS", "set up my GTM context", "refresh the GTM OS", "what's stale", "what should I run next", "update my ICP / positioning / messaging / brand / product / proof", or invokes /gtm-os. Three modes: install (first time), refresh (says which skills to run, in which order, and runs them on approval), update <foundation>. Needs an agent that can read and write files and run Node 18+ (Claude Code, Codex, Hermes Agent).
---

# GTM OS

A go-to-market memory that agents read before they write, and that says when it's going stale.

1. **Context**: a one-page map (`CLAUDE.md`), `latest.md` and `history.md`, seven foundations (product, proof,
   ICP, competitors, positioning, messaging, brand), and workstreams sorted in research, strategy, execution.
2. **Skills**: one per job, each reading the foundations directly. `competitor-card` comes installed, as the
   model to copy.
3. **Orchestration**: each document knows how long it stays true and what it's built from; a script turns
   that into an ordered plan of skills to run, and the refresh routine runs it with the user's OK.
4. **Integrations**: `connections.md`, the tools plugged in, never a key.

Paths below start from the repository root (the folder the session runs in, unless the user names another).
This skill's own folder is `.claude/skills/gtm-os/`, or wherever the user installed it.

## Pick the mode
- `scripts/freshness.mjs` doesn't exist → **install**: follow [references/install.md](references/install.md).
- The user asks what's stale, what to run next, or to refresh → **refresh**: follow
  [references/refresh.md](references/refresh.md).
- The user names a foundation to update, or a refresh step sends you here → **update**: run the section of
  [references/interview.md](references/interview.md) for that foundation, starting from the current document:
  show what it says, ask what changed, rewrite only what changed, then renew its header.

## Always
- One question at a time. When you can draft the answer (from the website, a document, the current
  foundation), show the draft and ask what's wrong or missing.
- Every fact carries its provenance, in two places. In the text, a short mark after the fact: `(Jane Doe,
  2026-10-19)` for something the user said, `(pricing page, 2026-10-19)` for a page, `(estimated)` for your
  own inference. In the header, `built_from` lists the sources with their prefixes: `person:Jane Doe
  2026-10-19`, `web:<url>`, a path for a file of the repository. The rules are in `.claude/rules/` once
  installed.
- Before writing `verified_on`, run `date +%Y-%m-%dT%H:%M`: a time ahead of the clock hides a change, a time
  behind it raises a false alert.
- Never overwrite an existing file without asking. Never mark a document `validated`: only the owner does.
- Never write a key, a token, an account ID or a private link.
- Nothing leaves the machine without the user's OK for that action: no commit, no push, no publishing, no
  paid tool, no message sent.
===== END OF SKILL.md =====

===== FILE: references/install.md =====
# Install

About 30 to 45 minutes with the user, most of it the interview. They can stop at any point: what's filled
stays, and the freshness plan asks for the rest later.

## 1. Check the ground
1. Run `node --version`. The scripts need Node 18 or later. Without it, say what won't work (the install
   script, the freshness check, the refresh plan, the session-start hook) and ask the user to install Node
   first.
2. Look at the repository root. If it holds anything besides `.claude/skills/gtm-os/`, say in two lines
   what's there and ask before going on. The installer never overwrites a file: it skips it and lists it.
3. Is it a git repository (`git rev-parse --is-inside-work-tree`)? If not, offer `git init`: git keeps the
   history when the rules delete what no longer holds. Commit nothing without the user's OK.

## 2. Two questions, then the files
Ask, one at a time:
1. "What's the company called, and who owns this OS, the person whose OK makes a document validated?"
2. "Which GTM lanes do you run, or will run in the next 3 months? For example content, outbound, paid, SEO,
   lifecycle, partnerships." Turn the answer into short folder names.

Then, from the repository root, run the install script with the answers (if this skill lives elsewhere, in
Hermes Agent's own skills folder for instance, use that path instead of `.claude/skills/gtm-os`):

```bash
node .claude/skills/gtm-os/scripts/install.mjs --target . --company "<company>" --owner "<owner>" --workstreams <lanes, comma-separated>
```

It first checks that the skill's files match their checksums. If it lists a file as different, that file was
mis-copied: rewrite it from its source (the prompt or the repository) and run the command again. Then it copies
the templates and fills in the names and today's date; creates each workstream with its `research/`,
`strategy/` and `execution/` folders; installs `competitor-card` in `.claude/skills/`; links `.agents/skills` to
`.claude/skills` for Codex and Hermes Agent; and adds the session-start hook for Claude Code in
`.claude/settings.json`. It prints what it created and what it skipped.

If `.claude/settings.json` already existed, the installer leaves it alone and prints the hook: show it to the
user and ask before adding it. Hermes Agent reads a project's `.agents/skills/` only once the user has
trusted the project for skills (see Hermes' skills documentation).

## 3. Connections
List the tools you can see in this session that serve GTM: web reading, MCP servers (CRM, call recorder,
enrichment, email, ads, analytics, CMS, scheduling), command-line tools such as `gh`. Ask the user which ones
they use and what for. Write one row each in `connections.md`: what it brings in or receives, which skills use
it, and its guardrail (for example "read freely; send, publish or spend only with the owner's OK"). If a tool
returns summaries rather than the source itself (some web readers do), say so in its row: a number read
through it is "read, unverified". Never a key, a token, an account ID or a workspace name.

## 4. The interview
Run `node scripts/freshness.mjs --plan`. Every foundation shows as empty, and the plan lists them in the order
to fill them: sources first. Then follow [interview.md](interview.md): the material first (website, documents,
product repository), then one section per foundation in the order of the plan, then the workstreams. After
each foundation:
- write the user's answers into the template's sections, in their words, each fact with its provenance mark;
- a section the user skips gets one line, "Not decided yet (<date>)", so readers know it's unknown; a
  foundation skipped as a whole stays untouched, and the plan will ask for it again;
- delete the guidance comments of the sections you filled, and the one under the title once every section is
  filled;
- update the header: `verified_on` from `date +%Y-%m-%dT%H:%M`, `verified_by` your name, a one-sentence
  `verification_note`, and `built_from` with what you used;
- keep `status: draft`: the owner validates later, document by document.

## 5. Close
1. Run `node scripts/freshness.mjs --plan` and show the user the output.
2. Replace the install entry at the top of `latest.md` with what was done: the foundations filled, the
   sections left undecided, the competitor cards written.
3. Tell the user in a few lines what's in place, what's still open, and the sentences to remember: "refresh
   the GTM OS" (what to run next), "update my <foundation>", "add a competitor".
4. Offer to commit. Commit only with their OK, listing the files.
===== END OF references/install.md =====

===== FILE: references/interview.md =====
# The interview

One question at a time, about 35 in all if nothing is skipped. Before each question, look for a draft
answer: the website, a document the user gave, the current foundation. Show the draft and ask "What's wrong
or missing?" rather than asking from scratch. If the user lets a draft stand without correcting it, keep only
what comes from their own words or from a page; leave out what you inferred. "Skip" is always a valid answer
(see install.md for what to write). When two sources disagree (the product repository and the user, the site
and a document), ask which is right, keep what the user confirms, and note the gap.

Write in the user's words, with the provenance marks of SKILL.md: `(<name>, <date>)` for what the user said,
`(<page>, <date>)` for what you read, `(estimated)` for what you inferred. In `built_from`: `web:<url>` for
each page read, `person:<name> <date>` for the answers, the path of each document or foundation you used.

## The material, first
1. "What's your website? I'll read it first, so I ask you less." Read the home, pricing, product or features,
   customers and about pages, and the last few blog or changelog posts. Note each URL and today's date.
2. "Anything else I should read? Call notes or transcripts, a pitch deck, a past positioning document,
   customer reviews. Paths, links, or paste them." Save each document you use in `foundations/data/`, with a
   first line saying where it comes from and when you got it, and cite it in `built_from` by its path. If the
   user doesn't want it kept, cite it as `person:<name> <date>` instead.
3. "Does the product's code live in a repository on this machine?" If yes, add `repo.app: <relative path>`
   to `.claude/lifetime.yaml`, and list its README or roadmap in the `built_from` of `product.md`
   (`app:README.md`): the product summary is flagged when they change.

## icp
1. "Name your 3 to 5 best customers, and why each one bought." Before launch: "the 3 to 5 people who said
   yes to a call or a pilot, and why".
2. "What do they have in common: industry, size, stage, location?"
3. "Who signs, who uses it, and what are they measured on?"
4. "What happened right before they started looking for something like you?"
5. "Who looked like a fit and wasn't, and why?"

## product
1. "In one sentence, what does a customer get?" (draft from the home page)
2. "What's live today, and since when? What's coming, and when?" Live and coming stay in separate sections.
3. "How is it priced?" (draft from the pricing page, dated)
4. "What will it never do?"

## proof
1. "What results can you show? A number, a customer, a date." One row each.
2. For each: "May we say it in public, and name the customer?" Without their written OK, a public
   deliverable anonymizes it.
3. "What do people assume you do that you don't, or not yet?"

## competitors
1. "When a prospect doesn't buy from you, what do they do instead? Name the tools, and count doing it by
   hand and doing nothing."
2. For each direct competitor: "Their website?" Write the overview table, then offer to run
   `competitor-card` on each one, one at a time (6 page reads at most each). Each card goes in the overview's
   `built_from`.

## positioning
Draft it from icp, product, proof and competitors, then ask:
1. "What would a buyer type to find something like you?"
2. "If they remember one sentence, which one?" Offer three, built from the drafts.
3. "What do you do that the alternatives can't, and what proves it?" Each point links to a line of proof;
   a point with no proof says "proof: none yet", so nobody uses it in public before it's proven.
4. "What do you never want to be confused with?"

## brand
1. "Three words for how you sound, and something you wrote that sounds right."
2. "Words you always use, words you never use."
3. Colors, fonts and logo: read them from the website and ask to confirm. Note where the logo files live.

## messaging
1. "Who are the 1 to 3 people you write to?" (from the ICP)
2. For each: draft the headline, three supporting points with their proof, and the call to action; ask for
   corrections.
3. "Which 3 objections do you hear most, and what do you answer?"

## workstreams
For each workstream: "In one line, what will it produce in the next 3 months?" Write it in
`workstreams/CLAUDE.md`. If the user has a strategy already (a content plan, an outbound sequence), offer to
save it in that workstream's `strategy/`, with a header whose `built_from` lists the foundations it uses.
===== END OF references/interview.md =====

===== FILE: references/refresh.md =====
# Refresh

The routine answers one question: **what should run next, in which order, and why**. It proposes, the user
decides, then it runs what was approved. It's the orchestration layer: without it, the foundations go stale
quietly and every skill keeps reading old context.

## 1. Read
1. `latest.md`: the entries since the last refresh (the last entry whose title ends with "Refresh").
2. `decisions.md`: the decisions taken since then.
3. Run `node scripts/freshness.mjs --plan`. Read its lists (stale, source changed, empty, drafts awaiting
   validation), its anomalies, its latest.md line, and the plan.

## 2. Complete the plan
The script sees only headers, dates and git. Add what it can't see:
- an entry of `latest.md` or a decision that changes a foundation which wasn't updated since (a new price, a
  new segment, a deal lost to a new competitor): add "update <foundation>" to the plan, before everything
  built from that foundation;
- commits that `latest.md` doesn't record yet (the script counts them): read them with `git log` and offer
  the missing entry;
- anomalies: fix the mechanical ones (a moved path, a typo in a type), list the others for the user.

A document always comes after its sources: never reorder against `built_from`.

## 3. Propose
Show the plan, short, in this shape:

```
Refresh plan, 2026-11-20
1. competitor-card on acme, globex: cards stale since 2026-11-18 (30 days)
2. gtm-os update positioning: built from the competitor overview, which will change
3. By hand: workstreams/content/strategy/plan.md, built from positioning
Also waiting: 4 drafts for your validation (icp, product, proof, brand)
```

Say what a step costs when it uses a paid tool or many page reads. Then ask one question: "Run the whole
plan, some steps, or none?"

## 4. Run
For each approved step, in order:
1. Run the skill on the listed documents, following its SKILL.md. A "by hand" step: re-read the document
   against its changed sources, and fix what no longer holds.
2. A re-check that changes nothing renews `verified_on` (from `date +%Y-%m-%dT%H:%M`) and replaces the
   `verification_note`. A re-check that
   changes a claim also sets `status: draft`: the owner validates again.
3. Run `node scripts/freshness.mjs`: the step's documents must no longer be flagged before the next step.

Stop and ask when a step fails, costs more than announced, or needs a decision.

## 5. Record
Add an entry at the top of `latest.md`, titled "<date> — Refresh": what ran, what changed, what's still
waiting (steps declined, drafts awaiting validation). A foundation whose substance changed also gets a line
in `history.md`.

## Running without being asked
- **Claude Code**: the installer adds a session-start hook in `.claude/settings.json`. It runs
  `node scripts/freshness.mjs --brief`, so every session starts with the counts and the plan in context, and
  the agent can offer the refresh.
- **On a schedule**: Codex (automations), Hermes Agent (cron), Claude Code (scheduled tasks) and Dust
  (scheduled triggers) can run a prompt on a schedule. A weekly prompt that fits: "Run the gtm-os refresh
  routine up to step 3, write the proposed plan at the top of latest.md, and run nothing." Set it up with
  the user, in their harness; the result arrives as a plan to approve, never as changes already made. Scheduled
  runs aren't tested with this skill yet: check the first run with the user.
===== END OF references/refresh.md =====

===== FILE: scripts/install.mjs =====
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
===== END OF scripts/install.mjs =====

===== FILE: templates/AGENTS.md.template =====
# {{COMPANY}} GTM OS — for every agent

This repository is the go-to-market memory of {{COMPANY}}. Before any task:

1. Read [CLAUDE.md](CLAUDE.md), the one-page map, then [latest.md](latest.md), what changed recently.
2. Read the rules, always on: `.claude/rules/memory.md`, `.claude/rules/single-home.md`,
   `.claude/rules/lifetime.md`.
3. Run `node scripts/freshness.mjs --plan`: what's stale, what needs a re-check, what to run next.
4. Before writing in a folder, read its `CLAUDE.md`.

The skills live in `.claude/skills/`; `.agents/skills` links to them. Owner: {{OWNER}}. Nothing becomes
`validated`, gets committed, pushed, published or paid for without the owner's OK.
===== END OF templates/AGENTS.md.template =====

===== FILE: templates/CLAUDE.md.template =====
# {{COMPANY}} GTM OS

The go-to-market memory of {{COMPANY}}: who we sell to, who we compete with, what we promise and how we say
it, what the product does today and what we can prove. Every agent session starts here. This file stays on
one page.

**Owner: {{OWNER}}.** A document becomes `validated` only with the owner's explicit OK.

## At the start of every session
1. Read [latest.md](latest.md): what changed recently.
2. Run `node scripts/freshness.mjs --plan`: what's stale, what needs a re-check, what to run next. In Claude
   Code, a session-start hook runs it for you.
3. Before writing in a folder, read its `CLAUDE.md`.

## The map
| Where | What |
|---|---|
| [foundations/](foundations/CLAUDE.md) | Product, proof, ICP, competitors, positioning, messaging, brand: what every deliverable reads first |
| [workstreams/](workstreams/CLAUDE.md) | One folder per GTM lane, each in `research/`, `strategy/`, `execution/` |
| [decisions.md](decisions.md) | GTM decisions, dated and signed |
| [connections.md](connections.md) | The tools plugged in, what they bring or receive; never a key or an ID |
| [latest.md](latest.md), [history.md](history.md) | Short memory (recent changes) and long memory (major events, append-only) |
| `.claude/rules/` | The rules, always on: memory and provenance, one home per document, how long a document stays true |
| `.claude/lifetime.yaml`, `scripts/freshness.mjs` | How long each type of document stays true, and the script that checks it |
| `.claude/skills/` | `gtm-os` (install, refresh, update a foundation) and `competitor-card`, the model for new skills |

Claude Code loads the rules of `.claude/rules/` by itself. Other agents read them through [AGENTS.md](AGENTS.md).

## The four layers
- **Context**: this map, `latest.md`, `history.md` and `foundations/`.
- **Skills**: `.claude/skills/`. A new skill starts as a copy of `competitor-card`: it says what it reads,
  what it produces, where it puts it, and shows a good output. It reads the foundations, never a copy of them.
- **Orchestration**: "refresh the GTM OS" runs the `gtm-os` refresh routine: it reads `latest.md` and the
  freshness plan, and proposes which skills to run, in which order. Nothing runs without the owner's OK.
- **Integrations**: `connections.md`.

## After anything that matters
A dated entry at the top of `latest.md`, in the same commit. A decision goes to `decisions.md` before it's
applied.
===== END OF templates/CLAUDE.md.template =====

===== FILE: templates/connections.md =====
# Connections

The tools plugged into this OS: what each brings in or receives, which skills use it, and its guardrail.
**Never a key, a token, an account ID, a workspace name or a private link here.**

| Tool | Brings in, or receives | Used by | Guardrail |
|---|---|---|---|
===== END OF templates/connections.md =====

===== FILE: templates/decisions.md =====
# Decisions

GTM decisions, newest first: what was decided, when, by whom, and where it applies. A decision is written
here before it's applied. A replaced decision is deleted: git keeps it.

| Date | Decision | Who | Where it applies |
|---|---|---|---|
| {{TODAY}} | Run our go-to-market from a four-layer GTM OS in this repository | {{OWNER}} | This repository |
===== END OF templates/decisions.md =====

===== FILE: templates/dot-claude/lifetime.yaml =====
# How long each type of document stays true, in days. scripts/freshness.mjs reads this table.
#   never        never goes stale (a raw source, a dated decision)
#   quarter      stale at the end of the calendar quarter it was checked in
#   propagation  stale only when one of its sources changes
# Change a number here and every document of that type follows: no document needs editing.
# Defaults for a young company, where what moves fast gets checked fast.
product: 30
proof: 30
competitor: 30
icp: 90
positioning: 90
messaging: propagation
brand: 365
research: 60
strategy: propagation
deliverable: propagation
metrics: quarter
source: never
decision: never

# Other repositories a document can cite in built_from, as <name>:<path>.
# Example: with the line  repo.app: ../my-app  a document can list  - app:README.md
===== END OF templates/dot-claude/lifetime.yaml =====

===== FILE: templates/dot-claude/rules/lifetime.md =====
# How long a document stays true

Every document in `foundations/`, and in the `research/` and `strategy/` folders of `workstreams/`, starts
with this header. `CLAUDE.md`, `README.md` and anything in a `data/` folder don't need one. In `execution/`
it's optional: add it to a deliverable you want flagged when its strategy changes.

```yaml
---
type: positioning             # a key of .claude/lifetime.yaml
status: draft                 # draft | validated
owner: Jane Doe
verified_on: 2026-10-19T14:30 # the last check, not the last edit; the time is optional and avoids false alerts
verified_by: Claude           # the owner's name once validated
verification_note: What was checked, in one sentence
built_from:                   # the sources of this document
  - foundations/icp/icp.md
  - web:https://example.com/pricing
refreshed_by: gtm-os          # the skill that rebuilds it; leave it empty if it's kept by hand
---
```

Prefixes in `built_from`: none for a file of this repository; `web:` for a page read online; `person:` for
an answer from someone, with its date (`person:Jane Doe 2026-10-19`); `file:` for a local file outside any
repository; `<name>:` for a file of another repository declared as `repo.<name>` in `.claude/lifetime.yaml`.

- The lifetime depends on the type, in `.claude/lifetime.yaml`.
- A date alone counts from midnight: a source changed the same day, even before the check, flags the
  document. Writing the time avoids that.
- Checking isn't editing: after a re-read, renew `verified_on` even if nothing changed, and replace the
  `verification_note`. Fixing a typo renews nothing.
- The `verification_note` says the last check, in one sentence: it gets replaced, it doesn't grow.
- Raw sources don't expire; only syntheses do.
- A synthesis whose source changed after its check must be re-checked, even if its own date is still good.
- `node scripts/freshness.mjs` does the math. Nobody computes a date in their head.
- Facing a stale document, warn without blocking: the deliverable says how old its oldest source is.
===== END OF templates/dot-claude/rules/lifetime.md =====

===== FILE: templates/dot-claude/rules/memory.md =====
# The repository is the memory

- A wrong line costs more than a missing one, because it will be believed.
- Every measure carries its date. Every decision carries the name of who made it.
- Every number carries its provenance:
  - **measured**: a real reading, the vendor's own document, a real call. The default, left unmarked.
  - **seen (date)**: a structure observed on a screen or a page; reliable on the shape, not on the numbers.
  - **read, unverified (date)**: a value read on a screenshot, in a video or in a summary. Never a benchmark.
  - **estimated**: a calculation or an assumption made by the agent, always said as such.
  - **unavailable**: write that we don't know rather than invent.
- A document's life: `draft`, then `validated`. Only the owner moves a document to `validated`, and their
  name then goes in `verified_by`. A re-check that changes what a document claims sends it back to `draft`.
- **Less is more.** What no longer holds is deleted: a replaced document, an outdated section, a dropped
  option, a replaced decision. No archive folder, no "dropped options" section: git keeps the history.
- A document changes in the same commit as the fact it describes. `latest.md` keeps only what's recent;
  `history.md` gets only the major events.
- Never write a secret, a key, a token, an account ID or a private link in this repository.
===== END OF templates/dot-claude/rules/memory.md =====

===== FILE: templates/dot-claude/rules/single-home.md =====
# One home per document

A document lives in one place. Anywhere else, summarize it in a line and link to it; never copy it.

- A synthesis lists its sources in `built_from`. The freshness script flags it as soon as one of them
  changes after its last check.
- Skills read the foundations directly. No summary of the ICP, the positioning or the brand lives inside a
  skill: it would drift the day the foundation changes.
- What belongs to another repository stays there. The product's specs live with its code; this OS keeps a
  sales summary in `foundations/product/`, built from that repository (declare it as `repo.app` in
  `.claude/lifetime.yaml`, then cite `app:README.md` in `built_from`).
- Raw material (exports, transcripts, scraped data) lives in a `data/` folder next to the work that uses it,
  with its source and the date it was collected. It never goes as is into a public deliverable.
- We take ideas from competitors, never their words: a public deliverable is written in our own sentences.
===== END OF templates/dot-claude/rules/single-home.md =====

===== FILE: templates/dot-claude/settings.json =====
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/scripts/freshness.mjs\" --brief"
          }
        ]
      }
    ]
  }
}
===== END OF templates/dot-claude/settings.json =====

===== FILE: templates/dot-claude/skills/competitor-card/references/good-output.md =====
# A good output

A card for a made-up competitor, to show the shape and the level of detail. Real cards follow it section by
section. What makes it good: every fact has a source and a date, prices are copied exactly, the comparison
with us is specific, and what we don't know says "unavailable".

````markdown
---
type: competitor
status: draft
owner: Jane Doe
verified_on: 2026-10-19T10:40
verified_by: Claude
verification_note: Home, pricing, features, customers and the last 3 changelog posts read on 2026-10-19
built_from:
  - web:https://acme.example/
  - web:https://acme.example/pricing
  - web:https://acme.example/customers
  - web:https://acme.example/changelog
refreshed_by: competitor-card
---

# Acme (made-up example)

**In one line**: a scheduling tool that turns a website form into a booked demo and routes it to the right
rep; self-serve up to 5 seats, sold through demos above.

## What changed since 2026-09-18
- New "Teams" plan at $79 per seat (pricing, 2026-10-19); the $49 plan is now limited to 2 seats.
- The home page headline moved from "book more demos" to "never lose an inbound lead".

## What they sell
- A booking form, routing rules by territory or company size, reminders (features page, 2026-10-19).
- A CRM sync, on the Teams plan only (pricing, 2026-10-19).

## Who they sell to
- Logos shown: 14, mostly B2B software companies of 20 to 200 people (customers page, 2026-10-19).
- Buyer named in the case studies: the head of sales, twice; the founder, once.

## Price (read on 2026-10-19)
| Plan | Price | What's in it |
|---|---|---|
| Starter | $49 per seat per month, 2 seats max | Form, routing, reminders |
| Teams | $79 per seat per month | Form, routing, reminders, CRM sync |
| Enterprise | On demand | Unavailable |

## What they claim
- "Never lose an inbound lead" (home headline, 2026-10-19).
- "40% more demos booked": no source, no date given on the page.

## Against us
- **Collision**: their new headline claims the outcome our positioning leads with; ours is backed by proof,
  theirs isn't.
- **Contrast**: they price per seat, we price per workspace; their buyer is the head of sales, ours the head
  of marketing.
- **Our ICP**: they reach the larger half of it (50 people and more).

## Unavailable
Number of customers, revenue, churn, the Enterprise price.
````
===== END OF templates/dot-claude/skills/competitor-card/references/good-output.md =====

===== FILE: templates/dot-claude/skills/competitor-card/SKILL.md.template =====
---
name: competitor-card
description: Research one competitor from its public pages and write or refresh its card in foundations/competitors/, then update the overview. Use when the user says "add a competitor", "refresh the competitor cards", "what is <company> doing now", or when the GTM OS refresh plan lists a competitor card. Also the model skill of this GTM OS: copy its folder to build a new one.
---

# Competitor card

One card per competitor, from public sources, read against our own positioning. The card says what they
sell, to whom, at what price, what they claim, and where they collide with us.

<!-- Every skill of this OS says four things: what it reads, what it produces and where it puts it, the steps,
and what a good output looks like (references/good-output.md). To build a new skill, copy this folder, rename
it, and rewrite each section for the new job. Keep it short: the skill points to the foundations, it never
copies them. -->

## Reads
- `foundations/positioning/positioning.md`: to see where they claim what we claim. If it's still empty (a
  first install fills competitors before positioning), compare with the ICP and the product instead and mark
  that part `(estimated)`: the next refresh of the card reads the positioning.
- `foundations/icp/icp.md`: to see whether they sell to the same buyers.
- The current card, if there is one: `foundations/competitors/<slug>.md`.
- The web, with any page-reading tool of this session (`connections.md` lists them once filled). Without
  one, ask the user to paste the pages. If the tool returns a summary rather than the page, a price or a
  number read through it is "read, unverified (date)": say so, or get the raw text.

## Produces
`foundations/competitors/<slug>.md`, section by section like [references/good-output.md](references/good-output.md),
with this header:

```yaml
type: competitor
status: draft
refreshed_by: competitor-card
built_from:      # every page read, as web:<url>
```

Then its row in `foundations/competitors/competitors.md`, whose `built_from` lists the card.

## Steps
1. Get the competitor's name and website. If its card exists, read it first: you'll say what changed.
2. Read 6 public pages at most: home, pricing, product or features, customers, the blog or changelog index,
   and its latest post if the index gives dates. Note the date you read each one.
3. Write the card like the good output. Every fact carries its source; every price and number its date.
   What isn't on a page is "unavailable", never guessed.
4. Read it against our positioning: where they claim what we claim (a collision), where they do the opposite
   (a contrast), which buyers of our ICP they reach.
5. If the card existed: start with "What changed since <last check>", and delete what no longer holds.
6. Update its row in the overview and the overview's `built_from`.
7. Fill the header: `verified_on` from `date +%Y-%m-%dT%H:%M`, a one-sentence `verification_note` (pages
   read, and how), `status: draft`.
8. Run `node scripts/freshness.mjs`: the card must not be flagged. If a change matters (a new price, a new
   claim, a new segment), add an entry at the top of `latest.md`.

## Never
- Copy their sentences into our messaging: we take ideas, never words.
- Log in anywhere, or pay for a tool, without the user's OK.
- Mark the card `validated`: only the owner does.
===== END OF templates/dot-claude/skills/competitor-card/SKILL.md.template =====

===== FILE: templates/foundations/brand/brand.md.template =====
---
type: brand
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from:
  - foundations/positioning/positioning.md
refreshed_by: gtm-os
---

# Brand

<!-- How we sound and how we look. Colors as hex codes, fonts by name, logo files by path. -->

## Voice
<!-- Three words for how we sound, what each means in practice, and one example that sounds right. -->

## Words we use
## Words we avoid

## Visual identity
<!-- Colors, fonts, logo files and where they live. -->
===== END OF templates/foundations/brand/brand.md.template =====

===== FILE: templates/foundations/CLAUDE.md.template =====
# foundations/ — what every deliverable reads first

One folder per foundation. Each document carries a header (`.claude/rules/lifetime.md`): the freshness
script says when it's stale, and which skill rebuilds it.

| Foundation | What it answers | Kept fresh by |
|---|---|---|
| [product/](product/product.md) | What a customer gets today, the price, the limits | `gtm-os` update |
| [proof/](proof/proof.md) | What we can claim in public, each claim dated and sourced | `gtm-os` update |
| [icp/](icp/icp.md) | Who buys, what triggers them, who's not a fit | `gtm-os` update |
| [competitors/](competitors/competitors.md) | What a buyer weighs against us; one card per competitor | `competitor-card` |
| [positioning/](positioning/positioning.md) | Category, main claim, why us, against what | `gtm-os` update |
| [messaging/](messaging/messaging.md) | One message per persona, objections and answers | `gtm-os` update |
| [brand/](brand/brand.md) | Voice, words, visual identity | `gtm-os` update |

Each foundation lists in `built_from` the others it depends on: when one changes, the script asks to re-check
the ones built from it, in order. A replaced document is deleted, not archived.
===== END OF templates/foundations/CLAUDE.md.template =====

===== FILE: templates/foundations/competitors/competitors.md.template =====
---
type: competitor
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from:
  - foundations/icp/icp.md
refreshed_by: competitor-card
---

# Competitors

<!-- What a buyer weighs against us: direct competitors, adjacent tools, doing it by hand, doing nothing.
One card per direct competitor in this folder, written by the competitor-card skill, and listed in
built_from above. Example of a row:
| Alternative | Kind | In one line | Card |
|---|---|---|---|
| Acme | Direct | Same job for larger teams, sold through demos | [acme.md](acme.md) |
-->

## The alternatives
<!-- The table above. -->

## Where we win, where we lose
<!-- From real deals when you have them; mark the rest as estimated. -->
===== END OF templates/foundations/competitors/competitors.md.template =====

===== FILE: templates/foundations/icp/icp.md.template =====
---
type: icp
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from: []
refreshed_by: gtm-os
---

# Ideal customer profile

<!-- Built from real customers (or, before launch, the people who said yes to a call or a pilot). Each line
says where it comes from: (customer call, date), (site, date), (estimated). -->

## The company
<!-- Industry, size, stage, location. What they have in common beyond the obvious. -->

## The people
<!-- Who signs, who uses it; their role, seniority, what they're measured on, where they spend their time. -->

## The trigger
<!-- What happens right before they start looking for something like us. -->

## Who is not a fit
<!-- And why. -->

## The customers behind this profile
<!-- The 3 to 5 real customers it's built from. Naming them is fine in a private repository. -->
===== END OF templates/foundations/icp/icp.md.template =====

===== FILE: templates/foundations/messaging/messaging.md.template =====
---
type: messaging
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from:
  - foundations/positioning/positioning.md
  - foundations/icp/icp.md
  - foundations/proof/proof.md
refreshed_by: gtm-os
---

# Messaging

<!-- The positioning turned into words, persona by persona. Skills that write (posts, emails, pages, ads)
read this file directly. -->

## Per persona
<!-- For each persona: the headline, three supporting points, the proof for each, the call to action. -->

## Objections and answers
<!-- The objections heard most, in the buyer's words, and what we answer. -->
===== END OF templates/foundations/messaging/messaging.md.template =====

===== FILE: templates/foundations/positioning/positioning.md.template =====
---
type: positioning
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from:
  - foundations/icp/icp.md
  - foundations/competitors/competitors.md
  - foundations/product/product.md
  - foundations/proof/proof.md
refreshed_by: gtm-os
---

# Positioning

<!-- The choices everything else follows. Each claim links to a line of proof.md. -->

## Category
<!-- What a buyer would type to find us. -->

## For whom
<!-- The ICP in one line, and the persona we lead with. -->

## The main claim
<!-- The one sentence they should remember. -->

## Why us
<!-- What we do that the alternatives can't, each point with its proof. -->

## Against what
<!-- The alternative we replace: a competitor, a habit, doing nothing. -->

## What we never say
<!-- Claims we can't back, words that put us in the wrong category. -->
===== END OF templates/foundations/positioning/positioning.md.template =====

===== FILE: templates/foundations/product/product.md.template =====
---
type: product
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from: []
refreshed_by: gtm-os
---

# Product

<!-- What a customer gets today, in their words, not in engineering words. Two things never mix: what's
live and what's planned. Sell only what's live. If the code lives in another repository, declare it as
repo.app in .claude/lifetime.yaml and list its README or roadmap in built_from (app:README.md). -->

## In one sentence
<!-- What a customer gets, as they would say it. -->

## What's live today
<!-- One line per capability, with the date it went live. -->

## What's coming
<!-- One line per item, with its expected date, marked as a plan. -->

## Price
<!-- The plans, what's in each, the trial; the date you read or decided it. -->

## Limits, and what it will never do
===== END OF templates/foundations/product/product.md.template =====

===== FILE: templates/foundations/proof/proof.md.template =====
---
type: proof
status: draft
owner: {{OWNER}}
verified_on: {{NOW}}
verified_by: gtm-os install
verification_note: Empty template, created at install
built_from:
  - foundations/product/product.md
refreshed_by: gtm-os
---

# Proof

<!-- What we can claim in public today. One row per claim, with its number, its date, its source, and
whether we may name the customer (only with their written OK). Example of a row:
| Claim | Number | Date | Source | Public? |
|---|---|---|---|---|
| Setup time | under 10 minutes | 2026-09 | Measured on 12 onboarding calls | Yes, anonymized |
-->

## Claims we can make
<!-- The table above. -->

## Customer words
<!-- Quotes, reviews, logos; each with its date and the customer's OK to show it. -->

## What we can't claim yet
<!-- What people assume we do and we don't, or not yet. -->
===== END OF templates/foundations/proof/proof.md.template =====

===== FILE: templates/history.md =====
# history.md — long memory

Append-only, oldest first. Major events only: the OS is born, a foundation is rebuilt, a new integration, a
change of convention, a change of owner.

## {{TODAY}} — The GTM OS is born

- Installed with the `gtm-os` skill. Owner: {{OWNER}}.
- Conventions: the three rules of `.claude/rules/`, the lifetimes of `.claude/lifetime.yaml`.
===== END OF templates/history.md =====

===== FILE: templates/latest.md =====
# latest.md — short memory

Recent changes, newest first, dated and short. Durable content goes to the foundations, major events to
[history.md](history.md). What's no longer recent is deleted: git keeps it.

## {{TODAY}} — GTM OS installed

The four layers are in place. The foundations are empty templates until the first interview.
===== END OF templates/latest.md =====

===== FILE: templates/scripts/freshness.mjs =====
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
===== END OF templates/scripts/freshness.mjs =====

===== FILE: templates/workstreams/CLAUDE.md.template =====
# workstreams/ — where the work happens

One folder per GTM lane. Each sorts its work in three folders:
- `research/`: what we learned (a market study, a keyword pull, a call analysis). Type `research`.
- `strategy/`: what we decided to do with it (a plan, a calendar, a sequence). Type `strategy`, re-checked
  when one of its sources changes.
- `execution/`: what we ship (posts, emails, ads, pages). A header is optional here: add one, type
  `deliverable`, to a piece you want flagged when its strategy changes.

| Workstream | What it will produce in the next 3 months | Skills |
|---|---|---|
{{WORKSTREAM_ROWS}}

A strategy lists the foundations it uses in `built_from`. Raw data stays in a `data/` folder of the
workstream, with its source and the date it was collected.
===== END OF templates/workstreams/CLAUDE.md.template =====

===== FILE: checksums.txt =====
# sha256 of each file of this skill, after normalizing line endings and trailing spaces. install.mjs checks them.
423ead24252c64bf3b55bcdb3f2da9384dc26238cd9f59b410671198f2794676  SKILL.md
99527344593f962cc8b623786131a195b55fd5c15344af5e10e2341a8f0c0364  references/install.md
b258962f5feeb26948efe01734db91b2eb2dc39835fa58606f2fd718ba7ca29e  references/interview.md
9caa3bc29b38553724819ff92cea390334168fae31d7693ad9b4941633c87d68  references/refresh.md
8b326b3f9a5bbeee040edc14b9c6120d3230ea6308cdb636264f5cbee558dd43  scripts/install.mjs
5d592068282694b2a149a3a10a3562f502993e2039c5c6a437baac68ee9373b0  templates/AGENTS.md.template
3b5340bbc80d6fdbdf3244df3e4dced976380d915aa6b6504591c96cfdfee013  templates/CLAUDE.md.template
f127fc270e9990c29a0fa7f0cb8b02623650100bf75b71fe5668cf3d74655126  templates/connections.md
454dca63d321df8334e1eec2f19683dc84db71e51a22ae447df1ae3fc0dd6aef  templates/decisions.md
c632e8c5470f885ac31c4dab33323b9e74846f17beeddebea44c2228aabd18c7  templates/dot-claude/lifetime.yaml
d75322b969d8db08fd16c231fe245face4454567b1bf9d50aee36d45280bc36f  templates/dot-claude/rules/lifetime.md
279f965ead07959c4b82b1fa7ec6837bb502277f363b6b6a828810af7798c077  templates/dot-claude/rules/memory.md
ea3edf575da717553d7b568f5e173580b896204db77128b93dc5d099fe10c0be  templates/dot-claude/rules/single-home.md
e0cd4dc4b9cab4f4c0ddc4e6b30bb0ffe3f74520bb988385778f37caedad6b59  templates/dot-claude/settings.json
cc22fe72b4948a28b8b21ce852bea4d21139b4fcd1000def0060cb86064edecb  templates/dot-claude/skills/competitor-card/references/good-output.md
bbb7b8646304b3a6fbd856226b177a0839a572b1116496c39eab3742a19a74b9  templates/dot-claude/skills/competitor-card/SKILL.md.template
3ba8314e0a66ab27541be43c9f768227e1522cd345703ca8765ab487d4673911  templates/foundations/brand/brand.md.template
a9691081a242a6343fe2881572d3c7119af5044ffb584d1c7ecf9ca04bc4a20a  templates/foundations/CLAUDE.md.template
d06622a020eb1fb107cc123da1da2de1ba38a06666c62e2f0eae34bd020c8529  templates/foundations/competitors/competitors.md.template
6c78305ce76f76447d941470bb7aac12bdfe2af9642daed10efbc7a45aa62fde  templates/foundations/icp/icp.md.template
9820d222c406a072cf3db2515ba9bca0cd27f83a71e0a7fce1fc70dfc324eeb2  templates/foundations/messaging/messaging.md.template
cb25064cbf8093faacb3bc406af66b34d4fe494cbfa64b61d20a3fe13a056011  templates/foundations/positioning/positioning.md.template
4336fba613b011521d578cc5f6a1ec2b40ec8c65f6a3c8c46e1d46130f0d9871  templates/foundations/product/product.md.template
fb82e2c85cb7ab52567625c3ffdb24fc06521f60c52aa6575b5f7d3ff6e83b6f  templates/foundations/proof/proof.md.template
495b93bd8558b44bf4978efdd587993670abefdc725ebce0896827c342191d81  templates/history.md
1e66210fbe6d113292981d9efc2dc09ded803fe1c14b79fd37c0adcb79559794  templates/latest.md
2ad081639665ca1d9c731e6114b875f50835df0f4412d71155e1916e0c734b05  templates/scripts/freshness.mjs
bf5da51d2b62575cc41f9deb26f461ffe682a4d0703144b5488beb965fd82395  templates/workstreams/CLAUDE.md.template
===== END OF checksums.txt =====
