# Vision Data Audit

Audit an image classifier for capture groups shared between training and test sets, predictions that change when only the background changes, and training labels worth reviewing.

## Install in Codex and Claude Code

Use Git and Node.js 20 or later. Replace `../your-project` with the path to the project you want to audit.

```sh
git clone https://github.com/assafsela-ai/ml-reliability-lab.git
cd ml-reliability-lab
npm run install:skill -- "../your-project"
```

Open a new session in that project and invoke the skill.

| Tool | Project skills directory | Invoke |
| --- | --- | --- |
| Codex | `.agents/skills/` | `$vision-data-audit` |
| Claude Code | `.claude/skills/` | `/vision-data-audit` |

Ask it to audit an image classification manifest or use your split metadata to prepare one. Image features and paired predictions provide evidence for the label and background checks.

- [View the skill source on GitHub](https://github.com/assafsela-ai/ml-reliability-lab/tree/main/skills/vision-data-audit)
- [Open the interactive demo](https://assafsela-ai.github.io/ml-reliability-lab/)
- [Read the ML Reliability Lab case study](https://assafsela-ai.github.io/Assaf-Sela/work/ml-reliability-lab/)
