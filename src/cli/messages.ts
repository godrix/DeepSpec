import type { ScaffoldResult } from '../types/core.js';
import {
  PACKAGE_NAME,
  PRODUCT_NAME,
  commandName,
} from '../core/brand.js';
import { headerText } from './banner.js';

export const versionText = (version: string): string =>
  [headerText(), version].join('\n');

export const helpText = (agentKeys: string[]): string =>
  [
    headerText(),
    'Usage:',
    `  npx ${PACKAGE_NAME}                  Interactive specs browser (TTY)`,
    `  npx ${PACKAGE_NAME} init <agent>`,
    `  npx ${PACKAGE_NAME} create "what you want" [--run]`,
    `  npx ${PACKAGE_NAME} approve <slug> [--run]`,
    `  npx ${PACKAGE_NAME} revise <slug> "feedback" [--run]`,
    `  npx ${PACKAGE_NAME} run "/deepspec.approve-task <slug>"`,
    `  npx ${PACKAGE_NAME} agent`,
    '',
    'Commands:',
    `  init <agent>                Scaffold ${PRODUCT_NAME} (stores agent in manifest)`,
    '  browse | ui                 Interactive pipeline browser',
    '  create | new                Create draft locally (or --run via agent CLI)',
    '  list                        List drafts / active / review / archive',
    '  show <slug>                 Show A-B-C (use --full for draft review)',
    '  approve <slug>              Approve locally, or --run agent approve+implement',
    '  revise <slug>               Request changes locally, or --run via agent',
    '  discard <slug>              Discard locally, or --run via agent',
    '  run | exec <prompt>         Invoke configured agent CLI with a prompt',
    '  agent                       Show configured agent + CLI runner status',
    '  memory                      Show memory.md index',
    '  validate <slug>             Validate A-B-C artifacts',
    '',
    'Options:',
    '  -a, --agent <key>    Override manifest agent for --run / run',
    '  -R, --run            Invoke agent CLI instead of local-only FS ops',
    '  -p, --print          Headless agent mode (scripts/CI)',
    '  --force              Allow agent auto-approvals in print mode',
    '  --dry-run            Print the agent command without executing',
    '  -n, --name <title>   Task title/slug for create',
    '  -s, --stage <stage>  Filter list: draft|active|review|archive',
    '  -m, --message <text> Feedback for revise (alias: -r)',
    '  -r, --reason <text>  Discard reason / revise feedback',
    '  -f, --full           Full A-B-C dump on show',
    '  -h, --help           Show this help',
    '  -v, --version        Show the version',
    '',
    `Available agents: ${agentKeys.join(', ')} (alias: cursor → cursor-agent)`,
    'Env: DEEPSPEC_AGENT=<key> overrides manifest agent for runners',
  ].join('\n');

export const noAgentSelected = (agentKeys: string[]): string => {
  const first = agentKeys[0];

  return [
    'No agent selected.',
    `Pass an agent (available: ${agentKeys.join(', ')}).`,
    `Example: npx ${PACKAGE_NAME} init ${first}`,
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
    return `${PRODUCT_NAME} is already initialized for ${agentDisplayName}: nothing to do.`;

  return `${PRODUCT_NAME} initialized for ${agentDisplayName}: ${result.created.length} created, ${result.skipped.length} skipped.`;
};

export const nextSteps = (agentDisplayName: string): string =>
  [
    '',
    'Next steps:',
    `  1. Open ${agentDisplayName} in this project.`,
    `  2. Say "Initialize ${PRODUCT_NAME}" or run /${commandName('init')} to generate AGENTS.md.`,
    `  3. Run /${commandName('create-task')} to plan your first task.`,
    '  4. Review A-B-C docs, then "Approve task" to implement with TDD.',
    '  5. Complete at Review Gate with "Complete task".',
  ].join('\n');
