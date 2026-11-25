# Worked examples

Run these commands from the repository root. Each example uses a fictional product rule and a fixed date.

## 1. New York cancellation cutoff

**Rule.** A customer can cancel until 45 elapsed minutes before the booking starts, inclusive. A booking stores its start as a specific instant.

On November 1, 2026, the local label `01:30` occurs twice.

```sh
python time-zone-replay/scripts/replay.py resolve America/New_York 2026-11-01T01:30
```

| Booking start in New York | Start in UTC | Request at 05:00 UTC | Expected |
| --- | --- | --- | --- |
| `01:30 -04:00` | `05:30Z` | 30 minutes before start | Deny |
| `01:30 -05:00` | `06:30Z` | 90 minutes before start | Allow |

For the first booking, test requests at `04:44:59Z`, `04:45:00Z`, and `04:45:01Z` on the same date. Expect allow, allow, and deny.

```sh
python time-zone-replay/scripts/replay.py elapsed 2026-11-01T04:45:00Z 2026-11-01T01:30:00-04:00
```

The result is 2,700 elapsed seconds, exactly 45 minutes. If a booking record stores only `01:30` and the zone, both starts remain possible until the record identifies the occurrence.

## 2. A scheduled reminder in a skipped hour

**Rule.** Send a reminder every day at 02:30 New York time. If the local time is skipped, record the skipped occurrence and resume on the next scheduled day.

```sh
python time-zone-replay/scripts/replay.py resolve America/New_York 2026-03-08T02:30
python time-zone-replay/scripts/replay.py resolve America/New_York 2026-03-09T02:30
python time-zone-replay/scripts/replay.py elapsed 2026-03-08T01:30:00-05:00 2026-03-08T03:30:00-04:00
```

On March 8, `02:30` has no UTC candidate. Expect zero sends and a skipped occurrence. On March 9, `02:30` maps to `06:30Z`. Expect one send. On the transition day, the clock moved from `01:30` to `03:30` in 3,600 elapsed seconds.

## 3. Overnight support window in Los Angeles

**Rule.** An overnight support queue accepts tickets from 22:00 local through the following 02:00, with the closing time excluded. Tickets are assigned to the local date on which the window opened.

```sh
python time-zone-replay/scripts/replay.py window America/Los_Angeles 2026-11-26T09:59:00Z 22:00 02:00
python time-zone-replay/scripts/replay.py window America/Los_Angeles 2026-11-26T10:00:00Z 22:00 02:00
```

| Input UTC | Los Angeles local time | Expected |
| --- | --- | --- |
| `2026-11-26T05:59:59Z` | Nov 25 at 21:59:59 | Closed |
| `2026-11-26T06:00:00Z` | Nov 25 at 22:00:00 | Open for Nov 25 |
| `2026-11-26T08:00:00Z` | Nov 26 at 00:00:00 | Open for Nov 25 |
| `2026-11-26T09:59:00Z` | Nov 26 at 01:59:00 | Open for Nov 25 |
| `2026-11-26T10:00:00Z` | Nov 26 at 02:00:00 | Closed |

## 4. A half-hour clock change in Australia

**Rule.** When users select a repeated local time to schedule an export, show both occurrences with their offsets.

```sh
python time-zone-replay/scripts/replay.py resolve Australia/Lord_Howe 2026-04-05T01:45
```

The `01:45` options are `+11:00` and `+10:30`. They map to `2026-04-04T14:45:00Z` and `2026-04-04T15:15:00Z`. Expect two choices 30 minutes apart. The UTC date is April 4 for both.
