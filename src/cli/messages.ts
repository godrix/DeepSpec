import type { ScaffoldResult } from '../types/core.js';

export const helpText = (agentKeys: string[]): string =>
  [
    'DeepSpec: Spec-Driven Development for AI agents.',
    '',
    'Usage:',
    '  npx deep-spec init <agent>',
    '',
    'Commands:',
    '  init <agent>      Scaffold DeepSpec into the current project',
    '',
    'Options:',
    '  -h, --help        Show this help',
    '  -v, --version     Show the version',
    '',
    `Available agents: ${agentKeys.join(', ')}`,
  ].join('\n');

export const noAgentSelected = (agentKeys: string[]): string => {
  const first = agentKeys[0];

  return [
    'No agent selected.',
    `Pass an agent (available: ${agentKeys.join(', ')}).`,
    `Example: npx deep-spec init ${first}`,
  ].join('\n');
};

export const agentSelectTitle = (): string => 'Which agent are you using?';

export const agentSelectHint = (): string =>
  'Use the arrow keys to move, Enter to confirm.';

export const agentSelectedLine = (displayName: string): string =>
  `Agent: ${displayName}`;

export const selectionAborted = (): string => 'No agent selected: cancelled.';

export const createdLine = (path: string): string => `  created  ${path}`;

export const skippedLine = (path: string): string =>
  `  skipped  ${path} (already exists)`;

export const summaryLine = (
  agentDisplayName: string,
  result: ScaffoldResult
): string => {
  if (result.created.length === 0)
    return `DeepSpec is already initialized for ${agentDisplayName}: nothing to do.`;

  return `DeepSpec initialized for ${agentDisplayName}: ${result.created.length} created, ${result.skipped.length} skipped.`;
};

export const nextSteps = (agentDisplayName: string): string =>
  [
    '',
    'Next steps:',
    `  1. Open ${agentDisplayName} in this project.`,
    '  2. Say "Initialize DeepSpec" or run /deepspec.init to generate AGENTS.md.',
    '  3. Run /deepspec.create-task to plan your first task.',
    '  4. Review A-B-C docs, then "Approve task" to implement with TDD.',
    '  5. Complete at Review Gate with "Complete task".',
  ].join('\n');
