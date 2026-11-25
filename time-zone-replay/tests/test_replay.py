import json
import subprocess
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "replay.py"


class ReplayTest(unittest.TestCase):
    def run_cli(self, *args):
        return subprocess.run(
            [sys.executable, str(SCRIPT), *args],
            capture_output=True,
            text=True,
            encoding="utf-8",
        )

    def replay(self, *args):
        result = self.run_cli(*args)
        self.assertEqual(result.returncode, 0, result.stderr)
        return json.loads(result.stdout)

    def test_repeated_time_has_two_ordered_instants(self):
        result = self.replay("resolve", "America/New_York", "2026-11-01T01:30")
        self.assertEqual(result["status"], "ambiguous")
        self.assertEqual(result["candidates"], [
            {"utc": "2026-11-01T05:30:00Z", "local": "2026-11-01T01:30:00-04:00", "fold": 0},
            {"utc": "2026-11-01T06:30:00Z", "local": "2026-11-01T01:30:00-05:00", "fold": 1},
        ])

    def test_skipped_time_has_no_candidate(self):
        result = self.replay("resolve", "America/New_York", "2026-03-08T02:30")
        self.assertEqual((result["status"], result["candidates"]), ("nonexistent", []))

    def test_ordinary_time_has_one_candidate(self):
        result = self.replay("resolve", "America/New_York", "2026-03-09T02:30")
        self.assertEqual(result["status"], "unique")
        self.assertEqual(result["candidates"], [
            {"utc": "2026-03-09T06:30:00Z", "local": "2026-03-09T02:30:00-04:00", "fold": 0},
        ])

    def test_half_hour_repeated_time_crosses_the_utc_date(self):
        result = self.replay("resolve", "Australia/Lord_Howe", "2026-04-05T01:45")
        self.assertEqual(result["status"], "ambiguous")
        self.assertEqual([candidate["utc"] for candidate in result["candidates"]], [
            "2026-04-04T14:45:00Z", "2026-04-04T15:15:00Z",
        ])

    def test_elapsed_ignores_skipped_or_repeated_wall_hours(self):
        spring = self.replay("elapsed", "2026-03-08T01:30:00-05:00", "2026-03-08T03:30:00-04:00")
        fall = self.replay("elapsed", "2026-11-01T01:30:00-04:00", "2026-11-01T01:30:00-05:00")
        self.assertEqual(spring["elapsed_seconds"], 3600)
        self.assertEqual(fall["elapsed_seconds"], 3600)

    def test_cancellation_boundary_and_occurrence(self):
        starts = ("2026-11-01T01:30:00-04:00", "2026-11-01T01:30:00-05:00")
        cases = [
            ("04:44:59", starts[0], 2701),
            ("04:45:00", starts[0], 2700),
            ("04:45:01", starts[0], 2699),
            ("05:00:00", starts[0], 1800),
            ("05:00:00", starts[1], 5400),
        ]
        for clock, start, seconds in cases:
            with self.subTest(clock=clock, start=start):
                result = self.replay("elapsed", f"2026-11-01T{clock}Z", start)
                self.assertEqual(result["elapsed_seconds"], seconds)

    def test_overnight_wall_clock_window(self):
        cases = [
            ("05:59:59", False, None),
            ("06:00:00", True, "2026-11-25"),
            ("08:00:00", True, "2026-11-25"),
            ("09:59:00", True, "2026-11-25"),
            ("10:00:00", False, None),
        ]
        for clock, inside, service_date in cases:
            with self.subTest(clock=clock):
                result = self.replay(
                    "window", "America/Los_Angeles", f"2026-11-26T{clock}Z", "22:00", "02:00"
                )
                self.assertEqual((result["inside"], result["service_date"]), (inside, service_date))

    def test_daily_wall_clock_window_can_include_both_occurrences(self):
        for utc in ("2026-11-01T05:15Z", "2026-11-01T06:15Z"):
            with self.subTest(utc=utc):
                result = self.replay("window", "America/New_York", utc, "01:00", "01:45")
                self.assertTrue(result["inside"])
                self.assertEqual(result["service_date"], "2026-11-01")

    def test_errors_for_missing_offset_and_undefined_equal_boundaries(self):
        no_offset = self.run_cli("elapsed", "2026-11-01T01:30", "2026-11-01T06:00Z")
        self.assertEqual(no_offset.returncode, 1)
        self.assertIn("explicit UTC offset", no_offset.stderr)

        equal = self.run_cli("window", "America/New_York", "2026-11-01T06:00Z", "09:00", "09:00")
        self.assertEqual(equal.returncode, 1)
        self.assertIn("explicit product rule", equal.stderr)

    def test_unknown_zone_error_suggests_database_fallback(self):
        result = self.run_cli("resolve", "Nowhere/Imaginary", "2026-11-01T01:30")
        self.assertEqual(result.returncode, 1)
        self.assertIn("Unknown IANA zone", result.stderr)
        self.assertIn("tzdata", result.stderr)


if __name__ == "__main__":
    unittest.main()
