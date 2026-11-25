import csv
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image, ImageChops


LAB = Path(__file__).resolve().parents[1]
ASSETS = LAB / "assets"
INVOICE = ASSETS / "invoice.png"
CASE = ASSETS / "invoice-case.json"
EXAMPLE_RESULTS = ASSETS / "simulated-results.json"


class DocumentFailureLabTest(unittest.TestCase):
    def setUp(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        self.folder = Path(folder.name)
        self.output = self.folder / "runs"

    def command(self, script, *args):
        return subprocess.run(
            [sys.executable, str(LAB / "scripts" / script), *map(str, args)],
            capture_output=True,
            text=True,
            encoding="utf-8",
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )

    def generate(self, invoice=INVOICE, case=CASE):
        result = self.command("generate_variants.py", invoice, case, "--output-root", self.output)
        self.assertEqual(result.returncode, 0, result.stderr)
        run = Path(result.stdout.strip())
        self.assertEqual(run.parent, self.output.resolve())
        return run

    def reports(self, run, results):
        result = self.command("compare_results.py", run, results)
        self.assertEqual(result.returncode, 0, result.stderr)
        with (run / "report.csv").open(encoding="utf-8-sig", newline="") as stream:
            rows = {(row["variant"], row["field"]): row for row in csv.DictReader(stream)}
        return (run / "report.md").read_text(encoding="utf-8"), rows

    def save_json(self, name, data):
        path = self.folder / name
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
        return path

    def test_image_variants_and_regions(self):
        original_bytes = INVOICE.read_bytes()
        run = self.generate()
        manifest = json.loads((run / "manifest.json").read_text(encoding="utf-8"))
        variants = {item["id"]: item for item in manifest["variants"]}
        self.assertEqual(list(variants), ["clean", "stamp", "tilt", "blur"])
        self.assertEqual({path.name for path in run.glob("*.png")}, {item["file"] for item in variants.values()})
        with Image.open(run / "clean.png") as image:
            clean = image.copy()
        with Image.open(INVOICE) as original:
            self.assertIsNone(ImageChops.difference(original, clean).getbbox())

        for name in ("stamp", "blur"):
            with Image.open(run / f"{name}.png") as changed:
                difference = ImageChops.difference(clean, changed).getbbox()
            self.assertIsNotNone(difference)
            left, top, right, bottom = variants[name]["box"]
            self.assertGreaterEqual(difference[0], left)
            self.assertGreaterEqual(difference[1], top)
            self.assertLessEqual(difference[2], right)
            self.assertLessEqual(difference[3], bottom)
        with Image.open(run / "tilt.png") as tilted:
            self.assertGreater(tilted.width, clean.width)
            self.assertGreater(tilted.height, clean.height)
            self.assertEqual(tilted.getpixel((0, 0)), (255, 255, 255))
        self.assertEqual(INVOICE.read_bytes(), original_bytes)

    def test_jpeg_support_and_repeat_run_isolation(self):
        jpeg = self.folder / "invoice.jpg"
        with Image.open(INVOICE) as invoice:
            invoice.save(jpeg)
        first = self.generate(jpeg)
        second = self.generate(jpeg)
        self.assertNotEqual(first, second)
        self.assertTrue((first / "clean.png").exists())
        self.assertTrue((second / "clean.png").exists())

    def test_bad_box_does_not_create_a_run(self):
        case = json.loads(CASE.read_text(encoding="utf-8"))
        case["regions"]["stamp"][2] = 9999
        path = self.save_json("bad-case.json", case)
        result = self.command("generate_variants.py", INVOICE, path, "--output-root", self.output)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Region 'stamp' is outside", result.stderr)
        self.assertFalse(self.output.exists())

    def test_simulation_reports_the_subtotal_error(self):
        run = self.generate()
        report, rows = self.reports(run, EXAMPLE_RESULTS)
        self.assertEqual(len(rows), 20)
        self.assertIn("Simulated results", report)
        self.assertIn("stamp / total_amount** expected 125.40, got 120.00", report)
        self.assertIn("Matches the expected value of subtotal.", report)
        total = rows["stamp", "total_amount"]
        self.assertEqual(total["status"], "wrong")
        self.assertEqual(total["regressed_from_clean"], "yes")
        self.assertEqual(total["matches_expected_fields"], "subtotal")
        self.assertEqual(total["source"], "simulated")
        self.assertEqual(rows["blur", "invoice_date"]["status"], "missing")

    def test_partial_results_missing_fields_and_equal_amounts(self):
        run = self.generate()
        path = self.save_json("partial.json", {
            "source": "measured",
            "variants": {
                "clean": {"total_amount": 125.4, "invoice_number": "  INV-1042  "},
                "stamp": {"total_amount": "125.400", "invoice_number": "  "},
                "tilt": None,
                "blur": {},
            },
        })
        report, rows = self.reports(run, path)
        self.assertIn("Measured results", report)
        self.assertEqual(rows["clean", "invoice_number"]["status"], "correct")
        self.assertEqual(rows["clean", "total_amount"]["status"], "correct")
        self.assertEqual(rows["stamp", "total_amount"]["status"], "correct")
        self.assertEqual(rows["stamp", "invoice_number"]["status"], "missing")
        self.assertEqual(rows["stamp", "invoice_number"]["regressed_from_clean"], "yes")
        self.assertEqual(rows["tilt", "invoice_number"]["status"], "not_run")
        self.assertEqual(rows["blur", "total_amount"]["status"], "missing")

    def test_wrong_or_missing_baseline_is_not_a_regression(self):
        run = self.generate()
        path = self.save_json("bad-clean.json", {
            "source": "measured",
            "variants": {"clean": {"total_amount": "120"}, "stamp": {"total_amount": "110"}},
        })
        report, rows = self.reports(run, path)
        self.assertIn("total_amount** — Wrong on the clean image", report)
        self.assertEqual(rows["stamp", "total_amount"]["regressed_from_clean"], "no")

        path = self.save_json("no-clean.json", {
            "source": "measured",
            "variants": {"stamp": {"total_amount": "120"}},
        })
        report, rows = self.reports(run, path)
        self.assertIn("A baseline comparison is unavailable", report)
        self.assertEqual(rows["clean", "total_amount"]["status"], "not_run")
        self.assertEqual(rows["stamp", "total_amount"]["regressed_from_clean"], "no")

    def test_unknown_variant_leaves_existing_report_intact(self):
        run = self.generate()
        self.reports(run, EXAMPLE_RESULTS)
        previous = (run / "report.csv").read_bytes()
        path = self.save_json("unknown.json", {
            "source": "measured",
            "variants": {"stamped": {"total_amount": "120"}},
        })
        result = self.command("compare_results.py", run, path)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Unknown variant ID: stamped", result.stderr)
        self.assertEqual((run / "report.csv").read_bytes(), previous)


if __name__ == "__main__":
    unittest.main()
