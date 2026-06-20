---
description: Create a new DeepSpec task in drafts/ with the A-B-C documentation flow (APPROACH, BUSINESS_CONTEXT, COMPLETION_REPORT). Planning only — no application code. Optionally scope by task name, affected paths, or a free-form description.
---

## User Input

```text
$ARGUMENTS
```

The User Input decides scope:

- **Task name** (e.g. `auto-save-by-sound`): create draft for that feature.
- **Paths** (e.g. `src/api/upload.ts`): infer task scope from affected files.
- **Description** (e.g. `add retry logic to payment webhook`): plan from the described concern.
- **Empty:** ask the user what task to create before proceeding.

## Outline

You are creating a **draft task** under `.deepspec/specs/drafts/`. This phase is **planning only** — do **NOT** modify application code.

### Step 1: Resolve the task slug

- Normalize the task name to **kebab-case** (e.g. `Auto Save by Sound` → `auto-save-by-sound`).
- If a folder with that slug already exists in `drafts/`, `active/`, or `archive/`, **stop** and ask for a different name. Do **not** auto-append numbers.
- The slug is the task's identity across all stages.

### Step 2: Load context (strict order)

1. Open files & terminal output
2. `.deepspec/AGENTS.md`
3. `.deepspec/memory.md`
4. Existing specs in `active/` or `drafts/`
5. Project source (especially paths named in input)
6. Ask the user as last resort

### Step 3: Create the task folder

Create `.deepspec/specs/drafts/[slug]/` and generate three files from templates:

- `APPROACH.md` — from `templates/APPROACH.template.md`
- `BUSINESS_CONTEXT.md` — from `templates/BUSINESS_CONTEXT.template.md`
- `COMPLETION_REPORT.md` — from `templates/COMPLETION_REPORT.template.md` with `Status: [PENDING]`

Fill templates according to **task sizing**:

| Size   | Scope                | Density                          |
| ------ | -------------------- | -------------------------------- |
| Small  | < 2h, 1–3 files      | Bullet steps; AC as bullets      |
| Medium | half-day, 3–10 files | Full A-B-C (default)             |
| Large  | > 1 day, 10+ files   | Full A-B-C + diagram in APPROACH |

Replace `[name]` with the human-readable task title. Match documentation density to scope — do not pad.

### Step 4: Register paths in tracking (optional)

If affected files are known, run the track hook from project root:

```bash
node ./.deepspec/hooks/track.mjs '{"entries":[{"name":"<slug>","stage":"draft","paths":["src/..."]}]}'
```

Paths live in `tracking.json`, not duplicated in prose artifacts.

### Step 5: Present for review

Tell the user the folder slug (e.g. `auto-save-by-sound`). Ask them to review A-B-C docs and respond with `"Approve task"`, `"Discard task"`, or feedback.

**NO CODE RULE:** Do not create or modify files under `src/`, `app/`, `lib/`, or other application directories in this phase.
