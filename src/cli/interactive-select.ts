import type { KeypressEvent, SelectConfig } from '../types/core.js';
import { stdin, stdout } from 'node:process';
import { emitKeypressEvents } from 'node:readline';
import { styleText } from 'node:util';

const ESC = '\u001b';
const CURSOR_HIDE = `${ESC}[?25l`;
const CURSOR_SHOW = `${ESC}[?25h`;
const CLEAR_LINE = `${ESC}[2K`;

const color = {
  cyan: (text: string): string => styleText('cyan', text, { stream: stdout }),
  dim: (text: string): string => styleText('dim', text, { stream: stdout }),
  bold: (text: string): string => styleText('bold', text, { stream: stdout }),
};

export const interactiveSelect = (
  config: SelectConfig
): Promise<number | undefined> => {
  const { title, hint, options } = config;

  return new Promise((resolve) => {
    let active = 0;
    let rendered = false;

    const render = (): void => {
      if (rendered) stdout.write(`${ESC}[${options.length}A`);

      for (let index = 0; index < options.length; index += 1) {
        const isActive = index === active;
        const pointer = isActive ? color.cyan('>') : ' ';
        const label = isActive
          ? color.cyan(options[index].label)
          : options[index].label;

        stdout.write(`${CLEAR_LINE}\r ${pointer} ${label}\n`);
      }

      rendered = true;
    };

    const cleanup = (): void => {
      stdin.off('keypress', onKeypress);

      if (stdin.isTTY) stdin.setRawMode(false);

      stdin.pause();
      stdout.write(CURSOR_SHOW);
    };

    const finish = (result: number | undefined): void => {
      cleanup();
      resolve(result);
    };

    const onKeypress = (_str: string, key: KeypressEvent): void => {
      const name = key?.name;

      if (key?.ctrl && name === 'c') {
        finish(undefined);
        return;
      }

      if (name === 'escape' || name === 'q') {
        finish(undefined);
        return;
      }

      if (name === 'up' || name === 'k') {
        active = (active - 1 + options.length) % options.length;
        render();
        return;
      }

      if (name === 'down' || name === 'j') {
        active = (active + 1) % options.length;
        render();
        return;
      }

      if (name === 'return' || name === 'enter') {
        finish(active);
        return;
      }
    };

    stdout.write(`${color.bold(title)}\n`);
    stdout.write(`${color.dim(hint)}\n`);
    stdout.write(CURSOR_HIDE);

    emitKeypressEvents(stdin);

    if (stdin.isTTY) stdin.setRawMode(true);

    stdin.resume();
    stdin.on('keypress', onKeypress);

    render();
  });
};
