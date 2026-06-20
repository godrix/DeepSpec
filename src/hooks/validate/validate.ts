import type { ValidationResult } from '../../types/core.js';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseStatus } from '../list/list.js';

const VALID_STATUSES = [
  '[PENDING]',
  '[IN PROGRESS]',
  '[IN REVIEW]',
  '[DONE]',
  '[DISCARDED]',
] as const;

const STAGE_FOLDERS = ['drafts', 'active', 'archive'] as const;

const taskDir = (
  targetDir: string,
  slug: string,
  stageFolder: string
): string => join(targetDir, '.deepspec/specs', stageFolder, slug);

const findTaskFolder = async (
  targetDir: string,
  slug: string
): Promise<string | undefined> => {
  for (const stageFolder of STAGE_FOLDERS) {
    try {
      await access(
        join(taskDir(targetDir, slug, stageFolder), 'COMPLETION_REPORT.md')
      );

      return stageFolder;
    } catch {
      continue;
    }
  }

  return undefined;
};

export const validateTask = async (
  targetDir: string,
  slug: string,
  expectStatus?: string
): Promise<ValidationResult> => {
  const errors: string[] = [];
  const stageFolder = await findTaskFolder(targetDir, slug);

  if (!stageFolder)
    return {
      valid: false,
      slug,
      status: 'missing',
      errors: [`Task "${slug}" not found in drafts, active, or archive`],
    };

  const base = taskDir(targetDir, slug, stageFolder);
  const [reportContents, approachContents, businessContents] =
    await Promise.all([
      readFile(join(base, 'COMPLETION_REPORT.md'), 'utf8'),
      readFile(join(base, 'APPROACH.md'), 'utf8'),
      readFile(join(base, 'BUSINESS_CONTEXT.md'), 'utf8'),
    ]);

  const status = parseStatus(reportContents);

  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number]))
    errors.push(`Invalid status: ${status}`);

  if (expectStatus && status !== expectStatus)
    errors.push(`Expected status ${expectStatus}, found ${status}`);

  if (!approachContents.includes('## Execution Plan'))
    errors.push('APPROACH.md missing ## Execution Plan');

  if (!approachContents.includes('# [A] APPROACH'))
    errors.push('APPROACH.md missing title marker');

  if (!businessContents.includes('# [B] BUSINESS CONTEXT'))
    errors.push('BUSINESS_CONTEXT.md missing title marker');

  if (!reportContents.includes('# [C] COMPLETION REPORT'))
    errors.push('COMPLETION_REPORT.md missing title marker');

  return {
    valid: errors.length === 0,
    slug,
    status,
    errors,
  };
};

export const formatValidation = (result: ValidationResult): string =>
  `${JSON.stringify(result, null, 2)}\n`;

/** Validates A-B-C structure and COMPLETION_REPORT status for a task slug */
export const validate = async (
  targetDir: string,
  payload: string
): Promise<string> => {
  const parsed: unknown = JSON.parse(payload);
  const slug = (parsed as { slug?: unknown }).slug;
  const expectStatus = (parsed as { expectStatus?: unknown }).expectStatus;

  if (typeof slug !== 'string' || slug.length === 0)
    throw new Error('validate input needs a non-empty `slug` string');

  const result = await validateTask(
    targetDir,
    slug,
    typeof expectStatus === 'string' ? expectStatus : undefined
  );

  return formatValidation(result);
};
