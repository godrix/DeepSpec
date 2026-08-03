# Answer questions

Incorporate user decisions recorded in a task's `OPEN_QUESTIONS.md` and continue the blocked work.

**Trigger:** `"Answer questions"`, or `/deepspec.answer-questions`

Typically invoked after the user answers from the **DeepSpec VS Code/Cursor panel** (answers are already written to `OPEN_QUESTIONS.md` with `Status: answered`). Also works when the user answers in chat and the file still needs updating.

Folds decisions into `APPROACH.md` / `BUSINESS_CONTEXT.md` when they affect the plan. Implements application code only if the task is already in `active/` and the answers unblock an in-flight step; drafts stay planning-only.
