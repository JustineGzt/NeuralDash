export type Category = 
  // Missions neuronales (fictives)
  | 'Système' | 'Réseau' | 'Maintenance' | 'Communication' | 'Sécurité' | 'Stockage'
  // Missions réelles (vie quotidienne)
  | 'Tâches Ménagères' | 'Sport' | 'Projets Personnels' | 'Art & Créativité' | 'Apprentissage' | 'Santé & Bien-être' | 'Loisirs' | 'Travail';

export type Difficulty = 'facile' | 'moyen' | 'difficile';
export type Rarity = 'common' | 'rare' | 'epic';
export type MissionType = 'neural' | 'real'; // Neural = fictive, Real = vraie

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
}

export interface QuestFilters {
  category?: Category;
  difficulty?: Difficulty;
}
