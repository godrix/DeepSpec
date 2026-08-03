import type { BundledAsset, CommandFormat, CommandKey } from '../types/core.js';
import { COMMAND_PREFIX, PRODUCT_NAME, ROOT_DIR } from '../core/brand.js';

const ARGUMENT_HINTS: Record<CommandKey, string> = {
  init: `Leave empty to bootstrap ${PRODUCT_NAME} in the current project`,
  'create-task':
    'Task name, affected paths, or a description of the work to plan',
  'approve-task': 'Optional task slug if multiple drafts exist',
  'discard-task': 'Optional discard reason',
  'complete-task': 'Complete after Review Gate approval',
  'revise-task': 'Feedback describing post-implementation changes',
  list: 'Optional stage filter: drafts, active, or archive',
  repair: 'Optional task slug to repair tracking for',
  'map-codebase': 'Optional paths to prioritize in the repository map',
  'diagram-architecture':
    'Optional task slug or diagram focus (sequence, components, data-flow)',
  interview: 'Optional task slug or answer to the previous interview question',
  'answer-questions':
    'Optional task slug, question ids, or answers already saved from the DeepSpec panel',
};

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n/;

const skillName = (key: CommandKey): string => `${COMMAND_PREFIX}.${key}`;

const rewriteTemplatePath = (body: string): string =>
  body.replaceAll('`templates/', `\`${ROOT_DIR}/templates/`);

const hasField = (frontmatter: string, field: string): boolean =>
  frontmatter
    .split('\n')
    .some((line) => line.trimStart().startsWith(`${field}:`));

const parseFrontmatter = (
  asset: BundledAsset,
  key: CommandKey
): {
  frontmatter: string;
  body: string;
} => {
  const match = asset.contents.match(FRONTMATTER_PATTERN);

  if (!match) throw new Error(`Command ${key} is missing frontmatter`);

  if (!hasField(match[1], 'description'))
    throw new Error(
      `Command ${key} is missing a \`description\` in its frontmatter`
    );

  return { frontmatter: match[1], body: asset.contents.slice(match[0].length) };
};

const readDescription = (frontmatter: string): string => {
  const match = frontmatter.match(/^description:\s*(.+)$/m);

  if (!match)
    throw new Error('Command frontmatter is missing a `description` value');

  return match[1].trim();
};

const assemble = (frontmatterLines: string[], body: string): string =>
  rewriteTemplatePath(`---\n${frontmatterLines.join('\n')}\n---\n${body}`);

const injectSkillFrontmatter = (
  asset: BundledAsset,
  key: CommandKey,
  { withUserInvocable }: { withUserInvocable: boolean }
): string => {
  const { frontmatter, body } = parseFrontmatter(asset, key);

  if (hasField(frontmatter, 'name')) return rewriteTemplatePath(asset.contents);

  const lines = [`name: ${skillName(key)}`, frontmatter.trim()];

  if (!hasField(frontmatter, 'argument-hint'))
    lines.push(`argument-hint: ${ARGUMENT_HINTS[key]}`);

  if (withUserInvocable && !hasField(frontmatter, 'user-invocable'))
    lines.push('user-invocable: true');

  return assemble(lines, body);
};

const transformSkill = (asset: BundledAsset, key: CommandKey): string =>
  injectSkillFrontmatter(asset, key, { withUserInvocable: true });

const transformCopilotPrompt = (asset: BundledAsset, key: CommandKey): string =>
  injectSkillFrontmatter(asset, key, { withUserInvocable: false });

const keepFrontmatterRewriteTemplatePath = (
  asset: BundledAsset,
  key: CommandKey
): string => {
  parseFrontmatter(asset, key);

  return rewriteTemplatePath(asset.contents);
};

const transformForge = (asset: BundledAsset, key: CommandKey): string =>
  keepFrontmatterRewriteTemplatePath(asset, key).replaceAll(
    '$ARGUMENTS',
    '{{parameters}}'
  );

const splitDescriptionAndBody = (
  asset: BundledAsset,
  key: CommandKey
): { description: string; body: string } => {
  const { frontmatter, body } = parseFrontmatter(asset, key);

  return {
    description: readDescription(frontmatter),
    body: rewriteTemplatePath(body),
  };
};

const tomlString = (value: string): string =>
  `"${value.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;

const transformGeminiToml = (asset: BundledAsset, key: CommandKey): string => {
  const { description, body } = splitDescriptionAndBody(asset, key);
  const prompt = body.replaceAll('$ARGUMENTS', '{{args}}');

  return [
    `description = ${tomlString(description)}`,
    '',
    'prompt = """',
    prompt.replace(/\n$/, ''),
    '"""',
    '',
  ].join('\n');
};

const transformGooseYaml = (asset: BundledAsset, key: CommandKey): string => {
  const { description, body } = splitDescriptionAndBody(asset, key);
  const prompt = body.replaceAll('$ARGUMENTS', '{{ args }}');
  const indented = prompt
    .replace(/\n$/, '')
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : ''))
    .join('\n');

  return [
    'version: 1.0.0',
    `title: "${skillName(key)}"`,
    `description: ${JSON.stringify(description)}`,
    `instructions: ${JSON.stringify(description)}`,
    'prompt: |',
    indented,
    '',
  ].join('\n');
};

const TRANSFORMS: Record<
  CommandFormat,
  (asset: BundledAsset, key: CommandKey) => string
> = {
  skill: transformSkill,
  'copilot-prompt': transformCopilotPrompt,
  markdown: keepFrontmatterRewriteTemplatePath,
  forge: transformForge,
  'gemini-toml': transformGeminiToml,
  'goose-yaml': transformGooseYaml,
};

export const transformCommand = (
  asset: BundledAsset,
  key: CommandKey,
  format: CommandFormat
): string => TRANSFORMS[format](asset, key);
