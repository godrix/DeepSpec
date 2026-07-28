import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveSpecRoot } from './brand.js';

const ENTRY_PATTERN =
  /^\[(\d{4}-\d{2}-\d{2})\]\s+\[([^\]]+)\]:\s+(.+?)(?:\.\s+Ref:.*)?$/;

export type MemoryEntry = {
  date: string;
  slug: string;
  summary: string;
  discarded: boolean;
};

export const readMemoryEntries = async (
  targetDir: string
): Promise<MemoryEntry[]> => {
  const rootDir = await resolveSpecRoot(targetDir);
  const memoryPath = join(targetDir, rootDir, 'memory.md');

  let contents: string;

  try {
    contents = await readFile(memoryPath, 'utf8');
  } catch {
    return [];
  }

  const entries: MemoryEntry[] = [];

  for (const line of contents.split('\n')) {
    const match = line.trim().match(ENTRY_PATTERN);

    if (!match) continue;

    const summaryRaw = match[3].trim();
    const discardedMatch = summaryRaw.match(/^\[discarded\]\s*(.*)$/i);

    entries.push({
      date: match[1],
      slug: match[2],
      summary: discardedMatch
        ? discardedMatch[1].trim() || 'Discarded draft'
        : summaryRaw,
      discarded: Boolean(discardedMatch),
    });
  }

  return entries;
};

export const formatMemory = (entries: MemoryEntry[]): string => {
  if (entries.length === 0) return 'Memory is empty.\n';

  const lines = ['Memory:', ''];

  for (const entry of entries) {
    const mark = entry.discarded ? 'discarded' : 'done';

    lines.push(`- [${entry.date}] ${entry.slug} (${mark}): ${entry.summary}`);
  }

  return `${lines.join('\n')}\n`;
};
