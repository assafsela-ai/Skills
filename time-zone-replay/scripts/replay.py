"""Replay local times, elapsed durations, and daily windows as JSON."""

import argparse
import json
import re
import sys
from datetime import datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


LOCAL_PATTERN = r"[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(?::[0-9]{2}(?:\.[0-9]{1,6})?)?"
INSTANT_PATTERN = LOCAL_PATTERN + r"(?:Z|[+-](?:[01][0-9]|2[0-3]):[0-5][0-9])"


def parse_datetime(value, pattern, description):
    if not re.fullmatch(pattern, value):
        raise ValueError(f"{description} must be an ISO date-time: {value}")
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)


def parse_instant(value):
    description = "an instant with an explicit UTC offset or Z"
    return parse_datetime(value, INSTANT_PATTERN, description).astimezone(timezone.utc)


def parse_clock(value):
    if not re.fullmatch(r"[0-9]{2}:[0-9]{2}", value):
        raise ValueError(f"a window boundary must use HH:MM: {value}")
    return time.fromisoformat(value)


def utc_text(instant):
    return instant.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def resolve(zone_name, wall_time):
    zone = ZoneInfo(zone_name)
    local = parse_datetime(wall_time, LOCAL_PATTERN, "local time without an offset")
    candidates = {}
    for fold in (0, 1):
        utc = local.replace(tzinfo=zone, fold=fold).astimezone(timezone.utc)
        # Round-tripping discards local clock values skipped by an offset change.
        actual = utc.astimezone(zone)
        if actual.replace(tzinfo=None) == local:
            candidates[utc] = {
                "utc": utc_text(utc),
                "local": actual.isoformat(),
                "fold": actual.fold,
            }
    status = ("nonexistent", "unique", "ambiguous")[len(candidates)]
    return {
        "zone": zone_name,
        "local": local.isoformat(),
        "status": status,
        "candidates": [candidates[utc] for utc in sorted(candidates)],
    }


def elapsed(start_value, end_value):
    start = parse_instant(start_value)
    end = parse_instant(end_value)
    return {
        "start_utc": utc_text(start),
        "end_utc": utc_text(end),
        "elapsed_seconds": (end - start).total_seconds(),
    }


def window(zone_name, instant_value, opens, closes):
    zone = ZoneInfo(zone_name)
    instant = parse_instant(instant_value)
    opening, closing = parse_clock(opens), parse_clock(closes)
    if opening == closing:
        raise ValueError("equal opening and closing times need an explicit product rule")

    local = instant.astimezone(zone)
    clock = local.time()
    overnight = opening > closing
    if overnight:
        inside = clock >= opening or clock < closing
    else:
        inside = opening <= clock < closing

    service_date = None
    if inside:
        service_date = local.date()
        if overnight and clock < closing:
            service_date -= timedelta(days=1)

    return {
        "zone": zone_name,
        "utc": utc_text(instant),
        "local": local.isoformat(),
        "inside": inside,
        "service_date": service_date.isoformat() if service_date else None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    resolve_command = commands.add_parser("resolve", help="Find UTC candidates for a local time")
    resolve_command.add_argument("zone")
    resolve_command.add_argument("local")
    elapsed_command = commands.add_parser("elapsed", help="Measure the time between two instants")
    elapsed_command.add_argument("start")
    elapsed_command.add_argument("end")
    window_command = commands.add_parser("window", help="Check a daily wall-clock window")
    window_command.add_argument("zone")
    window_command.add_argument("instant")
    window_command.add_argument("opens")
    window_command.add_argument("closes")
    args = parser.parse_args()

    try:
        if args.command == "resolve":
            result = resolve(args.zone, args.local)
        elif args.command == "elapsed":
            result = elapsed(args.start, args.end)
        else:
            result = window(args.zone, args.instant, args.opens, args.closes)
    except ZoneInfoNotFoundError:
        print(f"Unknown IANA zone or missing time-zone data: {args.zone}. "
              "Check the name or install tzdata with python -m pip install tzdata.", file=sys.stderr)
        return 1
    except (ValueError, OverflowError) as error:
        print(f"{args.command}: {error}", file=sys.stderr)
        return 1

    print(json.dumps(result, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
