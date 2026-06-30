import type {
  AgentProvider,
  CommandWrite,
  FileOutcome,
  ScaffoldOptions,
  ScaffoldResult,
  TemplateKey,
} from '../types/core.js';
import { dirname, join } from 'node:path';
import { ROOT_DIR } from './brand.js';
import { ensureDir, writeFileIfAbsent } from './fs-actions.js';
import { buildManifest, serializeManifest } from './manifest.js';
import { emptyTrackingMap, serializeTrackingMap } from './tracking.js';

const MANIFEST_PATH = `${ROOT_DIR}/manifest.json`;
const TRACKING_PATH = `${ROOT_DIR}/tracking.json`;
const SPECS_DIRS = [
  `${ROOT_DIR}/specs/drafts/.gitkeep`,
  `${ROOT_DIR}/specs/active/.gitkeep`,
  `${ROOT_DIR}/specs/archive/.gitkeep`,
];

const templateJobs = (
  templates: ScaffoldOptions['assets']['templates']
): CommandWrite[] => {
  const keys = Object.keys(templates) as TemplateKey[];

  return keys.map((key) => ({
    relativePath: `${ROOT_DIR}/templates/${templates[key].fileName}`,
    contents: templates[key].contents,
  }));
};

const hookJobs = (hooks: ScaffoldOptions['assets']['hooks']): CommandWrite[] =>
  hooks.map((hook) => ({
    relativePath: `${ROOT_DIR}/hooks/${hook.fileName}`,
    contents: hook.contents,
  }));

const bootstrapJobs = (
  templates: ScaffoldOptions['assets']['templates']
): CommandWrite[] => [
  {
    relativePath: `${ROOT_DIR}/AGENTS.md`,
    contents: templates.agents.contents,
  },
  {
    relativePath: `${ROOT_DIR}/memory.md`,
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
