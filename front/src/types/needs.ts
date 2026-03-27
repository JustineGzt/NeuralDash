export type NeedKey =
  | 'hunger'
  | 'thirst'
  | 'engagement'
  | 'productivity'
  | 'energy'
  | 'focus'
  | 'mood';

export interface PlayerNeeds {
  hunger: number;
  thirst: number;
  engagement: number;
  productivity: number;
  energy: number;
  focus: number;
  mood: number;
}

export type NeedEffects = Partial<Record<NeedKey, number>>;

export const NEED_KEYS: NeedKey[] = [
  'hunger',
  'thirst',
  'engagement',
  'productivity',
  'energy',
  'focus',
  'mood',
];
