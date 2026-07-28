import type { CliCommand, CliStageFilter, ParsedCliArgs } from '../types/core.js';
import { parseArgs } from 'node:util';
import { isTaskStage } from '../core/tracking.js';

const COMMANDS = new Set<CliCommand>([
  'init',
  'list',
  'show',
  'memory',
  'discard',
  'validate',
  'browse',
  'create',
  'approve',
  'revise',
  'run',
  'agent',
]);

const SLUG_COMMANDS = new Set<CliCommand>([
  'show',
  'discard',
  'validate',
  'approve',
  'revise',
]);

const toCommand = (value: string | undefined): CliCommand | undefined => {
  if (!value) return undefined;
  if (value === 'ui') return 'browse';
  if (value === 'new') return 'create';
  if (value === 'exec') return 'run';
  if (COMMANDS.has(value as CliCommand)) return value as CliCommand;

  return undefined;
};

const toStage = (value: string | undefined): CliStageFilter | undefined => {
  if (!value) return undefined;
  if (value === 'review' || value === 'drafts')
    return value === 'drafts' ? 'draft' : value;
  if (isTaskStage(value)) return value;

  return undefined;
};

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
      stage: { type: 'string', short: 's' },
      reason: { type: 'string', short: 'r' },
      name: { type: 'string', short: 'n' },
      message: { type: 'string', short: 'm' },
      agent: { type: 'string', short: 'a' },
      full: { type: 'boolean', short: 'f' },
      run: { type: 'boolean', short: 'R' },
      print: { type: 'boolean', short: 'p' },
      force: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
    },
  });

  const command = toCommand(positionals[0]);
  const rest = positionals.slice(1);
  const feedback =
    (typeof values.message === 'string' ? values.message : undefined) ||
    (typeof values.reason === 'string' ? values.reason : undefined);
  const agentFlag =
    typeof values.agent === 'string' ? values.agent : undefined;

  return {
    command,
    agent: command === 'init' ? rest[0] ?? agentFlag : agentFlag,
    slug: command && SLUG_COMMANDS.has(command) ? rest[0] : undefined,
    stage: toStage(
      typeof values.stage === 'string' ? values.stage : undefined
    ),
    reason: feedback,
    name: typeof values.name === 'string' ? values.name : undefined,
    description:
      command === 'create'
        ? rest.join(' ').trim() || undefined
        : command === 'revise'
          ? rest.slice(1).join(' ').trim() || undefined
          : command === 'run'
            ? rest.join(' ').trim() || undefined
            : undefined,
    full: values.full === true,
    run: values.run === true,
    print: values.print === true,
    force: values.force === true,
    dryRun: values['dry-run'] === true,
    help: values.help === true,
    version: values.version === true,
  };
};
