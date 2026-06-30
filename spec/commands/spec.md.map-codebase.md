---
description: Deep-scan an existing repository and rewrite `.spec.md/AGENTS.md` with tech stack, standards, testing, personas, and a Repository Map. Planning only — no application code.
---

## User Input

```text
$ARGUMENTS
```

Optional: paths or areas to prioritize (e.g. `src/api`, `mobile`). Empty scans the whole workspace.

## Outline

You are **mapping a brownfield codebase** into `.spec.md/AGENTS.md` so future tasks load accurate context.

This is **planning / documentation only** — do **not** modify application source code.

### Step 1: Preconditions

- Require `.spec.md/manifest.json`. If missing, tell the user to run `/spec.md.init` first.
- Read current `.spec.md/AGENTS.md` as baseline (preserve user edits where still accurate).

### Step 2: Structured discovery scan

Inspect (read-only):

| Area                           | What to extract                                                            |
| ------------------------------ | -------------------------------------------------------------------------- |
| Package manifests              | `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, etc.             |
| Source layout                  | Top-level dirs (`src/`, `lib/`, `app/`, `packages/`) — 1-line purpose each |
| Lint/format                    | ESLint, Prettier, Ruff, editorconfig                                       |
| Tests                          | Runner, config, test folder conventions                                    |
| CI/CD                          | `.github/workflows/`, GitLab CI, etc.                                      |
| Root `AGENTS.md` / `README.md` | Existing conventions                                                       |
| Recent commits                 | `git log -5 --oneline` for active areas                                    |

If User Input names paths, weight those in the Repository Map.

### Step 3: Rewrite `.spec.md/AGENTS.md`

Use `templates/AGENTS.template.md` structure and fill:

- **Tech Stack**, **Coding Standards**, **Testing Setup**, **Agent Personas**
- **Repository Map** (new section after Tech Stack):

```markdown
## Repository Map

| Path        | Role                          |
| ----------- | ----------------------------- |
| `src/core/` | CLI scaffold, hooks, manifest |
| …           | …                             |
```

Replace `[PLACEHOLDER]` tokens. Use `TBD` only when discovery fails — list what you could not detect.

### Step 4: Summarize for the user

Present a short diff-style summary (what changed vs previous AGENTS.md). Do **not** create a task.

**Next steps:** `/spec.md.create-task` to plan work, or `/spec.md.init` if agent commands need reinstall.
