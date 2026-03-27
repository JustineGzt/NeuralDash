export interface Reward {
  id: string;
  name: string;
  icon: string;
  type: string;
  rarity: 'common' | 'rare' | 'epic';
  count: number;
  desc?: string;
}

export interface Mission {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  reward: Reward;
  createdAt: number;
  rotationId: string;
  isPinned: boolean;
  completed: boolean;
  iconUrl?: string;
  missionType?: 'neural' | 'real';
}

export interface Quest extends Mission {} // Alias pour compatibilité

export interface CreateQuestDto {
  title: string;
  description?: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  reward?: Reward;
}

export interface UpdateQuestDto {
  isPinned?: boolean;
  completed?: boolean;
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
}

export interface CompleteMissionResponse {
  success: boolean;
  message: string;
  reward?: Reward;
  mission?: Mission;
}

export interface AchievementStatus {
  category: string;
  completedCount: number;
  label: string;
  tier: number;
  nextThreshold: number | null;
}
