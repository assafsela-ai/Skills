# Review Rollback Readiness

Check whether the previous application version still works after a release changes the database or configuration.

Open the [Release Reliability Lab repository](https://github.com/assafsela-ai/release-reliability-lab) and run `npm run install:skills` from its root. Start a new session and use the command for your client.

| Client | Command |
| --- | --- |
| Codex | `$review-rollback-readiness` |
| Claude Code | `/review-rollback-readiness` |

Compare the two migration paths. Use the downloaded run evidence or run both rehearsals locally. Cite the exact check that supports each verdict.

[Interactive demo](https://assafsela-ai.github.io/release-reliability-lab/) · [Skill source](https://github.com/assafsela-ai/release-reliability-lab/blob/main/skills/review-rollback-readiness/SKILL.md) · [Installation details](https://github.com/assafsela-ai/release-reliability-lab#agent-skills)
