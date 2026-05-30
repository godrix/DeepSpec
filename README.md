![DeepSpec Logo](.github/assets/DeepSpec.png)

# DeepSpec 🖥️
**SDD Framework: The Spec is the Solution.**

DeepSpec is a zero-ceremony, AI-native Spec-Driven Development (SDD) framework. It eliminates architectural obesity, context degradation, and AI hallucinations by acting as the "positronic brain" for your project. It safely guides AI agents (like Cursor, Copilot, or Cline) from intention to implementation using a strict, state-machine workflow.

## Purpose

- Give every piece of work a **single source of truth** before application code changes.
- Make **acceptance criteria** the bridge to tests (TDD) instead of vague chat goals.
- Produce an **audit trail** (what changed, why, and how it was verified) without extra ceremony beyond what the task size needs.

## Philosophy

- **Context diet:** load information in a fixed order (open files → `AGENTS.md` → `memory.md` → specs → source → ask the user) to reduce noise and off-topic edits.
- **Auto-discovery:** on *Initialize*, the agent scans the repo (manifests, tests, lint, CI, commit history) and generates `.deepspec/AGENTS.md` aligned with your stack and conventions.
- **Three-stage pipeline:** `drafts` (planning, **no application code**) → `active` (execution with a locked plan) → `archive` (history and learnings). Drafts can also go straight to `archive` via **Discard** when the spec is abandoned.
- **TDD and atomic steps:** in `active/`, tests derived from acceptance criteria come **before** implementation; `APPROACH.md` is executed **one step at a time**.

## The A-B-C method

The A-B-C flow is DeepSpec's per-task documentation model. It exists so **intent**, **design**, and **proof** never collapse into one blob that agents (or humans) can misread or skip.

| Letter | File | Role |
|--------|------|------|
| **A** | `APPROACH.md` | **How** — technical blueprint: steps, constraints, sequencing, and where code will land. After approval, it is the **immutable** execution contract. |
| **B** | `BUSINESS_CONTEXT.md` | **Why** — goal, scope, stakeholders, and **acceptance criteria** mapped to verifiable outcomes. This is what tests and "done" must trace back to. |
| **C** | `COMPLETION_REPORT.md` | **What happened** — living evidence during execution: files touched, decisions, failures, fixes, and final verification. Starts as a stub (e.g. `[PENDING]`) and is updated continuously through **active** work. |

**Why A-B-C (not one mega-doc):**

- **B before A in meaning, not necessarily in writing order:** clarity on outcomes prevents clever but wrong implementations.
- **A is executable structure:** the agent (and reviewers) can gate scope and reject scope creep once the task is **active**.
- **C is accountability:** merges "what we said we'd do" with "what we actually did," which feeds trust, onboarding, and postmortems—without relying on chat history alone.

Templates live under `deep-spec/templates/` and are instantiated for each task folder.

## Repository layout (this skill)

```text
<repo-root>/
├── LICENSE
├── README.md
└── deep-spec/             # skill payload (installed as .cursor/skills/deep-spec/)
    ├── SKILL.md
    ├── examples.md
    └── templates/
        ├── APPROACH.template.md
        ├── BUSINESS_CONTEXT.template.md
        └── COMPLETION_REPORT.template.md
```

## After *Initialize* (target repo)

```text
.deepspec/
├── AGENTS.md              # Project rules (stack, standards, personas)
├── memory.md              # Archived task index + lessons learned
└── specs/
    ├── drafts/            # Stage 1: planning (no app code)
    ├── active/            # Stage 2: execution guided by the plan
    └── archive/           # Stage 3: completed specs
```

Each task lives in `[name]/` (kebab-case slug from the task name) with the three A-B-C files generated from `deep-spec/templates/`.

## Installation (Cursor)

DeepSpec does not require npm packages; it runs in your IDE's AI agent.

1. Copy the `deep-spec/` skill folder into your Cursor skills directory, keeping the folder name `deep-spec`:

```bash
mkdir -p .cursor/skills/deep-spec
cp -R /path/to/deepspec-repo/deep-spec/. .cursor/skills/deep-spec/
```

2. Ensure `SKILL.md` ends up at `.cursor/skills/deep-spec/SKILL.md`.

For a user-wide install, use your user-level Cursor skills directory instead of `.cursor/skills/`.

Or install via CursorToys: **Initialize DeepSpec** downloads from [github.com/godrix/deep-flow](https://github.com/godrix/deep-flow/tree/main/deep-spec).

## Workflow

1. **Initialize:** say *"Initialize DeepSpec"*. The agent creates `.deepspec/`, the pipeline folders, and generates `AGENTS.md` from the repo.
2. **Create task:** *"Create task [name]"`* — creates a draft folder under `drafts/` named from the task (kebab-case); **no application code** in this stage.
3. **Review (gatekeeper):** read `APPROACH.md` and `BUSINESS_CONTEXT.md`. Iterate in chat, approve, or discard.
4. **Approve:** *"Approve task"* — moves the folder to `active/`; `APPROACH.md` becomes **immutable**; execution starts with TDD and a progress checklist.
5. **Discard (optional):** *"Discard task"* — moves a draft straight to `archive/` when the idea is abandoned or deferred; indexes `memory.md` as `[discarded]`; no code is written.
6. **Complete:** *"Complete task"* — moves an `active/` task to `archive/` and updates `memory.md` with an index and learnings.

Full activation commands and operating rules are in `deep-spec/SKILL.md`. For an end-to-end walkthrough, see `deep-spec/examples.md`.

## License

DeepSpec is released under the [MIT License](LICENSE).

Built with ❤️ to foster better collaboration between humans and AI in software development.

👨‍💻🤝🤖 *"Humanity is a good thing; AI is only an extension of it."*
