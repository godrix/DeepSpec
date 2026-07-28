/** Normalize free text into a kebab-case task slug. */
export const toKebabSlug = (input: string): string => {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return slug.length > 0 ? slug : 'task';
};

/** Human title from slug or free text. */
export const toTaskTitle = (input: string): string => {
  const cleaned = input.replace(/\s+/g, ' ').trim();

  if (!cleaned) return 'Untitled task';

  if (cleaned.includes(' ') || /[A-Z]/.test(cleaned))
    return cleaned.slice(0, 120);

  return cleaned
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};
