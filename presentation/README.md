# Vibe vs. Verified — presentation

A 60-minute presenter-led session on token-efficient AI development with the
Claude Code CLI (with Cursor equivalents), built on the `parcel-pilot` repo. It
alternates theory and live demos around two themes: planning keeps an agent on
target, and managing context keeps it cheap.

| File | What it is |
|---|---|
| [`run-of-show.md`](run-of-show.md) | Itinerary and full script for Adam and Eugene, prep checklists, contingencies |
| [`vibe-vs-verified.pptx`](vibe-vs-verified.pptx) | The slide deck (speaker notes on every slide; slides 26–27 are backup) |
| [`cheat-sheet.pdf`](cheat-sheet.pdf) | Two-page attendee handout (source: `cheat-sheet.html`) |
| [`demo-kit/`](demo-kit/README.md) | Demo staging, every prompt, the vibe-vs-disciplined race, scoring |
| [`_source/`](_source/) | Generator for the deck: `npm install && npm run build` |

Slide 23 holds rehearsal race results as a fallback: refresh them from a new
run of `node demo-kit/race.mjs` (see the run of show).
