# Map codebase

Re-scan the repository and refresh `.deepspec/AGENTS.md`.

**Trigger:** `"Map codebase"`, `"Refresh AGENTS"`, or `/deepspec.map-codebase`

Requires an initialized `.deepspec/` folder. Planning only — no application code changes.

The agent performs a structured discovery pass (source tree, manifests, CI, lint/format, test runner, npm scripts, existing root `AGENTS.md`, recent commits) and rewrites `.deepspec/AGENTS.md` with required sections plus a **Repository Map** table of key modules and folders.

Presents a diff summary to the user. Does not create or move tasks.
