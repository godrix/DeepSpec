import type { ParsedCliArgs, TaskStage, TaskSummary } from '../types/core.js';
import { stdout } from 'node:process';
import { listTasks } from '../hooks/list/list.js';
import { PRODUCT_NAME } from '../core/brand.js';
import { interactiveSelect } from './interactive-select.js';
import { isInteractive, promptText } from './prompt.js';
import {
  filterTasksByView,
  runAgentCommand,
  runApprove,
  runCreate,
  runDiscard,
  runMemory,
  runRevise,
  runShow,
  runValidate,
} from './commands/pipeline.js';
import { browseReviewDecide, browseReviewPlan } from './review-plan.js';
import { headerText } from './banner.js';

type MenuAction =
  | { kind: 'create' }
  | { kind: 'stage'; view: TaskStage | 'review' }
  | { kind: 'memory' }
  | { kind: 'agent' }
  | { kind: 'quit' };

type TaskAction =
  | { kind: 'review' }
  | { kind: 'show' }
  | { kind: 'validate' }
  | { kind: 'approve' }
  | { kind: 'revise' }
  | { kind: 'discard' }
  | { kind: 'back' };

const print = (line: string): void => {
  stdout.write(`${line}\n`);
};

const baseArgs = (): ParsedCliArgs => ({
  command: undefined,
  agent: undefined,
  slug: undefined,
  stage: undefined,
  reason: undefined,
  name: undefined,
  description: undefined,
  full: false,
  run: false,
  print: false,
  force: false,
  dryRun: false,
  help: false,
  version: false,
});

const countLabel = (label: string, count: number): string =>
  `${label} (${count})`;

const askRunViaAgent = async (): Promise<boolean> => {
  const index = await interactiveSelect({
    title: 'Invoke configured agent CLI?',
    hint: 'Uses agent from .deepspec/manifest.json (or DEEPSPEC_AGENT)',
    options: [{ label: 'Yes — run agent CLI' }, { label: 'No — local only' }],
  });

  return index === 0;
};

const buildStageMenu = (): MenuAction[] => [
  { kind: 'create' },
  { kind: 'stage', view: 'draft' },
  { kind: 'stage', view: 'active' },
  { kind: 'stage', view: 'review' },
  { kind: 'stage', view: 'archive' },
  { kind: 'memory' },
  { kind: 'agent' },
  { kind: 'quit' },
];

const stageLabels = (tasks: TaskSummary[]): string[] => {
  const counts = {
    draft: filterTasksByView(tasks, 'draft').length,
    active: filterTasksByView(tasks, 'active').length,
    review: filterTasksByView(tasks, 'review').length,
    archive: filterTasksByView(tasks, 'archive').length,
  };

  return [
    'New task',
    countLabel('Drafts', counts.draft),
    countLabel('Active', counts.active),
    countLabel('Review', counts.review),
    countLabel('Archive', counts.archive),
    'Memory',
    'Agent status',
    'Quit',
  ];
};

const taskActionsFor = (task: TaskSummary): TaskAction[] => {
  const actions: TaskAction[] = [];

  if (task.stage === 'draft') {
    actions.push(
      { kind: 'review' },
      { kind: 'approve' },
      { kind: 'revise' },
      { kind: 'discard' }
    );
  } else {
    actions.push({ kind: 'show' }, { kind: 'review' });
  }

  actions.push({ kind: 'validate' }, { kind: 'back' });

  return actions;
};

const taskActionLabels = (actions: TaskAction[]): string[] =>
  actions.map((action) => {
    switch (action.kind) {
      case 'review':
        return 'Review plan (A / B / C)';
      case 'show':
        return 'Show summary';
      case 'validate':
        return 'Validate';
      case 'approve':
        return 'Approve → active';
      case 'revise':
        return 'Request changes';
      case 'discard':
        return 'Discard draft';
      case 'back':
        return 'Back';
    }
  });

const browseCreate = async (cwd: string): Promise<void> => {
  const description = await promptText('What do you want to build? ');

  if (!description) {
    print('Cancelled — empty description.');
    return;
  }

  const name = await promptText('Title / slug (optional, Enter to derive): ');
  const run = await askRunViaAgent();

  print('');
  await runCreate(cwd, {
    ...baseArgs(),
    command: 'create',
    name: name || undefined,
    description,
    run,
  });
};

const handleApprove = async (
  cwd: string,
  slug: string
): Promise<'done' | 'continue'> => {
  const run = await askRunViaAgent();

  print('');
  await runApprove(cwd, slug, { ...baseArgs(), run });
  return 'done';
};

