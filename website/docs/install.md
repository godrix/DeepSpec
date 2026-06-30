# Install

## CLI (recommended)

```bash
npx @godrix/spec.md init cursor-agent
```

Replace `cursor-agent` with your agent key. Run `npx @godrix/spec.md --help` for the full list.

## What init creates

```
.spec.md/
├── AGENTS.md
├── memory.md
├── templates/
├── hooks/
└── specs/
    ├── drafts/
    ├── active/
    └── archive/
```

Agent commands are installed in the native directory (e.g. `.cursor/skills/spec.md.create-task/SKILL.md`).

## Manual install

Copy `spec.md/` to `.cursor/skills/spec.md/` for the orchestrator skill only. For full command support, use the CLI.

## Re-init

`npx @godrix/spec.md init` is idempotent — existing files are never overwritten.
