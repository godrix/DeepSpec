---
description: Handle Review Gate feedback and post-implementation revisions. Append Review Rounds to APPROACH.md, execute delta steps with TDD, and return to Review Gate. Triggered by "Revise task", "Refinar tarefa", or feedback at [IN REVIEW].
---

## User Input

```text
$ARGUMENTS
```

Free-form feedback describing what needs to change.

## Outline

You are handling **post-implementation revisions** at the Review Gate. The `## Execution Plan` stays immutable; only `## Review Rounds` holds deltas.

### Review Gate entry (when execution checklist is complete)

If entering Review Gate for the first time (not a revision round):

1. Set `COMPLETION_REPORT.md` → `Status: [IN REVIEW]`
2. Append **Review submission** under `## Review Gate` (date, AC summary, `User decision: pending`)
3. Announce: _"Execução concluída. Entrando no Review Gate — aguardando sua revisão."_
4. Present review package:
   - AC checklist from `BUSINESS_CONTEXT.md` with test evidence
   - Done vs. original Execution Plan
   - Deviations (if any)
   - Files touched (paths only)
5. Ask: _"Responda com `Complete task` para arquivar, ou descreva o que precisa mudar."_

**Do not** archive on your own.

### When the user requests changes

1. Append to `APPROACH.md` under **`## Review Rounds`** (create on first round)
2. Document: feedback summary, date, atomic **delta steps** (`R1.1`, `R1.2`, …)
3. Execute delta steps (TDD when applicable)
4. Log each in `COMPLETION_REPORT.md` under `## Review Gate` → `### Round N`
5. Return to Review Gate automatically with updated review package
6. Repeat until the user says `"Complete task"`

### Rules

- Do **not** start Review Gate until execution checklist is fully complete.
- `## Execution Plan` stays immutable; only `## Review Rounds` holds post-impl deltas.
- Mid-flight plan changes (before Review Gate) belong in `## Deviations` and require re-approval via `/deepspec.approve-task`.
