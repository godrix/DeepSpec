import type { AgentChoice } from '../types/core.js';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { interactiveSelect } from './interactive-select.js';
import {
  agentSelectedLine,
  agentSelectHint,
  agentSelectTitle,
  selectionAborted,
} from './messages.js';

export const isInteractive = (): boolean => stdin.isTTY === true;

export const promptForAgent = async (
  agents: AgentChoice[]
): Promise<string> => {
  const index = await interactiveSelect({
    title: agentSelectTitle(),
    hint: agentSelectHint(),
    options: agents.map((agent) => ({ label: agent.displayName })),
  });

  if (index === undefined) throw new Error(selectionAborted());

  const agent = agents[index];

  stdout.write(`${agentSelectedLine(agent.displayName)}\n`);

  return agent.key;
};

export const promptText = async (question: string): Promise<string> => {
  if (stdin.isPaused()) stdin.resume();

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const answer = await rl.question(question);

    return answer.trim();
  } finally {
    rl.close();
  }
};