const handleRevise = async (
  cwd: string,
  slug: string
): Promise<'done' | 'continue'> => {
  const feedback = await promptText('What should change in the plan? ');

  if (!feedback) {
    print('Cancelled — empty feedback.');
    return 'continue';
  }

  const run = await askRunViaAgent();

  print('');
  await runRevise(cwd, slug, feedback, { ...baseArgs(), run });
  return 'continue';
};

const handleDiscard = async (
  cwd: string,
  slug: string
): Promise<'done' | 'continue'> => {
  const reason = await promptText('Discard reason (optional): ');
  const run = await askRunViaAgent();

  print('');
  await runDiscard(cwd, slug, reason || undefined, {
    ...baseArgs(),
    run,
  });
  return 'done';
};

const reviewThenDecide = async (
  cwd: string,
  task: TaskSummary
): Promise<'done' | 'continue'> => {
  for (;;) {
    const outcome = await browseReviewPlan(cwd, task);

    if (outcome === 'continue') return 'continue';

    const decided = await browseReviewDecide(cwd, task, {
      approve: () => handleApprove(cwd, task.slug),
      revise: () => handleRevise(cwd, task.slug),
      discard: () => handleDiscard(cwd, task.slug),
    });

    if (decided === 'done') return 'done';
  }
};

const browseTask = async (cwd: string, task: TaskSummary): Promise<void> => {
  for (;;) {
    const actions = taskActionsFor(task);
    const index = await interactiveSelect({
      title: `${task.slug}  ${task.status}`,
      hint: '↑/↓ move · Enter select · Esc/q back',
      options: taskActionLabels(actions).map((label) => ({ label })),
    });

    if (index === undefined) return;

    const action = actions[index];

    if (action.kind === 'back') return;

    if (action.kind === 'review') {
      const outcome = await reviewThenDecide(cwd, task);

      if (outcome === 'done') return;
      continue;
    }

    if (action.kind === 'show') {
      print('');
      await runShow(cwd, task.slug, { full: false });
      print('');
      continue;
    }

    if (action.kind === 'validate') {
      print('');
      try {
        await runValidate(cwd, task.slug);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        print(message);
      }
      print('');
      continue;
    }

    if (action.kind === 'approve') {
      await handleApprove(cwd, task.slug);
      return;
    }

    if (action.kind === 'revise') {
      await handleRevise(cwd, task.slug);
      continue;
    }

    if (action.kind === 'discard') {
      await handleDiscard(cwd, task.slug);
      return;
    }
  }
};

const browseStage = async (
  cwd: string,
  view: TaskStage | 'review',
  tasks: TaskSummary[]
): Promise<void> => {
  const bucket = filterTasksByView(tasks, view);

  if (bucket.length === 0) {
    print(`No tasks in ${view}.`);
    return;
  }

  const index = await interactiveSelect({
    title: `${view} tasks`,
    hint: '↑/↓ move · Enter open · Esc/q back',
    options: bucket.map((task) => ({
      label: `${task.slug}  ${task.status}`,
    })),
  });

  if (index === undefined) return;

  await browseTask(cwd, bucket[index]);
};

export const runBrowse = async (cwd: string): Promise<void> => {
  if (!isInteractive())
    throw new Error(
      'Interactive browse requires a TTY. Use: deep-spec list | create | show | approve | revise | discard | run'
    );

  print(headerText());
  print(`${PRODUCT_NAME} pipeline browser`);
  print('');

  for (;;) {
    const tasks = await listTasks(cwd);
    const menu = buildStageMenu();
    const index = await interactiveSelect({
      title: 'Specs',
      hint: '↑/↓ move · Enter select · Esc/q quit',
      options: stageLabels(tasks).map((label) => ({ label })),
    });

    if (index === undefined) {
      print('Bye.');
      return;
    }

    const action = menu[index];

    if (action.kind === 'quit') {
      print('Bye.');
      return;
    }

    if (action.kind === 'create') {
      print('');
      await browseCreate(cwd);
      print('');
      continue;
    }

    if (action.kind === 'memory') {
      print('');
      await runMemory(cwd);
      print('');
      continue;
    }

    if (action.kind === 'agent') {
      print('');
      await runAgentCommand(cwd, baseArgs());
      print('');
      continue;
    }

    print('');
    await browseStage(cwd, action.view, tasks);
    print('');
  }
};
