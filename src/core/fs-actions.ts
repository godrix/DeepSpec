import type { FileOutcome } from '../types/core.js';
import { mkdir, writeFile } from 'node:fs/promises';

const isFileExistsError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && (error as NodeJS.ErrnoException).code === 'EEXIST';

export const ensureDir = async (dir: string): Promise<void> => {
  await mkdir(dir, { recursive: true });
};

export const writeFileIfAbsent = async (
  filePath: string,
  contents: string
): Promise<FileOutcome> => {
  try {
    await writeFile(filePath, contents, { encoding: 'utf8', flag: 'wx' });

    return { path: filePath, status: 'created' };
  } catch (error) {
    if (isFileExistsError(error)) return { path: filePath, status: 'skipped' };

    throw error;
  }
};

export const writeFileOverwrite = async (
  filePath: string,
  contents: string
): Promise<void> => {
  await writeFile(filePath, contents, 'utf8');
};
