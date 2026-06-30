import type { ManifestData, ManifestInput } from '../types/core.js';
import { PACKAGE_NAME } from './brand.js';

export const buildManifest = (input: ManifestInput): ManifestData => ({
  name: PACKAGE_NAME,
  version: input.version,
  agent: input.agent,
  createdAt: input.now.toISOString(),
  files: input.files,
});

export const serializeManifest = (data: ManifestData): string =>
  `${JSON.stringify(data, null, 2)}\n`;
