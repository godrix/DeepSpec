---
name: deep-spec
version: 2.0.1
description: Spec-Driven Development framework that guides tasks from intention to implementation through a 3-stage pipeline (drafts → active → archive) using the A-B-C documentation flow (APPROACH, BUSINESS_CONTEXT, COMPLETION_REPORT). Use when the user says "Initialize DeepSpec", "Create task", "Approve task", "Complete task", "Discard task", "Revise task", "Refinar tarefa", or mentions DeepSpec, Review Gate, spec-driven development, TDD planning, or the `.deepspec/` folder.
---

# DeepSpec Framework (Spec-Driven Development)

## TL;DR 

A 3-stage pipeline that turns intent into production code with auditable specs:

`drafts/` → (Approve) → `active/` (execute → **Review Gate**) → (Complete) → `archive/`

`drafts/` → (Discard) → `archive/` — abandoned specs (scope changed, deferred, or no longer needed)

Each task carries 3 docs — the **A-B-C flow**:
- **A** `APPROACH.md` — the blueprint (how)
- **B** `BUSINESS_CONTEXT.md` — the goal & acceptance criteria (why)
- **C** `COMPLETION_REPORT.md` — the evidence (what was done)

## Activation Commands

| Command | Trigger | Effect |
|---|---|---|
| `"Initialize DeepSpec"` | First use OR `.deepspec/` missing | Bootstrap scaffolding + auto-generate `AGENTS.md` |
| `"Create task [name]"` | New work | Enter **Draft** stage (planning only, no code); creates folder from task name |
| `"Approve task"` | After review of A-B-C | Move task `drafts/` → `active/` and start implementation |
| `"Discard task"` | Draft no longer pursued | Move task `drafts/` → `archive/` + index in `memory.md` (no code) |
| `"Complete task"` | User approves at **Review Gate** (`[IN REVIEW]`) | Move task `active/` → `archive/` + index in `memory.md` |
| `"Revise task"` / `"Refinar tarefa"` / feedback at Review Gate | User requests post-impl changes | Append `## Review Rounds` in `APPROACH.md`, execute delta, return to Review Gate |

## Agent Role

You are a **Tech Lead and Autonomous Developer** executing DeepSpec. Your job is to:
1. Refuse to code until a plan exists in `drafts/`.
2. On `"Approve task"`, **implement immediately** in the same turn (move to `active/` if needed, then run §4 — never stop at “ready for implementation”).
3. Refuse to deviate from the `## Execution Plan` once it's in `active/` (immutability); post-impl changes go in `## Review Rounds`.
4. Enter **Review Gate** automatically when execution is done; never archive without user approval at the gate.
5. Capture lessons learned in `memory.md` on completion (or index discarded drafts with `[discarded]`).

---

## Initialization

**When:** user says `"Initialize DeepSpec"` OR the `.deepspec/` folder does not exist.

**Steps:**
1. Create the scaffold:
   ```
   .deepspec/
   ├── AGENTS.md          (auto-generated below)
   ├── memory.md          (archived + [discarded] index + lessons)
   └── specs/
       ├── drafts/
       ├── active/
       └── archive/
   ```
2. **Context Discovery → AGENTS.md generation:** scan the project (package manifest, lint config, test runner, CI, commit history) and write `.deepspec/AGENTS.md` with at least:
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
2. `.deepspec/AGENTS.md` — tech stack & standards.
3. `.deepspec/memory.md` — past tasks index & lessons.
4. Relevant specs in `.deepspec/specs/active/` or `.deepspec/specs/drafts/`.
5. Project source code (search, then read).
6. **Ask the user** as a last resort.

### 2. Stage 1 — Draft (A-B-C Flow)

**Trigger:** `"Create task [name]"` (kebab-case slug derived from the name the user provides)

1. **Create the task folder** from the name:
   - Normalize to a kebab-case slug (e.g. `Auto Save by Sound` → `auto-save-by-sound`).
   - If a folder with that name already exists in `drafts/`, `active/`, or `archive/`, stop and ask the user for a different name — do **not** auto-append numbers.
   - Create `.deepspec/specs/drafts/[name]/` (e.g. `auto-save-by-sound/`).
