import type { HookHandler } from '../types/core.js';
import process, { argv, stderr, stdout } from 'node:process';
import { pathToFileURL } from 'node:url';

/** Runs the handler only when the module is the executed entry, printing its result */
export const runHook = async (
  moduleUrl: string,
  handler: HookHandler
): Promise<void> => {
  if (moduleUrl !== pathToFileURL(argv[1]).href) return;

  try {
    stdout.write(await handler(argv.slice(2)));
  } catch (error) {
    stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
};
