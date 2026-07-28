import type { AgentRunnerSpec } from '../types/core.js';

/** How to invoke each init agent from a terminal CLI, when available. */
export const AGENT_RUNNERS: Record<string, AgentRunnerSpec> = {
  'cursor-agent': {
    key: 'cursor-agent',
    displayName: 'Cursor',
    binaries: ['agent', 'cursor-agent'],
    buildArgs: (prompt, mode) =>
      mode.print
        ? ['-p', ...(mode.force ? ['--force'] : []), prompt]
        : [prompt],
  },
  claude: {
    key: 'claude',
    displayName: 'Claude Code',
    binaries: ['claude'],
    buildArgs: (prompt, mode) =>
      mode.print
        ? [
            '-p',
            ...(mode.force ? ['--dangerously-skip-permissions'] : []),
            prompt,
          ]
        : [prompt],
  },
  codex: {
    key: 'codex',
    displayName: 'Codex CLI',
    binaries: ['codex'],
    buildArgs: (prompt, mode) =>
      mode.print
        ? ['exec', ...(mode.force ? ['--full-auto'] : []), prompt]
        : [prompt],
  },
  gemini: {
    key: 'gemini',
    displayName: 'Gemini CLI',
    binaries: ['gemini'],
    buildArgs: (prompt, mode) => (mode.print ? ['-p', prompt] : [prompt]),
  },
  opencode: {
    key: 'opencode',
    displayName: 'opencode',
    binaries: ['opencode'],
    buildArgs: (prompt, mode) =>
      mode.print ? ['run', prompt] : ['run', prompt],
  },
  goose: {
    key: 'goose',
    displayName: 'Goose',
    binaries: ['goose'],
    buildArgs: (prompt) => ['run', '-t', prompt],
  },
};

export const getAgentRunner = (
  agentKey: string
): AgentRunnerSpec | undefined => AGENT_RUNNERS[agentKey];
