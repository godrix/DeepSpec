import { cwd } from 'node:process';
import { runHook } from '../../cli/run-hook.js';
import { track } from './track.js';

/**
 * @example node ./.spec.md/hooks/track.mjs '{"entries":[{"name":"my-task","stage":"draft","paths":["src/a.ts"]}]}'
 */
await runHook(import.meta.url, (args) => track(cwd(), args[0] ?? '{}'));
