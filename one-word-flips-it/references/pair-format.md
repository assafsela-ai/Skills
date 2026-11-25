# Pair format

The draft is a JSON array. The export is UTF-8 JSONL with one pair per line. Each row contains two complete inputs.

```json
{
  "id": "OWF-001",
  "rule": {
    "id": "R01",
    "excerpt": "Approve an automatic renewal refund when the request was received 0 to 14 calendar days after renewal, inclusive."
  },
  "change": {
    "a": "14 calendar days",
    "b": "15 calendar days"
  },
  "a": {
    "input": "The automatic renewal refund request arrived 14 calendar days after renewal. Approve the refund?",
    "expected": "ALLOW"
  },
  "b": {
    "input": "The automatic renewal refund request arrived 15 calendar days after renewal. Approve the refund?",
    "expected": "DENY"
  }
}
```

- `id` is a unique pair identifier. `rule.id` identifies the decision rule and `rule.excerpt` quotes it exactly from the source.
- `change.a` and `change.b` are the text spans that hold the decisive fact. Replace one occurrence of `change.a` in `a.input` with `change.b` to get `b.input`. Keep wording, punctuation, names, and unrelated facts fixed. A multi-word span is fine when it expresses one fact.
- `a.expected` and `b.expected` use opposite labels. `ALLOW` approves the proposed action and `DENY` rejects it.
- The script checks the shape, pair count when supplied, unique IDs and input pairs, opposite labels, the exact replacement, and the presence of the quoted rule in the policy. Check the expected decisions against the policy during drafting.
