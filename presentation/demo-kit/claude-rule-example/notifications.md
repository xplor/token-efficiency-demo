---
paths:
  - "src/notifications/**"
  - "tests/notifications/**"
---

# Notification retries

- A retry is an attempt AFTER the initial one: N retries = N + 1 attempts (ADR 003).
- `retry-policy.ts` decides WHETHER to retry and owns the limit; `delivery-queue.ts` only decides WHEN.
- Tests derive limits from `maxDeliveryAttempts()`; never hard-code the number twice.
- Focused test: `npm test -- tests/notifications`
