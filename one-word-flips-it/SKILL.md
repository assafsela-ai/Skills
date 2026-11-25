---
name: one-word-flips-it
description: Create paired AI evaluation cases from a policy or decision rule. Change one decisive fact between two inputs so their expected decisions flip, then validate and export the pairs as JSONL.
---

# One Word Flips It

Read the supplied policy and [the pair format](references/pair-format.md). If the user asks for the bundled demo, use [the fictional Juniper Desk policy](assets/example-policy.md) and [the 100 ready-made pairs](assets/example-pairs.jsonl).

1. Identify explicit rules with a yes-or-no decision. Give each rule a stable ID and keep a short exact excerpt. Raise missing definitions, conflicting rules, and unresolved boundaries before turning them into expected answers.
2. Draft both versions of each case. Give each version the same question and enough facts to decide it on its own. Hold the rest of the case fixed and swap one contiguous span that represents a single fact. Prefer exact thresholds, changes in status, completed versus requested actions, and roles with similar names.
3. Check the expected answer to each version against the cited rule. Keep all other conditions fixed and satisfied when testing one clause in a rule with several conditions. Vary the direction of the flip and the wording across pairs. Default to 10 English pairs unless the user requests a different count or language. If the policy cannot support the requested set without repeating cases or guessing, explain the shortfall.
4. Save the draft as a JSON array and export it with [the bundled script](scripts/pairs.py). Use its installed path and the available Python 3 command. For pasted policy text, save it as a UTF-8 text file first. Keep working files in the user's workspace or the host's writable artifact directory.

```text
python "<skill-directory>/scripts/pairs.py" export pairs-draft.json output/pairs.jsonl --policy policy.md --count 10
```

Review any validation errors and correct them using the policy. Return the JSONL path, the pair count, and any unresolved policy questions. When asked to evaluate a system, send each variant independently with the policy. Keep the expected answer, the other variant, and the recorded change out of the prompt.
