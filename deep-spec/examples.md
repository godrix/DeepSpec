# DeepSpec — End-to-End Examples

Concrete walkthroughs showing the agent's expected behavior at each stage.
The example task is `00-auto-save-by-sound` (auto-save a recording clip when a loud sound is detected). The `00-` prefix is assigned automatically on create.

---

## Example 1 — Initialization

**User:** `Initialize DeepSpec`

**Agent actions:**

1. Detects `.deepspec/` is missing.
2. Creates scaffold:
   ```
   .deepspec/
   ├── AGENTS.md
   ├── memory.md
   └── specs/{drafts,active,archive}/
   ```
3. Scans repo: `package.json`, `tsconfig.json`, `eslint.config.*`, `__tests__/`, etc.
4. Writes `.deepspec/AGENTS.md` with detected stack:
   ```markdown
   # AGENTS.md

   ## Tech Stack
   - React Native (Expo SDK 53), TypeScript
   - Nitro Modules, react-native-vision-camera
   - ffmpeg-kit-react-native for media processing

   ## Coding Standards
   - ESLint + Prettier (config in `eslint.config.mjs`)
   - Path aliases via `tsconfig.json#paths`

   ## Testing
   - Jest with `@testing-library/react-native`
   - Test files in `__tests__/` mirroring `src/`

   ## Personas
   - Mobile RN Engineer (default)
   - Media/FFmpeg specialist (for buffer/encoding tasks)
   ```
5. Presents `AGENTS.md` to user and waits for approval.

---

## Example 2 — Draft Stage

**User:** `Create task auto-save-by-sound`

**Agent actions:**

1. **Context Loading** (in order): reads open files, `AGENTS.md`, `memory.md`, scans `src/lib/BufferManager.ts` and `src/screens/RecordingScreen.tsx`.
2. Scans `drafts/`, `active/`, and `archive/` — no existing `NN-*` folders → assigns prefix `00`.
3. Creates `.deepspec/specs/drafts/00-auto-save-by-sound/` and generates the three files using the templates. Excerpts:

**`APPROACH.md`** (excerpt):
```markdown
## Execution Plan
1. Step 1 — Add `AudioLevelMonitor` module
   - Files: `src/lib/AudioLevelMonitor.ts`
   - Tests added: AC-1, AC-2
   - Done when: unit tests pass and module exposes `onPeak(threshold, cb)`.
2. Step 2 — Wire into RecordingScreen
   - Files: `src/screens/RecordingScreen.tsx`
   - Done when: peak above threshold triggers `BufferManager.exportClip()`.
3. Step 3 — Final validation (lint, typecheck, manual smoke on device).
```

**`BUSINESS_CONTEXT.md`** (excerpt):
```markdown
## Acceptance Criteria
- AC-1: Given the recording is active, when audio peak ≥ -6 dBFS for ≥ 200 ms,
        then a 15s clip ending at the peak is exported.
- AC-2: Given two peaks within 5s, when the second occurs, then a single clip
        covering both peaks is exported (no double-save).
