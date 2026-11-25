"""Compare recorded agent writes against an expected set of writes."""

import argparse
from collections import Counter
import json
from pathlib import Path
import sys


DEMO = Path(__file__).resolve().parents[1] / "assets"
EFFECT_FIELDS = {"operation", "resource", "record_id", "before", "after"}
SNAPSHOTS = {
    "create": (type(None), dict),
    "update": (dict, dict),
    "delete": (dict, type(None)),
}


def encode(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=True, allow_nan=False)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def read_json(path):
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"), object_pairs_hook=unique_object)
    except (OSError, ValueError) as error:
        raise ValueError(f"{path}: {error}") from error


def require_object(value, fields, location):
    if not isinstance(value, dict) or value.keys() != fields:
        raise ValueError(f"{location} must have these fields: {', '.join(sorted(fields))}")


def require_text(value, location):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{location} must be non-empty text")


def effect_counter(values, location):
    if not isinstance(values, list):
        raise ValueError(f"{location} must be a list")

    counts = Counter()
    for index, effect in enumerate(values):
        entry = f"{location}[{index}]"
        require_object(effect, EFFECT_FIELDS, entry)
        operation = effect["operation"]
        require_text(operation, f"{entry}.operation")
        if operation not in SNAPSHOTS:
            raise ValueError(f"{entry}.operation must be create, update, or delete")
        require_text(effect["resource"], f"{entry}.resource")
        require_text(effect["record_id"], f"{entry}.record_id")
        before, after = effect["before"], effect["after"]
        if (type(before), type(after)) != SNAPSHOTS[operation]:
            raise ValueError(f"{entry} has invalid before/after values for {operation}")
        try:
            if operation == "update":
                if before.keys() != after.keys() or not before:
                    raise ValueError("an update needs the same changed fields in before and after")
                if any(encode(before[key]) == encode(after[key]) for key in before):
                    raise ValueError("include only fields that changed in an update")
            counts[encode(effect)] += 1
        except ValueError as error:
            raise ValueError(f"{entry}: {error}") from error
    return counts


def read_expected(path):
    value = read_json(path)
    require_object(value, {"request", "effects"}, str(path))
    require_text(value["request"], f"{path}: request")
    return value["request"], effect_counter(value["effects"], f"{path}: effects")


def read_run(path):
    value = read_json(path)
    require_object(value, {"label", "reply", "effects"}, str(path))
    require_text(value["label"], f"{path}: label")
    if not isinstance(value["reply"], str):
        raise ValueError(f"{path}: reply must be text")
    value["effects"] = effect_counter(value["effects"], f"{path}: effects")
    return value


def entries(counts):
    return [
        {"count": count, "effect": json.loads(key)}
        for key, count in sorted(counts.items())
    ]


def against_expected(run, expected):
    observed = run["effects"]
    return {
        "label": run["label"],
        "reply": run["reply"],
        "matches_expected": observed == expected,
        "missing": entries(expected - observed),
        "unexpected": entries(observed - expected),
    }


def compare(request, expected, baseline, candidate):
    earlier = baseline["effects"]
    later = candidate["effects"]
    return {
        "request": request,
        "replies_equal": baseline["reply"] == candidate["reply"],
        "baseline": against_expected(baseline, expected),
        "candidate": against_expected(candidate, expected),
        "shared": entries(earlier & later),
        "baseline_only": entries(earlier - later),
        "candidate_only": entries(later - earlier),
    }


def show_effects(title, records):
    print(f"{title} ({sum(record['count'] for record in records)})")
    for record in records:
        item = record["effect"]
        print(
            f"  {record['count']}x {item['operation']} "
            f"{item['resource']}/{item['record_id']} | "
            f"{encode(item['before'])} -> {encode(item['after'])}"
        )


def show_report(report):
    print(f"Request: {report['request']}")
    baseline, candidate = report["baseline"], report["candidate"]
    if report["replies_equal"]:
        print(f"Same reply in both runs: {encode(baseline['reply'])}")
    else:
        print(f"Baseline reply: {encode(baseline['reply'])}")
        print(f"Candidate reply: {encode(candidate['reply'])}")

    for role, run in (("Baseline", baseline), ("Candidate", candidate)):
        verdict = "MATCH" if run["matches_expected"] else "MISMATCH"
        print(f"\n{role} ({run['label']}): {verdict}")
        show_effects("Missing effects", run["missing"])
        show_effects("Unexpected effects", run["unexpected"])

    print("\nEffect diff")
    show_effects("Shared", report["shared"])
    show_effects("Baseline only", report["baseline_only"])
    show_effects("Candidate only", report["candidate_only"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    demo = commands.add_parser("demo", help="Compare two bundled synthetic runs")
    custom = commands.add_parser("compare", help="Compare three local JSON files")
    for command in (demo, custom):
        command.add_argument("--format", choices=("text", "json"), default="text")
    custom.add_argument("--expected", type=Path, required=True)
    custom.add_argument("--baseline", type=Path, required=True)
    custom.add_argument("--candidate", type=Path, required=True)
    args = parser.parse_args()

    if args.command == "demo":
        args.expected = DEMO / "expected.json"
        args.baseline = DEMO / "baseline.json"
        args.candidate = DEMO / "candidate.json"

    try:
        request, expected = read_expected(args.expected)
        report = compare(request, expected, read_run(args.baseline), read_run(args.candidate))
    except ValueError as error:
        print(f"Comparison failed: {error}", file=sys.stderr)
        return 2

    if args.format == "json":
        print(json.dumps(report, indent=2))
    else:
        show_report(report)

    # The demo succeeds when it runs. Custom comparisons can serve as a test.
    return int(args.command == "compare" and not report["candidate"]["matches_expected"])


if __name__ == "__main__":
    sys.exit(main())
