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
