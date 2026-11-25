# Meeting room booking impact map

Employees must now cancel at least two hours before the reservation starts. Under the old rule they could cancel with 30 minutes left.

## US-003 — Cancel my reservation

| Field | Current | Proposed |
| --- | --- | --- |
| First acceptance criterion | An employee can cancel their own reservation 30 minutes or more before the start time. | An employee can cancel their own reservation two hours or more before the start time. |
| Source quote at lines 19–20 | Quote line 19 from the original spec. | Quote line 19 from the revised spec. Keep the room availability sentence at line 20 in the reference. |

The time rule is on line 19 of both the [original spec](spec-before.md) and the [revised spec](spec-after.md). The release of the room after a successful cancellation is still required by line 20. The story ID, title, user story, and second acceptance criterion stay the same. The requirements behind US-001 and US-002 have no changes in this example.

## Suggested tests

Use an employee who owns the reservation. Measure time to the same scheduled start.

| Time before start | Expected under original rule | Expected under revised rule |
| --- | --- | --- |
| 29 minutes | Cancellation rejected | Cancellation rejected |
| 30 minutes | Cancellation allowed | Cancellation rejected |
| 119 minutes | Cancellation allowed | Cancellation rejected |
| 120 minutes | Cancellation allowed | Cancellation allowed |
| 121 minutes | Cancellation allowed | Cancellation allowed |

After an allowed cancellation, verify that the room becomes available for the original time slot. The specs leave the reminder timing and delivery channel open.
