<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/banner-dark.svg">
  <img alt="GTM OS. The go-to-market memory your agents read first, and that tells them when it goes stale." src="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/banner-light.svg" width="100%">
</picture>

You use AI for go-to-market work, and each deliverable starts from a blank chat or from a context document nobody
has opened in weeks. Two months later, a post quotes last quarter's price, an email pitches a feature that slipped,
and the competitor list misses the two that launched since. The context was there. It just stopped being true, and
nothing said so.

**GTM OS is a skill that installs a go-to-market memory in a repository.** Every agent you work with reads the same
context about your customers, competitors, positioning and brand. And the repository tells you when that context
goes stale, and what to run to fix it.

## How it works

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/layers-dark.svg">
  <img alt="The four layers. 1, context: CLAUDE.md, latest.md and history.md, the foundations, the workstreams. 2, skills: gtm-os, competitor-card, your next skill. 3, orchestration: lifetime.yaml, built_from, freshness.mjs --plan, the session-start hook. 4, integrations: connections.md and your tools." src="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/layers-light.svg" width="100%">
</picture>

1. **Context.** A one-page map that every session reads first, a short memory (`latest.md`) and a long one
   (`history.md`), seven foundations, and one folder per GTM lane, split into research, strategy and execution.
2. **Skills.** Each skill does one job and reads the foundations directly, never a copy of them. `competitor-card`
   comes installed: a working skill, and the model for yours, with an example of a good output.
3. **Orchestration.** Every document knows how long it stays true and what it's built from. A script turns that
   into an ordered plan: which skill to run, on what, and why. You approve, the skills run.
4. **Integrations.** One sheet lists the tools plugged in: what each brings in or receives, which skill uses it,
   and its guardrail. Never a key.

## One change, the whole chain

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/chain-dark.svg">
  <img alt="One change, the whole chain. The ICP is updated; the competitor overview, the positioning, the messaging, the brand and the content plan are built from it and get flagged. The plan: 1, competitor-card on competitors.md; 2, gtm-os on positioning, brand and messaging; 3, re-read the content plan by hand. Product and proof are untouched." src="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/chain-light.svg" width="100%">
</picture>

Each document starts with a short header: its type, when it was last checked and by whom, what it's built from,
and which skill rebuilds it. `.claude/lifetime.yaml` says how long each type stays true: 30 days for the product
and competitors, 90 for the ICP and positioning, a year for the brand, and "until a source changes" for messaging
and strategies.

A document is flagged when its time is up, or when something it's built from changed after its last check,
including a file in another repository, like your product's README. The plan then puts sources first, and in
Claude Code a hook prints it at the start of every session. Time works like a change: here is the plan of a test
install five weeks on, once its 30-day documents had expired.

```
Refresh plan:
  1. Run `competitor-card`:
       - foundations/competitors/competitors.md: stale since 2026-11-19
  2. Run `gtm-os`:
       - foundations/product/product.md: stale since 2026-11-19
       - foundations/proof/proof.md: stale since 2026-11-19
       - foundations/positioning/positioning.md: built from foundations/competitors/competitors.md, which will change
       - foundations/brand/brand.md: built from foundations/positioning/positioning.md, which will change
       - foundations/messaging/messaging.md: built from foundations/proof/proof.md, which will change
  3. Re-read by hand (no skill keeps these):
       - workstreams/content/strategy/plan.md: built from foundations/positioning/positioning.md, which will change
```

## Install

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/install-dark.svg">
  <img alt="Install in three steps. 1, paste the prompt into Claude Code, Codex or Hermes Agent, at the root of your repository. 2, answer the interview: about 35 questions, one at a time, 30 to 45 minutes. 3, your GTM OS runs." src="https://raw.githubusercontent.com/mussetpro-ship-it/gtm-os/main/assets/install-light.svg" width="100%">
</picture>

Paste [prompt-installation.md](prompt-installation.md) into your agent, or clone this repository and copy `gtm-os/` to
`.claude/skills/gtm-os/`. Node 18+. Stop anytime: what's filled stays.

## Day to day

| Say | What happens |
|---|---|
| "Refresh the GTM OS" | The agent reads `latest.md` and the freshness plan, adds what the script can't see (a decision that changes a foundation), shows you the plan, and runs the steps you approve |
| "Update my ICP" | It shows what the document says, asks what changed, and rewrites only that. Same for positioning, messaging, brand, product and proof |
| "Add a competitor: acme.com" | `competitor-card` reads their public pages and writes a dated card |
| A new skill | Copy `.claude/skills/competitor-card/`, rename it, and rewrite its four parts for the new job |

<details>
<summary><b>What gets installed</b></summary>

```
CLAUDE.md            the one-page map
AGENTS.md            the same entry point, for Codex and Hermes Agent
latest.md            short memory: recent changes, newest first
history.md           long memory: major events, append-only
decisions.md         GTM decisions, dated and signed
connections.md       the tools plugged in, never a key
foundations/         product, proof, icp, competitors, positioning, messaging, brand
workstreams/         one folder per lane, each in research/, strategy/, execution/
scripts/
  freshness.mjs      the check and the plan
.claude/
  rules/             memory and provenance, one home per document, how long a document stays true
  lifetime.yaml      how long each type of document stays true
  settings.json      the session-start hook
  skills/            gtm-os and competitor-card
.agents/skills       a link to .claude/skills, for Codex and Hermes Agent
```

</details>

## The rules it installs

- **The repository is the memory.** Every number says where it comes from (measured, seen, read but unverified,
  estimated, unavailable) and every decision says who made it. Only the owner validates a document. What no longer
  holds is deleted; git keeps the history.
- **One home per document.** Anywhere else, a one-line summary and a link. Skills read the foundations, never a
  copy of them.
- **How long a document stays true.** The header, the lifetimes, and a script that does the date math, so nobody
  does it in their head.

## What's tested, what isn't

Tested on 2026-10-20, on macOS with Node 24:
- the full install from the all-in-one prompt, by a fresh Claude Code agent in an empty folder, for a made-up
  company with its product repository next door: every file copied without a difference, the interview played to
  the end, a competitor card written from 6 public pages; about 90 tool calls and 12 minutes of agent time,
  without the human pauses;
- the checksum step: a faithful copy passes, with Unix or Windows line endings; a changed or missing file stops
  the install before anything is written;
- the freshness script: empty templates, documents going stale on a later date, a change cascading through what's
  built from it, a source in another repository (committed or not), documents built from each other, a
  `latest.md` behind the commits, and every kind of malformed header;
- the session-start hook's command, run the way Claude Code runs it.

Not tested yet: the hook firing inside a live Claude Code session, the install in Codex and Hermes Agent,
scheduled runs, Windows itself. Dust can't hold this OS (it has no repository to write into): install it with one
of the others.

## Credits

The four-layer model (context, skills, orchestration, integrations) comes from Matteo Tittarelli's
["How to build your AI GTM system"](https://www.growthunhinged.com/p/how-to-build-your-ai-gtm-system), published in
Kyle Poyar's Growth Unhinged on June 17, 2026. This repository is our own implementation of it, in our own words
and drawings. We added what we found we needed while running one: lifetimes per document type, the `built_from`
links, the freshness script and its refresh plan, and the provenance rules.
The Claude, OpenAI and Hermes Agent logos belong to their owners ([sources](tools/logos/SOURCES.md)).

Made by [Maxime Musset](https://github.com/mussetpro-ship-it).

## License

[MIT](LICENSE). The Manrope font embedded in the images, in `tools/fonts/`, is under the
[SIL Open Font License](tools/fonts/OFL.txt).
