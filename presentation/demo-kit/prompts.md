# Demo prompts

Copy-paste source for all three demos, and the prompts `race.mjs` sends. The
`<!-- prompt:... -->` markers are read by `race.mjs`: edit the text freely, but
keep the markers.

All paths are relative to the demo copy (for example `parcel-pilot-stage/demo2-disciplined`).
In Claude Code you can type `@` and pick the file instead of pasting the path, so
it is attached rather than searched for.

---

## The vibe lane (Demo 1, and the vibe side of the race)

One conversation for everything. No file names, no constraints, no verification
command. This is how most of us actually prompt on a busy day. Prompt numbers match
the task numbers. Demo 1 uses vibe-1 then vibe-3; the race sends 1, 3, 2, 4 in one chat.

<!-- prompt:vibe-1 -->
```text
An order with a percentage discount is charged too much tax. Fix the bug and make the tests pass.
```

<!-- prompt:vibe-3 -->
```text
Also, make shipping free on orders over £100.
```

<!-- prompt:vibe-2 -->
```text
Also, wholesale customers shouldn't get more than £500 off. Add that.
```

<!-- prompt:vibe-4 -->
```text
Notifications retry too many times. Make it only retry twice.
```

---

## The disciplined lane (Demo 2, Demo 3, and the disciplined side of the race)

One **fresh** conversation per goal. Each prompt has the six parts: goal,
acceptance criteria, context pointers, constraints, plan requirement, verification.

### Task 1 — tax bug (Demo 2, part 1 · normal mode, no plan needed)

<!-- prompt:disciplined-1 -->
```text
Fix the discounted-order tax calculation.

Goal: an order with a percentage discount is taxed on the discounted merchandise subtotal plus shipping.
Acceptance: the failing test in tests/pricing/calculate-order-total.test.ts passes; undiscounted orders are unchanged; every amount stays an integer (minor units).
Start with: src/pricing/calculate-order-total.ts and tests/pricing/calculate-order-total.test.ts. The operation-order rule is in docs/decisions/002-pricing-operation-order.md.
Constraints: do not change tax rates (src/pricing/tax-calculator.ts) or public API types. Do not read archive/ or fixtures/.
Plan: not needed - make the smallest correct change.
Verify: npm test -- tests/pricing/calculate-order-total.test.ts, then npm run typecheck.
```

### Task 3 — free standard shipping (Demo 2, part 2 · plan mode first)

Claude Code: `/clear`, then **Shift+Tab** until the footer shows *plan mode*.

This is the task where saying what you know pays off. The vibe prompt ("free on
orders over £100") is a perfectly normal ticket, and in rehearsal the vibe lane
failed it every time: it codes "over" as `>` (so exactly £100 still pays) and
makes express free too. Neither is a model mistake; nobody told it otherwise.

<!-- prompt:disciplined-3 -->
```text
Goal: standard shipping is free when the DISCOUNTED merchandise subtotal is at least £100 (10000 minor units). Express shipping is never free.

Acceptance:
- standard: £99.99 -> £5; exactly £100.00 -> free; £150 -> free
- express: £150 -> £15; £5,000 -> £15 (never free)
- £120 with a 20% discount is £96 discounted -> standard shipping is still charged

Context: src/pricing/shipping-price.ts decides what the customer pays; the threshold goes in src/pricing/pricing-policy.ts. Not src/shipping/ (shipping-selector picks the method, carrier-rates is what carriers charge us) and not src/pricing/price-breakdown.ts (formatting only).

Constraints: the threshold lives in PricingPolicy as 10000, no scattered literal. Integer minor units. Do not change shipping-method selection. Do not weaken existing tests; add tests/pricing/shipping-price.test.ts with the acceptance cases.

Plan first, at most 8 lines, with these headings: Goal, Change (files), Don't touch, Tests, Verify, Open questions. Then stop for my review.

Verify: npm test -- tests/pricing, then npm run typecheck.
```

### Task 3, continued — save the plan, clear, build from it (Demo 2)

When the plan is good, decline Claude Code's "proceed?" prompt (choose to keep
planning), press **Shift+Tab** to leave plan mode, then:

