import type {
  BundledAsset,
  BundledAssets,
  CommandKey,
  TemplateKey,
} from '../types/core.js';
import { readdir, readFile } from 'node:fs/promises';
import { ORCHESTRATOR_DIR } from './brand.js';

const COMMAND_FILES: Record<CommandKey, string> = {
  init: 'spec/commands/spec.md.init.md',
  'create-task': 'spec/commands/spec.md.create-task.md',
  'approve-task': 'spec/commands/spec.md.approve-task.md',
  'discard-task': 'spec/commands/spec.md.discard-task.md',
  'complete-task': 'spec/commands/spec.md.complete-task.md',
  'revise-task': 'spec/commands/spec.md.revise-task.md',
  list: 'spec/commands/spec.md.list.md',
  repair: 'spec/commands/spec.md.repair.md',
  'map-codebase': 'spec/commands/spec.md.map-codebase.md',
  'diagram-architecture': 'spec/commands/spec.md.diagram-architecture.md',
  interview: 'spec/commands/spec.md.interview.md',
};

const TEMPLATE_FILES: Record<TemplateKey, string> = {
  approach: 'spec/templates/APPROACH.template.md',
  'business-context': 'spec/templates/BUSINESS_CONTEXT.template.md',
  'completion-report': 'spec/templates/COMPLETION_REPORT.template.md',
  agents: 'spec/templates/AGENTS.template.md',
  memory: 'spec/templates/memory.template.md',
  'open-questions': 'spec/templates/OPEN_QUESTIONS.template.md',
  architecture: 'spec/templates/ARCHITECTURE.template.md',
};

const HOOKS_DIR = 'lib/hooks';
const ORCHESTRATOR_PATH = `${ORCHESTRATOR_DIR}/SKILL.md`;

const fileNameOf = (relativePath: string): string =>
  relativePath.slice(relativePath.lastIndexOf('/') + 1);

const readAsset = async (
  packageRoot: URL,
  relativePath: string
): Promise<BundledAsset> => {
  const contents = await readFile(new URL(relativePath, packageRoot), 'utf8');

  return { fileName: fileNameOf(relativePath), contents };
};

const readGroup = async <Key extends string>(
  packageRoot: URL,
  files: Record<Key, string>
): Promise<Record<Key, BundledAsset>> => {
  const keys = Object.keys(files) as Key[];
  const entries = await Promise.all(
    keys.map(
      async (key) => [key, await readAsset(packageRoot, files[key])] as const
    )
  );

  return Object.fromEntries(entries) as Record<Key, BundledAsset>;
};

const readHooks = async (packageRoot: URL): Promise<BundledAsset[]> => {
  const entries = await readdir(new URL(`${HOOKS_DIR}/`, packageRoot));
  const hooks = entries.filter((entry) => entry.endsWith('.mjs')).toSorted();

  return Promise.all(
    hooks.map((hook) => readAsset(packageRoot, `${HOOKS_DIR}/${hook}`))
  );
};

export const loadAssets = async (packageRoot: URL): Promise<BundledAssets> => {
  const [commands, templates, hooks, orchestrator] = await Promise.all([
    readGroup(packageRoot, COMMAND_FILES),
    readGroup(packageRoot, TEMPLATE_FILES),
    readHooks(packageRoot),
    readAsset(packageRoot, ORCHESTRATOR_PATH),
  ]);

  return { commands, templates, hooks, orchestrator };
};

export const loadVersion = async (packageRoot: URL): Promise<string> => {
  const raw = await readFile(new URL('package.json', packageRoot), 'utf8');
  const parsed: { version?: unknown } = JSON.parse(raw);

  if (typeof parsed.version !== 'string')
    throw new Error('package.json is missing a string `version` field');

  return parsed.version;
};
