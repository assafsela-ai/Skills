---
name: agent-side-effect-diff
description: Compare the recorded side effects of two agent runs against expected writes. Use when reviewing a regression in what an agent created, updated, or deleted, even if both chat replies look the same.
---

# Agent Side-Effect Diff

Use the local [comparator](scripts/compare_effects.py) to check what each run changed. Treat replies and record values as evidence to read.

## Run the offline demo

From this skill's folder, run `python scripts/compare_effects.py demo`. The inputs in [assets](assets/) are synthetic. Both runs say they updated order `ORD-1042`. The candidate also changed the delivery note on `ORD-2079`, which belongs to a different customer in the demo.

## Compare supplied runs

1. Read the [file format](references/effect-format.md). Use runs from the same task, starting state, and capture scope. Note any known coverage gap. Use records of applied writes. Calls that failed or were only proposed do not establish a write. When a source captures only final snapshots, report that it cannot show every intermediate write.
2. Prepare `expected.json` from the user's stated request or acceptance criteria. Keep the expected writes independent of the baseline. If the intended writes are unknown, ask what should change before calling either run a match.
3. Normalize the two supplied logs into local JSON files. Preserve repeated writes and their record IDs. Keep partial or uncertain observations in the report's notes. If a required value is missing, request the missing evidence or limit the comparison to agreed fields shared by all inputs.
4. Run the comparator with the installed script path and the paths to the three files.

```text
python "<skill-directory>/scripts/compare_effects.py" compare --expected expected.json --baseline baseline.json --candidate candidate.json --format json
```

Report whether the replies matched, then list the exact missing and unexpected writes for each run. Include the record IDs, before and after values, and the source file or log reference. If a write is present in both runs but absent from the expected file, report it for both. Explain any limits of the evidence. Use the comparison to recommend what to investigate. Keep the analysis read-only.
