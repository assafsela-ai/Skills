---
name: time-zone-replay
description: Turn business rules about local time, deadlines, and schedules into reproducible test cases. Use to replay daylight saving gaps, repeated times, overnight windows, and elapsed-time cutoffs with IANA time zones.
---

# Time Zone Replay

Use [the replay script](scripts/replay.py) to check the timestamps in test cases. Resolve the script path from this skill directory. See [the worked examples](assets/examples.md) for sample rules and expected outcomes.

1. Read the rule and identify whose time zone governs it. Use a named IANA zone such as `America/New_York` and a full date. Ask for the governing zone if the rule only says “local time” or uses an ambiguous abbreviation.
2. Identify what the rule measures. A wall-clock cutoff, such as 09:00 local, follows the named zone. An elapsed duration, such as 24 hours from booking, follows the UTC timeline. A calendar-day rule uses local dates and the stated day-count convention. Confirm any boundary, date convention, or missing-time policy that can change the answer.
3. Build a small matrix. Include a normal case and cases just before, exactly at, and just after each cutoff. Add the relevant transition, date change, or disagreement between customer and service zones. Use the smallest difference that exposes the bug.
4. Check the instants with the script. For a local time that occurs twice, give both UTC values and offsets. For a local time that does not occur, show the gap. If the product rule does not say which occurrence to choose or how to handle a gap, mark the expected behavior as unresolved.
5. For each case, report the local date and time, governing zone, UTC instant or candidates, expected product behavior, and the rule that supports it. If offsets depend on an assumed or different time-zone database, record that dependency with the result.

```sh
python "<skill-directory>/scripts/replay.py" resolve America/New_York 2026-11-01T01:30
python "<skill-directory>/scripts/replay.py" elapsed 2026-03-08T01:30:00-05:00 2026-03-08T03:30:00-04:00
python "<skill-directory>/scripts/replay.py" window America/Los_Angeles 2026-11-26T09:59:00Z 22:00 02:00
```

The `window` command uses a daily window with an inclusive opening and exclusive closing. For other business policies, use the verified timestamps and apply the stated rule. If Python cannot load time-zone data, report the missing dependency and provide the command from the README. Keep calculated results distinct from proposed expectations.
