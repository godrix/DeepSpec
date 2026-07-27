# Create task

Create a draft task with A-B-C documentation.

**Trigger:** `"Create task [name]"` or `/deepspec.create-task`

- Normalizes name to kebab-case slug
- Generates `APPROACH.md`, `BUSINESS_CONTEXT.md`, `COMPLETION_REPORT.md`
- **No application code** — planning only

Respond with `"Approve task"`, `"Discard task"`, or feedback.
