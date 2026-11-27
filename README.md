# Skills

Reusable skills for Codex, Claude, and other tools that support Agent Skills.

- [Spec to Backlog](spec-to-backlog/) turns a product spec into editable user stories with acceptance criteria, source references, and CSV export.
- [Change Impact Map](change-impact-map/) maps spec changes to backlog edits, acceptance criteria, and tests.
- [Decision Replay](decision-replay/) reconstructs what a team knew when it made a decision and what it learned later.
- [Support to Product](support-to-product/) groups support tickets into product themes with counts, examples, and evidence gaps.
- [Bug Report Doctor](bug-report-doctor/) turns vague product bug reports into investigation drafts with steps, evidence, and focused questions.
- [Feedback to Eval](feedback-to-eval/) turns AI support complaints into reusable eval cases and compares assistant versions on the same inputs.
- [Meeting Decisions Tracker](meeting-decisions-tracker/) extracts decisions, tasks, and owners from meeting notes, links them to the original text, and tracks task updates across meetings.
- [AI Workflow ROI Calculator](ai-workflow-roi-calculator/) compares automation costs, break-even volume, payback, and ROI. It includes live sliders. [Open the English calculator](https://assafsela-ai.github.io/Skills/ai-workflow-roi-calculator/).
- [Document Review Lab](document-review-lab/) lets teams review simulated AI extraction against source lines in synthetic documents. [Open the interactive lab](https://assafsela-ai.github.io/Skills/document-review-lab/).
- [Document Failure Lab](document-failure-lab/) creates invoice image variants and reports how extraction results change by field. [Open the interactive demo](https://assafsela-ai.github.io/Skills/document-failure-lab/).
- [One Word Flips It](one-word-flips-it/) creates paired AI tests where changing one fact flips the expected policy decision.
- [Time Zone Replay](time-zone-replay/) turns time-sensitive rules into test cases for daylight saving changes, cutoffs, and overnight windows.
- [Agent Side-Effect Diff](agent-side-effect-diff/) compares what two agent runs changed and flags unexpected writes, even when the replies match.
- [Vision Data Audit](vision-data-audit/) checks image datasets for overlap between splits, prediction changes after background swaps, and training labels worth reviewing.
- [Answer Readiness Lab](https://github.com/assafsela-ai/answer-readiness-lab) is an AEO and GEO content audit. It checks whether web pages give clear, source-backed answers to customer questions and suggests fixes. [Interactive demo](https://assafsela-ai.github.io/answer-readiness-lab/) · [Skill for Codex and Claude Code](https://github.com/assafsela-ai/answer-readiness-lab/tree/main/skills/answer-readiness-lab)

## People Onboarding Lab

Switch between two HR policy versions to see how a 30-day onboarding plan changes. [Open the People Onboarding Lab demo](https://assafsela-ai.github.io/people-onboarding-lab/).

- [Audit an HR Policy](audit-hr-policy/) compares policy versions and links each change to its source clauses and affected onboarding tasks.
- [Build an Onboarding Plan](build-onboarding-plan/) turns an applicable policy and a role brief into a plan with owners, dates, and sources.
- [Review Onboarding Feedback](review-onboarding-feedback/) uses survey responses or interview notes to propose changes for the plan owner to review.

## AP Payment Review

Review a fictional supplier invoice with a quantity mismatch and new bank details that still need verification. [Live demo](https://assafsela-ai.github.io/ap-payment-review/) · [GitHub repository](https://github.com/assafsela-ai/ap-payment-review)

- [Review an invoice exception](review-invoice-exception/) compares billed quantities and prices with the purchase order and goods receipts.
- [Review a vendor bank change](review-vendor-change/) compares the requested account with the vendor record and checks for independent verification.
- [Assemble a payment evidence pack](assemble-payment-evidence/) records the review decision, open checks, next steps, and source documents.

## Release Reliability Lab

Rehearse two PostgreSQL rollback paths and compare the database checks. [Interactive demo](https://assafsela-ai.github.io/release-reliability-lab/) · [GitHub repository](https://github.com/assafsela-ai/release-reliability-lab)

- [Diagnose CI Failure](diagnose-ci-failure/) identifies the first causal error and proposes the smallest verification step.
- [Review Rollback Readiness](review-rollback-readiness/) checks if the previous version can still read and write after a schema or configuration change.
