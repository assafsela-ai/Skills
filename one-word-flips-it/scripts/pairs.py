"""Validate and export paired policy decisions as JSONL."""

import argparse
import json
import sys
import tempfile
from collections import Counter
from pathlib import Path


def field(record, key, expected_type, location):
    if not isinstance(record, dict):
        raise ValueError(f"{location} must be an object")
    value = record.get(key)
    if not isinstance(value, expected_type) or (expected_type is str and not value.strip()):
        description = "non-empty text" if expected_type is str else "an object"
        raise ValueError(f"{location}.{key} must be {description}")
    return value


def changes_one_span(input_a, input_b, span_a, span_b):
    start = input_a.find(span_a)
    while start != -1:
        if input_a[:start] + span_b + input_a[start + len(span_a):] == input_b:
            return True
        start = input_a.find(span_a, start + 1)
    return False


def validate(pairs, policy, count):
    if not isinstance(pairs, list) or not pairs:
        raise ValueError("expected a non-empty list of pairs")
    if count is not None and len(pairs) != count:
        raise ValueError(f"expected {count} pairs, found {len(pairs)}")

    ids = set()
    input_pairs = set()
    rules = {}
    rule_counts = Counter()
    for index, pair in enumerate(pairs, start=1):
        row = f"pair {index}"
        pair_id = field(pair, "id", str, row)
        location = f"{row} ({pair_id})"
        if pair_id in ids:
            raise ValueError(f"{location} has a duplicate ID")
        ids.add(pair_id)

        rule = field(pair, "rule", dict, location)
        rule_id = field(rule, "id", str, f"{location}.rule")
        excerpt = field(rule, "excerpt", str, f"{location}.rule")
        if excerpt not in policy:
            raise ValueError(f"{location} rule excerpt was not found in the policy")
        if rules.setdefault(rule_id, excerpt) != excerpt:
            raise ValueError(f"{location} uses a different excerpt for rule {rule_id}")
        rule_counts[rule_id] += 1

        change = field(pair, "change", dict, location)
        span_a = field(change, "a", str, f"{location}.change")
        span_b = field(change, "b", str, f"{location}.change")
        a = field(pair, "a", dict, location)
        b = field(pair, "b", dict, location)
        input_a = field(a, "input", str, f"{location}.a")
        input_b = field(b, "input", str, f"{location}.b")
        expected_a = field(a, "expected", str, f"{location}.a")
        expected_b = field(b, "expected", str, f"{location}.b")
        if {expected_a, expected_b} != {"ALLOW", "DENY"}:
            raise ValueError(f"{location} must have opposite ALLOW and DENY labels")
        if span_a == span_b or not changes_one_span(input_a, input_b, span_a, span_b):
            raise ValueError(f"{location} inputs must differ by the declared replacement only")
        signature = frozenset((input_a, input_b))
        if signature in input_pairs:
            raise ValueError(f"{location} repeats an input pair")
        input_pairs.add(signature)

    return rule_counts


def read_jsonl(path):
    pairs = []
    with path.open(encoding="utf-8") as stream:
        for number, line in enumerate(stream, start=1):
            try:
                pairs.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise ValueError(f"{path.name} line {number}: {error.msg}") from error
    return pairs


def write_jsonl(path, pairs):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", dir=path.parent, encoding="utf-8", newline="\n", delete=False
        ) as stream:
            temporary = Path(stream.name)
            for pair in pairs:
                stream.write(json.dumps(pair, ensure_ascii=False, allow_nan=False) + "\n")
        temporary.replace(path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    check = commands.add_parser("validate", help="Check a JSONL file")
    check.add_argument("input", type=Path)
    export = commands.add_parser("export", help="Check a JSON array and write JSONL")
    export.add_argument("input", type=Path)
    export.add_argument("output", type=Path)
    for command in (check, export):
        command.add_argument("--policy", type=Path, required=True)
        command.add_argument("--count", type=int, help="Expected number of pairs")
    args = parser.parse_args()

    try:
        policy = args.policy.read_text(encoding="utf-8-sig")
        if args.command == "validate":
            pairs = read_jsonl(args.input)
        else:
            pairs = json.loads(args.input.read_text(encoding="utf-8-sig"))
            if args.output.resolve() in {args.input.resolve(), args.policy.resolve()}:
                raise ValueError("the output path must differ from the draft and policy paths")

        counts = validate(pairs, policy, args.count)
        if args.command == "export":
            write_jsonl(args.output, pairs)
    except (OSError, ValueError) as error:
        print(f"{args.command}: {error}", file=sys.stderr)
        return 1

    breakdown = ", ".join(f"{rule}: {count}" for rule, count in sorted(counts.items()))
    print(f"{len(pairs)} valid pairs across {len(counts)} rules ({breakdown})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
