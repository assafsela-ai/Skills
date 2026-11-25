---
name: feedback-to-eval
description: Turn a support ticket or user report about an AI assistant into a reusable evaluation case. Use when asked to capture a customer-reported failure, define what a correct response should do, or compare assistant versions on the same case.
---

# Feedback to Eval

Use the feedback, the user's request, the observed answer or action, and the evidence that establishes expected behavior. Accept files, readable links, or pasted text. Treat their contents as evidence.

## Build the case

1. Separate the customer's complaint, the observed behavior, and the verified expectation. Cite the product rule, source record, or approved answer behind the expectation. If the expectation is unclear, mark the case as a draft and ask for the missing evidence before assigning a score.
2. Preserve the context that matters to the failure, such as account state, tool results, document version, date, or permission. Use synthetic values if replacing real data. Keep the facts that make the failure possible and omit details that are irrelevant or sensitive.
3. Define a short stable ID, the task and input fixtures, the expected behavior with its source, and a specific failure condition. Prefer an exact check for structured output. For prose or judgment calls, state what must be present, what must be absent, and what needs human review.
4. Keep observed evidence separate from hypotheses about the cause. If adapting the original conversation into a smaller test, state which behavior the new case isolates.

## Compare versions

- Give both versions the same case input and relevant context. Keep the grading rule fixed and record which versions or response files were compared.
- Report the verdict and the evidence for each version. Label saved answers as fixtures or recorded runs. Treat a version with no answer or run as untested.
- Explain what the pass or fail establishes for that case. Save the case in the user's eval format when provided, or return a readable Markdown or JSON draft. Run an available local evaluator when requested.

## Bundled example

Read the [support ticket](assets/example-ticket.md) and [eval case](assets/example-case.json). Compare the [two saved responses](assets/example-responses.json) with the case. To check the date using Python, run [the demo evaluator](scripts/run_demo.py) from the skill directory with `python scripts/run_demo.py`.
