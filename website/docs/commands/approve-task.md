# Approve task

Approve a draft and implement immediately.

**Trigger:** `"Approve task"` or `/spec.md.approve-task`

- Moves `drafts/[slug]/` → `active/[slug]/`
- Locks `## Execution Plan` as immutable contract
- Starts TDD execution **in the same turn**

Never stop at "ready for implementation" — approval means execute now.
