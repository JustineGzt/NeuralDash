export type EmotionImage = 
  | 'ennuie1' | 'ennuie2' | 'colere' | 'triste' | 'content' | 'supercontent' 
  | 'confiant' | 'surpris' | 'inquiet' | 'boost1' | 'boost2' | 'boost3' 
  | 'boostFatigue' | 'boostDort' | 'arrete';

export interface StatsInput {
  health: number;
  energy: number;
  system: number;
  power?: number;
  shield?: number;
  focus?: number;
}

export function determineEmotion(stats: StatsInput): {
  emotion: EmotionImage;
  intensity: number;
} {
  const { health, energy, system, power = 50, shield = 50, focus = 50 } = stats;

  // --- 1. ÉTATS CRITIQUES (Priorité maximale) ---
  if (health < 20) return { emotion: 'colere', intensity: 100 };
  if (energy < 5) return { emotion: 'boostDort', intensity: 20 };
  if (health < 40 || shield < 25) return { emotion: 'inquiet', intensity: 80 };
  if (energy < 25) return { emotion: 'boostFatigue', intensity: 75 };

  // --- 2. ÉTATS D'ACTION / PERFORMANCE (Priorité haute) ---
  // Cas Confiant : Tu es en plein contrôle
  if (system > 85 && focus > 80 && power > 70) {
    return { emotion: 'confiant', intensity: 90 };
  }

  // Cas Surpris : Pic soudain de système ou de focus
  if (system > 95 || focus > 95) {
    return { emotion: 'surpris', intensity: 90 };
  }

  // --- 3. ÉTATS POSITIFS (Le "Flow") ---
  if (energy > 85 && health > 80) return { emotion: 'supercontent', intensity: 95 };

  // Cycle des Boosts : On utilise le focus pour varier entre boost 1, 2 et 3
  if (energy > 60 && focus > 50) {
    const variants: EmotionImage[] = ['boost1', 'boost2', 'boost3'];
    // On change de variante selon le niveau de focus pour que ça bouge
    const index = Math.floor(focus / 34) % 3; 
    return { emotion: variants[index], intensity: energy };
  }

  // --- 4. ÉTATS PASSIFS / NÉGATIFS ---
  // Cas Ennuyé : Si le focus est très bas, l'avatar décroche
  if (focus < 30) {
    const ennui = system < 40 ? 'ennuie2' : 'ennuie1';
    return { emotion: ennui, intensity: 40 };
  }

  if (energy < 45) return { emotion: 'triste', intensity: 60 };

  // --- 5. ÉTATS STABLES (Par défaut) ---
  if (health > 60 && energy > 50) return { emotion: 'content', intensity: 70 };

  // Secours si aucune condition n'est remplie
  return { emotion: 'ennuie1', intensity: 30 };
}

export function getEmotionImagePath(emotion: EmotionImage): string {
  return `/emotions/${emotion}.png`;
}