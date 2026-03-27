import type { NeedEffects } from './needs';

export type Category = 
  // Missions neuronales (fictives)
  | 'Système' | 'Réseau' | 'Maintenance' | 'Communication' | 'Sécurité' | 'Stockage'
  // Missions réelles (vie quotidienne)
  | 'Tâches Ménagères' | 'Sport' | 'Projets Personnels' | 'Art & Créativité' | 'Apprentissage' | 'Santé & Bien-être' | 'Loisirs' | 'Travail';

export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type Rarity = 'common' | 'rare' | 'epic';
export type MissionType = 'neural' | 'real' | 'personal'; // Personal = creee par utilisateur

export interface Reward {
  id: string;
  name: string;
  icon: string;
  type: string;
  rarity: Rarity;
  count: number;
  desc?: string;
}

export interface Quest {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  category: Category;
  difficulty: Difficulty;
  createdAt: number;
  rotationId: string;
  isPinned: boolean;
  completed?: boolean;
  reward?: Reward;
  iconUrl?: string;
  missionType?: MissionType;
  isUserCreated?: boolean;
  isNeedsMission?: boolean;
  needsEffects?: NeedEffects;
}

export interface QuestFilters {
  category?: Category;
  difficulty?: Difficulty;
}
