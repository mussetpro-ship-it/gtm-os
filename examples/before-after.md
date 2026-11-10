# Before and after

The picture at the top of the README, in full. Run on 2026-11-10 with Claude Code 2.1.319 and the same model
both times (`claude-fable-5-2`), each in a fresh session that loaded nothing but the folder it ran in (no user
settings, skills or MCP servers), allowed to read files and run the freshness script, not to write. Both
answers are copied as the agent wrote them. Nothing was sent.

The request, the same both times:

> Fernway is our scheduling software for field-service teams. Write a cold email to Marco Diaz, operations manager at a 40-technician HVAC company in Columbus, Ohio. Under 120 words.

- **Without GTM OS**: an empty folder.
- **With GTM OS**: a GTM OS installed and filled for Fernway, a made-up company. Its seven foundations were
  written from a pretend interview; its proof document was last checked on 2026-09-30, so it was stale on the
  day of the run (proof stays true for 30 days).

## Without GTM OS

```text
**Subject:** Scheduling 40 techs in Columbus

Hi Marco,

The first cold week in Columbus usually means a flood of no-heat calls, and I'd guess your dispatchers spend much of it rebuilding the schedule by hand.

Fernway is scheduling software built for field-service teams. When an emergency call comes in or a job runs long, it helps your dispatchers see who's available and rework the day without a chain of phone calls.

Would you be open to a 15-minute call next week? I'd like to hear how you handle scheduling today and show you whether Fernway fits.

Best,
[Your name]
[Phone]

That's about 95 words. I kept the product claims generic because I don't know Fernway's specific features or customer results; a concrete proof point (a similar HVAC customer or a real metric) in the second paragraph would strengthen it.
```

## With GTM OS

```text
**Subject:** Tomorrow's board at 40 techs

Marco,

With 40 techs and the first cold snap on the way, I'd guess someone on your team ends each day rebuilding tomorrow's board.

Fernway builds it for you from your jobs, each tech's skills and the drive times. Your dispatcher checks the schedule instead of building it. Dispatchers tell us that takes about 15 minutes a day, down from about 90.

Brightline Heating & Air, 42 techs, saw 31% fewer no-shows over three months this summer.

It runs next to QuickBooks, and there's a 14-day trial, no card needed.

Worth 15 minutes next week to see it on your own jobs?

[Your name]
Fernway

That's 110 words in the body.

- **Stale proof:** the proof foundation has been stale since 2026-10-30 (last checked 2026-09-30). Both numbers in the email come from it, so confirm them with Dana Reyes before sending.
- **What I left out:** I didn't use "goes live in a week" because it appears only in the messaging draft, not in the proof document. I also avoided route optimization and fuel savings, which the positioning says we never claim.
- **Assumptions:** the opening line guesses that Marco's team builds the board by hand. The signature is a placeholder because I don't know who is sending it.

I haven't saved this in the repository; say so if you want it filed under `workstreams/outbound/execution/`.
```
