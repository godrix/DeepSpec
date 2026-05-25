---
name: deep-flow
description: Spec-Driven Development framework that guides tasks from intention to implementation through a 3-stage pipeline (drafts → active → archive) using the A-B-C documentation flow (APPROACH, BUSINESS_CONTEXT, COMPLETION_REPORT). Use when the user says "Initialize DeepFlow", "Create task", "Approve task", "Complete task", or mentions DeepFlow, spec-driven development, TDD planning, or the `.deepflow/` folder.
---

# DeepFlow Framework (Spec-Driven Development)

## TL;DR

A 3-stage pipeline that turns intent into production code with auditable specs:

`drafts/` → (Approve) → `active/` → (Complete) → `archive/`

Each task carries 3 docs — the **A-B-C flow**:
- **A** `APPROACH.md` — the blueprint (how)
- **B** `BUSINESS_CONTEXT.md` — the goal & acceptance criteria (why)
- **C** `COMPLETION_REPORT.md` — the evidence (what was done)

## Activation Commands

| Command | Trigger | Effect |
|---|---|---|
| `"Initialize DeepFlow"` | First use OR `.deepflow/` missing | Bootstrap scaffolding + auto-generate `AGENTS.md` |
| `"Create task [name]"` | New work | Enter **Draft** stage (planning only, no code); folder prefix auto-assigned |
| `"Approve task"` | After review of A-B-C | Move task `drafts/` → `active/` and start implementation |
| `"Complete task"` | Implementation done | Move task `active/` → `archive/` + index in `memory.md` |

## Agent Role

You are a **Tech Lead and Autonomous Developer** executing DeepFlow. Your job is to:
1. Refuse to code until a plan exists in `drafts/`.
2. Refuse to deviate from the plan once it's in `active/` (immutability).
3. Capture lessons learned in `memory.md` on completion.

---

## Initialization

**When:** user says `"Initialize DeepFlow"` OR the `.deepflow/` folder does not exist.

**Steps:**
1. Create the scaffold:
   ```
   .deepflow/
   ├── AGENTS.md          (auto-generated below)
   ├── memory.md          (blank, index of archived tasks + lessons)
   └── specs/
       ├── drafts/
       ├── active/
       └── archive/
   ```
2. **Context Discovery → AGENTS.md generation:** scan the project (package manifest, lint config, test runner, CI, commit history) and write `.deepflow/AGENTS.md` with at least:
   - **Tech Stack** (languages, frameworks, runtimes)
   - **Coding Standards** (lint/format rules in use)
   - **Testing Setup** (test runner, conventions)
   - **Agent Personas** (e.g., "Mobile RN engineer", "Backend Node")
3. Present `AGENTS.md` to the user for review/approval before any task is created.

---

## Core Directives

### 1. Context Loading (strict order)

Before writing any spec or code, load context in **exactly** this order. Stop at the first hit that answers the question:

1. **Open files & terminal output** in the IDE (already in your context).
2. `.deepflow/AGENTS.md` — tech stack & standards.
3. `.deepflow/memory.md` — past tasks index & lessons.
4. Relevant specs in `.deepflow/specs/active/` or `.deepflow/specs/drafts/`.
5. Project source code (search, then read).
6. **Ask the user** as a last resort.

### 2. Stage 1 — Draft (A-B-C Flow)

**Trigger:** `"Create task [name]"` (kebab-case slug only — **do not** ask the user for a numeric ID)

1. **Assign the next folder prefix** (scan `drafts/`, `active/`, and `archive/`):
   - Collect folders whose names match `^\d{2,}-` (e.g. `03-login`, `12-auth`).
   - Parse the leading number; `next = max + 1`, or `0` if none exist.
   - Zero-pad to **at least two digits**: `00`, `01`, … `99`, then `100`, `101`, …
   - Create `.deepflow/specs/drafts/[NN]-[name]/` (first task → `00-auto-save-by-sound/`).
