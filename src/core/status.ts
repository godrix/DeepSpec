const STATUS_PATTERN =
  /\*\*Status:\*\*\s*`(\[PENDING\]|\[IN PROGRESS\]|\[IN REVIEW\]|\[DONE\]|\[DISCARDED\])`/;

export const parseStatus = (contents: string): string => {
  const match = contents.match(STATUS_PATTERN);

  return match ? match[1] : 'unknown';
};