```text
Save the plan above to plans/free-shipping.md exactly as agreed, including the don't-touch list and the verification commands. Do not change any other file.
```

Run `/context`, then `/clear`, then `/context` again (the drop is the point), then:

```text
Implement plans/free-shipping.md. Stay inside its file list and don't-touch list. Run its verification commands and report only what changed and the test results.
```

### Task 2 — wholesale discount cap (race only)

Not demoed live; the race runs it so the vibe chat carries a fourth ticket.

<!-- prompt:disciplined-2 -->
```text
Goal: cap the percentage discount for WHOLESALE customers at £500 (50000 minor units). Retail behaviour must not change.

Acceptance:
- retail, calculated discount £600 -> applied £600 (retail is NOT capped)
- wholesale £400 -> £400; wholesale £500 -> £500; wholesale £600 -> £500

Context: src/pricing/apply-discount.ts, src/pricing/pricing-policy.ts, tests/pricing/wholesale-discount.test.ts.
The limit is money, not a percentage - so it does not belong in src/promotions/ (see docs/decisions/004-promotions-are-not-pricing.md if unsure).

Constraints: the cap value lives in PricingPolicy - no 50000 literal scattered across files. Integer minor units, no floats. No changes under src/promotions/ or src/api/. Do not refactor the pricing pipeline. Do not weaken existing tests; add cases below, at and above the cap.

Plan first, at most 10 lines, with these headings: Goal, Change (files), Don't touch, Approach (where the tier condition goes), Tests, Verify, Open questions. Then stop for my review.

Verify: npm test -- tests/pricing/wholesale-discount.test.ts, then npm run typecheck.
```

### Task 4 — notification retries (Demo 3 · fresh session, plan mode)

Claude Code: `/clear`, then **Shift+Tab** until the footer shows *plan mode*. Type `@` and
attach the retry policy and its test, then paste the prompt.

<!-- prompt:disciplined-4 -->
```text
Goal: failed fulfilment notification deliveries currently allow three retries. Change the maximum to TWO retries.

Definition: a retry is an attempt AFTER the initial one, so two retries = three attempts in total (docs/decisions/003-notification-retries.md).

Acceptance: attempts 1 and 2 may be retried; attempt 3 may not; successful deliveries and permanent failures are never retried; maxDeliveryAttempts() returns 3.

Context: src/notifications/retry-policy.ts and tests/notifications/retry-policy.test.ts. delivery-queue.ts (when to retry) and notification-log.ts (audit trail) do not own the limit - do not change them.

Constraints: no pricing changes. Keep the maxDeliveryAttempts() name - other modules call it. Update the existing test deliberately; do not delete or loosen it.

Plan first: at most 5 lines, then stop for my review.

Verify: npm test -- tests/notifications, then npm run typecheck.
```

---

## Handy follow-ups

Approving a plan:

```text
Plan approved. Implement it, run the narrowest test, then typecheck. Report only what changed and the test result.
```

Asking for a 200-word handoff before clearing (Demo 3, optional):

```text
Write a handoff of at most 200 words: goal, what changed (files), decisions and why, verification run, what remains. No transcript recap.
```

Focused compaction in Claude Code (if you want to show it):

```text
/compact keep only the retry-limit decision, the files changed and the test results
```

---

## The QA round (race only)

After the four tickets, `race.mjs` runs the hidden checks. Any lane with a failing
check gets one QA report, the same wording for both lanes, built from the names of
the checks that failed, then is scored again. The vibe lane gets it in its existing
chat; the disciplined lane in a fresh one, matching each lane's habit. A lane that
passed everything gets no report. This is the rework that slide 6 calls the cost
that hurts most: it shows up as corrections, extra tokens, cost and minutes.

The report looks like this (built by `race.mjs`, not read from this file):

```text
QA found these acceptance checks failing:
- Free shipping: makes standard shipping free exactly at the threshold
- Free shipping: never makes express shipping free

Fix them without breaking anything else, then run the relevant tests.
```
