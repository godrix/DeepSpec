---
description: Incorporate user answers to open questions from OPEN_QUESTIONS.md (often submitted via the DeepSpec panel) and continue the blocked work. Planning updates allowed; implement only when the task is already active.
---

## User Input

```text
$ARGUMENTS
```

Optional: task slug, question id(s), and/or the answer text the user already provided (including when answers were saved from the DeepSpec VS Code/Cursor panel).

## Outline

You are processing **Open Questions** that were blocking a task. The user answered from the DeepSpec panel and/or in chat.

### Rules

1. Prefer the task folder referenced in User Input / `@` attachments.
2. Treat panel-saved answers as authoritative: if `OPEN_QUESTIONS.md` already has `**Status:** answered` and a filled `**Answer:**`, do not overwrite with a weaker paraphrase.
3. If the user answered only in chat and the file still says `open`, update `OPEN_QUESTIONS.md` yourself.
4. **No application code** unless the task is already in `active/` and the answers unblock an in-flight Execution Plan step. Drafts stay planning-only.
5. Do not approve, discard, complete, or revise unless the user explicitly asks.

### Step 1: Load context

1. Task `OPEN_QUESTIONS.md`, `APPROACH.md`, `BUSINESS_CONTEXT.md` (and `COMPLETION_REPORT.md` if active)
2. `.deepspec/AGENTS.md`, `memory.md`
3. Source files listed under `## Affected Files` when relevant

### Step 2: Normalize answers

For each question in User Input (or every newly `answered` entry in `OPEN_QUESTIONS.md`):

1. Ensure the entry uses:

```markdown
### Qn — <short title>
- **Status:** answered
- **Asked:** YYYY-MM-DD
- **Blocking:** …
- **Question:** …
- **Answer:** <user decision>
```

2. Fold the decision into `APPROACH.md` / `BUSINESS_CONTEXT.md` where it affects Summary, Acceptance Criteria, Execution Plan (drafts only), Risks, or Affected Files.
3. If the task is `active/` and the plan must change mid-flight, append `## Deviations` and ask for `"Approve task"` — do not silently rewrite the locked Execution Plan.

### Step 3: Continue

- Summarize which questions are now resolved.
- State what was unblocked.
- Continue the highest-priority next step (plan refinement, diagram, interview, or implementation if already active and unblocked).
- If more blocking questions remain open, list them briefly and stop — do not invent answers.

### Step 4: When still blocked

Ask the user (or suggest answering in the DeepSpec panel). Append new questions to this task's `OPEN_QUESTIONS.md` with `**Status:** open`.
