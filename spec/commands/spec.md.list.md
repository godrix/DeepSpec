---
description: List spec.md tasks by pipeline stage (drafts, active, archive) with COMPLETION_REPORT status. Read-only — changes nothing.
---

## User Input

```text
$ARGUMENTS
```

Optional: stage filter (`drafts`, `active`, or `archive`). Empty lists all stages.

## Outline

List tasks currently in the spec.md pipeline.

### Step 1: Run the hook

From project root:

```bash
node ./.spec.md/hooks/list.mjs '{"stage":"<optional-stage>"}'
```

Pass empty `{}` or omit stage to list all.

### Step 2: Report

Present exactly what the hook printed, grouped by stage. If no tasks exist, say so and suggest `/spec.md.create-task`.

This command changes nothing — read and report only.
