"""Shared input format for invoice test runs."""

import json
import re
from decimal import Decimal, InvalidOperation
from pathlib import Path


VARIANTS = {
    "clean": "Clean baseline",
    "stamp": "Stamp over an amount",
    "tilt": "Slight rotation",
    "blur": "One blurred line",
}
FIELD_ID = re.compile(r"[a-z][a-z0-9_]*")
DECIMAL_TEXT = re.compile(r"[+-]?(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?")


def invalid_constant(value):
    raise ValueError(f"{value} is not a valid JSON number")


def read_json(path):
    with Path(path).open(encoding="utf-8-sig") as stream:
        try:
            return json.load(stream, parse_float=Decimal, parse_constant=invalid_constant)
        except (ValueError, InvalidOperation) as error:
            raise ValueError(f"{path}: {error}") from error


def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def object_at(value, location):
    if not isinstance(value, dict):
        raise ValueError(f"{location} must be a JSON object")
    return value


def decimal_amount(value):
    if isinstance(value, (int, Decimal)) and not isinstance(value, bool):
        return Decimal(value)
    if isinstance(value, str) and DECIMAL_TEXT.fullmatch(value.strip()):
        try:
            return Decimal(value.strip())
        except InvalidOperation:
            return None
    return None


def read_fields(value):
    fields = object_at(value, "fields")
    if not fields:
        raise ValueError("fields must contain at least one named field")

    validated = {}
    for field_id, value in fields.items():
        if not FIELD_ID.fullmatch(field_id):
            raise ValueError(f"Field ID {field_id!r} must use lowercase letters, digits or underscores")
        field = object_at(value, f"Field {field_id}")
        field_type = field.get("type")
        expected = field.get("expected")
        if field_type == "amount":
            if decimal_amount(expected) is None:
                raise ValueError(f"Field {field_id} needs a plain decimal amount")
        elif field_type == "text":
            if not isinstance(expected, str) or not expected.strip():
                raise ValueError(f"Field {field_id} needs non-empty expected text")
        else:
            raise ValueError(f"Field {field_id} must use type 'text' or 'amount'")
        validated[field_id] = {"type": field_type, "expected": str(expected)}
    return validated