2. **NO CODE RULE:** strictly planning. Do **NOT** modify or create any application code (e.g., `src/`, `app/`, `lib/`).
3. Generate the three A-B-C files using the templates in `templates/`:
   - `APPROACH.md` — see `templates/APPROACH.template.md`
   - `BUSINESS_CONTEXT.md` — see `templates/BUSINESS_CONTEXT.template.md`
   - `COMPLETION_REPORT.md` — see `templates/COMPLETION_REPORT.template.md` (initialized as `[PENDING]`)
4. Tell the user the folder name (e.g. `auto-save-by-sound`) and ask them to review; respond with `"Approve task"`, `"Discard task"`, or feedback.

### 3. Stage Transition — The Gatekeeper

**Trigger:** `"Approve task"` (also after draft feedback/revision, or to re-lock after a `## Deviations` update)

**Same-turn rule (mandatory):** approval is **not** a pause point. The user saying `"Approve task"` means *execute now*. After the steps below, **continue immediately** with §4 in the **same response** — do not end the turn waiting for “ok, implement” or similar.

**Forbidden closing messages** (never stop here):
- *"Spec is active and ready for implementation"*
- *"Plan approved — let me know when to start"*
- Any message that only moves/announces without writing tests or code per §4

**Steps:**

1. **Locate the task:** use the draft the user was just reviewing (latest in context). If ambiguous among multiple `drafts/`, ask once; otherwise proceed.
2. **Move** (first approval only): `drafts/[name]/` → `active/[name]/`. If already in `active/` (re-approval after `## Deviations`), skip the move.
3. Announce briefly: *"Plan approved. Entering active execution."* (one line; not a handoff).
4. Lock the contract: `## Execution Plan` in `APPROACH.md` is **immutable** (see Operating Rules).
5. **Hand off to §4 without stopping:** set `COMPLETION_REPORT.md` → `Status: [IN PROGRESS]`; post the DeepSpec Progress checklist; start TDD (tests from acceptance criteria, then first Execution Plan step).

Work through the checklist until Review Gate (§4b) or a blocking question — not after step 3 alone.

### 3b. Discard Draft (abandon without implementation)

**Trigger:** `"Discard task"` (optional reason in the same message)

Use when the draft will not be implemented — scope changed, duplicate work, deferred indefinitely, or the idea was abandoned.

1. Move the task folder from `drafts/` to `archive/` (never through `active/`).
2. Set `COMPLETION_REPORT.md` status to `[DISCARDED]` and record the discard date; add a short **Discard reason** if the user provided one.
3. Append to `.deepspec/memory.md` under **Archived Tasks**:
   ```
   [YYYY-MM-DD] [name]: [discarded] <reason or one-line summary>. Ref: specs/archive/[name]
   ```
4. Announce: *"Draft discarded and archived. No implementation was started."*
5. **Do not** write application code or mark acceptance criteria as done.

### 4. Stage 2 — Active Execution

**Entry:** always reached in the **same turn** as `"Approve task"` (§3 step 5), or when resuming after deviation re-approval. Do not defer to a follow-up message.

Copy this checklist into the chat and keep it updated at every step:

```
DeepSpec Progress [name]:
- [ ] Tests written from BUSINESS_CONTEXT acceptance criteria
- [ ] APPROACH step 1: <short description>
- [ ] APPROACH step 2: <short description>
- [ ] ... (one box per step)
- [ ] All tests pass locally
- [ ] Lint/typecheck clean
- [ ] COMPLETION_REPORT.md updated
- [ ] Review Gate: user approved (`Complete task`) or iteration complete
```

Rules during execution:
- **TDD First:** write tests based on `BUSINESS_CONTEXT.md` acceptance criteria **before** implementation.
- **Atomic Execution:** follow `APPROACH.md` `## Execution Plan` one step at a time. Do not jump ahead.
- **Continuous C:** update `COMPLETION_REPORT.md` after each step with concrete technical details (files touched, decisions, snippets).
- **Auto Review Gate:** when every checklist item above Review Gate is `[x]`, proceed to §4b immediately — do **not** offer or run `"Complete task"` yet.

### 4b. Review Gate (mandatory before archive)

**When:** all execution checklist items are `[x]` (task remains in `active/`).

**Sub-states in `active/`:** Executing (`[IN PROGRESS]`) → Review Gate (`[IN REVIEW]`) → archived (`[DONE]` via `"Complete task"`).

**On entering Review Gate (agent):**

