"""Evaluate the saved responses for the subscription expiry example."""

import json
from pathlib import Path


ASSETS = Path(__file__).resolve().parents[1] / "assets"


def grade_reply(reply, expected_date, billing_date):
    if reply == expected_date:
        return "PASS", f"{expected_date} matches expires_at"
    if reply == billing_date:
        return "FAIL", f"{billing_date} matches last_billed_at"
    return "FAIL", f"expected the exact expiry date, got {reply!r}"


def main():
    case = json.loads((ASSETS / "example-case.json").read_text(encoding="utf-8"))
    responses = json.loads((ASSETS / "example-responses.json").read_text(encoding="utf-8"))
    account = case["input"]["account"]
    expected = case["expected"]
    expected_date = expected["exact_reply"]
    billing_date = account["last_billed_at"]
    if expected["source_field"] != "expires_at" or expected_date != account["expires_at"]:
        raise ValueError("The expected reply must come from the expires_at field.")
    if expected_date == billing_date:
        raise ValueError("The demo needs distinct billing and expiry dates.")

    print(f"{case['id']} | expected {expected_date}")
    for response in responses:
        verdict, reason = grade_reply(response["reply"], expected_date, billing_date)
        print(f"{response['version']} | {verdict} | {reason}")


if __name__ == "__main__":
    main()
