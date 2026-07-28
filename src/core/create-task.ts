import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSpecRoot, specsDir } from './brand.js';
import { locateTask } from './task-locate.js';
import { toKebabSlug, toTaskTitle } from './slug.js';
import { track } from '../hooks/track/track.js';
import type { TaskOpResult } from './task-ops.js';

const TEMPLATE_FILES = {
  approach: 'APPROACH.template.md',
  business: 'BUSINESS_CONTEXT.template.md',
  report: 'COMPLETION_REPORT.template.md',
  questions: 'OPEN_QUESTIONS.template.md',
} as const;

export type CreateTaskInput = {
  description: string;
  name?: string;
  slug?: string;
};

const pathExists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const loadWorkspaceTemplate = async (
  targetDir: string,
  rootDir: string,
  fileName: string
): Promise<string> => {
  const path = join(targetDir, rootDir, 'templates', fileName);

  try {
    return await readFile(path, 'utf8');
  } catch {
    throw new Error(
      `Missing template ${fileName}. Run: deep-spec init <agent>`
    );
  }
};

const seedBusinessContext = (template: string, title: string, intent: string): string => {
  let text = template.replaceAll('[name]', title);

  text = text.replace(
    /## Problem Statement\n\n[\s\S]*?(?=\n## )/,
    `## Problem Statement\n\n${intent}\n\n`
  );

  if (!text.includes(intent)) {
    text = `${text.trimEnd()}\n\n## CLI Intent\n\n${intent}\n`;
  }

  return text;
};

const seedApproach = (template: string, title: string, intent: string): string => {
  let text = template.replaceAll('[name]', title);

  text = text.replace(
    /## Summary\n\n[\s\S]*?(?=\n## )/,
    `## Summary\n\n${intent}\n\n> Seeded from CLI. Ask your agent to flesh out Affected Files and Execution Plan before approval, or refine with \`/deepspec.create-task\` / interview.\n\n`
  );

  return text;
};

const seedCompletionReport = (template: string, title: string): string => {
  const date = new Date().toISOString().slice(0, 10);

  return template
    .replaceAll('[name]', title)
    .replace(
      /\*\*Status:\*\*.*/,
      '**Status:** `[PENDING]`'
    )
    .replace(/\*\*Started:\*\*.*/, `**Started:** ${date}`)
    .replace(/\*\*Completed:\*\*.*/, '**Completed:**');
};

const seedOpenQuestions = (template: string, title: string): string =>
  template.replaceAll('[name]', title);

export const createDraftTask = async (
  targetDir: string,
  input: CreateTaskInput
): Promise<TaskOpResult & { slug?: string; folderPath?: string }> => {
  const intent = input.description.trim();

  if (!intent)
    return {
      ok: false,
      error: 'Usage: deep-spec create "what you want to build"',
    };

  const rootDir = await resolveSpecRoot(targetDir);

  if (!(await pathExists(join(targetDir, rootDir))))
    return {
      ok: false,
      error: `DeepSpec is not initialized (${rootDir}/ missing). Run: deep-spec init <agent>`,
    };

  const title = toTaskTitle(input.name?.trim() || intent);
  const slug = toKebabSlug(input.slug?.trim() || input.name?.trim() || intent);
  const existing = await locateTask(targetDir, slug);

  if (existing)
    return {
      ok: false,
      error: `Task "${slug}" already exists in ${existing.stage}. Choose another name.`,
    };

  const specsPath = specsDir(targetDir, rootDir);
  const folderPath = join(specsPath, 'drafts', slug);

  try {
    const [approachTpl, businessTpl, reportTpl, questionsTpl] =
      await Promise.all([
        loadWorkspaceTemplate(targetDir, rootDir, TEMPLATE_FILES.approach),
        loadWorkspaceTemplate(targetDir, rootDir, TEMPLATE_FILES.business),
        loadWorkspaceTemplate(targetDir, rootDir, TEMPLATE_FILES.report),
        loadWorkspaceTemplate(targetDir, rootDir, TEMPLATE_FILES.questions),
      ]);

    await mkdir(folderPath, { recursive: true });
    await Promise.all([
      writeFile(
        join(folderPath, 'APPROACH.md'),
        seedApproach(approachTpl, title, intent),
        'utf8'
      ),
      writeFile(
        join(folderPath, 'BUSINESS_CONTEXT.md'),
        seedBusinessContext(businessTpl, title, intent),
        'utf8'
      ),
      writeFile(
        join(folderPath, 'COMPLETION_REPORT.md'),
        seedCompletionReport(reportTpl, title),
        'utf8'
      ),
      writeFile(
        join(folderPath, 'OPEN_QUESTIONS.md'),
        seedOpenQuestions(questionsTpl, title),
        'utf8'
      ),
    ]);

    await track(
      targetDir,
      JSON.stringify({
        entries: [{ name: slug, stage: 'draft', paths: [] }],
      })
    );

    return {
      ok: true,
      slug,
      folderPath,
      message: [
        `Draft created: ${slug}`,
        `Path: ${folderPath}`,
        'Review with: deep-spec show ' + slug,
        'Or open the interactive browser and use Review plan → Approve / Request changes.',
        'Tip: ask your agent to refine A-B-C before approving if the Execution Plan is still a stub.',
      ].join('\n'),
    };
  } catch (error) {
    return { ok: false, error: `Failed to create draft: ${error}` };
  }
};
