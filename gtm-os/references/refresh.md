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
