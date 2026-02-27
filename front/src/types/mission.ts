export interface Mission {
  id: string;
  title: string;
  status: 'NEW' | 'WORK' | 'DONE';
  detail: string;
  reward?: string;
  tag?: string;
}