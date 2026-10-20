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
