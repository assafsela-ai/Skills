# Document Failure Lab

Find which invoice fields break when the image changes. Start with one synthetic invoice, create three independent variants, and run the clean image and all variants through the same extractor. Import the returned values to get a field-by-field Markdown and CSV report.

| Image | Change |
| --- | --- |
| `clean.png` | Clean image for comparison |
| `stamp.png` | A translucent stamp over the amount |
| `tilt.png` | A 6° rotation with enough padding to keep the whole invoice |
| `blur.png` | Blur inside one selected line |

## Install

Requires Python 3.10 or later. From the **Skills** repository root, install Pillow in your Python environment.

```sh
python -m pip install -r document-failure-lab/requirements.txt
```

Copy the entire `document-failure-lab` folder into your project's skills directory. Open the agent from that project.

| Agent | Project directory | Invoke |
| --- | --- | --- |
| [Codex](https://developers.openai.com/codex/skills) | `.agents/skills/` | `$document-failure-lab` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `.claude/skills/` | `/document-failure-lab` |

You can also run the scripts directly. The scripts work on local files and need no API key.

## Run the demo

Ask the skill to run the bundled demo, or run these commands from the repository root. The generator prints the new run folder.

**PowerShell**

```powershell
$lab = 'document-failure-lab'
$run = python "$lab/scripts/generate_variants.py" "$lab/assets/invoice.png" "$lab/assets/invoice-case.json"
if ($LASTEXITCODE -ne 0) { throw 'Variant generation failed.' }
python "$lab/scripts/compare_results.py" "$run" "$lab/assets/simulated-results.json"
```

**macOS or Linux**

```sh
lab=document-failure-lab
run=$(python3 "$lab/scripts/generate_variants.py" "$lab/assets/invoice.png" "$lab/assets/invoice-case.json") &&
  python3 "$lab/scripts/compare_results.py" "$run" "$lab/assets/simulated-results.json"
```

Open `report.md` or `report.csv` in the run folder. The demo uses **simulated results**. On the clean invoice, the total is 125.40. In the stamp example, the imported value is 120.00, which matches the subtotal. The report flags the change. The blurred date provides a second example of a field that went missing.

## Test your own extractor

1. Provide a synthetic PNG or JPEG invoice. Copy the [example case](assets/invoice-case.json) and replace its expected values and two target rectangles. See the [run format](references/run-format.md) for the coordinate and value rules.
2. Run the generator with your image and case JSON. It creates a new folder under `output/document-failure-lab/` with four images, a manifest and an empty results template.
3. Submit the four PNGs to your extractor with the same model and settings. Copy `results-template.json` and fill it with the returned values. Leave untested variants as `null`. The [results example](assets/simulated-results.json) shows a filled-in file.
4. Run `compare_results.py` with the run folder and your filled-in JSON. The reports show all fields, errors on the clean image, and regressions where a correct clean result became wrong or missing.

Run the acceptance tests from the repository root with `python -m unittest discover -s document-failure-lab/tests -v`.

[MIT License](LICENSE)
