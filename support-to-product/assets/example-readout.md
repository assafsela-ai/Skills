# Meeting room booking — support readout

This fictional [support export](example-tickets.csv) covers email and chat from May 12–16, 2026. It has 12 rows and 11 unique tickets. A repeated export row for T-105 was counted once. Ten tickets have enough detail to group and one needs clarification. T-103 covers two goals, so the four theme counts add up to 11.

| Customer goal and obstacle | Unique tickets | Example from the source | What we still need to know |
| --- | ---: | --- | --- |
| Reserve the same room for several dates. Customers have to book each date separately. | 3 · T-101, T-102, T-103 | “Right now I have to make six separate bookings.” (T-102) | How many users book the same room repeatedly? How many dates do they usually need? |
| Release a room when plans change close to the meeting. Customers report blocked cancellations. One ticket quotes a two-hour cutoff. | 3 · T-104, T-105, T-106 | “The app says cancellations close two hours ahead.” (T-106) | How often do customers attempt a late cancellation? How many rooms then sit unused? |
| See confirmed reservations in a work calendar. Customers have trouble adding bookings to the calendar they already use. | 3 · T-103, T-107, T-108 | “How do I add a confirmed room booking there?” (T-107, referring to Outlook) | Which calendars do affected users rely on? How often do they miss a booking because of this? |
| Reserve a room shown as available. Search shows a free slot, then confirmation returns a conflict. | 2 · T-109, T-110 | “When I clicked Reserve, the app said someone else had booked it.” (T-109) | How often does a displayed slot fail at confirmation? Did another reservation take the slot, or was the availability display out of date? |

## Needs clarification

T-111 says “Booking was confusing.” It would help to know what the customer wanted to do and where they got stuck.

## How to read the counts

The input covers the supplied export only. It gives no total for eligible customers, active bookers, or bookings. The table measures how many tickets in the export mention each problem. It cannot estimate how often the problems occur across all users.
