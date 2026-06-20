import type { ManifestData, ManifestInput } from '../types/core.js';

export const buildManifest = (input: ManifestInput): ManifestData => ({
  name: 'deep-spec',
  version: input.version,
  agent: input.agent,
  createdAt: input.now.toISOString(),
  files: input.files,
});

export const serializeManifest = (data: ManifestData): string =>
  `${JSON.stringify(data, null, 2)}\n`;
