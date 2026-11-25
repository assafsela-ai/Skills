# Agent Side-Effect Diff

Two agents can give the same reply while changing different records. This skill compares their recorded writes against the user's request and shows exactly what each run changed.

## Run the demo

From the root of the Skills repository, run:

```sh
python agent-side-effect-diff/scripts/compare_effects.py demo
```

Use Python 3.8 or later. You can use `python3` if that is how you start Python. The demo runs locally with Python's standard library. It needs no account, API key, package install, or network access.

Both synthetic runs say **“I updated the delivery note on order ORD-1042.”** Version A updates that order. Version B also overwrites the delivery note on order `ORD-2079`, which belongs to another customer.

```text
Baseline (version A): MATCH
Candidate (version B): MISMATCH
Unexpected effects (1)
  1x update orders/ORD-2079 | {"delivery_note": "Ring bell on arrival."} -> {"delivery_note": "Leave with reception."}
```

The fixtures show the [expected write](assets/expected.json), the [baseline run](assets/baseline.json), and the [candidate run](assets/candidate.json). Add `--format json` to see the full report as JSON.

## Install the skill

Copy the entire `agent-side-effect-diff` folder into the skills directory for your project. Open the agent from that project's root.

| Agent | Project skills directory | Demo prompt |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$agent-side-effect-diff Run the offline demo and show what changed.` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/agent-side-effect-diff Run the offline demo and show what changed.` |

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `agent-side-effect-diff` folder itself so the archive contains `agent-side-effect-diff/SKILL.md`. Upload it under **Customize → Skills** with code execution enabled. Then ask Claude to use Agent Side-Effect Diff and run the demo.

## Compare your own runs

Prepare the three local files using the [input format](references/effect-format.md). Start both runs from the same data. Capture applied writes in the same scope.

```sh
python agent-side-effect-diff/scripts/compare_effects.py compare --expected expected.json --baseline baseline.json --candidate candidate.json
```

The report shows missing and unexpected effects for both runs. To use the command as a test, exit code `1` means the candidate differs from the expected effects. Exit code `2` means the input or command is invalid. The bundled demo returns `0` when it runs and shows its intentional mismatch in the report.

Run the checks from the repository root with `python -m unittest discover -s agent-side-effect-diff/tests -v`.

[MIT License](LICENSE)
