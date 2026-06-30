import type {
  EntryClassification,
  FoldState,
  ItemMatch,
  ObservedEntry,
  TaskStage,
  TrackingEntry,
  TrackingMap,
} from '../types/core.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  LEGACY_ROOT_DIR,
  PACKAGE_NAME,
  ROOT_DIR,
  resolveSpecRoot,
} from './brand.js';
import { ensureDir, writeFileOverwrite } from './fs-actions.js';

const STAGES: TaskStage[] = ['draft', 'active', 'archive'];

export const isTaskStage = (value: string): value is TaskStage =>
  STAGES.includes(value as TaskStage);

export const emptyTrackingMap = (): TrackingMap => ({
  name: PACKAGE_NAME,
  entries: [],
});

export const samePaths = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false;

  const sortedRight = right.toSorted();

  return left.toSorted().every((path, index) => path === sortedRight[index]);
};

const matchItem = (observed: ObservedEntry, map: TrackingMap): ItemMatch => {
  const existing = map.entries.find((entry) => entry.name === observed.name);

  if (existing) {
    const pathsChanged = !samePaths(existing.paths, observed.paths);
    const stageChanged = existing.stage !== observed.stage;
    const classification: EntryClassification =
      pathsChanged || stageChanged ? 'moved' : 'unchanged';

    return {
      entry: {
        name: existing.name,
        stage: observed.stage,
        paths: [...observed.paths],
      },
      classification: { name: existing.name, classification },
    };
  }

  return {
    entry: {
      name: observed.name,
      stage: observed.stage,
      paths: [...observed.paths],
    },
    classification: { name: observed.name, classification: 'new' },
  };
};

const upsert = (
  entries: TrackingEntry[],
  next: TrackingEntry
): TrackingEntry[] =>
  entries.some((entry) => entry.name === next.name)
    ? entries.map((entry) => (entry.name === next.name ? next : entry))
    : [...entries, next];

export const foldEntries = (
  map: TrackingMap,
  observed: ObservedEntry[]
): FoldState =>
  observed.reduce<FoldState>(
    (state, item) => {
      const match = matchItem(item, state.map);

      return {
        map: {
          name: PACKAGE_NAME,
          entries: upsert(state.map.entries, match.entry),
        },
        classifications: [...state.classifications, match.classification],
      };
    },
    { map, classifications: [] }
  );

const isObservedEntry = (value: unknown): value is ObservedEntry =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as ObservedEntry).name === 'string' &&
  isTaskStage((value as ObservedEntry).stage) &&
  Array.isArray((value as ObservedEntry).paths) &&
  (value as ObservedEntry).paths.every((path) => typeof path === 'string');

export const toObservedEntries = (value: unknown): ObservedEntry[] =>
  Array.isArray(value)
    ? value.filter(isObservedEntry).map((entry) => ({
        name: entry.name,
        stage: entry.stage,
        paths: [...entry.paths],
      }))
    : [];

export const parseObservedPayload = (raw: string): ObservedEntry[] => {
  const parsed: unknown = JSON.parse(raw);

  return toObservedEntries((parsed as { entries?: unknown }).entries);
};

const normalizeEntry = (value: unknown): TrackingEntry | undefined => {
  if (typeof value !== 'object' || value === null) return undefined;

  const candidate = value as Record<string, unknown>;
  const { name } = candidate;
  const stage = candidate.stage;
  const paths = Array.isArray(candidate.paths)
    ? candidate.paths.filter((path): path is string => typeof path === 'string')
    : [];

  if (typeof name !== 'string') return undefined;
  if (typeof stage !== 'string' || !isTaskStage(stage)) return undefined;

  return { name, stage, paths };
};

const parseTrackingMap = (raw: string): TrackingMap => {
  const parsed: unknown = JSON.parse(raw);

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !Array.isArray((parsed as { entries?: unknown }).entries)
  )
    return emptyTrackingMap();

  const entries = (parsed as { entries: unknown[] }).entries
    .map(normalizeEntry)
    .filter((entry): entry is TrackingEntry => entry !== undefined);

  return { name: PACKAGE_NAME, entries };
};

const readTrackingFile = async (
  targetDir: string,
  rootDir: string
): Promise<TrackingMap | undefined> => {
  try {
    const raw = await readFile(
      join(targetDir, rootDir, 'tracking.json'),
      'utf8'
    );

    return parseTrackingMap(raw);
  } catch {
    return undefined;
  }
};

export const loadTrackingMap = async (
  targetDir: string
): Promise<TrackingMap> => {
  const primary = await readTrackingFile(targetDir, ROOT_DIR);
  if (primary) return primary;

  const legacy = await readTrackingFile(targetDir, LEGACY_ROOT_DIR);
  if (legacy) return legacy;

  return emptyTrackingMap();
};

export const serializeTrackingMap = (map: TrackingMap): string =>
  `${JSON.stringify(map, null, 2)}\n`;

export const writeTrackingMap = async (
  targetDir: string,
  map: TrackingMap
): Promise<void> => {
  const rootDir = await resolveSpecRoot(targetDir);
  const trackingPath = join(targetDir, rootDir, 'tracking.json');

  await ensureDir(join(targetDir, rootDir));
  await writeFileOverwrite(trackingPath, serializeTrackingMap(map));
};
