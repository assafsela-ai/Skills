# Run format

## Case JSON

The case file has two objects:

- `fields` maps field IDs to an object with `type` and `expected`. Field IDs start with a lowercase letter and use lowercase letters, digits, and underscores. Use `text` for identifiers and dates. Use `amount` for decimal amounts in a consistent currency.
- `regions` contains `stamp` and `blur`. Each is a pixel rectangle in `[left, top, right, bottom]` order, measured from the top left of the oriented source image. The left and top edges are included. The right and bottom edges are excluded.

See [the invoice case](../assets/invoice-case.json) for a complete example. The generator writes the checked fields and the details of each variant to `manifest.json`.

## Results JSON

Copy the generated `results-template.json` to a new file and fill in the results. Keep the variant and field IDs from the manifest. A variant object contains the values returned by the extraction system:

```json
{
  "source": "measured",
  "variants": {
    "clean": { "total_amount": "125.40" },
    "stamp": { "total_amount": "120.00" },
    "tilt": null,
    "blur": null
  }
}
```

- Set `source` to `measured` for imported system outputs or `simulated` for invented example results.
- Leave a variant out or set it to `null` when it was skipped. Use an empty object when the system ran and returned none of the expected fields.
- Within a tested variant, a missing key, `null` or blank text is a missing field. Keep other values as returned.
- Amounts accept JSON numbers and decimal strings like `"125.40"`. Map currency-formatted amounts to a plain decimal before import if your system returns them with currency symbols or separators. Keep IDs and dates as strings. Text comparisons trim surrounding spaces and preserve case.
- Use the same extractor, model version and settings for every variant in one run. If the import does not contain a clean result, the report shows per-field results and leaves the baseline comparison unavailable.
