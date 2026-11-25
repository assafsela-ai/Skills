# Decision Replay — scheduled reports

On **2026-05-14 at 14:00 UTC**, Maya and Ren chose to ship manual CSV export and hold scheduled report emails. They also considered shipping both together. The recorded reason for the hold was duplicate emails after a send retry. [Decision and rationale](decision.md#recorded-rationale)

## What they had at 14:00 UTC

| Available | Evidence | What it supported |
| --- | --- | --- |
| May 12, 09:20 | Two of six recent support requests explicitly asked for scheduling. [S1](evidence.md#s1--support-summary) | Some customers wanted the feature. The sample was too small to estimate wider demand. |
| May 14, 09:15 | Three of ten retry rehearsal runs sent duplicate emails after a timeout. [S2](evidence.md#s2--retry-rehearsal) | Engineering had a concrete reason to hold scheduled emails. Manual exports used a different path. |
| May 14, 14:00 | The decision record says to revisit the hold after a retry fix passed the timed-out-send rehearsal. [Decision and rationale](decision.md#recorded-rationale) | The team set a condition to revisit the release. |

## What they learned afterward

- **May 14, 16:40 UTC.** The first completed analysis found repeat manual exports in 38 of 50 sampled accounts. It used activity through May 13. The analysis arrived two hours and forty minutes after the decision. It showed repeated manual work in that sample. The share of customers who would use scheduled email was still unknown. [S3](evidence.md#s3--export-activity-analysis)
- **May 18, 10:10 UTC.** After the fix, all 20 controlled retries delivered one email each. This met the recorded condition for revisiting the hold in the rehearsal environment. The evidence ends with the rehearsal result. [S4](evidence.md#s4--follow-up-rehearsal)
- **May 20, 11:00 UTC.** A teammate recalled having the 38-of-50 analysis during the decision. That recollection conflicts with the analysis record, which shows the first completion and share at 16:40 UTC on May 14. [S5](evidence.md#s5--retrospective-recollection) · [S3](evidence.md#s3--export-activity-analysis)

## Evidence gap

The customer quote asking for Monday emails is dated May 14. The source gives neither a time nor a record of when the decision-makers saw it, so its place relative to the decision is unknown. [S6](evidence.md#s6--customer-quote-without-a-time)
