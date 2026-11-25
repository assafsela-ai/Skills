"""Compare returned fields with the answer key for an invoice test run."""

import argparse
import csv
import sys
from dataclasses import dataclass
from decimal import Decimal
from html import escape
from pathlib import Path

from lab_format import VARIANTS, decimal_amount, object_at, read_fields, read_json


LABELS = {"correct": "Correct", "wrong": "Wrong", "missing": "Missing", "not_run": "Not run"}


@dataclass
class FieldResult:
    variant: str
    field: str
    expected: str
    extracted: object
    status: str
    regressed: bool
    matches_expected_fields: tuple


def read_results(path, fields):
    data = object_at(read_json(path), "Results")
    source = data.get("source")
    if source not in ("measured", "simulated"):
        raise ValueError("Results source must be 'measured' or 'simulated'")
    variants = object_at(data.get("variants"), "Results variants")
    for variant, result in variants.items():
        if variant not in VARIANTS:
            raise ValueError(f"Unknown variant ID: {variant}")
        if result is None:
            continue
        result = object_at(result, f"Results for {variant}")
        for field, value in result.items():
            if field not in fields:
                raise ValueError(f"Unknown field ID in {variant}: {field}")
            if value is not None and not isinstance(value, (str, int, Decimal, bool)):
                raise ValueError(f"Result for {variant}.{field} must be a scalar value or null")
    return source, variants


def field_status(result, field_id, field):
    if result is None:
        return "not_run"
    value = result.get(field_id)
    if value is None or (isinstance(value, str) and not value.strip()):
        return "missing"
    if field["type"] == "amount":
        equal = decimal_amount(value) == decimal_amount(field["expected"])
    else:
        equal = isinstance(value, str) and value.strip() == field["expected"].strip()
    return "correct" if equal else "wrong"


def compare(fields, variants):
    baseline = {
        field_id: field_status(variants.get("clean"), field_id, field)
        for field_id, field in fields.items()
    }
    rows = []
    for variant in VARIANTS:
        result = variants.get(variant)
        for field_id, field in fields.items():
            status = field_status(result, field_id, field)
            extracted = result.get(field_id) if result is not None else None
            regressed = variant != "clean" and baseline[field_id] == "correct" and status in ("wrong", "missing")
            matches = ()
            if status == "wrong" and field["type"] == "amount":
                amount = decimal_amount(extracted)
                matches = tuple(
                    other_id for other_id, other in fields.items()
                    if other_id != field_id and other["type"] == "amount"
                    and decimal_amount(other["expected"]) == amount
                )
            rows.append(FieldResult(variant, field_id, field["expected"], extracted, status, regressed, matches))
    return rows


def display_value(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return str(value).lower()
    return str(value)


def markdown_value(value):
    value = display_value(value).replace("\r\n", "\n").replace("\r", "\n")
    return escape(value).replace("\\", "\\\\").replace("|", "\\|").replace("\n", "<br>")


def write_markdown(path, source, rows):
    source_note = (
        "Simulated results. The values illustrate a failure scenario."
        if source == "simulated" else "Measured results imported from the system under test."
    )
    lines = ["# Document Failure Lab", "", source_note, "", "## Regressions from the clean image", ""]
    regressions = [row for row in rows if row.regressed]
    if regressions:
        for row in regressions:
            actual = "missing" if row.status == "missing" else markdown_value(row.extracted)
            detail = (
                f"- **{row.variant} / {row.field}** expected {markdown_value(row.expected)}, got {actual}."
            )
            if row.matches_expected_fields:
                detail += " Matches the expected value of " + ", ".join(row.matches_expected_fields) + "."
            lines.append(detail)
    else:
        lines.append("No regressions were identified among fields with a correct clean result.")

    lines.extend(["", "## Clean image", ""])
    clean = [row for row in rows if row.variant == "clean"]
    if all(row.status == "not_run" for row in clean):
        lines.append("The clean image was not tested. A baseline comparison is unavailable.")
    else:
        errors = [row for row in clean if row.status in ("wrong", "missing")]
        if errors:
            lines.extend(f"- **{row.field}** — {LABELS[row.status]} on the clean image." for row in errors)
        else:
            lines.append("All expected fields matched the clean result.")

    lines.extend([
        "", "## Results by field", "",
        "| Variant | Field | Expected | Extracted | Status | Regression | Matches expected field |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ])
    for row in rows:
        cells = (
            row.variant, row.field, markdown_value(row.expected), markdown_value(row.extracted),
            LABELS[row.status], "Yes" if row.regressed else "", ", ".join(row.matches_expected_fields),
        )
        lines.append("| " + " | ".join(cells) + " |")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def spreadsheet_value(value):
    text = display_value(value)
    if text.lstrip().startswith(("=", "+", "-", "@", "＝", "＋", "－", "＠")) or text.startswith(("\t", "\n", "\r")):
        return "'" + text
    return text


def write_csv(path, source, rows):
    with path.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow((
            "source", "variant", "field", "expected", "extracted", "status",
            "regressed_from_clean", "matches_expected_fields",
        ))
        for row in rows:
            writer.writerow((
                source, row.variant, row.field, spreadsheet_value(row.expected), spreadsheet_value(row.extracted),
                row.status, "yes" if row.regressed else "no", ", ".join(row.matches_expected_fields),
            ))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run", type=Path, help="Generated folder containing manifest.json")
    parser.add_argument("results", type=Path, help="Filled-in results JSON")
    args = parser.parse_args()

    try:
        manifest = object_at(read_json(args.run / "manifest.json"), "Manifest")
        fields = read_fields(manifest.get("fields"))
        source, variants = read_results(args.results, fields)
        rows = compare(fields, variants)
        write_markdown(args.run / "report.md", source, rows)
        write_csv(args.run / "report.csv", source, rows)
    except (OSError, ValueError) as error:
        print(f"Comparison failed: {error}", file=sys.stderr)
        return 1

    print(f"Wrote {args.run / 'report.md'} and {args.run / 'report.csv'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
