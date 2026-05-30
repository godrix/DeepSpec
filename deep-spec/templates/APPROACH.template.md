# [A] APPROACH — [NN]-[name]

> **The Blueprint.** Technical solution design and step-by-step execution plan.
> Once this task enters `active/`, this file is **immutable** without re-approval.

## Summary

One paragraph describing the technical solution at a high level.

## Affected Files

List every file that will be created or modified. Be precise.

| File | Change | Rationale |
|---|---|---|
| `src/path/to/file.ts` | modify | adds X behavior |
| `src/path/to/new.ts` | create | new module Y |
| `__tests__/file.test.ts` | create | covers AC-1 and AC-2 |

## Dependencies & Constraints

- External libs added/removed: …
- API/contract changes: …
- Migration required? …
- Performance budget / non-functional constraints: …

## Execution Plan (atomic steps)

> Each step should be small enough to commit independently.
> The agent will execute **one step at a time** during Active stage.

1. **Step 1 — <verb + object>**
   - Files: `…`
   - Tests added: `AC-1`, `AC-2`
   - Done when: …

2. **Step 2 — <verb + object>**
   - Files: `…`
   - Done when: …

3. **Step N — Final validation**
   - Run lint/typecheck/test suite.
   - Manual smoke check (if applicable).

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| … | low/med/high | … |

## Out of Scope

Explicitly list what this task does **not** address to prevent scope creep.

- …
- …

## Diagram (Large tasks only)

```
<dependency or sequence diagram, ASCII or mermaid>
```
