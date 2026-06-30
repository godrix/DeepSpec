---
description: Bootstrap spec.md in the current project. Creates `.spec.md/` scaffolding, copies templates and hooks, installs agent commands, and generates AGENTS.md from a context discovery scan of the repository.
---

## User Input

```text
$ARGUMENTS
```

This command is typically triggered by `"Initialize spec.md"` or when `.spec.md/` is missing.

## Outline

You are initializing **spec.md** (Spec-Driven Development) in the current project.

### Step 1: Check if already initialized

- If `.spec.md/manifest.json` exists, tell the user spec.md is already initialized. Suggest `npx @godrix/spec.md init <agent>` only if they need agent commands reinstalled. Do **not** overwrite existing files.

### Step 2: Verify scaffold (CLI path)

If the user ran `npx @godrix/spec.md init <agent>`, the CLI already created:

```
.spec.md/
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

If `.spec.md/` is missing, create the structure above manually. Copy templates from `templates/` (or `.spec.md/templates/` if present):

- `templates/AGENTS.template.md` → `.spec.md/AGENTS.md` (placeholder until Step 3)
- `templates/memory.template.md` → `.spec.md/memory.md`

Ensure `specs/drafts/`, `specs/active/`, and `specs/archive/` directories exist.

### Step 3: Context Discovery → AGENTS.md

Run the same structured discovery as `/spec.md.map-codebase` (read-only):

| Area | What to extract |
|------|-----------------|
| Package manifests | Languages, frameworks, package manager |
| Source layout | `src/`, `lib/`, `packages/` — purpose per top-level dir |
| Lint/format | ESLint, Prettier, Ruff, etc. |
| Tests | Runner, conventions, coverage |
| CI/CD | `.github/workflows/` or equivalent |
| Root docs | `README.md`, root `AGENTS.md` if present |

**Rewrite** `.spec.md/AGENTS.md` with:

- **Tech Stack**, **Coding Standards**, **Testing Setup**, **Agent Personas**
- **Repository Map** (table: Path | Role for key modules)

Replace all `[PLACEHOLDER]` tokens. Use `TBD` only when discovery fails.

### Step 4: Present for review

Show the generated `AGENTS.md` summary to the user. Ask them to review before creating any task.

**Next step:** Run `/spec.md.create-task` (or say `"Create task [name]"`) when ready to plan work.
