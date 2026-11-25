# Change Impact Map

Compare two versions of a product spec against an existing backlog. See which stories, acceptance criteria, and tests need attention. Each proposed edit points back to the change in the spec.

## Install

Copy the entire `change-impact-map` folder into your project's skills directory and open your agent from the project root. The skill uses the model provided by the host.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$change-impact-map` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/change-impact-map` |

From the root of this repository, use the commands for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse change-impact-map .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse change-impact-map .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R change-impact-map .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R change-impact-map .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the skill folder with `change-impact-map/SKILL.md` and its bundled assets inside. Upload it under **Customize → Skills** and ask Claude to use Change Impact Map.

## Try the meeting room demo

Ask `$change-impact-map Run the bundled meeting room demo and show the proposed backlog edits.` In Claude Code, use the same prompt after `/change-impact-map`.

The [original spec](assets/spec-before.md) lets employees cancel their own reservations 30 minutes or more before the start. The [revised spec](assets/spec-after.md) moves that cutoff to two hours. In the [current backlog](assets/backlog-before.json), the change affects **US-003 — Cancel my reservation**. The proposed edit updates its time criterion and source quote.

| Time before start | Original rule | Revised rule |
| --- | --- | --- |
| 30 minutes | Can cancel | Cannot cancel |
| 119 minutes | Can cancel | Cannot cancel |
| 120 minutes | Can cancel | Can cancel |
| 121 minutes | Can cancel | Can cancel |

See the [example impact map](assets/impact-map.md) and the [revised backlog draft](assets/backlog-after.json).

## Use it with your specs

Give the skill your old spec, revised spec, and current backlog. Include existing tests if you want it to identify tests by name. Compatible with [Spec to Backlog](../spec-to-backlog/) JSON and readable backlog text. The default output is a map of proposed edits. Ask for a revised draft when you want a separate backlog file.

[MIT License](LICENSE)
