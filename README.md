![spec.md Logo](.github/assets/spec.md.png)

# spec.md

**SDD Framework: The Spec is the Solution.**

spec.md is a zero-ceremony, AI-native Spec-Driven Development (SDD) framework. It guides AI agents from intention to implementation using a strict 3-stage pipeline and the A-B-C documentation flow.

## Quick start

```bash
npx @godrix/spec.md init cursor-agent
```

Then in your agent:

1. `"Initialize spec.md"` — generate `AGENTS.md` from your repo
2. `"Create task [name]"` — draft A-B-C specs (no app code)
3. `"Approve task"` — implement with TDD in the same turn
4. Review at **Review Gate**, then `"Complete task"` to archive

## Pipeline

```
drafts/ → (Approve) → active/ → Review Gate → (Complete) → archive/
```

## A-B-C flow

| Doc                    | Role                                |
| ---------------------- | ----------------------------------- |
| `APPROACH.md`          | How — immutable execution plan      |
| `BUSINESS_CONTEXT.md`  | Why — acceptance criteria for TDD   |
| `COMPLETION_REPORT.md` | Evidence — status and execution log |

## Installation alternatives

**CLI (recommended):**

```bash
npx @godrix/spec.md init <agent>
```

Available agents: `cursor-agent`, `claude`, `copilot`, `opencode`, `cline`, and more — run `npx @godrix/spec.md --help`.

**Manual skill install (retrocompat):**

```bash
mkdir -p .cursor/skills/spec.md
cp -R spec.md/. .cursor/skills/spec.md/
```

## Commands

| Command                   | Trigger                   |
| ------------------------- | ------------------------- |
| `/spec.md.init`          | Initialize spec.md       |
| `/spec.md.create-task`   | Create draft task         |
| `/spec.md.approve-task`  | Approve + execute         |
| `/spec.md.discard-task`  | Discard draft             |
| `/spec.md.complete-task` | Archive after Review Gate |
| `/spec.md.revise-task`   | Review Rounds             |
| `/spec.md.list`          | List tasks by stage       |
| `/spec.md.repair`        | Repair tracking map       |
| `/spec.md.map-codebase`  | Refresh `AGENTS.md` from repo scan |
| `/spec.md.diagram-architecture` | Mermaid `ARCHITECTURE.md` per task |
| `/spec.md.interview`     | One-question approach refinement |

Optional per-task artifact: `ARCHITECTURE.md` (diagrams on demand). The VS Code extension shows **Execution Plan** progress from `APPROACH.md` reconciled with `COMPLETION_REPORT.md`.

## Repository layout (this repo)

```text
spec/commands/     # operational prompts
spec/templates/    # A-B-C templates
src/               # CLI + hooks (TypeScript)
spec.md/         # orchestrator skill
.spec.md/         # dogfooded instance
```

## License

MIT — see [LICENSE](https://github.com/godrix/spec.md/blob/main/LICENSE).

Docs: [godrix.github.io/spec.md](https://godrix.github.io/spec.md/)
