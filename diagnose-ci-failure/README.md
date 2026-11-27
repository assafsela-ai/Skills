# Diagnose CI Failure

Find the first causal error in a failed CI job and propose the smallest check that could confirm it.

Open the [Release Reliability Lab repository](https://github.com/assafsela-ai/release-reliability-lab) and run `npm run install:skills` from its root. Start a new session and use the command for your client.

| Client | Command |
| --- | --- |
| Codex | `$diagnose-ci-failure` |
| Claude Code | `/diagnose-ci-failure` |

Run the direct rename rehearsal and identify the failing step. Explain why the earlier green checks passed.

[Interactive demo](https://assafsela-ai.github.io/release-reliability-lab/) · [Skill source](https://github.com/assafsela-ai/release-reliability-lab/blob/main/skills/diagnose-ci-failure/SKILL.md) · [Installation details](https://github.com/assafsela-ai/release-reliability-lab#agent-skills)