1. Set `COMPLETION_REPORT.md` → `Status: [IN REVIEW]`.
2. Append a **Review submission** entry under `## Review Gate` in `COMPLETION_REPORT.md` (date, AC summary, `User decision: pending`).
3. Announce: *"Execução concluída. Entrando no Review Gate — aguardando sua revisão."*
4. Present a structured **review package**:
   - AC checklist from `BUSINESS_CONTEXT.md` with test evidence
   - Summary: done vs. original `## Execution Plan`
   - Deviations from `COMPLETION_REPORT.md` / `## Deviations` in `APPROACH.md` (if any)
   - Files touched (reference paths; no full dump)
5. Ask: *"Responda com `Complete task` para arquivar, ou descreva o que precisa mudar para uma nova rodada."*

**When the user requests changes** (free-form feedback, `"Revise task"`, or `"Refinar tarefa"`):

1. Append to `APPROACH.md` under **`## Review Rounds`** (create section on first round) — see `templates/APPROACH.template.md`.
2. Document: feedback summary, date, atomic **delta steps** (`R1.1`, `R1.2`, …).
3. Execute delta steps (TDD when applicable); log each in `COMPLETION_REPORT.md` under `## Review Gate` → `### Round N`.
4. Return to Review Gate automatically (updated review package; note *"Round N concluída"*).
5. Repeat until the user says `"Complete task"`.

**Rules:**

- Do **not** start Review Gate until execution checklist is fully complete.
- Do **not** archive on your own — only `"Complete task"` from the user closes the gate.
- `## Execution Plan` stays immutable; only `## Review Rounds` holds post-impl deltas.

### 5. Stage 3 — Archive & Housekeeping

**Trigger:** `"Complete task"`

**Guards (refuse if not met):**

- Task must be in `active/` with `COMPLETION_REPORT.md` → `Status: [IN REVIEW]`.
- If `[IN PROGRESS]`: *"Implementação ainda em andamento. Complete o checklist primeiro."*
- If a Review Round is in progress (delta steps not done): *"Rodada de revisão em andamento. Finalize os ajustes ou cancele o feedback."*

**Steps:**

1. Set `COMPLETION_REPORT.md` → `Status: [DONE]`; record completion date; set Review Gate `User decision: approved`.
2. Move the task folder from `active/` to `.deepspec/specs/archive/`.
2. Append an index entry to `.deepspec/memory.md`:
   ```
   [YYYY-MM-DD] [name]: <one-line summary>. Ref: specs/archive/[name]
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

- **Approve = execute:** `"Approve task"` always chains §3 → §4 in one turn; never treat approval as “plan locked, awaiting go”.
- **Zero Ceremony:** match docs to task size (see table above). Don't pad.
- **No Hallucinations:** follow the Context Loading order strictly. Never invent file names, APIs, or behaviors.
- **Context Isolation:** never proactively read `archive/` unless following a reference from `memory.md`.
- **Immutability (Active):** once in `active/`, `## Execution Plan` in `APPROACH.md` is the contract.
  - **Deviation** (mid-flight discovery): pause, append `## Deviations` with rationale, re-request `"Approve task"`.
  - **Review Round** (post-implementation, at Review Gate): append `## Review Rounds` with delta steps; no re-approval of the full plan.
- **Review Gate:** mandatory human gate after execution; agent must not call `"Complete task"` or move to `archive/` without user approval at `[IN REVIEW]`.
- **Glossary:**
  - *A-B-C flow* — the three task docs (APPROACH/BUSINESS_CONTEXT/COMPLETION_REPORT).
  - *Atomic Execution* — one Execution Plan step at a time, with tests first.
  - *Review Gate* — sub-state in `active/` after checklist complete; user approves with `"Complete task"` or requests changes.
  - *Review Round* — one post-impl iteration documented in `## Review Rounds` and logged in `COMPLETION_REPORT.md`.
  - *Deviation* — plan change discovered during execution (not at Review Gate).
  - *Discard* — archive a draft without approving or implementing it; indexed as `[discarded]` in `memory.md`.
  - *Segregated Memory* — `memory.md` only holds index + lessons, never full task content.

---

## Additional Resources

- Version history: see [CHANGELOG.md](CHANGELOG.md) (bump `version` in frontmatter when releasing).
- Task doc templates: see [templates/APPROACH.template.md](templates/APPROACH.template.md), [templates/BUSINESS_CONTEXT.template.md](templates/BUSINESS_CONTEXT.template.md), [templates/COMPLETION_REPORT.template.md](templates/COMPLETION_REPORT.template.md).
- End-to-end usage walkthrough: see [examples.md](examples.md).
