# Time Zone Replay

Turn time-sensitive product rules into reproducible test cases. Check repeated local times, skipped times, and windows that cross midnight before they become production bugs.

In New York on November 1, 2026, two bookings labeled **01:30** can start an hour apart. The first starts at **05:30 UTC**. The second starts at **06:30 UTC**. A cancellation cutoff based on minutes before the start can give different results for the two bookings.

## Install

Copy the whole `time-zone-replay` folder to the project's skills directory and open the agent from that project.

| Agent | Destination | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/time-zone-replay/` | `$time-zone-replay` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/time-zone-replay/` | `/time-zone-replay` |

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the folder with `time-zone-replay/SKILL.md` inside it. Upload the ZIP under **Customize → Skills** with code execution enabled.

The helper needs Python 3.9 or later. It uses the system IANA time-zone database or the `tzdata` package. If your Python environment has no time-zone database, install the fallback with `python -m pip install tzdata`. [Python zoneinfo documentation](https://docs.python.org/3/library/zoneinfo.html)

## Try it

In Codex, enter `$time-zone-replay Replay the bundled New York cancellation example and prepare test cases for the cutoff.` In Claude Code, use the same request after `/time-zone-replay`.

To reproduce the two 01:30 occurrences directly, run this from the repository root.

```sh
python time-zone-replay/scripts/replay.py resolve America/New_York 2026-11-01T01:30
```

The script prints JSON. Its three commands cover the following cases.

| Command | Input | Result |
| --- | --- | --- |
| `resolve ZONE LOCAL` | An IANA zone and an ISO local date-time without an offset | A unique time, two occurrences, or a nonexistent time |
| `elapsed START END` | Two ISO date-times with explicit offsets or `Z` | The signed seconds from START to END on the UTC timeline |
| `window ZONE INSTANT OPEN CLOSE` | An IANA zone, an ISO instant with an offset or `Z`, and two local `HH:MM` values | Whether the instant falls in the daily window and the local date on which that window opened |

Use `YYYY-MM-DDTHH:MM` for date-times. Seconds and up to six fractional digits are optional. `window` includes its opening and excludes its closing. When the closing time is earlier than the opening, the window runs into the next local date. Equal opening and closing times require a separate product rule. During a repeated hour, each instant is checked by its local clock reading. A schedule that binds to one specific opening or closing instant needs its own rule for choosing the occurrence.

The [worked examples](assets/examples.md) cover a repeated hour in New York, a skipped reminder time, an overnight support window, and a half-hour offset change in Australia. For your own cases, give the skill the exact rule, the governing IANA zone, and the date or event timestamps. Include how the product handles missing or repeated times if it is already defined.

Run the checks with `python -m unittest discover -s time-zone-replay/tests -v`.

[MIT License](LICENSE)
