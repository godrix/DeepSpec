import type { ParsedCliArgs } from '../types/core.js';
import { parseArgs } from 'node:util';

const toCommand = (value: string | undefined): ParsedCliArgs['command'] =>
  value === 'init' ? 'init' : undefined;

export const parseCliArgs = (argv: string[]): ParsedCliArgs => {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: false,
    options: {
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });

  return {
    command: toCommand(positionals[0]),
    agent: positionals[1],
    help: values.help === true,
    version: values.version === true,
  };
};
