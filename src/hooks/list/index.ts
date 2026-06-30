import { cwd } from 'node:process';
import { runHook } from '../../cli/run-hook.js';
import { isTaskStage } from '../../core/tracking.js';
import { formatTaskList, listTasks } from './list.js';

/**
 * @example node ./.spec.md/hooks/list.mjs '{}'
 * @example node ./.spec.md/hooks/list.mjs '{"stage":"active"}'
 */
await runHook(import.meta.url, async (args) => {
  const raw = args[0] ?? '{}';
  const parsed: unknown = JSON.parse(raw);
  const stageValue = (parsed as { stage?: unknown }).stage;
  const stage =
    typeof stageValue === 'string' && isTaskStage(stageValue)
      ? stageValue
      : undefined;

  return formatTaskList(await listTasks(cwd(), stage));
});
