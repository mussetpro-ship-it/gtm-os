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
