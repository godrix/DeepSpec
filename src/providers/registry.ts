import type { AgentChoice, AgentProvider, AgentSpec } from '../types/core.js';
import { createProvider } from './create-provider.js';

export const AGENT_SPECS: AgentSpec[] = [
  {
    key: 'claude',
    displayName: 'Claude Code',
    format: 'skill',
    layout: 'skill',
    dir: '.claude/skills',
  },
  {
    key: 'codex',
    displayName: 'Codex CLI',
    format: 'skill',
    layout: 'skill',
    dir: '.codex/skills',
  },
  {
    key: 'copilot',
    displayName: 'GitHub Copilot',
    format: 'copilot-prompt',
    dir: '.github/prompts',
    extension: '.prompt.md',
  },
  {
    key: 'cursor-agent',
    displayName: 'Cursor',
    format: 'skill',
    layout: 'skill',
    dir: '.cursor/skills',
  },
  {
    key: 'opencode',
    displayName: 'opencode',
    format: 'markdown',
    dir: '.opencode/commands',
  },
  {
    key: 'windsurf',
    displayName: 'Windsurf',
    format: 'markdown',
    dir: '.windsurf/workflows',
  },
  {
    key: 'cline',
    displayName: 'Cline',
    format: 'markdown',
    dir: '.clinerules/workflows',
  },
  {
    key: 'continue',
    displayName: 'Continue',
    format: 'markdown',
    dir: '.continue/prompts',
    extension: '.prompt',
  },
  {
    key: 'forge',
    displayName: 'Forge',
    format: 'forge',
    dir: '.forge/commands',
  },
  {
    key: 'gemini',
    displayName: 'Gemini CLI',
    format: 'gemini-toml',
    dir: '.gemini/commands',
    extension: '.toml',
  },
  {
    key: 'goose',
    displayName: 'Goose',
    format: 'goose-yaml',
    dir: '.goose/recipes',
    extension: '.yaml',
  },
];

export const AGENT_PROVIDERS: Record<string, AgentProvider> =
  Object.fromEntries(
    AGENT_SPECS.map((spec) => [spec.key, createProvider(spec)])
  );

/** CLI aliases (e.g. `cursor` → `cursor-agent`). */
const AGENT_ALIASES: Record<string, string> = {
  cursor: 'cursor-agent',
};

export const listAgentKeys = (): string[] => Object.keys(AGENT_PROVIDERS);

export const listAgentChoices = (): AgentChoice[] =>
  Object.values(AGENT_PROVIDERS).map(({ key, displayName }) => ({
    key,
    displayName,
  }));

export const getProvider = (key: string): AgentProvider => {
  const resolved = AGENT_ALIASES[key] ?? key;
  const provider = AGENT_PROVIDERS[resolved];

  if (!provider)
    throw new Error(
      `Unknown agent "${key}". Available: ${listAgentKeys().join(', ')}.`
    );

  return provider;
};
