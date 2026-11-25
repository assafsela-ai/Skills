---
name: document-review-lab
description: Run a document extraction review lab with synthetic invoices, purchase orders, and receipts. Use when a team wants to check extracted fields against their source lines, practice human review, or compare failure patterns across examples.
---

# Document Review Lab

[Open the interactive lab](https://assafsela-ai.github.io/Skills/document-review-lab/). It uses three synthetic documents and fixed results that illustrate what an AI extractor might return. The results demonstrate failure types, not a model's performance.

## Run a review

1. Select a document and a field. Read the cited line and check that its label and context support the extracted value. The same value can appear under several labels.
2. Confirm a supported field. For an error, copy the value as printed and select the line that supports it. Save the correction. Review missing values against the whole document.
3. Read the summary across the three documents. It shows the original errors by type, the number of fields reviewed, and the errors still present in the saved results.

## Guide a review in chat

Use the [bundled fixtures](assets/fixtures.js) when the user asks for a walkthrough. For each field, the **expected** pair is the answer key and the **extracted** pair is the draft. A **source** number refers to a line within the same document, starting at 1. A null source means no line was cited.

Show the document with line numbers and the extracted values with their cited lines. Keep the expected pairs out of the first view so the reviewer can make a decision. Accept corrections as a value and a line number. Compare the saved pair with the expected pair when giving feedback. If neither a correction nor confirmation is supported by the text, identify the discrepancy and let the reviewer try again.

Count each field once. Count a blank expected-to-be-present value as **Missing value**, a different value as **Wrong value**, and a correct value with an unsupported line as **Wrong source**. Compare the original results and the saved results. Cite a short example of each observed pattern and keep the denominator visible. Use the user's language for the walkthrough.
