# Build an Onboarding Plan

Build or update a 30-day onboarding plan from an applicable policy, a role brief, and a team checklist. Each task includes an owner, a due date or working day, and its source.

## Install

1. [Download the Build Onboarding Plan ZIP](https://assafsela-ai.github.io/people-onboarding-lab/downloads/build-onboarding-plan.zip).
2. For Codex or Claude Code, extract the ZIP so `SKILL.md` is at the project path below. Open a new session from the project root and invoke the skill.

| Tool | Path to `SKILL.md` inside your project | Invoke |
| --- | --- | --- |
| Codex | `.agents/skills/build-onboarding-plan/SKILL.md` | `$build-onboarding-plan` |
| Claude Code | `.claude/skills/build-onboarding-plan/SKILL.md` | `/build-onboarding-plan` |

For Claude in the browser, upload the ZIP under **Customize → Skills** and enable it. Attach the policy and onboarding documents and ask Claude to use Build an Onboarding Plan.

## Try it

Provide [the new hire brief and checklist](https://assafsela-ai.github.io/people-onboarding-lab/samples/new-hire.md), [the original plan](https://assafsela-ai.github.io/people-onboarding-lab/samples/plan-v1.md), and [the revised policy](https://assafsela-ai.github.io/people-onboarding-lab/samples/hybrid-work-v2.md). Ask for a revised plan with source references and a summary of added, updated, and removed tasks.

- [Open the People Onboarding Lab demo](https://assafsela-ai.github.io/people-onboarding-lab/)
- [View the Build Onboarding Plan source](https://github.com/assafsela-ai/people-onboarding-lab/blob/main/skills/build-onboarding-plan/SKILL.md)
