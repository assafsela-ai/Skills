# Bug Report Doctor

Turn a report like “Room booking gets stuck sometimes” into an issue a product or engineering team can investigate. The skill asks focused follow-up questions, then drafts a report with the steps, expected and observed behavior, evidence, and open questions.

## Install

Copy the entire `bug-report-doctor` folder into your project's skills directory. Open your agent from the project root. The skill uses the host's model and needs no extra API key.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$bug-report-doctor` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/bug-report-doctor` |

From the root of this repository, use the commands for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse bug-report-doctor .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse bug-report-doctor .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R bug-report-doctor .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R bug-report-doctor .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `bug-report-doctor` folder. Upload the ZIP under **Customize → Skills** and ask Claude to use Bug Report Doctor.

## Try the meeting room demo

In Codex, enter `$bug-report-doctor Use the bundled meeting room intake to draft a bug report. Show which details came from the reporter and what engineering still needs to check.` In Claude Code, use the same prompt after `/bug-report-doctor`.

The [fictional intake](assets/example-intake.md) starts with “Room booking gets stuck sometimes.” Three follow-up questions establish that the screen kept loading after the user clicked **Reserve**, that it happened in two of three attempts, and that one affected booking appeared under **My Reservations** after a refresh. The [finished report](assets/example-report.md) turns that into a concrete investigation with the remaining gaps.

## Use your own report

Paste a ticket, a support message, or a short description. Add any screenshots, relevant logs, or follow-up replies you have. The skill can draft a report from partial information and call out what would make it easier to investigate.

[MIT License](LICENSE)
