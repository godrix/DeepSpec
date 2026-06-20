import { describe, it, strict } from 'poku';
import { foldEntries, emptyTrackingMap } from '../../../src/core/tracking.js';
import { repairEntries } from '../../../src/hooks/repair/repair.js';
import { trackEntries } from '../../../src/hooks/track/track.js';

describe('tracking hooks', () => {
  it('registers a new task entry', () => {
    const map = emptyTrackingMap();
    const result = trackEntries(map, [
      { name: 'my-task', stage: 'draft', paths: ['src/a.ts'] },
    ]);

    strict.strictEqual(result.updatedMap.entries.length, 1);
    strict.strictEqual(result.classifications[0].classification, 'new');
  });

  it('detects stage moves', () => {
    const map = emptyTrackingMap();
    const tracked = trackEntries(map, [
      { name: 'my-task', stage: 'draft', paths: ['src/a.ts'] },
    ]);
    const moved = trackEntries(tracked.updatedMap, [
      { name: 'my-task', stage: 'active', paths: ['src/a.ts'] },
    ]);

    strict.strictEqual(moved.classifications[0].classification, 'moved');
    strict.strictEqual(moved.updatedMap.entries[0].stage, 'active');
  });

  it('reconciles observed entries and flags orphans', () => {
    const folded = foldEntries(emptyTrackingMap(), [
      { name: 'kept', stage: 'active', paths: ['src/a.ts'] },
      { name: 'gone', stage: 'archive', paths: ['src/b.ts'] },
    ]);
    const result = repairEntries(folded.map, [
      { name: 'kept', stage: 'active', paths: ['src/a.ts'] },
    ]);

    strict.strictEqual(result.unresolved.length, 1);
    strict.strictEqual(result.unresolved[0].name, 'gone');
  });
});
