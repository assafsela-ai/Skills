# Decision Replay

Reconstruct a past decision from the records that were available when it was made. The replay shows the options the team discussed, the reason recorded for the choice, and the evidence that arrived later.

## Install

Copy the entire `decision-replay` folder into your project's skills directory. Open the agent from the project root. The skill uses the host's model and needs no extra API key.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$decision-replay` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/decision-replay` |

From the root of this repository, use the commands for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse decision-replay .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse decision-replay .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R decision-replay .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R decision-replay .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `decision-replay` folder. Upload the ZIP under **Customize → Skills** and ask Claude to use Decision Replay.

## Try the scheduled-reports demo

In Codex, enter `$decision-replay Replay the bundled scheduled-reports decision. Show the recorded rationale and what the team learned later.` In Claude Code, use the same prompt after `/decision-replay`.

The team decided to ship manual CSV export while holding scheduled emails. At the cutoff, the team had a rehearsal in which 3 of 10 timed-out sends produced duplicate emails. Later that same day, analytics found that 38 of 50 sampled accounts had repeated their manual exports. The underlying activity was already recorded, but the analysis was first completed and shared after the decision.

Read the [decision record](assets/decision.md), the [dated evidence](assets/evidence.md), and the [sample replay](assets/replay.md). The example is fictional.

## Use your own records

Provide the decision or question to replay, the cutoff if you know it, and the relevant messages, notes, or reports. Include timestamps and older document versions where possible. Ask a focused question such as “Did we have the analytics report when we decided to hold the rollout?” The replay cites the records and shows where timing or awareness is still uncertain.

[MIT License](LICENSE)
