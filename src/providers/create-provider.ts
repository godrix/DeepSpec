import type {
  AgentProvider,
  AgentSpec,
  BundledAssets,
  CommandKey,
  CommandWrite,
} from '../types/core.js';
import { COMMAND_PREFIX, ORCHESTRATOR_DIR } from '../core/brand.js';
import { transformCommand } from '../transform/command-template.js';

const commandPath = (spec: AgentSpec, key: CommandKey): string => {
  const name = `${COMMAND_PREFIX}.${key}`;

  if ((spec.layout ?? 'file') === 'skill')
    return `${spec.dir}/${name}/SKILL.md`;

  return `${spec.dir}/${name}${spec.extension ?? '.md'}`;
};

const orchestratorPath = (spec: AgentSpec): string | undefined => {
  if ((spec.layout ?? 'file') !== 'skill') return undefined;

  return `${spec.dir}/${ORCHESTRATOR_DIR}/SKILL.md`;
};

export const createProvider = (spec: AgentSpec): AgentProvider => ({
  key: spec.key,
  displayName: spec.displayName,
  orchestratorPath: () => orchestratorPath(spec),
  buildCommands: (assets: BundledAssets): CommandWrite[] => {
    const keys = Object.keys(assets.commands) as CommandKey[];

    return keys.map((key) => ({
      relativePath: commandPath(spec, key),
      contents: transformCommand(assets.commands[key], key, spec.format),
    }));
  },
});
