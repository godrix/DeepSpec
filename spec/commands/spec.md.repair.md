---
description: Repair spec.md tracking after file renames or moves. Realigns tracking.json with current task paths from APPROACH.md artifacts. Maintenance only — never edits A-B-C prose. Can migrate legacy `.deepspec/` to `.spec.md/` when requested.
---

## User Input

```text
$ARGUMENTS
```

Optional: task slug to repair. Empty repairs all tracked tasks.

## Outline

You are reconciling `.spec.md/tracking.json` so task slugs stay linked to current file paths after refactors.

This is **plumbing**, not a workflow phase. It does **not** edit A-B-C artifacts — only `tracking.json`.

### Step 0 (optional): Migrate legacy `.deepspec/`

If `.deepspec/` exists and `.spec.md/` does not:

1. `mv .deepspec .spec.md`
2. Update `manifest.json` and `tracking.json` so `"name": "spec.md"`
3. Re-run `npx @godrix/spec.md init <agent>` to refresh skills (idempotent)

### Step 1: Collect observed entries

For each task slug in scope (one slug from input, or all tasks in `drafts/`, `active/`, `archive/`):

1. Read `APPROACH.md` from the task folder
2. Extract paths from `## Affected Files` table
3. Determine stage from folder location (`drafts` | `active` | `archive`)
4. Build `{ name: slug, stage, paths: [...] }`

If tracking and artifacts disagree on stage, trust the filesystem folder.

### Step 2: Run repair hook

```bash
node ./.spec.md/hooks/repair.mjs '{"entries":[{"name":"<slug>","stage":"active","paths":["src/..."]}]}'
```

Pass all observed entries in one payload.

### Step 3: Resolve unresolved items

The hook returns `unresolved` entries:

- **`renamed-candidate`:** paths match a different slug — confirm with user before reassigning.
- **`orphan`:** slug in tracking but no task folder — ask user before removing.

### Step 4: Summarize

Report what was reconciled, anything still unresolved, and suggest:

```
chore: repair spec.md tracking map
```

Other commands may invoke repair automatically when they detect path inconsistencies.
