# Diagram architecture

Create or update `ARCHITECTURE.md` for a task with Mermaid diagrams.

**Trigger:** `"Diagram architecture"` or `/spec.md.diagram-architecture`

Resolves the task in context (`drafts/` or `active/`; asks for slug if ambiguous). Reads `APPROACH.md` and affected code paths, then writes `ARCHITECTURE.md` in the task folder with one or more `mermaid` blocks, a legend, and links to real files.

`ARCHITECTURE.md` is optional and generated on demand — it is not part of the core A-B-C set. Use `/spec.md.create-task` for planning; run this command when a visual architecture artifact helps review.
