import type { TaskStage, TaskSummary } from '../../types/core.js';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSpecRoot } from '../../core/brand.js';
import { parseStatus } from '../../core/status.js';

export { parseStatus } from '../../core/status.js';

const stageDirs = (rootDir: string): Record<TaskStage, string> => ({
  draft: `${rootDir}/specs/drafts`,
  active: `${rootDir}/specs/active`,
  archive: `${rootDir}/specs/archive`,
});

const listStageTasks = async (
  targetDir: string,
  stage: TaskStage,
  rootDir: string
): Promise<TaskSummary[]> => {
  const stagePath = join(targetDir, stageDirs(rootDir)[stage]);

  try {
    const entries = await readdir(stagePath, { withFileTypes: true });
    const tasks = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const reportPath = join(
            stagePath,
            entry.name,
            'COMPLETION_REPORT.md'
          );

          try {
            const contents = await readFile(reportPath, 'utf8');

            return {
              slug: entry.name,
              stage,
              status: parseStatus(contents),
            };
          } catch {
            return {
              slug: entry.name,
              stage,
              status: 'unknown',
            };
          }
        })
    );

    return tasks.toSorted((left, right) => left.slug.localeCompare(right.slug));
  } catch {
    return [];
  }
};

export const listTasks = async (
  targetDir: string,
  stageFilter?: TaskStage
): Promise<TaskSummary[]> => {
  const rootDir = await resolveSpecRoot(targetDir);
  const stages: TaskStage[] = stageFilter
    ? [stageFilter]
    : ['draft', 'active', 'archive'];

  const nested = await Promise.all(
    stages.map((stage) => listStageTasks(targetDir, stage, rootDir))
  );

  return nested.flat();
};

export const formatTaskList = (tasks: TaskSummary[]): string => {
  if (tasks.length === 0) return 'No tasks tracked yet.\n';

  type ViewStage = TaskStage | 'review';
  const grouped = new Map<ViewStage, TaskSummary[]>();

  for (const task of tasks) {
    const view: ViewStage =
      task.stage === 'active' && task.status === '[IN REVIEW]'
        ? 'review'
        : task.stage;
    const bucket = grouped.get(view) ?? [];

    bucket.push(task);
    grouped.set(view, bucket);
  }

  const lines: string[] = ['Tasks:'];
  const order: ViewStage[] = ['draft', 'active', 'review', 'archive'];

  for (const stage of order) {
    const bucket = grouped.get(stage);

    if (!bucket || bucket.length === 0) continue;

    lines.push(`\n${stage}:`);

    for (const task of bucket) lines.push(`- ${task.slug} ${task.status}`);
  }

  return `${lines.join('\n')}\n`;
};
