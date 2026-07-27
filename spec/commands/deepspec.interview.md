---
description: Interview the user with exactly one focused question per turn to refine APPROACH.md before approval. Planning only — no application code.
---

## User Input

```text
$ARGUMENTS
```

Optional: task slug, or an **answer** to the previous interview question.

## Outline

You are running a **socratic interview** (sabatina) to strengthen the draft **APPROACH** before `"Approve task"`.

### Rules (strict)

1. **One question per turn** — never ask two questions in the same message.
2. **No application code** — only update planning docs.
3. Target task must be in `drafts/` (or `active/` only if Execution Plan is not yet locked — otherwise use Review Rounds).
4. If User Input contains an **answer** to your last question: incorporate it first, then optionally ask the next question (still only one).

### Step 1: Load context

1. Task folder: `APPROACH.md`, `BUSINESS_CONTEXT.md`, `OPEN_QUESTIONS.md`
2. `.spec.md/AGENTS.md`, `memory.md`
3. Relevant source for files in `## Affected Files`

### Step 2: If user answered a prior question

- Update `APPROACH.md` (Summary, Execution Plan, Risks, or Affected Files) with the answer.
- Append to `OPEN_QUESTIONS.md`:

```markdown
### Qn — <short title>

- **Status:** answered
- **Asked:** YYYY-MM-DD
- **Question:** …
- **Answer:** <user answer>
```

### Step 3: Ask exactly one question

Pick the **highest-impact** unresolved ambiguity:

- Missing acceptance criteria alignment
- Unclear technical boundary or dependency
- Risk without mitigation
- Scope creep vs Out of Scope

Format:

```markdown
**Interview — [slug]**

<One clear question>

_Context: why this matters in one sentence._
```

Wait for the user. Do **not** approve, implement, or create new tasks.

### Step 4: When plan feels complete

Say so explicitly and suggest `"Approve task"` or `/spec.md.diagram-architecture` — **do not** ask another question that turn.
