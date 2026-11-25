# Scheduled reports release decision

Fictional meeting record. All times in this example are UTC.

## Decision record

- Decision time: 2026-05-14 at 14:00 UTC.
- Decision-makers: Maya (product lead) and Ren (engineering lead).
- Option A: release manual CSV export and scheduled report emails together.
- Option B: release manual CSV export now and hold scheduled report emails.
- Decision: Maya and Ren chose option B.

## Recorded rationale

The team reviewed the support summary and the morning retry rehearsal. The rehearsal produced duplicate emails in 3 of 10 runs where the send timed out and the worker retried. The team chose to hold scheduled emails because it could not yet confirm a recipient would receive a single copy after a retry. Manual downloads did not use that worker.

The support sample suggested interest in scheduling. The team recorded that six requests were too few to estimate wider demand. They agreed to revisit the hold after a retry fix passed the timed-out-send rehearsal.
