import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Commands',
      items: [
        'commands/init',
        'commands/create-task',
        'commands/approve-task',
        'commands/complete-task',
        'commands/map-codebase',
        'commands/diagram-architecture',
        'commands/interview',
      ],
    },
    'workflow',
    'install',
  ],
};

export default sidebars;
