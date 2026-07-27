# Complete task

Archive a task after Review Gate approval.

**Trigger:** `"Complete task"` or `/deepspec.complete-task`

**Requires:** `COMPLETION_REPORT.md` status `[IN REVIEW]`

- Sets status to `[DONE]`
- Moves `active/` → `archive/`
- Indexes entry in `memory.md`
