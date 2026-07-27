# Install

## CLI (recommended)

```bash
npx deep-spec init cursor-agent
```

Replace `cursor-agent` with your agent key. Run `npx deep-spec --help` for the full list.

## What init creates

```
.deepspec/
├── AGENTS.md
├── memory.md
├── templates/
├── hooks/
└── specs/
    ├── drafts/
    ├── active/
    └── archive/
```

Agent commands are installed in the native directory (e.g. `.cursor/skills/deepspec.create-task/SKILL.md`).

## Manual install

Copy `deep-spec/` to `.cursor/skills/deep-spec/` for the orchestrator skill only. For full command support, use the CLI.

## Re-init

`npx deep-spec init` is idempotent — existing files are never overwritten.
