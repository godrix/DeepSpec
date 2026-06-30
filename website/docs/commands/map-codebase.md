# Map codebase

Re-scan the repository and refresh `.spec.md/AGENTS.md`.

**Trigger:** `"Map codebase"`, `"Refresh AGENTS"`, or `/spec.md.map-codebase`

Requires an initialized `.spec.md/` folder. Planning only — no application code changes.

The agent performs a structured discovery pass (source tree, manifests, CI, lint/format, test runner, npm scripts, existing root `AGENTS.md`, recent commits) and rewrites `.spec.md/AGENTS.md` with required sections plus a **Repository Map** table of key modules and folders.

Presents a diff summary to the user. Does not create or move tasks.
