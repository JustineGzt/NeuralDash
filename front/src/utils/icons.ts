export const QUEST_ICONS: Record<string, string> = {
  horreur: '👻',
  invasion: '👾',
  espionnage: '🕵️',
  puzzle: '🧩',
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

export function getQuestIcon(category: string): string {
  return QUEST_ICONS[category] || '🎯';
}
