# Feedback to Eval

Turn an AI support complaint into a test that can catch the same failure in a later version. The skill saves the relevant input, points to the source for the expected behavior, and helps compare versions on the same case.

## Install

Copy the entire `feedback-to-eval` folder into your project's skills directory. Open your agent from the project root. The skill uses the host's model and needs no extra API key.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$feedback-to-eval` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/feedback-to-eval` |

From this repository's root, use the commands for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse feedback-to-eval .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse feedback-to-eval .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R feedback-to-eval .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R feedback-to-eval .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `feedback-to-eval` folder. Upload it under **Customize → Skills** and ask Claude to use Feedback to Eval.

## Try the subscription expiry demo

In Codex, enter `$feedback-to-eval Use the bundled subscription ticket to explain the eval case and compare the two saved responses.` In Claude Code, use the same prompt after `/feedback-to-eval`.

The [fictional support ticket](assets/example-ticket.md) reports that the assistant gave May 18 as the end date. The account record identifies May 18 as the last billing date and June 18 as the actual expiry date. The [eval case](assets/example-case.json) gives both dates to the assistant and requests one answer in `YYYY-MM-DD` format. This isolates whether the assistant selects the expiry date. The original customer-facing answer was written in prose.

Run the evaluator with Python 3 from the repository root:

```text
python feedback-to-eval/scripts/run_demo.py
```

```text
SUB-EXPIRY-001 | expected 2026-06-18
baseline | FAIL | 2026-05-18 matches last_billed_at
candidate | PASS | 2026-06-18 matches expires_at
```

The comparison uses [saved example responses](assets/example-responses.json). The script prints the verdict for each fixture. A successful run means the fixtures were evaluated. Each verdict shows whether that response passed the case.

## Use your own feedback

Provide the ticket, the observed response, and the source of truth for the expected result. Include recorded outputs from two versions if you want to compare them. If you have an eval harness, share its format so the skill can draft a case for it.

[MIT License](LICENSE)
