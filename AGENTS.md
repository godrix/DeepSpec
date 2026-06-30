# spec.md: Spec-Driven Development (SDD)

> This file orients any AI agent (and human) working in this repository. Read it fully before making changes. It describes **what spec.md is**, **who it is for**, **how it is built**, and **how to work in this codebase**. For file/folder layout and code conventions, invoke the internal `architecture` skill.

---

## 1. What this workspace is

This workspace is the **development environment for spec.md**.

spec.md is a **Spec-Driven Development (SDD)** framework: a structured workflow that turns intent into production code with auditable specs. The agent runs the workflow from markdown commands and templates, not from ad-hoc chat goals.

### The problem it exists to solve

AI coding assistants ship features fast, but without a single source of truth before code changes. Acceptance criteria drift, context degrades across turns, and there is no audit trail. spec.md puts a **3-stage pipeline** and **A-B-C documentation flow** within reach of any developer using any supported agent.

### What spec.md ships

spec.md is **a collection of templates, agent commands, and a thin CLI** — not a heavy runtime framework. Its value is the **workflow the AI agent runs**:

```
drafts/ → (Approve) → active/ (execute → Review Gate) → (Complete) → archive/
```

Each task carries three docs:

- **A** `APPROACH.md` — the blueprint (how)
- **B** `BUSINESS_CONTEXT.md` — the goal & acceptance criteria (why)
- **C** `COMPLETION_REPORT.md` — the evidence (what was done)

### Flexible by design

spec.md adapts documentation density to task size (Small / Medium / Large). The pipeline is strict on **when code may change**, but the amount of ceremony matches the scope.

---

## 2. Who it is for

spec.md is for **any team or individual using AI agents for software development** who wants:

- A plan before application code changes
- TDD anchored to acceptance criteria
- A human Review Gate before archive
- An index of past work in `memory.md`

The intelligence lives in the **spec**, not in the user memorizing commands.

---

## 3. Technology stack

- **Language:** TypeScript (strict), compiled to JavaScript via esbuild
- **Distribution:** npm as `@godrix/spec.md`, run via `npx @godrix/spec.md init <agent>`
- **Tests:** Poku
- **Docs site:** Docusaurus (`website/`)

---

## 4. The spec.md workflow

| Stage     | Command                   | Purpose                                    |
| --------- | ------------------------- | ------------------------------------------ |
| Bootstrap | `/spec.md.init`          | Create `.spec.md/` + generate `AGENTS.md` |
| Draft     | `/spec.md.create-task`   | A-B-C planning — **no app code**           |
| Approve   | `/spec.md.approve-task`  | Move to `active/` + implement same turn    |
| Review    | `/spec.md.revise-task`   | Review Gate + Review Rounds                |
| Complete  | `/spec.md.complete-task` | Archive after user approval                |
| Discard   | `/spec.md.discard-task`  | Abandon draft without code                 |
| List      | `/spec.md.list`          | Read-only pipeline status                  |
| Repair    | `/spec.md.repair`        | Realign `tracking.json` after renames      |
| Map       | `/spec.md.map-codebase`  | Re-scan repo → refresh `AGENTS.md`         |
| Diagram   | `/spec.md.diagram-architecture` | Mermaid `ARCHITECTURE.md` per task  |
| Interview | `/spec.md.interview`     | One-question approach refinement           |

Maintenance hooks (`list`, `track`, `repair`, `validate`) are deterministic TypeScript compiled to `.spec.md/hooks/*.mjs`.

---

## 5. How to work in this codebase

- **Spec-first:** commands in `spec/commands/` are the operational source of truth; `spec.md/SKILL.md` is a thin orchestrator.
- **Command / template / hook split:** reasoning in commands, artifact shape in templates, mechanics in hooks.
- **Agent-agnostic core:** one command source → many agent formats via `src/providers/registry.ts`.
- **Idempotent init:** `writeFileIfAbsent` — re-init never overwrites user artifacts.
- **Test what is deterministic:** hooks and scaffold have integration tests; LLM behavior stays in markdown.

When changing source under `src/`, `spec/`, or `test/`, read the `architecture` skill first.

---

## 6. Key directories

| Path              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `spec/commands/`  | `/spec.md.*` command definitions                |
| `spec/templates/` | A-B-C and bootstrap templates                    |
| `src/`            | TypeScript source (CLI, hooks, providers)        |
| `lib/`            | Compiled output (generated)                      |
| `spec.md/`      | Orchestrator skill payload (retrocompat install) |
| `test/`           | Poku e2e + integration tests                     |
| `website/`        | Docusaurus documentation site                    |
| `.spec.md/`      | Dogfooded instance in this repo                  |

Reference implementation patterns: `ideas/blue-spec/` (read-only reference, not shipped).
