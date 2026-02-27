import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getCurrentRotationId } from '../constants/quest';
import type { Quest } from '../types/quest';

const SEED_MISSIONS = [
  {
    title: 'Conquerir la lessive',
    category: 'horreur',
    difficulty: 'easy',
    isPinned: false,
  },
  {
    title: 'Eliminer python.js',
    category: 'invasion',
    difficulty: 'hard',
    isPinned: false,
  },
  {
    title: 'Defi spoota (quinn.js)',
    category: 'espionnage',
    difficulty: 'easy',
    isPinned: false,
  },
  {
    title: 'Resoudre le puzzle cryptique',
    category: 'puzzle',
    difficulty: 'medium',
    isPinned: false,
  },
  {
    title: 'Infiltration du serveur',
    category: 'espionnage',
    difficulty: 'hard',
    isPinned: false,
  },
  {
    title: 'Combat contre les zombies',
    category: 'horreur',
    difficulty: 'medium',
    isPinned: false,
  },
];

export async function seedMissions() {
  const rotationId = getCurrentRotationId();
  const createdAt = Date.now();

  try {
    const promises = SEED_MISSIONS.map((mission) =>
      addDoc(collection(db, 'quests'), {
        ...mission,
        rotationId,
        createdAt,
      })
    );

    await Promise.all(promises);
    console.log(`✅ ${SEED_MISSIONS.length} missions créées avec succès!`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des missions:', error);
    return false;
  }
}
