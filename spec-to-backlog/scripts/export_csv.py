"""Validate a saved backlog and write an Excel-friendly CSV."""

import argparse
import csv
import json
import re
import sys
import tempfile
from pathlib import Path


HEADER = ("ID", "Title", "User Story", "Acceptance Criteria", "Source")
STORY_ID = re.compile(r"US-[0-9]{3,}")


def object_at(value, location):
    if not isinstance(value, dict):
        raise ValueError(f"{location} must be an object")
    return value


def text_at(value, location):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{location} must be non-empty text")
    return value


def list_at(value, location, *, required_items=False):
    if not isinstance(value, list) or (required_items and not value):
        description = "a non-empty list" if required_items else "a list"
        raise ValueError(f"{location} must be {description}")
    return value


def source_label(value, source_lines, location):
    reference = object_at(value, location)
    start = reference.get("start_line")
    end = reference.get("end_line")
    if type(start) is not int or type(end) is not int:
        raise ValueError(f"{location} must use integers for start_line and end_line")
    if not 1 <= start <= end <= len(source_lines):
        raise ValueError(f"{location} has a line range outside source.md")

    quote = text_at(reference.get("quote"), f"{location}.quote")
    cited_text = "\n".join(source_lines[start - 1 : end])
    if quote not in cited_text:
        raise ValueError(f"{location}.quote does not match source.md lines {start}-{end}")

    line_range = str(start) if start == end else f"{start}-{end}"
    return f"source.md:{line_range} — {quote}"


def validate_backlog(value, source_lines):
    backlog = object_at(value, "backlog")
    questions = list_at(backlog.get("open_questions"), "open_questions")
    for index, question in enumerate(questions, start=1):
        text_at(question, f"open_questions item {index}")

    stories = list_at(backlog.get("stories"), "stories")
    seen_ids = set()
    rows = []
    for index, item in enumerate(stories, start=1):
        location = f"stories item {index}"
        story = object_at(item, location)
        story_id = text_at(story.get("id"), f"{location}.id")
        if not STORY_ID.fullmatch(story_id):
            raise ValueError(f"{location}.id must use the format US-001")
        if story_id in seen_ids:
            raise ValueError(f"duplicate story ID: {story_id}")
        seen_ids.add(story_id)

        title = text_at(story.get("title"), f"{story_id}.title")
        description = text_at(story.get("story"), f"{story_id}.story")
        criteria_location = f"{story_id}.acceptance_criteria"
        criteria = list_at(story.get("acceptance_criteria"), criteria_location, required_items=True)
        criteria_text = "\n".join(
            text_at(criterion, f"{criteria_location} item {number}")
            for number, criterion in enumerate(criteria, start=1)
        )
        sources_location = f"{story_id}.sources"
        sources = list_at(story.get("sources"), sources_location, required_items=True)
        sources_text = "\n\n".join(
            source_label(source, source_lines, f"{sources_location} item {number}")
            for number, source in enumerate(sources, start=1)
        )
        rows.append((story_id, title, description, criteria_text, sources_text))

    return rows


def spreadsheet_text(value):
    # Treat formula-like input as text when a spreadsheet opens the CSV.
    trimmed = value.lstrip()
    formula_prefixes = ("=", "+", "-", "@", "＝", "＋", "－", "＠")
    if trimmed.startswith(formula_prefixes) or value.startswith(("\t", "\r", "\n")):
        return "'" + value
    return value


def write_csv(destination, rows):
    # Write beside the destination so the final rename is atomic.
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8-sig", newline="", dir=destination.parent, delete=False
        ) as stream:
            temporary_path = Path(stream.name)
            writer = csv.writer(stream)
            writer.writerow(HEADER)
            writer.writerows(tuple(spreadsheet_text(cell) for cell in row) for row in rows)
        temporary_path.replace(destination)
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("draft_folder", type=Path, help="Folder with source.md and backlog.json")
    args = parser.parse_args()
    draft_folder = args.draft_folder
    destination = draft_folder / "backlog.csv"

    try:
        with (draft_folder / "source.md").open(encoding="utf-8-sig") as source:
            source_lines = [line.rstrip("\n") for line in source]
        try:
            backlog = json.loads((draft_folder / "backlog.json").read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError as error:
            raise ValueError(f"backlog.json: {error}") from error
        rows = validate_backlog(backlog, source_lines)
        write_csv(destination, rows)
    except (OSError, ValueError) as error:
        print(f"Export failed: {error}", file=sys.stderr)
        return 1

    print(f"Exported {len(rows)} stories to {destination.resolve()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
