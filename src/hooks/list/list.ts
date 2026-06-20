import type { TaskStage, TaskSummary } from '../../types/core.js';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const STAGE_DIRS: Record<TaskStage, string> = {
  draft: '.deepspec/specs/drafts',
  active: '.deepspec/specs/active',
  archive: '.deepspec/specs/archive',
};

const STATUS_PATTERN =
  /\*\*Status:\*\*\s*`(\[PENDING\]|\[IN PROGRESS\]|\[IN REVIEW\]|\[DONE\]|\[DISCARDED\])`/;

export const parseStatus = (contents: string): string => {
  const match = contents.match(STATUS_PATTERN);

  return match ? match[1] : 'unknown';
};

const listStageTasks = async (
  targetDir: string,
  stage: TaskStage
): Promise<TaskSummary[]> => {
  const stagePath = join(targetDir, STAGE_DIRS[stage]);

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
  const stages: TaskStage[] = stageFilter
    ? [stageFilter]
    : ['draft', 'active', 'archive'];

  const nested = await Promise.all(
    stages.map((stage) => listStageTasks(targetDir, stage))
  );

  return nested.flat();
};

export const formatTaskList = (tasks: TaskSummary[]): string => {
  if (tasks.length === 0) return 'No tasks tracked yet.\n';

  const grouped = new Map<TaskStage, TaskSummary[]>();

  for (const task of tasks) {
    const bucket = grouped.get(task.stage) ?? [];

    bucket.push(task);
    grouped.set(task.stage, bucket);
  }

  const lines: string[] = ['Tasks:'];

  for (const stage of ['draft', 'active', 'archive'] as TaskStage[]) {
    const bucket = grouped.get(stage);

    if (!bucket || bucket.length === 0) continue;

    lines.push(`\n${stage}:`);

    for (const task of bucket) lines.push(`- ${task.slug} ${task.status}`);
  }

  return `${lines.join('\n')}\n`;
};
