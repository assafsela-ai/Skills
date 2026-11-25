# Document Failure Lab

Find which invoice fields break when the image changes. Start with one synthetic invoice, create three independent variants, and run the clean image and all variants through the same extractor. Import the returned values to get a field-by-field Markdown and CSV report.

| Image | Change |
| --- | --- |
| `clean.png` | Clean image for comparison |
| `stamp.png` | A translucent stamp over the amount |
| `tilt.png` | A 6° rotation with enough padding to keep the whole invoice |
| `blur.png` | Blur inside one selected line |

[Open the interactive demo](https://assafsela-ai.github.io/Skills/document-failure-lab/) to switch between the four images and compare the simulated results for each field.

## Use your own invoice in the browser

[Open the invoice workspace](https://assafsela-ai.github.io/Skills/document-failure-lab/your-invoice.html). It processes files locally and needs no installation or API key.

1. Choose a PNG or JPEG, up to 20 MB. Adjust the stamp and blur areas, then generate the four images. Large images are resized to a longest side of 2,800 pixels.
2. Select **Extract all four images**. Local OCR reads the invoice number, invoice date, supplier, subtotal and total in English and Hebrew. The app downloads its OCR assets on first use. The invoice and the extracted text stay in the browser.
3. Select any variant to see the OCR value from Clean beside the value from that image. Missing or changed values are highlighted when OCR read a reference value on Clean. Extraction depends on image quality and recognizable field labels. Check the Clean values before interpreting differences.

To test a different extractor, expand **Import results from another extractor**. Download the PNGs and run them with the same settings. Fill in the [browser results template](assets/demo/results-template.json) and import it. Omit a variant or use `null` if it was skipped. Use `null` or omit a field if a tested variant did not return it.

For a check against known values in an imported file, add a top-level `fields` object, for example `"fields": {"total_amount": {"type": "amount", "expected": "125.40"}}`. Use decimal strings for amounts. Use `"type": "text"` for text values. Imports support up to 1 MB and 200 comparison fields.

The browser uses self-hosted [Tesseract OCR assets](assets/ocr/README.md). Run the field parser tests with Node.js 22 or later and `node --test document-failure-lab/tests/invoice-fields.test.mjs`.


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
