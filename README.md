![DeepFlow](.github/assets/DeepFlow.png)

# DeepFlow

**Lightweight SDD: the spec steers the implementation.**

DeepFlow is a Cursor Agent Skill for *Spec-Driven Development* (SDD). It guides the AI from intent to shipped code using a strict three-stage pipeline and an **A-B-C** documentation contract per task—so planning, validation, and evidence stay separated and reviewable.

## Purpose

- Give every piece of work a **single source of truth** before application code changes.
- Make **acceptance criteria** the bridge to tests (TDD) instead of vague chat goals.
- Produce an **audit trail** (what changed, why, and how it was verified) without extra ceremony beyond what the task size needs.

## Philosophy

- **Context diet:** load information in a fixed order (open files → `AGENTS.md` → `memory.md` → specs → source → ask the user) to reduce noise and off-topic edits.
- **Auto-discovery:** on *Initialize*, the agent scans the repo (manifests, tests, lint, CI, commit history) and generates `.deepflow/AGENTS.md` aligned with your stack and conventions.
- **Three-stage pipeline:** `drafts` (planning, **no application code**) → `active` (execution with a locked plan) → `archive` (history and learnings).
- **TDD and atomic steps:** in `active/`, tests derived from acceptance criteria come **before** implementation; `APPROACH.md` is executed **one step at a time**.

## The A-B-C method

The A-B-C flow is DeepFlow’s per-task documentation model. It exists so **intent**, **design**, and **proof** never collapse into one blob that agents (or humans) can misread or skip.

| Letter | File | Role |
|--------|------|------|
| **A** | `APPROACH.md` | **How** — technical blueprint: steps, constraints, sequencing, and where code will land. After approval, it is the **immutable** execution contract. |
| **B** | `BUSINESS_CONTEXT.md` | **Why** — goal, scope, stakeholders, and **acceptance criteria** mapped to verifiable outcomes. This is what tests and “done” must trace back to. |
| **C** | `COMPLETION_REPORT.md` | **What happened** — living evidence during execution: files touched, decisions, failures, fixes, and final verification. Starts as a stub (e.g. `[PENDING]`) and is updated continuously through **active** work. |

**Why A-B-C (not one mega-doc):**

- **B before A in meaning, not necessarily in writing order:** clarity on outcomes prevents clever but wrong implementations.
- **A is executable structure:** the agent (and reviewers) can gate scope and reject scope creep once the task is **active**.
- **C is accountability:** merges “what we said we’d do” with “what we actually did,” which feeds trust, onboarding, and postmortems—without relying on chat history alone.

Templates live under `skill/templates/` and are instantiated for each task folder.

## Repository layout (this skill)

```text
deep-flow/
├── LICENSE
├── README.md
└── skill/
    ├── SKILL.md
    ├── examples.md
    └── templates/
        ├── APPROACH.template.md
        ├── BUSINESS_CONTEXT.template.md
        └── COMPLETION_REPORT.template.md
```

## After *Initialize* (target repo)

```text
.deepflow/
├── AGENTS.md              # Project rules (stack, standards, personas)
├── memory.md              # Archived task index + lessons learned
└── specs/
    ├── drafts/            # Stage 1: planning (no app code)
    ├── active/            # Stage 2: execution guided by the plan
    └── archive/           # Stage 3: completed specs
```

Each task lives in `[NN]-[name]/` (auto-incrementing prefix: `00-`, `01-`, …) with the three A-B-C files generated from `skill/templates/`.

## Installation (Cursor)

DeepFlow does not require npm packages; it runs in your IDE’s AI agent.

1. Copy `skill/` into your Cursor skills directory, keeping the folder name `deep-flow`:

```bash
mkdir -p .cursor/skills/deep-flow
cp -R /path/to/deep-flow/skill/. .cursor/skills/deep-flow/
```

2. Ensure `SKILL.md` ends up at `.cursor/skills/deep-flow/SKILL.md`.

For a user-wide install, use your user-level Cursor skills directory instead of `.cursor/skills/`.

## Workflow

1. **Initialize:** say *"Initialize DeepFlow"*. The agent creates `.deepflow/`, the pipeline folders, and generates `AGENTS.md` from the repo.
2. **Create task:** *"Create task [name]"`* — assigns the next numeric prefix (`00-`, `01-`, …), creates a draft under `drafts/` with A-B-C; **no application code** in this stage.
3. **Review (gatekeeper):** read `APPROACH.md` and `BUSINESS_CONTEXT.md`. Iterate in chat or approve.
4. **Approve:** *"Approve task"* — moves the folder to `active/`; `APPROACH.md` becomes **immutable**; execution starts with TDD and a progress checklist.
5. **Complete:** *"Complete task"* — moves to `archive/` and updates `memory.md` with an index and learnings.

Full activation commands and operating rules are in `skill/SKILL.md`. For an end-to-end walkthrough, see `skill/examples.md`.

## License

DeepFlow is released under the [MIT License](LICENSE).

Built with ❤️ to foster better collaboration between humans and AI in software development.

👨‍💻🤝🤖 *“Humanity is a good thing; AI is only an extension of it.”*
