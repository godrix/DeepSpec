import { cwd } from 'node:process';
import { runHook } from '../../cli/run-hook.js';
import { validate } from './validate.js';

/**
 * @example node ./.deepspec/hooks/validate.mjs '{"slug":"my-task","expectStatus":"[IN REVIEW]"}'
 */
await runHook(import.meta.url, (args) => validate(cwd(), args[0] ?? '{}'));
