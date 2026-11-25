# One Word Flips It

Test whether an AI system notices the one fact that changes a policy decision. Each pair has two complete inputs and opposite expected answers.

> The automatic renewal refund request arrived **14** calendar days after renewal. Approve the refund? → **ALLOW**
>
> The automatic renewal refund request arrived **15** calendar days after renewal. Approve the refund? → **DENY**

## Install

Copy the whole `one-word-flips-it` folder to the project's skills directory and open the agent from that project.

| Agent | Destination | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/one-word-flips-it/` | `$one-word-flips-it` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/one-word-flips-it/` | `/one-word-flips-it` |

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the folder with `one-word-flips-it/SKILL.md` inside it. Upload the ZIP under **Customize → Skills** with code execution enabled.

The skill uses the host's model for drafting. The exporter uses Python 3.8 or later and the standard library.

## Try the example

The [fictional Juniper Desk policy](assets/example-policy.md) has ten rules. The [sample JSONL](assets/example-pairs.jsonl) contains 100 English pairs, ten per rule. Fifty pairs start with `ALLOW` and fifty start with `DENY`.

From the repository root:

```sh
python one-word-flips-it/scripts/pairs.py validate one-word-flips-it/assets/example-pairs.jsonl --policy one-word-flips-it/assets/example-policy.md --count 100
```

To draft your own, ask the skill to “Create 20 English flip pairs from this policy and export them to JSONL.” Attach the policy or provide its path. The [pair format](references/pair-format.md) explains each field.

## Run an evaluation

For each pair, send `a.input` and `b.input` as separate requests with the policy. Compare each reply with its own `expected` label. Count a pair as correct when both replies match their labels. The export is a labeled set of test cases. Use your own evaluation runner or ask your agent to run it against a system you provide.

[MIT License](LICENSE)
