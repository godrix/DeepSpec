import type { ParsedCliArgs } from '../types/core.js';
import { stdout } from 'node:process';
import { loadAssets, loadVersion } from '../core/assets.js';
import { scaffold } from '../core/scaffold.js';
import { listAgentKeys } from '../providers/registry.js';
import { headerText } from './banner.js';
import { runBrowse } from './browse.js';
import {
  runAgentCommand,
  runApprove,
  runCreate,
  runDiscard,
  runList,
  runMemory,
  runPromptCommand,
  runRevise,
  runShow,
  runValidate,
} from './commands/pipeline.js';
import {
  createdLine,
  helpText,
  nextSteps,
  skippedLine,
  summaryLine,
  versionText,
} from './messages.js';
import { isInteractive } from './prompt.js';
import { selectAgent } from './select-agent.js';

const print = (line: string): void => {
  stdout.write(`${line}\n`);
};

const runInit = async (
  args: ParsedCliArgs,
  cwd: string,
  packageRoot: URL
): Promise<void> => {
  print(headerText());

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
    print(versionText(await loadVersion(packageRoot)));

    return;
  }

  if (args.help) {
    print(helpText(listAgentKeys()));

    return;
  }

  if (args.command === undefined) {
    if (isInteractive()) {
      await runBrowse(cwd);

      return;
    }

    print(helpText(listAgentKeys()));

    return;
  }

  if (args.command === 'init') {
    await runInit(args, cwd, packageRoot);

    return;
  }

  if (args.command === 'browse') {
    await runBrowse(cwd);

    return;
  }

  if (args.command === 'list') {
    await runList(cwd, args);

    return;
  }

  if (args.command === 'show') {
    await runShow(cwd, args.slug, { full: args.full });

    return;
  }

  if (args.command === 'memory') {
    await runMemory(cwd);

    return;
  }

  if (args.command === 'create') {
    await runCreate(cwd, args);

    return;
  }

  if (args.command === 'approve') {
    await runApprove(cwd, args.slug, args);

    return;
  }

  if (args.command === 'revise') {
    await runRevise(cwd, args.slug, args.reason || args.description, args);

    return;
  }

  if (args.command === 'discard') {
    await runDiscard(cwd, args.slug, args.reason, args);

    return;
  }

  if (args.command === 'validate') {
    await runValidate(cwd, args.slug);

    return;
  }

  if (args.command === 'agent') {
    await runAgentCommand(cwd, args);

    return;
  }

  if (args.command === 'run') {
    await runPromptCommand(cwd, args);

    return;
  }

  print(helpText(listAgentKeys()));
};
