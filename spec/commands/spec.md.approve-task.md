---
description: Approve a draft task, move it to active/, lock the Execution Plan, and implement immediately in the same turn using TDD. Triggered by "Approve task" after draft review or re-approval after Deviations.
---

## User Input

```text
$ARGUMENTS
```

Optional: task slug if multiple drafts exist. Otherwise use the draft the user was just reviewing.

## Outline

You are transitioning a task from **draft** to **active** and **executing immediately**. Approval is **not** a pause point.

### Step 1: Locate the task

- Use the draft in context. If ambiguous among multiple `drafts/`, ask once.
- Load `.spec.md/specs/drafts/[slug]/APPROACH.md`, `BUSINESS_CONTEXT.md`, `COMPLETION_REPORT.md`.
- If no draft exists, **stop** and tell the user to run `/spec.md.create-task` first.

### Step 2: Move to active (first approval only)

- Move `drafts/[slug]/` → `active/[slug]/`. Skip if already in `active/` (re-approval after `## Deviations`).
- Announce briefly: _"Plan approved. Entering active execution."_ (one line only).

### Step 3: Lock the contract

- `## Execution Plan` in `APPROACH.md` is now **immutable**.
- Set `COMPLETION_REPORT.md` → `Status: [IN PROGRESS]`.

### Step 4: Update tracking

```bash
node ./.spec.md/hooks/track.mjs '{"entries":[{"name":"<slug>","stage":"active","paths":["..."]}]}'
```

Use paths from `## Affected Files` in APPROACH.md.

### Step 5: Execute immediately (same turn — mandatory)

**Forbidden closing messages:**

- _"Spec is active and ready for implementation"_
- _"Plan approved — let me know when to start"_

Post and maintain this checklist:

```
spec.md Progress [slug]:
- [ ] Tests written from BUSINESS_CONTEXT acceptance criteria
- [ ] APPROACH step 1: <short description>
- [ ] ... (one box per Execution Plan step)
- [ ] All tests pass locally
- [ ] Lint/typecheck clean
- [ ] COMPLETION_REPORT.md updated
- [ ] Review Gate: user approved or iteration complete
```

**Rules:**

- **TDD First:** write tests from acceptance criteria before implementation.
- **Atomic Execution:** one Execution Plan step at a time.
- **Continuous C:** update `COMPLETION_REPORT.md` after each step.
- When all items above Review Gate are `[x]`, enter Review Gate automatically (see `/spec.md.revise-task` for gate rules).

Work until Review Gate or a blocking question — do not stop after announcing approval.
