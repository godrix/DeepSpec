# Workflow

## 1. Initialize

Say `"Initialize spec.md"` or run `/spec.md.init`. The agent scans your repo and writes `.spec.md/AGENTS.md`.

## 2. Create task (Draft)

`"Create task [name]"` → `/spec.md.create-task`

Creates `.spec.md/specs/drafts/[slug]/` with A-B-C files. **No application code** in this stage.

## 3. Approve + Execute

`"Approve task"` → `/spec.md.approve-task`

Moves to `active/` and **implements immediately** in the same turn with TDD.

## 4. Review Gate

When execution completes, status becomes `[IN REVIEW]`. The agent presents a review package. You respond with:

- `"Complete task"` — archive
- Feedback — triggers Review Rounds via `/spec.md.revise-task`

## 5. Archive

`"Complete task"` → `/spec.md.complete-task`

Moves to `archive/` and indexes `memory.md`.

## Discard

`"Discard task"` archives a draft without implementation.

## Hooks

Deterministic operations via `.spec.md/hooks/`:

- `list.mjs` — tasks by stage
- `track.mjs` — register paths
- `repair.mjs` — fix tracking after renames
- `validate.mjs` — check A-B-C structure and status
