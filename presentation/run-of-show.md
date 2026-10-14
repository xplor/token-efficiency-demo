# Vibe vs. Verified — run of show and script

**Session:** Token-efficient AI development with the Claude Code CLI (the habits carry over to Cursor)
**Audience:** Xplor engineers using the Claude Code CLI (`claude`) or Cursor. Every demo runs in Claude Code in a terminal; no IDE UI. Cursor equivalents are on backup slide 26 and the cheat sheet.
**Length:** 60 minutes, presenter-led (attendees watch; no laptops needed)
**Speakers:** Adam (opens, Theory 1 and 3, drives Demo 2) · Eugene (Theory 2, drives Demos 1 and 3)
**Deck:** [`vibe-vs-verified.pptx`](vibe-vs-verified.pptx) — speaker notes on every slide; slides 26–27 are backup
**Handout:** [`cheat-sheet.pdf`](cheat-sheet.pdf)
**Demo kit:** [`demo-kit/`](demo-kit/README.md) — staging, prompts, the race, scoring

---

## The idea in one paragraph

We teach by contrast, around two themes: **planning keeps an agent on target**
and **managing context keeps it cheap**. Before saying anything, we start a
**race**: two headless Claude Code agents get the same four tickets in the same
repo, same model. One gets vibe prompts in one long chat; the other gets the
disciplined loop. Then we alternate **theory → demo** three times, each demo
showing the idea we just explained, live, with the room keeping score. At minute
54 we read the race scoreboard: correctness first, then tokens, context and files
touched.

**The lines to land:**
- *Every agent plans. Plan mode makes it plan where you can see it.*
- *Keep the conclusion, throw away the search.* (plan → save → clear → build)
- *The agent should pay only for the layer of docs the current step needs.*
- *The fix was one line either way. Everything else was the cost of not saying what we knew.*

## The five-verb loop we teach

**Aim · Plan · Build · Prove · Reset**

| Verb | What it means |
|---|---|
| Aim | Six-part prompt: goal, acceptance criteria, context pointers, constraints, plan requirement, verification |
| Plan | Make the agent's thinking visible in plan mode; review it; the approved plan is the contract |
| Build | Only what the plan says; no drive-by refactors; new evidence → re-plan |
| Prove | Narrowest test, then typecheck, then the full suite once |
| Reset | Save the plan or a handoff to a file; new goal → `/clear`; same goal, long chat → compact |

---

## Itinerary at a glance

| Time | Block | Slides | Lead | Driving the screen | The other speaker |
|---:|---|---:|---|---|---|
| 0:00 | Open, start the race | 1–3 | Adam | Adam (deck) | Eugene starts `race.mjs` |
| 0:03 | **Theory 1** — how context works, how we keep score | 4–7 | Adam | Adam (deck) | Eugene opens `claude` in `demo1-vibe` |
| 0:09 | **Demo 1** — vibe it (Claude Code CLI) | 8 | Eugene | Eugene | Adam narrates and tallies |
| 0:17 | **Theory 2** — planning keeps agents on target | 9–15 | Eugene | Eugene (deck) | Adam opens `claude` in `demo2-disciplined` |
| 0:27 | **Demo 2** — plan, save, clear, build (Claude Code CLI) | 16 | Adam | Adam | Eugene narrates and tallies |
| 0:38 | **Theory 3** — managing context and progressive disclosure | 17–21 | Adam | Adam (deck) | Eugene opens `claude` in `demo3-notifications` |
| 0:46 | **Demo 3** — new goal, fresh context (Claude Code CLI) | 22 | Eugene | Eugene | Adam narrates; checks the race |
| 0:54 | Race results, checklist, close | 23–25 | Both | Eugene (race terminal) → Adam (deck) | — |
| 0:58 | Q&A (backup slides 26–27: tool map, model choice) | 25 | Both | — | — |

Hard rules: **no block overruns by more than 1 minute**. If a demo agent is still
working at the time limit, stop it (Esc) and narrate what it was doing — an
unfinished vibe session is a perfectly good result.

---

## Preparation

Run every `node demo-kit/...` command from this `presentation/` folder. Demo
copies live in a `parcel-pilot-stage/` folder next to this repository (for example
`C:/Projects/parcel-pilot-stage/`), outside the repo, so the agent can't see the
prompts or answers.

**Personal Claude Code config shows up on stage.** Your `~/.claude/CLAUDE.md` and
rules load into every session. In rehearsal, git rules made demo agents check
remotes, offer to branch or commit, and ask about branch names in the plan. The race
blocks git in both lanes, so the scoreboard is safe. In a live demo it's only
chatter: "ignore the git bits, that's my personal config." A clean profile removes
it entirely (optional, see `demo-kit/README.md`).

