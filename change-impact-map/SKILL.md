---
name: change-impact-map
description: Compare two versions of a product spec and map requirement changes to affected backlog items, acceptance criteria, and tests. Use when asked what a spec change affects or what to update in an existing backlog.
---

# Change Impact Map

Use the old spec, revised spec, and current backlog. Accept file paths or pasted text. Read any test artifacts the user supplied. If a required input is missing, ask for it instead of guessing what changed or which story IDs exist. Resolve bundled example paths from this skill directory.

## Compare and trace

1. Identify differences in product behavior, including additions, removals, and changes to thresholds, permissions, or exceptions. Cite both versions by filename and line or section. Separate behavior changes from wording changes and shifted line references.
2. Trace each changed requirement to backlog items. Use the story ID, affected field or criterion, and source reference when available. Check dependent stories for actual signs of impact, such as a shared rule or matching criterion. Mark uncertain matches for review. If a changed requirement has no matching item, call that out and suggest a new story or a decision.
3. Propose a minimal edit for each confirmed impact. Show the current text and the proposed text. Keep existing story IDs and update affected source quotes and line numbers to match the revised spec. For a removed requirement, propose what to remove or close. Keep unrelated fields as they are.
4. Map existing tests when their evidence is available. Otherwise show suggested checks. Include the exact boundary and both sides when a threshold changes. Call out decisions the revised spec leaves open.

## Deliver the map

- Start with a short statement of what changes for the user.
- List each confirmed backlog impact with the story ID, exact edit, and old and new source references. Group related changes when they affect the same story.
- List suggested tests and unresolved decisions when they apply. Briefly say what evidence is missing when a match or test impact is uncertain.
- Report proposed edits for review by default. If asked for a revised backlog draft, write a separate copy in the workspace using the original format. Edit the existing backlog only when that is explicitly requested.

## Bundled demo

For the meeting room demo, compare [the original spec](assets/spec-before.md) and [the revised spec](assets/spec-after.md) against [the current backlog](assets/backlog-before.json). Use [the example impact map](assets/impact-map.md) and [the revised backlog](assets/backlog-after.json) as references after comparing the inputs.
