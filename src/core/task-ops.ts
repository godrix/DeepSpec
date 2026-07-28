import { access, readFile, rename, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { track } from '../hooks/track/track.js';
import { locateTask } from './task-locate.js';

export type TaskOpResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

const STATUS_REPLACE = /\*\*Status:\*\*\s*`?\[[^\]]+\]`?/;

const pathExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const buildDiscardedBlock = (date: string, reason?: string): string => {
  const reasonLine = reason?.trim()
    ? `\n**Discard reason:** ${reason.trim()}`
    : '';

  return `## Discarded

**Status:** \`[DISCARDED]\`
**Discarded:** ${date}${reasonLine}

Draft spec archived without implementation. No acceptance criteria were executed.
`;
};

const finalizeCompletionReportAsDiscarded = async (
  folderPath: string,
  reason?: string
): Promise<void> => {
  const reportPath = join(folderPath, 'COMPLETION_REPORT.md');
  const date = new Date().toISOString().slice(0, 10);
  const existing = await readFile(reportPath, 'utf8').catch(
    () => '# COMPLETION REPORT\n\n'
  );
  const discardedBlock = buildDiscardedBlock(date, reason);

  let updated: string;

  if (STATUS_REPLACE.test(existing)) {
    updated = existing.replace(STATUS_REPLACE, '**Status:** `[DISCARDED]`');

    if (!existing.includes('## Discarded'))
      updated = `${updated.trimEnd()}\n\n${discardedBlock}`;
  } else {
    updated = `${existing.trimEnd()}\n\n${discardedBlock}`;
  }

  await writeFile(reportPath, updated, 'utf8');
};

const inferSummary = async (folderPath: string): Promise<string> => {
  try {
    const contents = await readFile(
      join(folderPath, 'BUSINESS_CONTEXT.md'),
      'utf8'
    );

    for (const line of contents.split('\n')) {
      const trimmed = line.trim();

      if (trimmed.startsWith('#'))
        return trimmed.replace(/^#+\s*/, '').trim() || 'Discarded draft';

      if (trimmed.length > 0) return trimmed.slice(0, 120);
    }
  } catch {
    // fall through
  }

  return 'Discarded draft';
};

const appendMemoryDiscarded = async (
  targetDir: string,
  rootDir: string,
  slug: string,
  summary: string
): Promise<void> => {
  const memoryPath = join(targetDir, rootDir, 'memory.md');
  const date = new Date().toISOString().slice(0, 10);
  const clean = summary.replace(/\s+/g, ' ').trim();
  const line = `[${date}] [${slug}]: [discarded] ${clean}. Ref: specs/archive/${slug}`;
  const existing = await readFile(memoryPath, 'utf8').catch(
    () => '# DeepSpec Memory\n\n## Archived Tasks\n\n## Lessons\n'
  );
  const marker = '## Lessons';
  const updated = existing.includes(marker)
    ? existing.replace(marker, `${line}\n\n${marker}`)
    : `${existing.trimEnd()}\n${line}\n`;

  await writeFile(memoryPath, updated, 'utf8');
};

export const discardDraftTask = async (
  targetDir: string,
  slug: string,
  reason?: string
): Promise<TaskOpResult> => {
  const located = await locateTask(targetDir, slug);

  if (!located) return { ok: false, error: `Task "${slug}" not found.` };

  if (located.stage !== 'draft')
    return { ok: false, error: 'Only draft tasks can be discarded.' };

  const targetPath = join(located.specsPath, 'archive', located.slug);

  if (await pathExists(targetPath))
    return {
      ok: false,
      error: `Archived task "${located.slug}" already exists.`,
    };

  try {
    const summary = reason?.trim() || (await inferSummary(located.folderPath));

    await finalizeCompletionReportAsDiscarded(located.folderPath, reason);
    await rename(located.folderPath, targetPath);
    await appendMemoryDiscarded(
      targetDir,
      located.rootDir,
      located.slug,
      summary
    );
    await track(
      targetDir,
      JSON.stringify({
        entries: [{ name: located.slug, stage: 'archive', paths: [] }],
      })
    );

    return {
      ok: true,
      message: `Draft "${basename(located.folderPath)}" discarded and archived.`,
    };
  } catch (error) {
    return { ok: false, error: `Failed to discard task: ${error}` };
  }
};

export const approveDraftTask = async (
  targetDir: string,
  slug: string
): Promise<TaskOpResult & { folderPath?: string }> => {
  const located = await locateTask(targetDir, slug);

  if (!located) return { ok: false, error: `Task "${slug}" not found.` };

  if (located.stage !== 'draft')
    return { ok: false, error: 'Only draft tasks can be approved.' };

  const targetPath = join(located.specsPath, 'active', located.slug);

  if (await pathExists(targetPath))
    return {
      ok: false,
      error: `Active task "${located.slug}" already exists.`,
    };

  try {
    const reportPath = join(located.folderPath, 'COMPLETION_REPORT.md');
    const report = await readFile(reportPath, 'utf8').catch(() => '');
    const nextReport = report.includes('**Status:**')
      ? report.replace(STATUS_REPLACE, '**Status:** `[IN PROGRESS]`')
      : `${report.trimEnd()}\n\n**Status:** \`[IN PROGRESS]\`\n`;

    await writeFile(reportPath, nextReport, 'utf8');
    await rename(located.folderPath, targetPath);
    await track(
      targetDir,
      JSON.stringify({
        entries: [{ name: located.slug, stage: 'active', paths: [] }],
      })
    );

    return {
      ok: true,
      folderPath: targetPath,
      message: [
        `Plan approved. "${located.slug}" is now in active/.`,
        'Status set to [IN PROGRESS]. Execution Plan is locked.',
        `Next: ask your agent to implement with TDD (e.g. "Execute task ${located.slug}" or /deepspec.approve-task after opening the active task).`,
      ].join('\n'),
    };
  } catch (error) {
    return { ok: false, error: `Failed to approve task: ${error}` };
  }
};

export const requestDraftChanges = async (
  targetDir: string,
  slug: string,
  feedback: string
): Promise<TaskOpResult> => {
  const located = await locateTask(targetDir, slug);

  if (!located) return { ok: false, error: `Task "${slug}" not found.` };

  if (located.stage !== 'draft')
    return {
      ok: false,
      error: 'Request changes on drafts only. For Review Gate use revise on active/[IN REVIEW].',
    };

  const trimmed = feedback.trim();

  if (!trimmed) return { ok: false, error: 'Feedback is required.' };

  try {
    const approachPath = join(located.folderPath, 'APPROACH.md');
    const existing = await readFile(approachPath, 'utf8').catch(
      () => '# APPROACH\n\n'
    );
    const date = new Date().toISOString().slice(0, 10);
    const header = existing.includes('## Draft Review Feedback')
      ? ''
      : '\n## Draft Review Feedback\n';
    const block = `${header}\n### ${date}\n\n${trimmed}\n`;

    await writeFile(approachPath, `${existing.trimEnd()}${block}\n`, 'utf8');

    return {
      ok: true,
      message: [
        `Feedback recorded on draft "${located.slug}".`,
        'Ask your agent to revise the A-B-C plan with that feedback before approving.',
        `Example: "Revise draft ${located.slug}: ${trimmed.slice(0, 80)}"`,
      ].join('\n'),
    };
  } catch (error) {
    return { ok: false, error: `Failed to record feedback: ${error}` };
  }
};
