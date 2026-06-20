import type { Frontmatter } from '../../../src/types/test.js';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, it, strict } from 'poku';
import { parse } from 'yaml.min';
import { packageRoot } from './__utils__.js';

const SPEC_DIR = new URL('spec/', packageRoot);
const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n/;

const ALLOWED_KEYS = {
  name: true,
  description: true,
  'argument-hint': true,
  'user-invocable': true,
} satisfies Record<keyof Required<Frontmatter>, true>;

const listMarkdownFiles = async (dir: URL): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      if (entry.isDirectory())
        return listMarkdownFiles(new URL(`${entry.name}/`, dir));

      if (entry.isFile() && entry.name.endsWith('.md'))
        return [fileURLToPath(new URL(entry.name, dir))];

      return [];
    })
  );

  return nested.flat().sort((left, right) => left.localeCompare(right));
};

const frontmatterOf = (contents: string): string | null => {
  const match = contents.match(FRONTMATTER_PATTERN);

  return match ? match[1] : null;
};

const files = await listMarkdownFiles(SPEC_DIR);

const withFrontmatter = (
  await Promise.all(
    files.map(async (file) => {
      const frontmatter = frontmatterOf(await readFile(file, 'utf8'));

      return frontmatter === null ? null : { file, frontmatter };
    })
  )
).filter((entry) => entry !== null);

describe('every spec frontmatter is valid and well-typed', () => {
  it('finds spec files that declare frontmatter', () => {
    strict(
      withFrontmatter.length > 0,
      'at least one spec .md file should declare frontmatter'
    );
  });

  for (const { file, frontmatter } of withFrontmatter) {
    it(`${file} declares only allowed frontmatter keys`, () => {
      const parsed = parse<Frontmatter>(frontmatter);

      strict(
        typeof parsed === 'object' && parsed !== null,
        'frontmatter should parse to an object'
      );

      strict.strictEqual(
        typeof parsed.description,
        'string',
        'description is required and must be a string'
      );

      const unknownKeys = Object.keys(parsed).filter(
        (key) => !(key in ALLOWED_KEYS)
      );

      strict.deepStrictEqual(
        unknownKeys,
        [],
        `unexpected frontmatter keys: ${unknownKeys.join(', ')}`
      );
    });
  }
});
