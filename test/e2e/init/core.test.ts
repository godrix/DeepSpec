import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, strict } from 'poku';
import { listTasks } from '../../../src/hooks/list/list.js';
import { initInto, newWorkspace, packageRoot } from './__utils__.js';

await describe('init scaffolds the spec.md core', async () => {
  await it('creates pipeline stage directories', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    await stat(join(workspace, '.spec.md/specs/drafts'));
    await stat(join(workspace, '.spec.md/specs/active'));
    await stat(join(workspace, '.spec.md/specs/archive'));
  });

  await it('copies templates byte-for-byte from the package', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    for (const template of [
      'APPROACH.template.md',
      'BUSINESS_CONTEXT.template.md',
      'COMPLETION_REPORT.template.md',
      'AGENTS.template.md',
      'memory.template.md',
    ]) {
      const source = await readFile(
        new URL(`spec/templates/${template}`, packageRoot),
        'utf8'
      );
      const scaffolded = await readFile(
        join(workspace, `.spec.md/templates/${template}`),
        'utf8'
      );

      strict.strictEqual(scaffolded, source, `${template} should match`);
    }
  });

  await it('installs orchestrator skill for Cursor', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    await stat(join(workspace, '.cursor/skills/spec.md/SKILL.md'));
  });

  await it('renders commands for skill and markdown agents', async () => {
    const skillWorkspace = await newWorkspace();
    await initInto(skillWorkspace, { init: true, agent: 'cursor-agent' });
    await stat(
      join(skillWorkspace, '.cursor/skills/spec.md.create-task/SKILL.md')
    );

    const markdownWorkspace = await newWorkspace();
    await initInto(markdownWorkspace, { init: true, agent: 'opencode' });
    await stat(
      join(markdownWorkspace, '.opencode/commands/spec.md.create-task.md')
    );
  });

  await it('creates an empty tracking map at init', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    const tracking: { name: string; entries: unknown[] } = JSON.parse(
      await readFile(join(workspace, '.spec.md/tracking.json'), 'utf8')
    );

    strict.strictEqual(tracking.name, 'spec.md');
    strict.deepStrictEqual(tracking.entries, [], 'entries should start empty');
  });

  await it('copies hooks into .spec.md/hooks/', async () => {
    const workspace = await newWorkspace();

    await initInto(workspace, { init: true, agent: 'cursor-agent' });

    const hooks = await readdir(join(workspace, '.spec.md/hooks'));
    const expected = ['list.mjs', 'track.mjs', 'repair.mjs', 'validate.mjs'];

    for (const hook of expected) strict(hooks.includes(hook), `${hook} exists`);
  });

  await it('lists tasks from legacy .deepspec/ when .spec.md/ is absent', async () => {
    const workspace = await newWorkspace();
    const legacyTask = join(workspace, '.deepspec/specs/drafts/legacy-task');

    await mkdir(legacyTask, { recursive: true });
    await writeFile(
      join(legacyTask, 'COMPLETION_REPORT.md'),
      '**Status:** `[PENDING]`\n'
    );

    const tasks = await listTasks(workspace, 'draft');

    strict.strictEqual(tasks.length, 1);
    strict.strictEqual(tasks[0]?.slug, 'legacy-task');
  });
});
