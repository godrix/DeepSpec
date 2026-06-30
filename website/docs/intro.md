---
slug: /
---

# Introduction

spec.md turns intent into production code with auditable specs. It uses a **3-stage pipeline** and the **A-B-C documentation flow**.

## Pipeline

```
drafts/ → (Approve) → active/ → Review Gate → (Complete) → archive/
```

## A-B-C

- **A** `APPROACH.md` — technical blueprint
- **B** `BUSINESS_CONTEXT.md` — goals and acceptance criteria
- **C** `COMPLETION_REPORT.md` — execution evidence

## Why spec-first?

- Single source of truth before code changes
- Acceptance criteria drive TDD
- Review Gate ensures human approval
- `memory.md` indexes past work without bloating context

See [Workflow](./workflow) and [Install](./install) to get started.
