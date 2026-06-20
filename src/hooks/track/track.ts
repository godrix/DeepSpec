import type {
  ObservedEntry,
  TrackingMap,
  TrackResult,
} from '../../types/core.js';
import {
  foldEntries,
  loadTrackingMap,
  parseObservedPayload,
  serializeTrackingMap,
  writeTrackingMap,
} from '../../core/tracking.js';

export const trackEntries = (
  map: TrackingMap,
  observed: ObservedEntry[]
): TrackResult => {
  const folded = foldEntries(map, observed);

  return {
    updatedMap: folded.map,
    classifications: folded.classifications,
  };
};

/** Registers task entries in the tracking map */
export const track = async (
  targetDir: string,
  payload: string
): Promise<string> => {
  const entries = parseObservedPayload(payload);

  if (entries.length === 0)
    return `${JSON.stringify({ classifications: [] }, null, 2)}\n`;

  const map = await loadTrackingMap(targetDir);
  const result = trackEntries(map, entries);

  if (serializeTrackingMap(map) !== serializeTrackingMap(result.updatedMap))
    await writeTrackingMap(targetDir, result.updatedMap);

  return `${JSON.stringify({ classifications: result.classifications }, null, 2)}\n`;
};
