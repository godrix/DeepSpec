# Interview task

Socratic refinement of a draft (or pre-lock active) task — one question per turn.

**Trigger:** `"Interview task"`, `"Refine approach"`, `"Sabatina"`, or `/deepspec.interview`

Reads `APPROACH.md` and `BUSINESS_CONTEXT.md`, asks **exactly one** high-impact question to reduce risk or ambiguity, and waits for your answer.

On the next invocation (or explicit continuation), incorporates the answer into the relevant `APPROACH.md` section and records the Q/A in `OPEN_QUESTIONS.md` as `answered`.

Does not implement code or advance the pipeline stage.
