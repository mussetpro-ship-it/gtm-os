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
