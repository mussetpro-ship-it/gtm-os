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