### One week before

- [ ] Both speakers rehearse once end-to-end, with the timer running. Demo 2 is
      the tightest block — rehearse it twice.
- [ ] Run the race once (`node demo-kit/race.mjs`) and refresh slide 23's rehearsal numbers from
      `demo-kit/results/race-*.md`. That's your fallback if the live race hasn't finished.
- [ ] Record a screen capture of all three demos during rehearsal as backups.
- [ ] Confirm the Claude Code commands on the cheat sheet and backup slide 26 against your
      installed version (`claude --version`, `/help`). The Cursor column is reference only;
      if someone in the room uses Cursor, sanity-check it against `agent --version` too.
- [ ] In Claude Code, confirm how your version lets you decline a finished plan and stay
      in plan mode (Demo 2 step 4 depends on it).
- [ ] Share the cheat sheet with the organiser so it can go out right after the session.

### The day before

- [ ] `cd parcel-pilot && npm install && npm test` — expect exactly **1 failing test** (that's the tax bug).
- [ ] `node demo-kit/race.mjs --dry-run` — checks staging and scoring without calling Claude.

### 30 minutes before

- [ ] `node demo-kit/stage.mjs` — creates three clean demo copies in `../../parcel-pilot-stage/`:
      `demo1-vibe`, `demo2-disciplined`, `demo3-notifications`. These have no `workshop/`
      (answers) or `verify/` (hidden checks), so the agent can't cheat.
- [ ] **Eugene's machine:** `claude` running in `demo1-vibe`, fresh session, status
      line showing context % (`/statusline show model, context percentage and cost`).
      A second terminal with `claude` running in `demo3-notifications`, same status line.
- [ ] **Adam's machine:** `claude` running in `demo2-disciplined`, fresh session, same status line.
- [ ] Both: terminal font ≥ 18pt, notifications off, `demo-kit/prompts.md` open
      in a side window for copy-paste.
- [ ] A spare terminal for the race on whichever machine stays awake for ~15–25 minutes.
- [ ] Same model in every demo session as the race (default: Sonnet).

---

## Script

Lines in quotes are suggested wording, not a script to read. Stage directions are
in *italics*.

### 0:00–0:03 · Open — slides 1–3 · Adam

*Slide 1.*

> "This is 'Vibe vs. Verified'. Two ideas for the next hour: planning is how we
> keep an agent on target, and managing context is how we keep it cheap. We'll
> swap between a few minutes of theory and a live demo, three times. No laptops
> needed."

*Slide 2. Eugene starts the race now (`node demo-kit/race.mjs` in the spare
terminal) and says "race is running".*

> "Before we explain anything: we've just started two Claude Code agents on the
> same four tickets in the same repo. Same model. One gets the prompts we all
> write at 4pm on a Thursday — one chat, one-liners. The other gets the habits
> we're about to teach. We won't look at it again until the end."

*Slide 3.* "Purple is us talking, teal is live."

### 0:03–0:09 · Theory 1: how context works — slides 4–7 · Adam

*Slide 4 — working set.*

> "Most of us carry the wrong mental model: that the agent 'knows' our repo. It
> doesn't. It has one window. Everything goes in it — system prompt, your
> CLAUDE.md or AGENTS.md, your prompt, every file it opened, every test log,
> every message so far — and it re-reads the lot on every turn."

*Slide 5 — the numbers.* One file ≈ 1.5k tokens, the whole `src/` ≈ 30k, one
careless read of the analytics fixture ≈ 130k. The fix is one line. Point at the
traps: `archive/`, `tax-calculator.ts`, and the two `src/shipping/` files that
sound right for a shipping-price change and aren't.

*Slide 6 — four costs.*

> "Tokens are the cheapest of four costs: time, context, interaction — every
> 'no, not that file' — and rework. A cheap session that ships the wrong change is
> the most expensive outcome there is."

*Slide 7 — scoring.* "Call these out when you see them. The headline: of the files
it read, how many mattered? Aim for 70%."

Hand-off: *"Eugene — let's vibe."*

### 0:09–0:17 · Demo 1: vibe it — slide 8 · Eugene drives, Adam narrates

**Setup:** `claude` in `parcel-pilot-stage/demo1-vibe`, fresh session, status line visible.

1. *(0:09)* Eugene pastes **vibe-1**:
   `An order with a percentage discount is charged too much tax. Fix the bug and make the tests pass.`
   "That's it. I'm not going to help it."
2. *(0:09–0:11)* Let it work (about a minute in rehearsal). **Adam narrates and
   tallies:** files read, searches, `archive/`, the fixture, `tax-calculator.ts`,
   full-suite runs.
   - "It's searching across `src/` for 'discount' — because we didn't say where."
   - "It ran the whole suite, not the one test file. Fine at 120 tests; expensive at 12,000."
   - Expect the tax fix to be right. Say so: "Good docs and a failing test did our
     job for us. Remember that for Theory 3."
3. *(0:11)* In the **same chat**, paste **vibe-3**:
   `Also, make shipping free on orders over £100.`
   Adam: "That's a real ticket. Anyone see a problem with it?" Take one answer, move on.
4. *(0:13)* When it finishes, **Eugene runs the hidden check**:
   `node demo-kit/verify.mjs ../../parcel-pilot-stage/demo1-vibe 1 3` (second terminal,
   from `presentation/`). In rehearsal Task 3 failed every time, two ways:
   - **exactly £100 still pays shipping.** It wrote `> 10000`. We said "over"; the
     business meant "at least".
   - **express became free too.** We never said it shouldn't be.
   Open `src/pricing/shipping-price.ts` and show the one `if`.
5. *(0:16)* `/context` and leave it on screen. Adam reads the tally.

> Adam: "It did exactly what we asked. The bug is in the prompt: two facts we knew
> and didn't say. Hold on to that context number — Eugene's going to show what went
> wrong, and it wasn't the model."

**If it goes badly wrong:** switch to the rehearsal recording. **If Task 3
passes:** say so and show the diff — it guessed right; the race shows whether it
guesses right on average.

### 0:17–0:27 · Theory 2: planning keeps agents on target — slides 9–15 · Eugene

*Slide 9 — anti-patterns (1 min).* Tie each card to a moment in Demo 1.

*Slide 10 — the loop (1 min).*

> "Five verbs: Aim, Plan, Build, Prove, Reset. Today we lean on two of them. Plan
> keeps it on target. Reset keeps it cheap."

*Slide 11 — six-part prompt (1 min).* Stress the acceptance row — exactly £100 is
free, express never is: "the two edge cases Demo 1 got wrong, because the vague
prompt never mentioned them."

*Slide 12 — before/after (1 min).* "~150 tokens longer, saves tens of thousands."

*Slide 13 — the plan is the cheapest place to be wrong (2 min).*

> "Here's the thing: the agent in Demo 1 *did* plan. It planned silently, between
> tool calls, where nobody could review it. Plan mode makes that thinking visible
> before a single edit. A wrong assumption costs one line to fix in a plan, a
> correction spiral during the build, and a whole new session after review."

*Slide 14 — a plan that keeps the agent on target (2 min).*

> "Ask for the plan in sections. The two everyone skips matter most. 'Don't
> touch' is what stops the agent wandering into src/shipping/ or refactoring the
> pipeline. 'Open questions' is where it admits what it guessed — 'does £100
> exactly qualify? express too?' is exactly where Demo 1's bugs would have
> surfaced. Once you approve it, the plan is the
> contract: build only what's in it, and if new evidence breaks it, stop and
> re-plan instead of letting the agent improvise."

Show how: **Shift+Tab** into plan mode in Claude Code. For Cursor users in the room:
Shift+Tab cycles Agent → Plan → Ask there too, or `/plan`.

*Slide 15 — plan, save, clear, build (2 min).*

> "This is where planning and context management meet. Planning is the expensive
> part — the window fills with search results and dead ends. Once the plan is
> right, save it to a file and clear. The build starts from a clean window
> holding the plan and the files it names. Keep the conclusion, throw away the
> search. And the plan file is your handoff for free."

Hand-off: *"Adam's going to do exactly that, on the same bugs."*

### 0:27–0:38 · Demo 2: plan, save, clear, build — slide 16 · Adam drives, Eugene narrates

**Setup:** `claude` in `parcel-pilot-stage/demo2-disciplined`, fresh session.

1. *(0:27)* Paste **disciplined-1** (tax bug). Normal mode, no plan — "it's one line;
   a plan would be pure cost." Expect 2–3 files read, one-line edit, one focused
   test, typecheck. *(0:29)* `/context` — compare with Demo 1. Say it aloud.
2. *(0:30)* `/clear`. **Shift+Tab** into plan mode. Paste **disciplined-3** (free
   shipping). "Same ticket Demo 1 got wrong. This time we say the two things we knew."
3. *(0:31)* **Review the plan out loud** (Eugene leads): "Goal — at least £100, after
   discount? Change — only shipping-price and pricing-policy? Don't touch —
   src/shipping/, price-breakdown? Tests — exactly £100, express, the £96 case?
   Open questions?" Ask the room for one change. If the plan is wrong, correct it
   in one line — the best moment in the session if it happens.
4. *(0:33)* Decline "proceed" (keep planning), **Shift+Tab** out of plan mode, paste
   the **save-plan** prompt → `plans/free-shipping.md`. `/context` — read the number.
   `/clear`. `/context` again — read the drop as a number, not a cliff: a fresh
   session still holds the system prompt and CLAUDE.md, so the floor isn't zero.
5. *(0:35)* Paste the **build-from-plan** prompt: `Implement plans/free-shipping.md…`
   Eugene: "Watch what it reads: the plan first, then the files the plan names."
6. *(0:37)* `node demo-kit/verify.mjs ../../parcel-pilot-stage/demo2-disciplined 1 3`
   and `/context`. Eugene reads the tally next to Demo 1's: **Task 3 PASS here,
   FAIL there.**

> Eugene: "Same ticket, same model. Demo 1 shipped a bug because we didn't say what we
> knew; this one was right because the plan said where the target was — and cheap
> because we threw the search away."

**Fallback:** if the save step fights you, skip it — approve the plan and build in
the same session, then show `/compact keep the plan and the test results` instead.

### 0:38–0:46 · Theory 3: managing context and progressive disclosure — slides 17–21 · Adam

*Slide 17 — continue, compact or clear (1.5 min).*

> "Three options; the difference is what survives. Continue keeps everything,
> including the noise. Compact in Claude Code, or `/summarize` in the Cursor CLI,
> replaces the transcript with a summary — lossy, so tell it what to keep. Clear
> keeps nothing but the repo and your plan file — which is exactly enough. 'Keep
> context under 20%' is a smoke alarm, not a law."

*Slide 18 — when to reset, how to compact well (1.5 min).*

> "The clearest signal is the agent forgetting something you told it — the
> instruction got buried. Compact at a boundary, say what to keep, restate the
> key constraint after. And if it went down the wrong path, rewind — arguing with
> it leaves the wrong path in context forever."

*Slide 19 — progressive disclosure (2 min).*

> "Now the docs side. Don't load everything up front — load it in layers. Layer
> 0, CLAUDE.md or AGENTS.md, is paid every turn, so it's tiny and mostly
> pointers. Layer 1 is a routing map, read when it needs to find code. Layer 2 is
> scoped rules that load only when it touches matching files. Layer 3 — ADRs,
> runbooks, skills — only when changing that rule. Skills and description-based
> rules already work this way: the description is always loaded, the body only
> when relevant."

*Slide 20 — pointers, not paragraphs (1.5 min).*

> "Left is this repo's real CLAUDE.md: a few facts that apply to every task, then
> 'read X only when Y'. Right is what most CLAUDE.md files become after a year —
> paid for on every turn, including the turn where you fix a typo in
> notifications. If you saw the vibe agent find the right file fast in Demo 1,
> this is why."

*Slide 21 — narrowest layer (1 min).*

> "After a bad session, resist 'add it to CLAUDE.md'. Put the lesson at the
> narrowest layer where it'll still be found. And disable MCP servers you aren't
> using — their tool definitions load every session."

Hand-off: *"New goal — notifications. Eugene, fresh context."*

### 0:46–0:54 · Demo 3: new goal, fresh context — slide 22 · Eugene drives, Adam narrates

**Setup:** `claude` in `parcel-pilot-stage/demo3-notifications`, status line visible.

1. *(0:46)* "Pricing's done, now notifications. Continue, `/compact` or `/clear`?"
   Take an answer. "New goal — `/clear`." Then `cat CLAUDE.md`: "Layer 0. About twenty
   lines: commands, a few rules that apply to every task, and two 'read X only when Y'
   pointers. Nothing about notifications."
2. *(0:47)* **Shift+Tab** into plan mode. `@` the retry policy and its test; paste
   **disciplined-4**. Adam: "It'll read ADR 003 because the prompt points at it —
   disclosure on demand, not preloaded."
3. *(0:49)* Read the plan. **The trap:** the constant is called `maxRetries` but holds
   *attempts*; setting it to `2` gives **one** retry. "Two retries means three
   attempts." Check its don't-touch list covers `delivery-queue.ts` and
   `notification-log.ts`. If the plan runs past 5 lines, say so — "it ignored the
   limit; that's a review comment, not a rewrite."
4. *(0:50)* Approve and build. `npm test -- tests/notifications`, `npm run typecheck`.
   `/context`; if it's grown, `/compact keep only the retry-limit decision, the files
   changed and the test results` and point out what survived.
5. *(0:52)* Save the lesson at **layer 2**: create `.claude/rules/notifications.md`
   (copy from `demo-kit/claude-rule-example/notifications.md` if typing is slow).
   "The `paths:` frontmatter scopes it to `src/notifications/**`. Claude loads it only
   when it reads or edits a file there — not on every prompt like CLAUDE.md."
   Cursor users: the same idea is `.cursor/rules/*.mdc` with `globs` (cheat sheet).
6. *(0:53)* Optional: `node demo-kit/verify.mjs ../../parcel-pilot-stage/demo3-notifications 4`.

> Eugene: "Adam — how's the race?"

### 0:54–0:58 · Race results and close — slides 23–25 · Both

*Eugene switches to the race terminal (scoreboard prints when both lanes finish;
also in `demo-kit/results/`). If it's not finished, use slide 23's rehearsal
numbers and say so.*

Adam reads it top-down. The first block is slide 7's six scorecard measures, with
**correctness** first; then the cost block (tokens, dollars, minutes), which
includes rework. Point back to slide 7: "these are the numbers we told you we'd
count."

1. **First try.** "Four tickets each. On the first try, vibe shipped a bug."
2. **The QA round.** "Then QA did what QA does: it sent back the failing checks.
   Same report, same wording, to both lanes. Disciplined had nothing to fix. Vibe
   needed a correction — in the same long chat, so it re-paid for everything in
   there." Point at **Prompts (corrections)** and the cost block.
3. **Cost.** Read the dollars and peak context as "including the rework".
4. **Files read — own it.** "This one's even. This repo has good docs, so both
   lanes found the right files. That's Theory 3 working, not a win for vibe.
   Reading few files isn't the goal; vibe read few and still missed the rule
   that mattered."

> "Same model, same repo, same four tasks. The fix was one line either way —
> everything else was the cost of not saying what we knew."

*Slide 24 — checklist (Eugene, 1 min).* Ask two people for one habit they'll try tomorrow.

*Slide 25 — close (Adam).*

> "Say what you know. Prove what you changed. Reset when the goal changes. The
> cheat sheet's going out in the channel; the repo has four more tasks to practise."

### 0:58–1:00 · Q&A

| Question | Answer |
|---|---|
| "Isn't writing a long prompt slower than just vibing?" | For a 10-second task, yes — vibe it. For anything you'll verify or review, six lines up front are repaid many times over. |
| "Should I always use plan mode?" | No. Plan when it reduces uncertainty: unknown files, business rules, multi-file changes. Never for one-liners. |
| "Why save the plan to a file instead of just building?" | Because planning fills the window with exploration you no longer need. The file keeps the conclusion; `/clear` drops the search. It's also a free handoff. |
| "Doesn't /clear lose everything?" | It loses the transcript, not the work. Code, tests, docs, git and the plan file are the memory. |
| "Compact or clear?" | Same goal → compact (say what to keep). New goal or wrong path → clear (or rewind). |
| "What goes in CLAUDE.md / AGENTS.md?" | About one screen: commands, a few non-negotiables, pointers with conditions ("read X only when Y"). Everything else goes in a deeper layer. |
| "Does this work in Cursor?" | Yes. We demoed Claude Code, but every move has a Cursor equivalent (backup slide 26, cheat sheet). Don't compare usage numbers across tools — compare your own before and after. |
| "Which model should I default to?" | Backup slide 27. The normal coding model; escalate on evidence. |

---

## Contingencies

| Problem | What to do |
|---|---|
| A demo agent stalls or rate-limits | Stop it, play the rehearsal recording, keep narrating |
| Demo running long | Hard stop at the block end. Unfinished is a valid result |
| Demo 2 save/clear step misbehaves | Approve and build in the same session; show `/compact keep the plan and test results` instead |
| Race hasn't finished at 0:54 | Use slide 23's rehearsal numbers; show the live terminal as "still going" — which itself makes the point |
| Race crashed | Rehearsal numbers on slide 23 |
| Time is short overall | Cut slide 12 (before/after) and slide 21 (narrowest layer). Never cut the plan review in Demo 2 or the race reveal |
| Lots of time left | Backup slides 26–27, or run `verify.mjs` on all three demo copies |

## After the session

- Post the cheat sheet and a link to the repo in the channel.
- Save `demo-kit/results/` from the live race; it's real data for the next run.
- Reset with `node demo-kit/stage.mjs` before the next session.
