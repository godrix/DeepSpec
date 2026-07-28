import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { formatTaskList, listTasks } from '../../hooks/list/list.js';
import { isTaskStage } from '../../core/tracking.js';
import {
  listAbcFiles,
  locateTask,
  toViewStage,
} from '../../core/task-locate.js';
import {
  approveDraftTask,
  discardDraftTask,
  requestDraftChanges,
} from '../../core/task-ops.js';
import { createDraftTask } from '../../core/create-task.js';
import {
  formatMemory,
  readMemoryEntries,
} from '../../core/memory-view.js';
import {
  buildSlashPrompt,
  describeAgentStatus,
  invokeConfiguredAgent,
} from '../../core/agent-invoke.js';
import { validateTask } from '../../hooks/validate/validate.js';
import type { ParsedCliArgs, TaskStage, TaskSummary } from '../../types/core.js';

const print = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

const invokeOpts = (args: ParsedCliArgs) => ({
  agent: args.agent,
  print: args.print || undefined,
  force: args.force || undefined,
  dryRun: args.dryRun || undefined,
});

const runAgentPrompt = async (
  cwd: string,
  args: ParsedCliArgs,
  prompt: string
): Promise<void> => {
  const result = await invokeConfiguredAgent(cwd, prompt, invokeOpts(args));

  if (result.dryRun) {
    print(`[dry-run] ${result.commandLine}`);
    return;
  }

  if (!result.ok) throw new Error(result.error ?? 'Agent invoke failed.');
};

export const runList = async (
  cwd: string,
  args: ParsedCliArgs
): Promise<void> => {
  const stageFilter =
    args.stage && args.stage !== 'review' && isTaskStage(args.stage)
      ? args.stage
      : undefined;
  let tasks = await listTasks(cwd, stageFilter);

  if (args.stage === 'review')
    tasks = tasks.filter(
      (task) => task.stage === 'active' && task.status === '[IN REVIEW]'
    );
  else if (args.stage === 'active')
    tasks = tasks.filter((task) => task.status !== '[IN REVIEW]');

  process.stdout.write(formatTaskList(tasks));
};

export const runShow = async (
  cwd: string,
  slug: string | undefined,
  options?: { full?: boolean }
): Promise<void> => {
  if (!slug) throw new Error('Usage: deep-spec show <slug> [--full]');

  const located = await locateTask(cwd, slug);

  if (!located) throw new Error(`Task "${slug}" not found.`);

  const files = await listAbcFiles(located.folderPath);
  const view = toViewStage(located);
  const lines = [
    `Task: ${located.slug}`,
    `Stage: ${view}`,
    `Status: ${located.status}`,
    `Path: ${located.folderPath}`,
    '',
    'Files:',
    ...files.map((file) => `  - ${file}`),
  ];

  const previewLimit = options?.full ? Number.POSITIVE_INFINITY : 16;

  for (const name of [
    'BUSINESS_CONTEXT.md',
    'APPROACH.md',
    'COMPLETION_REPORT.md',
    'OPEN_QUESTIONS.md',
  ]) {
    try {
      const contents = await readFile(join(located.folderPath, name), 'utf8');
      const preview = contents
        .split('\n')
        .slice(0, previewLimit)
        .join('\n')
        .trimEnd();
      const truncated =
        !options?.full && contents.split('\n').length > previewLimit
          ? '\n… (use --full for complete review)'
          : '';

      lines.push('', `── ${name} ──`, `${preview}${truncated}`);
    } catch {
      // missing file
    }
  }

  print(lines.join('\n'));
};

export const runMemory = async (cwd: string): Promise<void> => {
  const entries = await readMemoryEntries(cwd);

  process.stdout.write(formatMemory(entries));
};

