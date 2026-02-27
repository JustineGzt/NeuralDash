export type QuestItem = {
  id: string;
  title: string;
  tag: string;
  active: boolean;
};

export const upcomingQuests: QuestItem[] = [
  {
    id: 'q-001',
    title: 'Conquerir la lessive',
    tag: 'NEW',
    active: true,
  },
  {
    id: 'q-002',
    title: 'Eliminer python.js',
    tag: 'Forte',
    active: false,
  },
  {
    id: 'q-003',
    title: 'Defi spoota (quinn.js)',
    tag: 'Facile',
    active: true,
  },
];
