import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { stdout } from 'node:process';
import { styleText } from 'node:util';
import type { TaskSummary } from '../types/core.js';
import { locateTask } from '../core/task-locate.js';
import { requestDraftChanges } from '../core/task-ops.js';
import { interactiveSelect } from './interactive-select.js';
import { promptText } from './prompt.js';

const PAGE_SIZE = 16;

export type AbcDoc = {
  letter: 'A' | 'B' | 'C';
  fileName: string;
  title: string;
};

export const ABC_DOCS: AbcDoc[] = [
  { letter: 'A', fileName: 'APPROACH.md', title: '[A] APPROACH — how' },
  {
    letter: 'B',
    fileName: 'BUSINESS_CONTEXT.md',
    title: '[B] BUSINESS CONTEXT — why',
  },
  {
    letter: 'C',
    fileName: 'COMPLETION_REPORT.md',
    title: '[C] COMPLETION REPORT — evidence',
  },
];

export type ReviewPlanOutcome = 'continue' | 'decide';

const print = (line: string): void => {
  stdout.write(`${line}\n`);
};

const bold = (text: string): string =>
  styleText('bold', text, { stream: stdout });

const dim = (text: string): string =>
  styleText('dim', text, { stream: stdout });

const loadDoc = async (
  cwd: string,
  slug: string,
  fileName: string
): Promise<{ path: string; lines: string[] } | undefined> => {
  const located = await locateTask(cwd, slug);

  if (!located) return undefined;

  const path = join(located.folderPath, fileName);

  try {
    const contents = await readFile(path, 'utf8');

    return { path, lines: contents.replace(/\r\n/g, '\n').split('\n') };
  } catch {
    return undefined;
  }
};

const commentOnDoc = async (
  cwd: string,
  slug: string,
  doc: AbcDoc
): Promise<void> => {
  const feedback = await promptText(
    `Feedback on ${doc.letter} (${doc.fileName}): `
  );

  if (!feedback) {
    print('Cancelled — empty feedback.');
    return;
  }

  const tagged = `[${doc.letter} ${doc.fileName}] ${feedback}`;
  const result = await requestDraftChanges(cwd, slug, tagged);

  if (!result.ok) {
    print(result.error ?? 'Failed to record feedback.');
    return;
  }

  print(`Saved feedback on ${doc.letter}.`);
};

type PageChoice = 'more' | 'comment' | 'back';

const readDocPaged = async (
  cwd: string,
  slug: string,
  doc: AbcDoc
): Promise<void> => {
  const loaded = await loadDoc(cwd, slug, doc.fileName);

  if (!loaded) {
    print(`Missing ${doc.fileName}.`);
    return;
  }

  let offset = 0;

  for (;;) {
    const slice = loaded.lines.slice(offset, offset + PAGE_SIZE);
    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(
      1,
      Math.ceil(loaded.lines.length / PAGE_SIZE)
    );
    const hasMore = offset + PAGE_SIZE < loaded.lines.length;

    print('');
    print(bold(doc.title));
    print(dim(`${loaded.path}  ·  page ${page}/${totalPages}`));
    print(dim('─'.repeat(48)));

    for (const line of slice) print(line.length > 0 ? line : ' ');

    print(dim('─'.repeat(48)));

    const choices: { kind: PageChoice; label: string }[] = [];

    if (hasMore) choices.push({ kind: 'more', label: 'More…' });

    choices.push(
      { kind: 'comment', label: `Comment on ${doc.letter}` },
      { kind: 'back', label: 'Back to A / B / C' }
    );

    const index = await interactiveSelect({
      title: hasMore ? 'Continue reading' : `End of ${doc.letter}`,
      hint: '↑/↓ · Enter · Esc/q back',
      options: choices.map((choice) => ({ label: choice.label })),
    });

    if (index === undefined) return;

    const choice = choices[index];

    if (choice.kind === 'more') {
      offset += PAGE_SIZE;
      continue;
    }

    if (choice.kind === 'comment') {
      print('');
      await commentOnDoc(cwd, slug, doc);
      print('');
      continue;
    }

    return;
  }
};

type ReviewMenu =
  | { kind: 'doc'; doc: AbcDoc }
  | { kind: 'decide' }
  | { kind: 'back' };

/**
 * Interactive draft review: pick A/B/C, read page-by-page, comment per doc.
 */
export const browseReviewPlan = async (
  cwd: string,
  task: TaskSummary
): Promise<ReviewPlanOutcome> => {
  for (;;) {
    const menu: ReviewMenu[] = [
      ...ABC_DOCS.map((doc) => ({ kind: 'doc' as const, doc })),
      { kind: 'decide' },
      { kind: 'back' },
    ];

    const index = await interactiveSelect({
      title: `Review plan · ${task.slug}`,
      hint: 'Open one doc at a time · Esc/q back',
      options: [
        ...ABC_DOCS.map((doc) => ({ label: doc.title })),
        { label: 'Decide (approve / revise / discard)' },
        { label: 'Back' },
      ],
    });

    if (index === undefined) return 'continue';

    const action = menu[index];

    if (action.kind === 'back') return 'continue';

    if (action.kind === 'doc') {
      await readDocPaged(cwd, task.slug, action.doc);
      continue;
    }

    return 'decide';
  }
};

export const browseReviewDecide = async (
  cwd: string,
  task: TaskSummary,
  handlers: {
    approve: () => Promise<'done' | 'continue'>;
    revise: () => Promise<'done' | 'continue'>;
    discard: () => Promise<'done' | 'continue'>;
  }
): Promise<'done' | 'continue'> => {
  void cwd;

  const index = await interactiveSelect({
    title: `Decide · ${task.slug}`,
    hint: 'After reading A / B / C',
    options: [
      { label: 'Approve → active' },
      { label: 'Request changes (global)' },
      { label: 'Discard draft' },
      { label: 'Back to A / B / C' },
    ],
  });

  if (index === undefined || index === 3) return 'continue';
  if (index === 0) return handlers.approve();
  if (index === 1) return handlers.revise();
  return handlers.discard();
};
