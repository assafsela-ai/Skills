---
name: document-failure-lab
description: Test how image changes affect invoice field extraction. Use when asked to generate stamped, tilted, or blurred invoice variants, import results from a document extraction system, or compare field-level regressions.
---

# Document Failure Lab

Use a synthetic PNG or JPEG invoice. Read [the input and results format](references/run-format.md) when preparing a case file or mapping extraction output.

[Open the interactive demo](https://assafsela-ai.github.io/Skills/document-failure-lab/) for a visual walkthrough of the bundled images and simulated results.

## Generate a run

- For the demo, use [the bundled invoice](assets/invoice.png) and [its case file](assets/invoice-case.json).
- For a new case, get the expected values from the user or their answer key. Ask for the two target rectangles or show suggested rectangles for review if image inspection is available. Use the pixel grid of the image after its orientation is applied.
- Run [the generator](scripts/generate_variants.py) with the invoice and case JSON paths. Use the script path relative to the installed skill directory. The script needs Python and Pillow and prints the new run folder.
- Give the user the four image files and the results template. Ask them to send each image through the same extraction setup and return the results JSON. The manifest contains the expected answers, so use only the images as model inputs.

## Compare results

- Use [the example results](assets/simulated-results.json) only for the demo. For a real run, use the outputs the user provides. If the fields have other names, map them to the declared field IDs and preserve the extracted values.
- Run [the comparison script](scripts/compare_results.py) with the run folder and results JSON. Share `report.md` and `report.csv`.
- Point out fields that were correct on the clean image and failed on a variant. Report any clean-image errors separately. Call out skipped variants and identify demo results as simulated.
