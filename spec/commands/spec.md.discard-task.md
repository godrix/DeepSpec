---
description: Discard a draft task without implementation. Moves the task from drafts/ to archive/, indexes memory.md as [discarded], and sets COMPLETION_REPORT status to [DISCARDED].
---

## User Input

```text
$ARGUMENTS
```

Optional: discard reason in the same message.

## Outline

You are abandoning a **draft** without implementation.

### Step 1: Locate the draft

- Use the draft in context. If ambiguous, ask once.
- If the task is in `active/`, **refuse** — use Review Gate or complete execution first.

### Step 2: Move to archive

- Move `.spec.md/specs/drafts/[slug]/` → `.spec.md/specs/archive/[slug]/` (never through `active/`).

### Step 3: Update COMPLETION_REPORT

- Set `Status: [DISCARDED]`
- Record discard date
- Add **Discard reason** if the user provided one

### Step 4: Index memory.md

Append under **Archived Tasks** (reconcile — do not duplicate the same slug):

```
[YYYY-MM-DD] [slug]: [discarded] <reason or one-line summary>. Ref: specs/archive/[slug]
```

### Step 5: Update tracking

```bash
node ./.spec.md/hooks/track.mjs '{"entries":[{"name":"<slug>","stage":"archive","paths":[]}]}'
```

### Step 6: Announce

_"Draft discarded and archived. No implementation was started."_

**Do not** write application code or mark acceptance criteria as done.
