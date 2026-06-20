import type {
  AgentProvider,
  CommandWrite,
  FileOutcome,
  ScaffoldOptions,
  ScaffoldResult,
  TemplateKey,
} from '../types/core.js';
import { dirname, join } from 'node:path';
import { ensureDir, writeFileIfAbsent } from './fs-actions.js';
import { buildManifest, serializeManifest } from './manifest.js';
import { emptyTrackingMap, serializeTrackingMap } from './tracking.js';

const MANIFEST_PATH = '.deepspec/manifest.json';
const TRACKING_PATH = '.deepspec/tracking.json';
const SPECS_DIRS = [
  '.deepspec/specs/drafts/.gitkeep',
  '.deepspec/specs/active/.gitkeep',
  '.deepspec/specs/archive/.gitkeep',
];

const templateJobs = (
  templates: ScaffoldOptions['assets']['templates']
): CommandWrite[] => {
  const keys = Object.keys(templates) as TemplateKey[];

  return keys.map((key) => ({
    relativePath: `.deepspec/templates/${templates[key].fileName}`,
    contents: templates[key].contents,
  }));
};

const hookJobs = (hooks: ScaffoldOptions['assets']['hooks']): CommandWrite[] =>
  hooks.map((hook) => ({
    relativePath: `.deepspec/hooks/${hook.fileName}`,
    contents: hook.contents,
  }));

const bootstrapJobs = (
  templates: ScaffoldOptions['assets']['templates']
): CommandWrite[] => [
  {
    relativePath: '.deepspec/AGENTS.md',
    contents: templates.agents.contents,
  },
  {
    relativePath: '.deepspec/memory.md',
    contents: templates.memory.contents,
  },
  ...SPECS_DIRS.map((relativePath) => ({
    relativePath,
    contents: '',
  })),
];

const orchestratorJob = (
  provider: AgentProvider,
  assets: ScaffoldOptions['assets']
): CommandWrite[] => {
  const relativePath = provider.orchestratorPath?.(assets);

  if (!relativePath) return [];

  return [
    {
      relativePath,
      contents: assets.orchestrator.contents,
    },
  ];
};

const toAbsolute = (targetDir: string, relativePath: string): string =>
  join(targetDir, relativePath);

export const scaffold = async (
  options: ScaffoldOptions
): Promise<ScaffoldResult> => {
  const { targetDir, provider, assets, version, now } = options;
  const jobs: CommandWrite[] = [
    ...bootstrapJobs(assets.templates),
    ...templateJobs(assets.templates),
    ...hookJobs(assets.hooks),
    ...provider.buildCommands(assets),
    ...orchestratorJob(provider, assets),
    {
      relativePath: TRACKING_PATH,
      contents: serializeTrackingMap(emptyTrackingMap()),
    },
  ];

  await Promise.all(
    jobs.map((job) =>
      ensureDir(dirname(toAbsolute(targetDir, job.relativePath)))
    )
  );

  const outcomes: FileOutcome[] = await Promise.all(
    jobs.map(async (job) => {
      const outcome = await writeFileIfAbsent(
        toAbsolute(targetDir, job.relativePath),
        job.contents
      );

      return { path: job.relativePath, status: outcome.status };
    })
  );

  const created = outcomes
    .filter((outcome) => outcome.status === 'created')
    .map((outcome) => outcome.path);
  const skipped = outcomes
    .filter((outcome) => outcome.status === 'skipped')
    .map((outcome) => outcome.path);

  const manifest = buildManifest({
    version,
    agent: provider.key,
    now,
    files: created,
  });

  await writeFileIfAbsent(
    toAbsolute(targetDir, MANIFEST_PATH),
    serializeManifest(manifest)
  );

  return { created, skipped, manifestPath: MANIFEST_PATH };
};
