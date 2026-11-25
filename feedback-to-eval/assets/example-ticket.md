# Support ticket SUB-482 — wrong subscription expiry date

All records in this example are fictional.

## Customer report

> I asked when my subscription expires. The assistant said it ends today, but my account page shows I have another month.

## Captured exchange

- Date of conversation: 2026-05-18.
- Question: "When does my current subscription expire?"
- Assistant reply: "Your current subscription expires on 2026-05-18."

## Account record

The account snapshot from the time of the conversation identifies `expires_at` as the end date of the current subscription. The product uses calendar dates for both fields in this example.

| Field | Value |
| --- | --- |
| `last_billed_at` | 2026-05-18 |
| `expires_at` | 2026-06-18 |

The reply matches the billing date. This ticket captures the input and output. It gives no trace of how the assistant selected the date.