export const runDiscard = async (
  cwd: string,
  slug: string | undefined,
  reason: string | undefined,
  args?: ParsedCliArgs
): Promise<void> => {
  if (!slug) throw new Error('Usage: deep-spec discard <slug> [--reason “…"]');

  if (args?.run) {
    const prompt = buildSlashPrompt(
      'discard-task',
      [slug, reason].filter(Boolean).join(' ')
    );

    await runAgentPrompt(cwd, args, prompt);
    return;
  }

  const result = await discardDraftTask(cwd, slug, reason);

  if (!result.ok) throw new Error(result.error ?? 'Discard failed.');

  print(result.message ?? 'Draft discarded.');
};

export const runValidate = async (
  cwd: string,
  slug: string | undefined
): Promise<void> => {
  if (!slug) throw new Error('Usage: deep-spec validate <slug>');

  const result = await validateTask(cwd, slug);

  print(JSON.stringify(result, null, 2));

  if (!result.valid) throw new Error(`Validation failed for "${slug}".`);
};

export const runCreate = async (
  cwd: string,
  args: ParsedCliArgs
): Promise<void> => {
  const description = args.description?.trim();

  if (!description)
    throw new Error(
      'Usage: deep-spec create "what you want" [--name "Title"] [--run]'
    );

  if (args.run) {
    const prompt = buildSlashPrompt(
      'create-task',
      [args.name, description].filter(Boolean).join(' ')
    );

    await runAgentPrompt(cwd, args, prompt);
    return;
  }

  const result = await createDraftTask(cwd, {
    description,
    name: args.name,
    slug: args.name,
  });

  if (!result.ok) throw new Error(result.error ?? 'Create failed.');

  print(result.message ?? `Draft created: ${result.slug}`);
  print('Tip: deep-spec create "…" --run  → agent fills full A-B-C via CLI');
};

export const runApprove = async (
  cwd: string,
  slug: string | undefined,
  args?: ParsedCliArgs
): Promise<void> => {
  if (!slug) throw new Error('Usage: deep-spec approve <slug> [--run]');

  if (args?.run) {
    await runAgentPrompt(cwd, args, buildSlashPrompt('approve-task', slug));
    return;
  }

  const result = await approveDraftTask(cwd, slug);

  if (!result.ok) throw new Error(result.error ?? 'Approve failed.');

  print(result.message ?? 'Draft approved.');
  print('Tip: deep-spec approve <slug> --run  → agent approves + implements');
};

export const runRevise = async (
  cwd: string,
  slug: string | undefined,
  feedback: string | undefined,
  args?: ParsedCliArgs
): Promise<void> => {
  if (!slug || !feedback?.trim())
    throw new Error(
      'Usage: deep-spec revise <slug> "feedback" [--run]  (or --message / -m)'
    );

  if (args?.run) {
    await runAgentPrompt(
      cwd,
      args,
      buildSlashPrompt('revise-task', `${slug} ${feedback.trim()}`)
    );
    return;
  }

  const result = await requestDraftChanges(cwd, slug, feedback);

  if (!result.ok) throw new Error(result.error ?? 'Revise failed.');

  print(result.message ?? 'Feedback recorded.');
  print('Tip: deep-spec revise <slug> "…" --run  → agent revises the plan');
};

export const runAgentCommand = async (
  cwd: string,
  args: ParsedCliArgs
): Promise<void> => {
  print(await describeAgentStatus(cwd, args.agent));
};

export const runPromptCommand = async (
  cwd: string,
  args: ParsedCliArgs
): Promise<void> => {
  const prompt = args.description?.trim();

  if (!prompt)
    throw new Error(
      'Usage: deep-spec run "/deepspec.approve-task my-slug"  (or any prompt)'
    );

  await runAgentPrompt(cwd, args, prompt);
};

export const filterTasksByView = (
  tasks: TaskSummary[],
  view: TaskStage | 'review'
): TaskSummary[] => {
  if (view === 'review')
    return tasks.filter(
      (task) => task.stage === 'active' && task.status === '[IN REVIEW]'
    );

  if (view === 'active')
    return tasks.filter(
      (task) => task.stage === 'active' && task.status !== '[IN REVIEW]'
    );

  return tasks.filter((task) => task.stage === view);
};
