---
name: ai-workflow-roi-calculator
description: Estimate and compare the ROI, break-even volume, payback, and human time saved for AI workflow automation. Use when deciding whether to automate a manual workflow or comparing model costs and human review plans. Also provides an offline browser calculator for this comparison.
---

# AI Workflow ROI Calculator

Compare one workflow's manual cost with one or more automation scenarios at the same monthly volume. Reply in the user's language. [Open the browser calculator](https://assafsela-ai.github.io/Skills/ai-workflow-roi-calculator/) on GitHub Pages. For offline use, open [index.html](index.html) in a browser with the full skill folder intact.

## Collect inputs

Ask for missing required values in one short message. Use user estimates when available and label them in the result. Include retries or multiple model calls in the supplied cost per task. Include expected correction work in human review time where relevant. Use the same currency for all costs.

| Field | Unit and default |
| --- | --- |
| `baseline.monthlyVolume` | Whole tasks per month, required |
| `baseline.manualMinutes` | Minutes of manual work per task, required |
| `baseline.hourlyCost` | Cost per hour of human work, required |
| `baseline.currency` | Three-letter currency code, defaults to USD |
| `baseline.months` | Whole months to compare, defaults to 12 |
| `scenarios[].name` | Scenario name, required |
| `scenarios[].modelCost` | Model cost per task, required |
| `scenarios[].reviewMinutes` | Minutes per reviewed task, required |
| `scenarios[].reviewPercent` | Percent of tasks reviewed, defaults to 100 |
| `scenarios[].monthlyCost` | Recurring fixed monthly cost, defaults to 0 |
| `scenarios[].setupCost` | One-time setup cost, defaults to 0 |

## Run and explain

Pipe a UTF-8 JSON object with a `baseline` object and a nonempty `scenarios` array to `node "<absolute skill path>/scripts/calculate.cjs"`. Resolve the script path relative to this skill. Use structured input or a shell-safe literal. The script writes results as JSON to stdout. Invalid input produces a JSON error on stderr and a nonzero exit code. Ask for a correction using the error's `field` and `code`. If Node.js is unavailable, link to the local browser calculator and explain how to use it.

For example:

```json
{
  "baseline": {"monthlyVolume": 400, "manualMinutes": 10, "hourlyCost": 120},
  "scenarios": [
    {"name": "Full review", "modelCost": 1, "reviewMinutes": 3, "monthlyCost": 1300, "setupCost": 3900}
  ]
}
```

- Give the manual baseline and period, then a table with each scenario's monthly automation cost, monthly savings, monthly hours saved, operating break-even volume, setup payback, period savings after setup, and ROI.
- Use `comparison.bestScenarioIndexes` to identify the best automation scenarios, including ties, and `comparison.status` to say if the manual process costs less, ties with the best, or costs more.
- Interpret `operatingBreakEven.status` as `threshold` (minimum whole tasks per month), `equal` (equal costs at every volume), or `unreachable` (higher automation costs at any positive volume). A threshold of zero means every positive volume meets the operating break-even. The threshold excludes setup costs.
- Interpret `payback.status` as `months`, `no_setup_cost`, or `unreachable` (monthly savings must be positive to recover setup). A null `roiPercent` means total automation cost is zero. Use plain language for these cases.
- Note the constant-volume assumption and the shared hourly cost for manual work and review. Monthly savings include the estimated value of staff time. Describe it as cash savings only if the user confirms a direct reduction in spending.
