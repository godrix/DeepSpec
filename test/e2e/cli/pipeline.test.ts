import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, strict } from 'poku';
import { run } from '../../../src/cli/run.js';
import { createDraftTask } from '../../../src/core/create-task.js';
import {
  approveDraftTask,
  discardDraftTask,
  requestDraftChanges,
} from '../../../src/core/task-ops.js';
import { listTasks } from '../../../src/hooks/list/list.js';
import { initInto, newWorkspace, packageRoot } from '../init/__utils__.js';

const writeDraft = async (workspace: string, slug: string): Promise<void> => {
  const dir = join(workspace, '.deepspec/specs/drafts', slug);

  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, 'APPROACH.md'),
    '# APPROACH\n\n## Execution Plan\n\n1. Do the thing\n',
    'utf8'
  );
  await writeFile(
    join(dir, 'BUSINESS_CONTEXT.md'),
    '# BUSINESS CONTEXT\n\nShip interactive CLI.\n',
    'utf8'
  );
  await writeFile(
    join(dir, 'COMPLETION_REPORT.md'),
    '# COMPLETION REPORT\n\n**Status:** `[PENDING]`\n',
    'utf8'
  );
};

await describe('CLI pipeline commands', async () => {
  await it('lists draft tasks', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });
    await writeDraft(workspace, 'cli-browser');

    const tasks = await listTasks(workspace);

    strict.equal(tasks.length, 1);
    strict.equal(tasks[0].slug, 'cli-browser');
    strict.equal(tasks[0].stage, 'draft');
  });

  await it('shows a task summary', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });
    await writeDraft(workspace, 'show-me');

    let output = '';
    const original = process.stdout.write.bind(process.stdout);

    process.stdout.write = ((chunk: string | Uint8Array) => {
      output +=
        typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString();
      return true;
    }) as typeof process.stdout.write;

    try {
      await run(
        {
          command: 'show',
          agent: undefined,
          slug: 'show-me',
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
        },
        workspace,
        packageRoot
      );
    } finally {
      process.stdout.write = original;
    }

    strict.equal(output.includes('Task: show-me'), true);
    strict.equal(output.includes('Stage: draft'), true);
    strict.equal(output.includes('BUSINESS_CONTEXT.md'), true);
  });

  await it('creates a draft from intent, then approves it', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    const created = await createDraftTask(workspace, {
      description: 'add retry logic to payment webhook',
      name: 'Webhook Retry',
    });

    strict.equal(created.ok, true);
    strict.equal(created.slug, 'webhook-retry');

    const drafts = await listTasks(workspace, 'draft');
    strict.equal(
      drafts.some((task) => task.slug === 'webhook-retry'),
      true
    );

    const approved = await approveDraftTask(workspace, 'webhook-retry');

    strict.equal(approved.ok, true);

    const tasks = await listTasks(workspace);
    const active = tasks.find((task) => task.slug === 'webhook-retry');

    strict.equal(active?.stage, 'active');
    strict.equal(active?.status, '[IN PROGRESS]');
  });

  await it('records draft review feedback', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });
    await writeDraft(workspace, 'needs-tweaks');

    const result = await requestDraftChanges(
      workspace,
      'needs-tweaks',
      'Add acceptance criteria for timeout handling'
    );

    strict.equal(result.ok, true);

    const approach = await readFile(
      join(workspace, '.deepspec/specs/drafts/needs-tweaks/APPROACH.md'),
      'utf8'
    );

    strict.equal(approach.includes('## Draft Review Feedback'), true);
    strict.equal(approach.includes('timeout handling'), true);
  });

  await it('dry-runs agent approve against configured cursor-agent', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });
    await writeDraft(workspace, 'agent-run');

    let output = '';
    const original = process.stdout.write.bind(process.stdout);

    process.stdout.write = ((chunk: string | Uint8Array) => {
      output +=
        typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString();
      return true;
    }) as typeof process.stdout.write;

    try {
      await run(
        {
          command: 'approve',
          agent: undefined,
          slug: 'agent-run',
          stage: undefined,
          reason: undefined,
          name: undefined,
          description: undefined,
          full: false,
          run: true,
          print: true,
          force: true,
          dryRun: true,
          help: false,
          version: false,
        },
        workspace,
        packageRoot
      );
    } finally {
      process.stdout.write = original;
    }

    strict.equal(output.includes('[dry-run]'), true);
    strict.equal(output.includes('/deepspec.approve-task agent-run'), true);
  });

  await it('discards a draft into archive and memory', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });
    await writeDraft(workspace, 'drop-me');

    const result = await discardDraftTask(workspace, 'drop-me', 'not needed');

    strict.equal(result.ok, true);

    const tasks = await listTasks(workspace);
    const archived = tasks.find((task) => task.slug === 'drop-me');

    strict.equal(archived?.stage, 'archive');
    strict.equal(archived?.status, '[DISCARDED]');

    const memory = await readFile(
      join(workspace, '.deepspec/memory.md'),
      'utf8'
    );

    strict.equal(memory.includes('[drop-me]'), true);
    strict.equal(memory.includes('[discarded]'), true);
  });
});
