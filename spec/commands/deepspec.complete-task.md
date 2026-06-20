---
description: Complete a task after Review Gate approval. Moves active/ to archive/, sets COMPLETION_REPORT to [DONE], and indexes memory.md. Only valid when status is [IN REVIEW].
---

## User Input

```text
$ARGUMENTS
```

Triggered by `"Complete task"` after the user approves at Review Gate.

## Outline

You are **archiving** a completed task. Only the user closes the Review Gate.

### Guards (refuse if not met)

- Task must be in `active/` with `COMPLETION_REPORT.md` → `Status: [IN REVIEW]`.
- If `[IN PROGRESS]`: _"Implementação ainda em andamento. Complete o checklist primeiro."_
- If a Review Round is in progress: _"Rodada de revisão em andamento. Finalize os ajustes."_

Run validation hook before proceeding:

```bash
node ./.deepspec/hooks/validate.mjs '{"slug":"<slug>","expectStatus":"[IN REVIEW]"}'
```

### Step 1: Finalize COMPLETION_REPORT

- Set `Status: [DONE]`
- Record completion date
- Set Review Gate `User decision: approved`

### Step 2: Move to archive

- Move `active/[slug]/` → `archive/[slug]/`

### Step 3: Index memory.md

Append under **Archived Tasks** (reconcile — update if slug already indexed):

```
[YYYY-MM-DD] [slug]: <one-line summary>. Ref: specs/archive/[slug]
```

### Step 4: Capture lessons

If the task surfaced gotchas or reusable patterns, append concise notes under `## Lessons` in `memory.md`.

### Step 5: Update tracking

```bash
node ./.deepspec/hooks/track.mjs '{"entries":[{"name":"<slug>","stage":"archive","paths":[]}]}'
```

### Step 6: Announce

Confirm the task is archived and reference the memory index entry.
