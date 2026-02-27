export const KNOWN_CATEGORIES = [
  'Système',
  'Réseau',
  'Maintenance',
  'Communication',
  'Sécurité',
  'Stockage',
  'Tâches Ménagères',
  'Sport',
  'Projets Personnels',
  'Art & Créativité',
  'Apprentissage',
  'Santé & Bien-être',
  'Loisirs',
  'Travail',
];

export const CATEGORY_TITLES: Record<string, string> = {
  Sport: 'Sportif',
  'Art & Créativité': 'Peintre',
};

export const ACHIEVEMENT_THRESHOLDS = [10, 30, 60, 100];
export const NOVICE_LABEL = 'Novice';

export const toRomanNumeral = (value: number) => {
  const map: Array<[number, string]> = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let remaining = value;
  let result = '';

  for (const [num, numeral] of map) {
    while (remaining >= num) {
      result += numeral;
      remaining -= num;
    }
  }

  return result || 'I';
};
