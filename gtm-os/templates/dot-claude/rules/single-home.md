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
