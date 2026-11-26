# Audit an HR Policy

Compare two versions of an HR policy. See which obligations changed, what each clause says, and which onboarding tasks are affected.

## Install

1. [Download the Audit HR Policy ZIP](https://assafsela-ai.github.io/people-onboarding-lab/downloads/audit-hr-policy.zip).
2. For Codex or Claude Code, extract the ZIP so `SKILL.md` is at the project path below. Open a new session from the project root and invoke the skill.

| Tool | Path to `SKILL.md` inside your project | Invoke |
| --- | --- | --- |
| Codex | `.agents/skills/audit-hr-policy/SKILL.md` | `$audit-hr-policy` |
| Claude Code | `.claude/skills/audit-hr-policy/SKILL.md` | `/audit-hr-policy` |

For Claude in the browser, upload the ZIP under **Customize → Skills** and enable it. Attach the policy files and ask Claude to use Audit an HR Policy.

## Try it

Provide [the original policy](https://assafsela-ai.github.io/people-onboarding-lab/samples/hybrid-work-v1.md) and [the revised policy](https://assafsela-ai.github.io/people-onboarding-lab/samples/hybrid-work-v2.md). Ask the skill to compare them for a London hybrid hire, cite both versions, and list the changes to the onboarding plan.

- [Open the People Onboarding Lab demo](https://assafsela-ai.github.io/people-onboarding-lab/)
- [View the Audit HR Policy source](https://github.com/assafsela-ai/people-onboarding-lab/blob/main/skills/audit-hr-policy/SKILL.md)
