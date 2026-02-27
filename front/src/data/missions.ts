import type { Mission } from '../types/mission';

export const missions: Mission[] = [
  {
    id: 'm-001',
    title: 'Defeat the Digimes',
    status: 'NEW',
    detail: '-90 HP on failure',
    tag: 'NEW',
  },
  {
    id: 'm-002',
    title: 'Data Breach',
    status: 'WORK',
    detail: 'Barrier Encryption',
    reward: '500 credits',
    tag: 'WORK',
  },
  {
    id: 'm-003',
    title: 'Supply Run',
    status: 'DONE',
    detail: 'Satchel secured',
    reward: 'Med pack',
    tag: 'EASY',
  },
];
