---
description: Bootstrap DeepSpec in the current project. Creates `.deepspec/` scaffolding, copies templates and hooks, installs agent commands, and generates AGENTS.md from a context discovery scan of the repository.
---

## User Input

```text
$ARGUMENTS
```

This command is typically triggered by `"Initialize DeepSpec"` or when `.deepspec/` is missing.

## Outline

You are initializing **DeepSpec** (Spec-Driven Development) in the current project.

### Step 1: Check if already initialized

- If `.deepspec/manifest.json` exists, tell the user DeepSpec is already initialized. Suggest `npx deep-spec init <agent>` only if they need agent commands reinstalled. Do **not** overwrite existing files.

### Step 2: Verify scaffold (CLI path)

If the user ran `npx deep-spec init <agent>`, the CLI already created:

```
.deepspec/
├── AGENTS.md
├── memory.md
├── manifest.json
├── tracking.json
├── templates/
├── hooks/
└── specs/
    ├── drafts/
    ├── active/
    └── archive/
```

If `.deepspec/` is missing, create the structure above manually. Copy templates from `templates/` (or `.deepspec/templates/` if present):

- `templates/AGENTS.template.md` → `.deepspec/AGENTS.md` (placeholder until Step 3)
- `templates/memory.template.md` → `.deepspec/memory.md`

Ensure `specs/drafts/`, `specs/active/`, and `specs/archive/` directories exist.

### Step 3: Context Discovery → AGENTS.md

Scan the project (package manifest, lint config, test runner, CI, commit history) and **rewrite** `.deepspec/AGENTS.md` with at least:

- **Tech Stack** (languages, frameworks, runtimes)
- **Coding Standards** (lint/format rules in use)
- **Testing Setup** (test runner, conventions)
- **Agent Personas** (e.g., "Mobile RN engineer", "Backend Node")

Replace all `[PLACEHOLDER]` tokens from the template with discovered values. If something is unknown, mark it as `TBD` and note it in your summary.

### Step 4: Present for review

Show the generated `AGENTS.md` summary to the user. Ask them to review before creating any task.

**Next step:** Run `/deepspec.create-task` (or say `"Create task [name]"`) when ready to plan work.
