export const QUEST_ICONS: Record<string, string> = {
  // Legacy categories
  horreur: '👻',
  invasion: '👾',
  espionnage: '🕵️',
  puzzle: '🧩',

  // Neural missions
  systeme: '🧠',
  system: '🧠',
  reseau: '🌐',
  network: '🌐',
  maintenance: '🛠️',
  communication: '📡',
  securite: '🛡️',
  security: '🛡️',
  stockage: '💾',
  storage: '💾',

  // Real-life missions
  'taches menageres': '🧹',
  chores: '🧹',
  sport: '🏃',
  fitness: '🏃',
  workout: '🏃',
  'projets personnels': '💻',
  'personal projects': '💻',
  'art creativite': '🎨',
  art: '🎨',
  creativity: '🎨',
  apprentissage: '📚',
  learning: '📚',
  education: '📚',
  'sante bien etre': '🧘',
  'health wellness': '🧘',
  loisirs: '🎮',
  hobbies: '🎮',
  work: '💼',
  travail: '💼',

  // Difficulty fallback keys
  facile: '🟢',
  easy: '🟢',
  moyen: '🟡',
  medium: '🟡',
  difficile: '🔴',
  hard: '🔴',
};

const normalizeCategory = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function getQuestIcon(category: string): string {
  if (!category) return '🎯';

  const normalized = normalizeCategory(category);
  const directMatch = QUEST_ICONS[normalized] || QUEST_ICONS[category.toLowerCase()];
  if (directMatch) return directMatch;

  const fuzzyMatch = Object.entries(QUEST_ICONS).find(([key]) =>
    normalized.includes(key) || key.includes(normalized)
  );

  return fuzzyMatch?.[1] ?? '🎯';
}
