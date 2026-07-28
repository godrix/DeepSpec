import type { TaskStage, TaskSummary } from '../types/core.js';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSpecRoot, specsDir } from './brand.js';
import { parseStatus } from './status.js';

const STAGE_FOLDERS: Record<TaskStage, string> = {
  draft: 'drafts',
  active: 'active',
  archive: 'archive',
};

export type LocatedTask = {
  slug: string;
  stage: TaskStage;
  status: string;
  rootDir: string;
  folderPath: string;
  specsPath: string;
};

export const stageFolderName = (stage: TaskStage): string => STAGE_FOLDERS[stage];

export const locateTask = async (
  targetDir: string,
  slug: string
): Promise<LocatedTask | undefined> => {
  const rootDir = await resolveSpecRoot(targetDir);
  const specsPath = specsDir(targetDir, rootDir);

  for (const stage of ['draft', 'active', 'archive'] as TaskStage[]) {
    const folderPath = join(specsPath, STAGE_FOLDERS[stage], slug);

    try {
      await access(join(folderPath, 'COMPLETION_REPORT.md'));
      const contents = await readFile(
        join(folderPath, 'COMPLETION_REPORT.md'),
        'utf8'
      );

      return {
        slug,
        stage,
        status: parseStatus(contents),
        rootDir,
        folderPath,
        specsPath,
      };
    } catch {
      continue;
    }
  }

  return undefined;
};

export const listAbcFiles = async (folderPath: string): Promise<string[]> => {
  try {
    const entries = await readdir(folderPath);

    return entries
      .filter((name) => name.endsWith('.md'))
      .toSorted((left, right) => left.localeCompare(right));
  } catch {
    return [];
  }
};

export const toViewStage = (
  task: Pick<TaskSummary, 'stage' | 'status'>
): TaskStage | 'review' =>
  task.stage === 'active' && task.status === '[IN REVIEW]'
    ? 'review'
    : task.stage;
