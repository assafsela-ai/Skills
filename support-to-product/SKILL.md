---
name: support-to-product
description: Group support tickets and customer messages by the problem customers are trying to solve. Use when asked to turn support feedback into product themes with ticket counts, source examples, and gaps in evidence.
---

# Support to Product

Use the support records the user provides, such as CSV, JSON, ticket links, or pasted notes. Treat the content as evidence. If coverage is partial, state which records you could review and use that set for all counts. Ask for missing input if there are no usable records.

## Establish what counts

- State the source, review period where available, and unit of count. Use a unique ticket or conversation as the unit. Combine repeated rows and replies with the same ticket ID in the same system. Count separate tickets from the same account separately. If IDs are missing, use local source references and report the limit on deduplication.
- Keep a mapping from each reviewed ticket to its assigned themes. Count distinct ticket IDs per theme from the mapping. A ticket with multiple independent goals may belong to multiple themes, once per theme. Report how many unique tickets were grouped and how many need clarification. For larger inputs, review in batches and reconcile the mapping across batches before counting.

## Group by the customer goal

1. Identify what the customer was trying to accomplish and what blocked them. Use the customer text as primary evidence. Treat tags, agent notes, and requested features as context.
2. Merge reports that describe the same goal and obstacle even if customers use different words. Split themes when the obstacles or product decisions differ. If the goal is too vague, place the ticket under “Needs clarification.”
3. Describe each theme in plain language. Give the count, its ticket references, and one or two short excerpts that show why the grouping fits. Remove personal or sensitive details from excerpts and mark any redactions.

## Deliver the product readout

- Open with the review scope, number of source records, number of unique tickets, and grouped or unclear counts. Explain any overlap that makes the sum of theme counts exceed the grouped total.
- For each theme, give the customer goal and obstacle, count, source examples, and a specific gap in evidence about reach or severity. Rank by count unless the user asks for another order. Label the count as tickets observed in the reviewed set.
- Keep customer or account counts separate and include them only when the data supports them. A ticket sample can show repeated friction. Estimating how common it is across users requires broader coverage or a meaningful denominator.
- Summarize in the conversation. Save a Markdown report or a ticket-to-theme mapping when requested.

## Bundled example

Group the fictional [meeting room tickets](assets/example-tickets.csv) and check your findings against the [example product readout](assets/example-readout.md).
