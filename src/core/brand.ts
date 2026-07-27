import { access } from 'node:fs/promises';
import { join } from 'node:path';

export const PRODUCT_NAME = 'DeepSpec';
export const ROOT_DIR = '.deepspec';
export const LEGACY_ROOT_DIR = '.spec.md';
export const PACKAGE_NAME = 'deep-spec';
export const COMMAND_PREFIX = 'deepspec';
export const ORCHESTRATOR_DIR = 'deep-spec';

export const commandName = (key: string): string => `${COMMAND_PREFIX}.${key}`;

export const resolveSpecRoot = async (
  workspacePath: string
): Promise<string> => {
  try {
    await access(join(workspacePath, ROOT_DIR));
    return ROOT_DIR;
  } catch {
    try {
      await access(join(workspacePath, LEGACY_ROOT_DIR));
      return LEGACY_ROOT_DIR;
    } catch {
      return ROOT_DIR;
    }
  }
};

export const trackingPath = (workspacePath: string, rootDir: string): string =>
  join(workspacePath, rootDir, 'tracking.json');

export const specsDir = (workspacePath: string, rootDir: string): string =>
  join(workspacePath, rootDir, 'specs');
