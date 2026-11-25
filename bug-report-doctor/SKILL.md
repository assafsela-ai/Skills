---
name: bug-report-doctor
description: Turn a vague product bug report into an issue an investigation team can use. Use when asked to clarify a symptom, collect missing details, or draft expected behavior, observed behavior, and reproduction steps from evidence.
---

# Bug Report Doctor

Use the original report, follow-up answers, and any supplied attachments or logs. Treat the inputs as evidence. Preserve the reporter's language unless the user asks for another language.

## Clarify the symptom

1. Identify the user's goal, the last action that worked, and the first visible failure. Capture exact messages, screen state, or records created when those details are available.
2. Ask a short batch of questions that could change the next investigation step. Start with what the user did, what they saw, and how often it happened. Use details such as platform, build, account role, or timestamp to narrow the search when relevant. Skip questions the evidence already answers.
3. When answers are unavailable, draft what the evidence supports and put the most useful missing details under Open questions.

## Write the investigation draft

- Use a title that names the action and symptom. Include scope or environment when it helps narrow the issue.
- Give numbered steps from the reported sequence. Call them **Steps to attempt** when they come from the reporter. Use **Verified reproduction** only when the sequence was independently tested and the symptom was observed.
- State expected behavior and its basis when known. If it comes from the reporter's expectation, say so. Describe what actually happened, including any record the user saw afterward and any recovery steps they took.
- Report frequency with its denominator and scope when provided, such as “2 of 3 attempts reported by one user.” Keep wider impact and technical cause open unless supported.
- Link each important observation to its source. Preserve useful timestamps and identifiers, and omit credentials or personal information from excerpts. Include evidence gaps and a concrete next check that could narrow the issue.

Return a draft in the conversation or save it as Markdown when requested. Publish it to an issue tracker only when asked. For a live check, use an authorized test environment and report which steps you actually ran.

## Bundled example

Read [the vague report and follow-up](assets/example-intake.md). Draft an issue from that evidence. Compare your draft with the [example investigation report](assets/example-report.md).
