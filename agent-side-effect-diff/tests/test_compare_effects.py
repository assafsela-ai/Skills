import copy
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SKILL = Path(__file__).resolve().parents[1]
SCRIPT = SKILL / "scripts" / "compare_effects.py"


class ComparisonTest(unittest.TestCase):
    def setUp(self):
        workspace = tempfile.TemporaryDirectory()
        self.addCleanup(workspace.cleanup)
        self.folder = Path(workspace.name)
        self.expected, self.baseline, self.candidate = [
            json.loads((SKILL / "assets" / f"{name}.json").read_text(encoding="utf-8"))
            for name in ("expected", "baseline", "candidate")
        ]

    def run_script(self, *arguments):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *arguments],
            cwd=self.folder,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

    def run_custom(self):
        arguments = ["compare", "--format", "json"]
        for name, data in (
            ("expected", self.expected),
            ("baseline", self.baseline),
            ("candidate", self.candidate),
        ):
            path = self.folder / f"{name}.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            arguments.extend((f"--{name}", str(path)))
        return self.run_script(*arguments)

    def test_demo_reveals_unexpected_write_despite_identical_reply(self):
        result = self.run_script("demo", "--format", "json")
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertTrue(report["replies_equal"])
        self.assertTrue(report["baseline"]["matches_expected"])
        self.assertFalse(report["candidate"]["matches_expected"])
        unexpected = report["candidate"]["unexpected"]
        self.assertEqual(len(unexpected), 1)
        self.assertEqual(unexpected[0]["effect"]["record_id"], "ORD-2079")
        self.assertEqual(report["candidate_only"], unexpected)

    def test_detects_the_same_unexpected_write_in_both_runs(self):
        self.baseline["effects"] = copy.deepcopy(self.candidate["effects"])
        result = self.run_custom()
        self.assertEqual(result.returncode, 1, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["candidate_only"], [])
        self.assertEqual(report["baseline"]["unexpected"], report["candidate"]["unexpected"])
        self.assertEqual(len(report["candidate"]["unexpected"]), 1)

    def test_keeps_duplicate_writes_and_reports_missing_writes(self):
        first = self.baseline["effects"][0]
        second = self.candidate["effects"][1]
        self.expected["effects"] = [first, second]
        self.candidate["effects"] = [first, first, first]
        result = self.run_custom()
        self.assertEqual(result.returncode, 1, result.stderr)
        candidate = json.loads(result.stdout)["candidate"]
        self.assertEqual(candidate["unexpected"], [{"count": 2, "effect": first}])
        self.assertEqual(candidate["missing"], [{"count": 1, "effect": second}])

    def test_compares_creates_and_deletes_independently_of_key_and_effect_order(self):
        create = {
            "operation": "create", "resource": "notes", "record_id": "N-1",
            "before": None, "after": {"title": "New", "visible": False},
        }
        delete = {
            "operation": "delete", "resource": "notes", "record_id": "N-2",
            "before": {"title": "Old"}, "after": None,
        }
        self.expected["effects"] = [create, delete]
        self.candidate["effects"] = [
            delete,
            {**create, "after": {"visible": False, "title": "New"}},
        ]
        self.candidate["reply"] = "Done."
        result = self.run_custom()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertFalse(report["replies_equal"])
        self.assertTrue(report["candidate"]["matches_expected"])
        self.assertFalse(report["baseline"]["matches_expected"])

    def test_distinguishes_a_numeric_value_from_a_boolean(self):
        expected = self.expected["effects"][0]
        expected["after"]["delivery_note"] = True
        observed = copy.deepcopy(expected)
        observed["after"]["delivery_note"] = 1
        self.candidate["effects"] = [observed]
        result = self.run_custom()
        self.assertEqual(result.returncode, 1, result.stderr)
        candidate = json.loads(result.stdout)["candidate"]
        self.assertEqual(candidate["missing"], [{"count": 1, "effect": expected}])
        self.assertEqual(candidate["unexpected"], [{"count": 1, "effect": observed}])

    def test_rejects_incomplete_update_snapshots(self):
        self.candidate["effects"][0]["after"] = {"unrelated_field": "new"}
        result = self.run_custom()
        self.assertEqual(result.returncode, 2)
        self.assertIn("same changed fields", result.stderr)
        self.assertEqual(result.stdout, "")

    def test_accepts_empty_effect_lists(self):
        for document in (self.expected, self.baseline, self.candidate):
            document["effects"] = []
        result = self.run_custom()
        self.assertEqual(result.returncode, 0, result.stderr)
        report = json.loads(result.stdout)
        self.assertEqual(report["shared"], [])
        self.assertTrue(report["candidate"]["matches_expected"])


if __name__ == "__main__":
    unittest.main()
