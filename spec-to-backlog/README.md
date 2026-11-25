# Spec to Backlog

Turn a product spec into user stories you can review, edit, and export to CSV. Each story includes acceptance criteria and a quote with line numbers from the original spec. Unclear requirements become open questions.

Spec to Backlog is an [Agent Skill](https://agentskills.io/specification). It uses the model in your agent. CSV export requires Python 3.8 or later and uses only the standard library.

## Install

Copy the entire `spec-to-backlog` folder to your project's skills directory. Open your agent from the project root after copying.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$spec-to-backlog` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/spec-to-backlog` |

For example, from this repository use the command for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse spec-to-backlog .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse spec-to-backlog .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R spec-to-backlog .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R spec-to-backlog .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `spec-to-backlog` skill folder itself. The ZIP should contain `spec-to-backlog/SKILL.md` and the folders beside it. Upload it under **Customize → Skills** with code execution and file creation enabled. Start a chat and ask Claude to use Spec to Backlog. Download your draft and source if you want to continue editing them in a new chat.

## Quick start

1. In Codex, enter `$spec-to-backlog Generate a fresh backlog from the bundled meeting room booking spec.` In Claude Code, use the same prompt after `/spec-to-backlog`. For your own spec, provide the path to a Markdown file or paste the specification.
2. Review the stories and open questions. For example, the sample does not say when or how employees should receive a reminder.
3. Ask for an edit such as “For US-002, make the acceptance criterion for the success confirmation clearer.” You can also edit `output/meeting-room-booking/backlog.json` directly. Keep the story IDs and source references.
4. Ask the skill to export the saved backlog to CSV. Open `output/meeting-room-booking/backlog.csv`. The CSV contains the stories. The open questions stay in the JSON draft.

The draft folder holds `source.md`, `backlog.json`, and the exported `backlog.csv`. Keep the source with the draft so the exporter can check each citation. Files under this repository's `output/` are ignored by Git.

## Try the ready-made example

The skill includes an [example spec](assets/example-spec.md) and an [example backlog](assets/example-backlog.json). Ask the skill to load the ready-to-edit demo, or run the following from this repository root.

```powershell
$demo = 'output/meeting-room-booking'
New-Item -ItemType Directory -Path $demo | Out-Null
if (-not $?) { throw 'Use a fresh demo folder.' }
Copy-Item spec-to-backlog/assets/example-spec.md "$demo/source.md"
Copy-Item spec-to-backlog/assets/example-backlog.json "$demo/backlog.json"
python spec-to-backlog/scripts/export_csv.py $demo
```

```sh
demo=output/meeting-room-booking
mkdir -p output
mkdir "$demo" &&
  cp spec-to-backlog/assets/example-spec.md "$demo/source.md" &&
  cp spec-to-backlog/assets/example-backlog.json "$demo/backlog.json" &&
  python3 spec-to-backlog/scripts/export_csv.py "$demo"
```

Open the CSV to see the three sample stories. Edit a title in the JSON and run the export command again to see the change.

Run the exporter checks with `python -m unittest discover -s spec-to-backlog/tests -v`.

[MIT License](LICENSE)
