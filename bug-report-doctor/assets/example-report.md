# Reserve keeps loading for over a minute after click

## Scope

One reporter using the web app in Chrome on a Windows laptop. Browser version, app build, and the exact room and slot are open. The reporter saw the spinner in **2 of 3** booking attempts for different slots in one session. The last affected attempt was reported at **2026-05-18 10:12 UTC**. [Reporter follow-up](example-intake.md#follow-up)

## Steps to attempt

1. In the web app, search for a room on the next day.
2. Select an available slot.
3. Click **Reserve** once.
4. Watch for a confirmation or an error. If the spinner persists, refresh and check **My Reservations** for the selected room and slot.

These steps come from the [reporter's sequence](example-intake.md#follow-up).

## Expected behavior

The reporter expected a confirmation showing the room and time after clicking **Reserve**. [Reporter follow-up](example-intake.md#follow-up)

## Observed behavior

In the affected attempts, **Reserve** kept showing a spinner for more than a minute. The reporter saw neither a confirmation nor an error. One attempt gave the usual confirmation. After refreshing on the last affected attempt, the reporter saw the selected room and slot listed in **My Reservations**. The other affected attempt was left unchecked. [Reporter follow-up](example-intake.md#follow-up)

## Open questions and next check

- What room, time slot, app build, and browser version were used? These details would help locate and repeat the last affected attempt.
- What response did the booking request return at 10:12 UTC, and what reservation record was created? Check the request and the record for that attempt together to see where confirmation stopped.
