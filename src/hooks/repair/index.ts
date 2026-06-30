import { cwd } from 'node:process';
import { runHook } from '../../cli/run-hook.js';
import { repair } from './repair.js';

/**
 * @example node ./.spec.md/hooks/repair.mjs '{"entries":[{"name":"my-task","stage":"active","paths":["src/a.ts"]}]}'
 */
await runHook(import.meta.url, (args) => repair(cwd(), args[0] ?? '{}'));