```

**`COMPLETION_REPORT.md`**: initialized with `Status: [PENDING]`.

4. Asks: *"A-B-C drafted in `00-auto-save-by-sound/`. Review the files and respond with `Approve task` to proceed."*

---

## Example 2b — Discard Draft (abandoned spec)

**User:** `Discard task` (or `Discard task` with a reason: scope moved to another project)

**Agent actions:**

1. Moves folder: `.deepspec/specs/drafts/00-auto-save-by-sound/` → `.deepspec/specs/archive/` (skips `active/`).
2. Updates `COMPLETION_REPORT.md`: `Status: [DISCARDED]`, discard date, optional reason.
3. Appends to `.deepspec/memory.md`:
   ```markdown
   [2026-05-28] [00]: [discarded] Product pivot — loud-peak auto-save deferred. Ref: specs/archive/00-auto-save-by-sound
   ```
4. Confirms: *"Draft 00 discarded and archived. No implementation was started."*

**When to use:** the plan is no longer valid, duplicated, or explicitly shelved. Do **not** use `"Complete task"` (that is only for tasks that reached `active/`).

---

## Example 3 — Approval (Stage Transition)

**User:** `Approve task`

**Agent actions:**

1. `git mv .deepspec/specs/drafts/00-auto-save-by-sound .deepspec/specs/active/` (or equivalent file move).
2. Announces: *"Plan approved. Entering active execution. APPROACH.md is now immutable."*
3. Posts the progress checklist:
   ```
   DeepSpec Progress 00-auto-save-by-sound:
   - [ ] Tests written from BUSINESS_CONTEXT acceptance criteria
   - [ ] APPROACH step 1: Add AudioLevelMonitor module
   - [ ] APPROACH step 2: Wire into RecordingScreen
   - [ ] APPROACH step 3: Final validation
   - [ ] All tests pass locally
   - [ ] Lint/typecheck clean
   - [ ] COMPLETION_REPORT.md updated
   ```
4. Starts Step 1 by writing the test file first (TDD).

---

## Example 4 — Active Execution (single step)

**Step 1 in progress:**

1. Writes `__tests__/AudioLevelMonitor.test.ts` covering AC-1 and AC-2 (tests fail — red).
2. Implements `src/lib/AudioLevelMonitor.ts` (tests pass — green).
3. Updates the checklist:
   ```
   - [x] Tests written from BUSINESS_CONTEXT acceptance criteria
   - [x] APPROACH step 1: Add AudioLevelMonitor module
   - [ ] APPROACH step 2: Wire into RecordingScreen
   ...
   ```
4. Appends to `COMPLETION_REPORT.md`:
   ```markdown
   ### Step 1 — Add AudioLevelMonitor module
   - Files touched: `src/lib/AudioLevelMonitor.ts`, `__tests__/AudioLevelMonitor.test.ts`
   - Tests added: AC-1, AC-2 (both passing)
   - Decisions: used a 50 ms ring-buffer over `Audio.recordingStatusListener` to compute peak dBFS.
   - Outcome: ✅ done
   ```

---

## Example 5 — Deviation Mid-Flight

While executing Step 2, the agent discovers `BufferManager.exportClip()` doesn't accept an `endTimestamp` parameter (was assumed in APPROACH).

**Correct behavior:**

1. **Stop** execution immediately.
2. Update `APPROACH.md`:
   ```markdown
   ## Deviations (added 2026-05-11)
   - Step 2 requires extending `BufferManager.exportClip(opts)` to accept
     `endTimestamp`. Adding sub-step 2a.
   ```
3. Ask user: *"APPROACH needs an update (see diff). Respond with `Approve task` to re-lock the contract."*
4. **Do not** silently change scope.

---

## Example 6 — Completion

**User:** `Complete task`

**Agent actions:**

1. Moves folder: `.deepspec/specs/active/00-auto-save-by-sound/` → `.deepspec/specs/archive/`.
2. Finalizes `COMPLETION_REPORT.md` (`Status: [DONE]`, fills test evidence, AC checklist).
3. Appends to `.deepspec/memory.md`:
   ```markdown
   [2026-05-11] 00: Auto-save clip on loud audio peak. Ref: specs/archive/00-auto-save-by-sound

   ## Lessons
   - `Audio.recordingStatusListener` fires at ~10 Hz on Android; for peak detection
     prefer a native module if sub-100ms latency is required.
   ```
4. Confirms to user: *"Task 00 archived and indexed in memory.md."*

---

## Anti-Examples (what NOT to do)

❌ **Skipping Draft:** agent jumps to editing `src/` after `"Create task"`.
✅ Correct: only A-B-C files are created until `"Approve task"`.

❌ **Silent pivot:** agent changes implementation strategy without updating APPROACH.
✅ Correct: pause, update APPROACH, ask for re-approval.

❌ **Reading `archive/` on a hunch:** wastes context.
✅ Correct: only read `archive/` when a reference in `memory.md` points there.

❌ **Heavy docs on small task:** 3-page APPROACH for a 1-file change.
✅ Correct: apply the Task Sizing table — Small tasks get bullet-list APPROACH.

❌ **Deleting a draft folder:** loses audit trail of what was considered and why it stopped.
✅ Correct: `"Discard task"` → `archive/` + `[discarded]` line in `memory.md`.

❌ **Complete task on a draft:** `Complete task` only applies to `active/` tasks.
✅ Correct: use `"Discard task"` for drafts you will not implement.
