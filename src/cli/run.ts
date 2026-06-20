import type { ParsedCliArgs } from '../types/core.js';
import { stdout } from 'node:process';
import { loadAssets, loadVersion } from '../core/assets.js';
import { scaffold } from '../core/scaffold.js';
import { listAgentKeys } from '../providers/registry.js';
import {
  createdLine,
  helpText,
  nextSteps,
  skippedLine,
  summaryLine,
} from './messages.js';
import { selectAgent } from './select-agent.js';

const print = (line: string): void => {
  stdout.write(`${line}\n`);
};

const runInit = async (
  args: ParsedCliArgs,
  cwd: string,
  packageRoot: URL
): Promise<void> => {
  const provider = await selectAgent(args.agent);
  const [assets, version] = await Promise.all([
    loadAssets(packageRoot),
    loadVersion(packageRoot),
  ]);

  const result = await scaffold({
    targetDir: cwd,
    provider,
    assets,
    version,
    now: new Date(),
  });

  for (const path of result.created) print(createdLine(path));

  for (const path of result.skipped) print(skippedLine(path));

  print(summaryLine(provider.displayName, result));

  if (result.created.length > 0) print(nextSteps(provider.displayName));
};

export const run = async (
  args: ParsedCliArgs,
  cwd: string,
  packageRoot: URL
): Promise<void> => {
  if (args.version) {
    print(await loadVersion(packageRoot));

    return;
  }

  if (args.help || args.command === undefined) {
    print(helpText(listAgentKeys()));

    return;
  }

  if (args.command === 'init') {
    await runInit(args, cwd, packageRoot);

    return;
  }

  print(helpText(listAgentKeys()));
};
