# Backlog format

Save `backlog.json` as UTF-8 JSON with this structure:

```json
{
  "stories": [
    {
      "id": "US-001",
      "title": "Find available rooms",
      "story": "As an employee, I want to find available meeting rooms so I can choose a room that fits my meeting.",
      "acceptance_criteria": [
        "The employee can search by date, time slot, and minimum capacity."
      ],
      "sources": [
        {
          "start_line": 7,
          "end_line": 7,
          "quote": "minimum capacity"
        }
      ]
    }
  ],
  "open_questions": []
}
```

- `stories` is an ordered list. IDs are unique and use `US-` followed by at least three digits. Each story has a non-empty title, story, list of acceptance criteria, and list of sources.
- Source line numbers are one-based and inclusive. Count headings and blank lines. Use the smallest line range that contains the quote. Copy the quote as it appears in `source.md`, including line breaks when needed. Use multiple entries when a story depends on separate parts of the spec.
- `open_questions` is a list of strings. Include a story ID where it helps the reader find the related story. Questions stay in the draft.
- The exporter keeps the draft's story order. Each acceptance criterion appears on its own line inside the CSV cell. Source entries include the filename, line range, and quote. Spreadsheet formula prefixes are escaped as text.
