# Support to Product

Turn support tickets into product themes based on what customers are trying to do. Each theme includes a count of unique tickets, examples from the source, and the information still needed to understand how widespread the problem is.

## Install

Copy the entire `support-to-product` folder into your project's skills directory. Open your agent from the project root. The skill uses the host's model and needs no extra API key.

| Agent | Project skills directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$support-to-product` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/support-to-product` |

From the root of this repository, use the commands for your agent:

```powershell
# Codex
New-Item -ItemType Directory -Force .agents/skills | Out-Null
Copy-Item -Recurse support-to-product .agents/skills/

# Claude Code
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse support-to-product .claude/skills/
```

```sh
# Codex
mkdir -p .agents/skills
cp -R support-to-product .agents/skills/

# Claude Code
mkdir -p .claude/skills
cp -R support-to-product .claude/skills/
```

For [Claude in the browser](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills), ZIP the `support-to-product` folder. Upload the ZIP under **Customize → Skills** and ask Claude to use Support to Product.

## Try the meeting room demo

In Codex, enter `$support-to-product Analyze the bundled meeting room tickets. Show the count, source examples, and what we still need to learn for each theme.` In Claude Code, use the same prompt after `/support-to-product`.

The [fictional ticket export](assets/example-tickets.csv) has 12 rows and 11 unique tickets. The [example product readout](assets/example-readout.md) groups 10 tickets into four themes and leaves one ticket for clarification. One ticket covers two distinct goals. Each theme counts that ticket once.

## Use your own tickets

Provide an export or paste a set of tickets. Include ticket IDs, dates, and customer messages where possible. State any relevant scope, such as a date range, product, or support channel. The example uses CSV. JSON exports and readable ticket notes also work.

[MIT License](LICENSE)
