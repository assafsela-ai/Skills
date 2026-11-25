import codecs
import csv
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]


class ExportCsvTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.draft = Path(directory.name)
        self.source = self.draft / "source.md"
        self.backlog = self.draft / "backlog.json"
        self.output = self.draft / "backlog.csv"
        shutil.copyfile(SKILL / "assets" / "example-spec.md", self.source)
        shutil.copyfile(SKILL / "assets" / "example-backlog.json", self.backlog)
        self.data = json.loads(self.backlog.read_text(encoding="utf-8"))

    def save_draft(self):
        self.backlog.write_text(json.dumps(self.data, ensure_ascii=False), encoding="utf-8")

    def run_exporter(self):
        return subprocess.run(
            [sys.executable, str(SKILL / "scripts" / "export_csv.py"), str(self.draft)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )

    def read_export(self):
        with self.output.open(encoding="utf-8-sig", newline="") as stream:
            return list(csv.DictReader(stream))

    def assert_export_error(self, message):
        previous_csv = b"keep the previous CSV"
        self.output.write_bytes(previous_csv)
        result = self.run_exporter()
        self.assertEqual(result.returncode, 1)
        self.assertIn(message, result.stderr)
        self.assertEqual(self.output.read_bytes(), previous_csv)

    def test_exports_sample_and_saved_edits(self):
        result = self.run_exporter()
        self.assertEqual(result.returncode, 0, result.stderr)
        original = self.read_export()
        self.assertEqual([row["ID"] for row in original], ["US-001", "US-002", "US-003"])
        self.assertIn("source.md:7-9", original[0]["Source"])
        self.assertIn("reminder", self.data["open_questions"][0])

        self.data["stories"][0]["title"] = "Search for a room"
        self.data["stories"][1]["acceptance_criteria"][0] = (
            "From the results, the employee can reserve an available room."
        )
        self.save_draft()
        result = self.run_exporter()
        self.assertEqual(result.returncode, 0, result.stderr)
        updated = self.read_export()
        self.assertEqual([row["ID"] for row in updated], [row["ID"] for row in original])
        self.assertEqual(updated[0]["Title"], "Search for a room")
        self.assertIn("From the results", updated[1]["Acceptance Criteria"])

    def test_preserves_hebrew_quotes_commas_and_line_breaks(self):
        self.source.write_text('הזמנה לחדר "צפון", ביום ראשון.\nטקסט נוסף.\n', encoding="utf-8")
        first_story = self.data["stories"][0]
        first_story["title"] = 'הזמנת חדר "צפון", ביום ראשון'
        first_story["acceptance_criteria"] = ["בחר חדר.", 'הצג "אישור", עם תאריך.\nהצג גם שעה.']
        first_story["sources"] = [
            {
                "start_line": 1,
                "end_line": 2,
                "quote": 'הזמנה לחדר "צפון", ביום ראשון.\nטקסט נוסף.',
            }
        ]
        self.data["stories"] = [first_story]
        self.save_draft()

        result = self.run_exporter()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(self.output.read_bytes().startswith(codecs.BOM_UTF8))
        row = self.read_export()[0]
        self.assertEqual(row["Title"], first_story["title"])
        self.assertEqual(row["Acceptance Criteria"], "\n".join(first_story["acceptance_criteria"]))
        self.assertIn(first_story["sources"][0]["quote"], row["Source"])

    def test_escapes_formula_like_values(self):
        self.data["stories"][0]["title"] = " =1+1"
        self.save_draft()
        result = self.run_exporter()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.read_export()[0]["Title"], "' =1+1")

    def test_rejects_broken_json(self):
        self.backlog.write_text("{", encoding="utf-8")
        self.assert_export_error("backlog.json:")

    def test_rejects_duplicate_ids(self):
        self.data["stories"][1]["id"] = self.data["stories"][0]["id"]
        self.save_draft()
        self.assert_export_error("duplicate story ID: US-001")

    def test_rejects_a_quote_outside_its_cited_lines(self):
        self.data["stories"][0]["sources"][0]["quote"] = "An employee can reserve a room"
        self.save_draft()
        self.assert_export_error("does not match source.md lines 7-9")

    def test_rejects_an_invalid_source_line_number(self):
        self.data["stories"][0]["sources"][0]["start_line"] = 0
        self.save_draft()
        self.assert_export_error("line range outside source.md")

    def test_rejects_the_position_after_the_last_source_line(self):
        line_count = len(self.source.read_text(encoding="utf-8").splitlines())
        self.data["stories"][0]["sources"][0]["end_line"] = line_count + 1
        self.save_draft()
        self.assert_export_error("line range outside source.md")

    def test_rejects_a_story_without_criteria(self):
        self.data["stories"][0]["acceptance_criteria"] = []
        self.save_draft()
        self.assert_export_error("US-001.acceptance_criteria must be a non-empty list")


if __name__ == "__main__":
    unittest.main()
