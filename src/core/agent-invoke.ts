import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { resolveSpecRoot, ROOT_DIR, commandName } from './brand.js';
import { getAgentRunner } from '../providers/runners.js';
import { getProvider } from '../providers/registry.js';
import type { AgentInvokeOptions, AgentInvokeResult } from '../types/core.js';

const which = async (binary: string): Promise<string | undefined> => {
  const pathEnv = process.env.PATH ?? '';
  const parts = pathEnv.split(':').filter(Boolean);

  for (const dir of parts) {
    const candidate = join(dir, binary);

    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      continue;
    }
  }

  return undefined;
};

export const loadConfiguredAgent = async (
  targetDir: string
): Promise<string | undefined> => {
  if (process.env.DEEPSPEC_AGENT?.trim())
    return process.env.DEEPSPEC_AGENT.trim();

  const rootDir = await resolveSpecRoot(targetDir);

  try {
    const raw = await readFile(
      join(targetDir, rootDir, 'manifest.json'),
      'utf8'
    );
    const parsed = JSON.parse(raw) as { agent?: string };

    return typeof parsed.agent === 'string' ? parsed.agent : undefined;
  } catch {
    try {
      const raw = await readFile(
        join(targetDir, ROOT_DIR, 'manifest.json'),
        'utf8'
      );
      const parsed = JSON.parse(raw) as { agent?: string };

      return typeof parsed.agent === 'string' ? parsed.agent : undefined;
    } catch {
      return undefined;
    }
  }
};

export const resolveRunnableAgent = async (
  targetDir: string,
  override?: string
): Promise<{
  key: string;
  displayName: string;
  binary: string;
  runnerKey: string;
}> => {
  const key = override?.trim() || (await loadConfiguredAgent(targetDir));

  if (!key)
    throw new Error(
      'No agent configured. Run: deep-spec init <agent>  (or set DEEPSPEC_AGENT / --agent)'
    );

  let provider;

  try {
    provider = getProvider(key);
  } catch {
    throw new Error(`Unknown agent "${key}". Re-run deep-spec init <agent>.`);
  }

  const runner = getAgentRunner(provider.key);

  if (!runner)
    throw new Error(
      `Agent "${provider.displayName}" has no CLI runner yet. ` +
        `Copy this prompt into ${provider.displayName} manually, or use cursor-agent / claude / gemini / codex.`
    );

  for (const binary of runner.binaries) {
    const resolved = await which(binary);

    if (resolved)
      return {
        key: provider.key,
        displayName: provider.displayName,
        binary: resolved,
        runnerKey: runner.key,
      };
  }

  throw new Error(
    `Agent "${provider.displayName}" is configured, but none of [${runner.binaries.join(', ')}] is on PATH.`
  );
};

export const buildSlashPrompt = (
  command: string,
  args?: string
): string => {
  const slash = `/${commandName(command)}`;
  const trimmed = args?.trim();

  return trimmed ? `${slash} ${trimmed}` : slash;
};

export const invokeConfiguredAgent = async (
  targetDir: string,
  prompt: string,
  options: AgentInvokeOptions = {}
): Promise<AgentInvokeResult> => {
  const resolved = await resolveRunnableAgent(targetDir, options.agent);
  const runner = getAgentRunner(resolved.runnerKey);

  if (!runner)
    return {
      ok: false,
      error: `No runner for ${resolved.key}`,
    };

  const print =
    options.print === true ||
    (options.print !== false && input.isTTY !== true);
  const force = options.force !== false;
  const args = runner.buildArgs(prompt, { print, force });
  const commandLine = [resolved.binary, ...args]
    .map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
    .join(' ');

  if (options.dryRun) {
    return {
      ok: true,
      agent: resolved.key,
      binary: resolved.binary,
      commandLine,
      dryRun: true,
    };
  }

  output.write(
    `→ Running ${resolved.displayName} (${resolved.key})\n  ${commandLine}\n\n`
  );

  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(resolved.binary, args, {
      cwd: targetDir,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 1));
  });

  if (exitCode !== 0)
    return {
      ok: false,
      agent: resolved.key,
      binary: resolved.binary,
      commandLine,
      exitCode,
      error: `Agent exited with code ${exitCode}`,
    };

  return {
    ok: true,
    agent: resolved.key,
    binary: resolved.binary,
    commandLine,
    exitCode: 0,
  };
};

export const describeAgentStatus = async (
  targetDir: string,
  override?: string
): Promise<string> => {
  const configured =
    override?.trim() ||
    (await loadConfiguredAgent(targetDir)) ||
    '(not configured)';

  let runnable = 'unavailable';
  let detail = '';

  try {
    const resolved = await resolveRunnableAgent(targetDir, override);

    runnable = 'ready';
    detail = `binary=${resolved.binary}`;
  } catch (error) {
    detail = error instanceof Error ? error.message : String(error);
  }

  return [
    `Configured agent: ${configured}`,
    `CLI runner: ${runnable}`,
    detail,
    '',
    'Override: --agent <key>  or  DEEPSPEC_AGENT=<key>',
    'Run a prompt: deep-spec run "…"   or   deep-spec approve <slug> --run',
  ].join('\n');
};
