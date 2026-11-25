# Example with two meetings

## First chat

User prompt

> Use $meeting-decisions-tracker on these notes.

Notes for meeting 1

```text
We agreed to keep the pilot invite-only.
Maya will revise the pilot FAQ by May 14.
We agreed that someone will draft the support checklist.
Noa will draft the onboarding checklist by May 19.
We discussed making the pilot public in June. The decision is still open.
```

### Report after meeting 1

Copy this report into the next chat with the new notes.

````markdown
# Meeting decisions

## Decisions

| ID | Decision | Source |
| --- | --- | --- |
| D-01 | Keep the pilot invite-only. | [M01-L01](#m01-l01) |

## Tasks

| ID | Action | Owner | Due date | Status | Sources |
| --- | --- | --- | --- | --- | --- |
| T-01 | Revise the pilot FAQ. | Maya | May 14 | Not stated | [M01-L02](#m01-l02) |
| T-02 | Draft the support checklist. | Not stated | Not stated | Not stated | [M01-L03](#m01-l03) |
| T-03 | Draft the onboarding checklist. | Noa | May 19 | Not stated | [M01-L04](#m01-l04) |

## Open questions

- Who owns T-02, and when is it due? [M01-L03](#m01-l03)
- Should the pilot go public in June? [M01-L05](#m01-l05)

## Task history

No updates yet.

## Sources

#### M01-L01

> We agreed to keep the pilot invite-only.

#### M01-L02

> Maya will revise the pilot FAQ by May 14.

#### M01-L03

> We agreed that someone will draft the support checklist.

#### M01-L04

> Noa will draft the onboarding checklist by May 19.

#### M01-L05

> We discussed making the pilot public in June. The decision is still open.
````

## New chat

User prompt

> Use $meeting-decisions-tracker to update the previous tracker with these new notes.

The user includes the report after meeting 1 in the message or as a Markdown attachment.

Notes for meeting 2

```text
Maya finished revising the pilot FAQ.
Oren will draft the support checklist by May 20.
One of the two checklists can move to May 22.
```

### Report after meeting 2

#### Decisions

| ID | Decision | Source |
| --- | --- | --- |
| D-01 | Keep the pilot invite-only. | [M01-L01](#m01-l01) |

#### Tasks

| ID | Action | Owner | Due date | Status | Sources |
| --- | --- | --- | --- | --- | --- |
| T-01 | Revise the pilot FAQ. | Maya | May 14 | Done | [M01-L02](#m01-l02), [M02-L01](#m02-l01) |
| T-02 | Draft the support checklist. | Oren | May 20 | Not stated | [M01-L03](#m01-l03), [M02-L02](#m02-l02) |
| T-03 | Draft the onboarding checklist. | Noa | May 19 | Not stated | [M01-L04](#m01-l04) |

#### Open questions

- Should the pilot go public in June? [M01-L05](#m01-l05)
- Does the proposed May 22 deadline apply to T-02 (support) or T-03 (onboarding)? [M02-L03](#m02-l03)

#### Task history

- T-01 · Status updated to Done. [M02-L01](#m02-l01)
- T-02 · Owner set to Oren and due date set to May 20. [M02-L02](#m02-l02)

#### Sources

#### M01-L01

> We agreed to keep the pilot invite-only.

#### M01-L02

> Maya will revise the pilot FAQ by May 14.

#### M01-L03

> We agreed that someone will draft the support checklist.

#### M01-L04

> Noa will draft the onboarding checklist by May 19.

#### M01-L05

> We discussed making the pilot public in June. The decision is still open.

#### M02-L01

> Maya finished revising the pilot FAQ.

#### M02-L02

> Oren will draft the support checklist by May 20.

#### M02-L03

> One of the two checklists can move to May 22.
