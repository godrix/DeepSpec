# Changelog

All notable changes to the **deep-spec** skill are documented in this file.
The active version lives in the `SKILL.md` frontmatter (`version` field).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project follows [Semantic Versioning](https://semver.org/): **major** = breaking workflow/commands; **minor** = compatible features; **patch** = docs/clarifications only.

## [2.0.0] — 2026-05-31

### Added

- Mandatory **Review Gate** after execution (`[IN REVIEW]`); `Complete task` only after user approval.
- `## Review Rounds` section in `APPROACH.md` for post-implementation iteration.
- `## Review Gate` section in `COMPLETION_REPORT.md`; `[IN REVIEW]` status.
- Optional `Revise task` / `Refinar tarefa` commands as feedback aliases at the gate.
- Guards on `Complete task` (reject if `[IN PROGRESS]` or a review round is in progress).

### Changed

- Pipeline: `active/` → execute → Review Gate → `Complete task` → `archive/`.
- Immutability scoped to `## Execution Plan`; mid-flight pivots go in `## Deviations`.

## [1.0.0] — 2026-05-28

### Added

- `drafts` → `active` → `archive` pipeline with A-B-C flow.
- Commands: Initialize, Create task, Approve task, Discard task, Complete task.
- APPROACH, BUSINESS_CONTEXT, and COMPLETION_REPORT templates.