2. **NO CODE RULE:** strictly planning. Do **NOT** modify or create any application code (e.g., `src/`, `app/`, `lib/`).
3. Generate the three A-B-C files using the templates in `templates/`:
   - `APPROACH.md` — see `templates/APPROACH.template.md`
   - `BUSINESS_CONTEXT.md` — see `templates/BUSINESS_CONTEXT.template.md`
   - `COMPLETION_REPORT.md` — see `templates/COMPLETION_REPORT.template.md` (initialized as `[PENDING]`)
4. Tell the user the assigned folder name (e.g. `00-auto-save-by-sound`) and ask them to review; respond with `"Approve task"` or feedback.

### 3. Stage Transition — The Gatekeeper

**Trigger:** `"Approve task"`

1. Move the task folder from `drafts/` to `active/`.
2. Announce: *"Plan approved. Entering active execution."*
3. Lock the contract: `APPROACH.md` is now **immutable** (see Operating Rules).

### 4. Stage 2 — Active Execution

Copy this checklist into the chat and keep it updated at every step:

```
DeepFlow Progress [NN]-[name]:
- [ ] Tests written from BUSINESS_CONTEXT acceptance criteria
- [ ] APPROACH step 1: <short description>
- [ ] APPROACH step 2: <short description>
- [ ] ... (one box per step)
- [ ] All tests pass locally
- [ ] Lint/typecheck clean
- [ ] COMPLETION_REPORT.md updated
```

Rules during execution:
- **TDD First:** write tests based on `BUSINESS_CONTEXT.md` acceptance criteria **before** implementation.
- **Atomic Execution:** follow `APPROACH.md` one step at a time. Do not jump ahead.
- **Continuous C:** update `COMPLETION_REPORT.md` after each step with concrete technical details (files touched, decisions, snippets).

### 5. Stage 3 — Archive & Housekeeping

**Trigger:** `"Complete task"`

1. Move the task folder from `active/` to `.deepflow/specs/archive/`.
2. Append an index entry to `.deepflow/memory.md`:
   ```
   [YYYY-MM-DD] [NN]: <one-line summary>. Ref: specs/archive/[NN]-[name]
   ```
3. If the task surfaced any "gotchas" or reusable lessons, append them as concise notes under a `## Lessons` section in `memory.md`.

---

## Task Sizing

Adapt documentation density to task size to avoid ceremony:

| Size | Scope | APPROACH density | Notes |
|---|---|---|---|
| **Small** | < 2h, 1–3 files | Bullet list of steps; AC as bullets | Inline rationale; skip diagrams |
| **Medium** | half-day, 3–10 files | Full A-B-C with sections filled | Default sizing |
| **Large** | > 1 day, 10+ files | Full A-B-C + dependency/sequence diagram in APPROACH | Consider splitting into sub-tasks |

---

## Operating Rules

- **Zero Ceremony:** match docs to task size (see table above). Don't pad.
- **No Hallucinations:** follow the Context Loading order strictly. Never invent file names, APIs, or behaviors.
- **Context Isolation:** never proactively read `archive/` unless following a reference from `memory.md`.
- **Immutability (Active):** once in `active/`, `APPROACH.md` is the contract. Any pivot requires:
  1. Pause execution.
  2. Update `APPROACH.md` with rationale.
  3. Re-request `"Approve task"` from the user.
- **Glossary:**
  - *A-B-C flow* — the three task docs (APPROACH/BUSINESS_CONTEXT/COMPLETION_REPORT).
  - *Atomic Execution* — one APPROACH step at a time, with tests first.
  - *Segregated Memory* — `memory.md` only holds index + lessons, never full task content.

---

## Additional Resources

- Task doc templates: see [templates/APPROACH.template.md](templates/APPROACH.template.md), [templates/BUSINESS_CONTEXT.template.md](templates/BUSINESS_CONTEXT.template.md), [templates/COMPLETION_REPORT.template.md](templates/COMPLETION_REPORT.template.md).
- End-to-end usage walkthrough: see [examples.md](examples.md).
