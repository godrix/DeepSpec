export type InitArgs = {
  init: boolean;
  agent: string;
};

export type Frontmatter = {
  name?: string;
  description: string;
  'argument-hint'?: string;
  'user-invocable'?: boolean;
};
