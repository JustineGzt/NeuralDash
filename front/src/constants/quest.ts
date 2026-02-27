export const CATEGORIES: Array<{ label: string; value: string }> = [
  // Missions Réelles
  { label: '🏠 Tâches Ménagères', value: 'Tâches Ménagères' },
  { label: '🏃 Sport', value: 'Sport' },
  { label: '💻 Projets Personnels', value: 'Projets Personnels' },
  { label: '🎨 Art & Créativité', value: 'Art & Créativité' },
  { label: '📚 Apprentissage', value: 'Apprentissage' },
  { label: '🧘 Santé & Bien-être', value: 'Santé & Bien-être' },
  { label: '🎮 Loisirs', value: 'Loisirs' },
  { label: '💼 Travail', value: 'Travail' },
];

export const DIFFICULTIES: Array<{ label: string; value: string }> = [
  { label: 'Facile', value: 'facile' },
  { label: 'Moyen', value: 'moyen' },
  { label: 'Difficile', value: 'difficile' },
];

export const QUEST_ROTATION_INTERVAL_MS = 3 * 60 * 60 * 1000; // 3 hours

export function getCurrentRotationId(): string {
  const now = Date.now();
  const rotationIndex = Math.floor(now / QUEST_ROTATION_INTERVAL_MS);
  return `rotation-${rotationIndex}`;
}
