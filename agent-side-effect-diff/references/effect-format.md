# Input and output format

Use UTF-8 JSON files. The expected file has a `request` string and an `effects` list. Each run has a `label` string, a `reply` string, and an `effects` list. Use an empty string if the run produced no reply. Use an empty effects list for a read-only request or a run that recorded zero writes.

Every effect has the same five fields:

```json
{
  "operation": "update",
  "resource": "orders",
  "record_id": "ORD-1042",
  "before": {"delivery_note": ""},
  "after": {"delivery_note": "Leave with reception."}
}
```

| Operation | `before` | `after` |
| --- | --- | --- |
| `create` | `null` | Object with the created values in scope |
| `update` | Object with prior values | Object with new values for the same changed fields |
| `delete` | Object with the prior values in scope | `null` |

Use the same resource names, record IDs, field names, and value types across all files. When a field itself has a null value, keep it in the field object as `null`. For an update, use the same grouping of fields across files, such as a single effect per applied record write.

The comparator matches exact effect occurrences. It ignores the order of effects and object keys. Array values keep their order. Repeated effects count separately. A wrong value shows up as an expected effect that is missing and an observed effect that is unexpected. The baseline and candidate are each compared with the expected effects as well as with each other.

A match covers the writes supplied for comparison. Use comparable runs and state what your logs capture. Final snapshots can reveal a net change. They cannot show repeated writes or a change that was later reversed. The comparator does not check action order.

## Output

The text report gives both verdicts and the diff. With `--format json`, the report includes `replies_equal`, a `baseline` and `candidate` object with `matches_expected`, `missing`, and `unexpected`, and the lists `shared`, `baseline_only`, and `candidate_only`. Each listed effect has a `count` and its original values.

| Exit code | Meaning |
| --- | --- |
| `0` | Demo ran successfully, or the candidate in a custom comparison matches the expected effects |
| `1` | Custom comparison ran and the candidate differs from the expected effects |
| `2` | Invalid arguments or input files |
