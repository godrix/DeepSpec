# DeepSpec: Spec-Driven Development (SDD)

> This file orients any AI agent (and human) working in this repository. Read it fully before making changes. It describes **what DeepSpec is**, **who it is for**, **how it is built**, and **how to work in this codebase**. For file/folder layout and code conventions, invoke the internal `architecture` skill.

---

## 1. What this workspace is

This workspace is the **development environment for DeepSpec**.

DeepSpec is a **Spec-Driven Development (SDD)** framework: a structured workflow that turns intent into production code with auditable specs. The agent runs the workflow from markdown commands and templates, not from ad-hoc chat goals.

### The problem it exists to solve

AI coding assistants ship features fast, but without a single source of truth before code changes. Acceptance criteria drift, context degrades across turns, and there is no audit trail. DeepSpec puts a **3-stage pipeline** and **A-B-C documentation flow** within reach of any developer using any supported agent.

### What DeepSpec ships

DeepSpec is **a collection of templates, agent commands, and a thin CLI** — not a heavy runtime framework. Its value is the **workflow the AI agent runs**:

```
drafts/ → (Approve) → active/ (execute → Review Gate) → (Complete) → archive/
```

Each task carries three docs:

- **A** `APPROACH.md` — the blueprint (how)
- **B** `BUSINESS_CONTEXT.md` — the goal & acceptance criteria (why)
- **C** `COMPLETION_REPORT.md` — the evidence (what was done)

### Flexible by design

DeepSpec adapts documentation density to task size (Small / Medium / Large). The pipeline is strict on **when code may change**, but the amount of ceremony matches the scope.

---

## 2. Who it is for

DeepSpec is for **any team or individual using AI agents for software development** who wants:

- A plan before application code changes
- TDD anchored to acceptance criteria
- A human Review Gate before archive
- An index of past work in `memory.md`

The intelligence lives in the **spec**, not in the user memorizing commands.

---

## 3. Technology stack

- **Language:** TypeScript (strict), compiled to JavaScript via esbuild
- **Distribution:** npm as `deep-spec`, run via `npx deep-spec init <agent>`
- **Tests:** Poku
- **Docs site:** Docusaurus (`website/`)

---

## 4. The DeepSpec workflow

| Stage     | Command                          | Purpose                                    |
| --------- | -------------------------------- | ------------------------------------------ |
| Bootstrap | `/deepspec.init`                 | Create `.deepspec/` + generate `AGENTS.md` |
| Draft     | `/deepspec.create-task`          | A-B-C planning — **no app code**           |
| Approve   | `/deepspec.approve-task`         | Move to `active/` + implement same turn    |
| Review    | `/deepspec.revise-task`          | Review Gate + Review Rounds                |
| Complete  | `/deepspec.complete-task`        | Archive after user approval                |
| Discard   | `/deepspec.discard-task`         | Abandon draft without code                 |
| List      | `/deepspec.list`                 | Read-only pipeline status                  |
| Repair    | `/deepspec.repair`               | Realign `tracking.json` after renames      |
| Map       | `/deepspec.map-codebase`         | Re-scan repo → refresh `AGENTS.md`         |
| Diagram   | `/deepspec.diagram-architecture` | Mermaid `ARCHITECTURE.md` per task         |
| Interview | `/deepspec.interview`            | One-question approach refinement           |
| Answer    | `/deepspec.answer-questions`     | Incorporate open-question answers          |

Maintenance hooks (`list`, `track`, `repair`, `validate`) are deterministic TypeScript compiled to `.deepspec/hooks/*.mjs`.

---

## 5. How to work in this codebase

- **Spec-first:** commands in `spec/commands/` are the operational source of truth; `deep-spec/SKILL.md` is a thin orchestrator.
- **Command / template / hook split:** reasoning in commands, artifact shape in templates, mechanics in hooks.
- **Agent-agnostic core:** one command source → many agent formats via `src/providers/registry.ts`.
- **Idempotent init:** `writeFileIfAbsent` — re-init never overwrites user artifacts.
- **Test what is deterministic:** hooks and scaffold have integration tests; LLM behavior stays in markdown.

When changing source under `src/`, `spec/`, or `test/`, read the `architecture` skill first.

---

## 6. Key directories

| Path              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `spec/commands/`  | `/deepspec.*` command definitions                |
| `spec/templates/` | A-B-C and bootstrap templates                    |
| `src/`            | TypeScript source (CLI, hooks, providers)        |
| `lib/`            | Compiled output (generated)                      |
| `deep-spec/`      | Orchestrator skill payload (retrocompat install) |
| `test/`           | Poku e2e + integration tests                     |
| `website/`        | Docusaurus documentation site                    |
| `.deepspec/`      | Dogfooded instance in this repo                  |

Reference implementation patterns: `ideas/blue-spec/` (read-only reference, not shipped).
