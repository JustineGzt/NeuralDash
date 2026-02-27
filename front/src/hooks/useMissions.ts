import { useEffect, useState, useCallback } from 'react';
import type { Quest, Reward } from '../types/quest';

const API_URL = 'http://localhost:3001/api';
const INVENTORY_EVENT = 'inventory:updated';
const XP_EVENT = 'xp:updated';
const XP_STORAGE_KEY = 'playerXpTotal';
const WALLET_EVENT = 'wallet:updated';
const WALLET_KEY = 'playerCredits';

// Missions par défaut en cas d'erreur API
const DEFAULT_MISSIONS: Quest[] = [
  // === MISSIONS NEURONALES (Fictives) ===
  {
    id: '1',
    title: 'Calibrer les Senseurs Neuraux',
    description: 'Synchronisez les senseurs neuraux avec le système de traitement central pour améliorer la précision des lectures.',
    category: 'Système',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r1',
      name: 'Pack Énergie Basique',
      icon: '🔋',
      type: 'Consommable',
      rarity: 'common',
      count: 1,
      desc: 'Recharge énergétique basique. +10% énergie'
    }
  },
  {
    id: '2',
    title: 'Optimiser la Bande Passante',
    description: 'Réduisez la latence du réseau neural en optimisant les canaux de communication.',
    category: 'Réseau',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r2',
      name: 'Puce Focus Améliorée',
      icon: '💾',
      type: 'Module',
      rarity: 'rare',
      count: 1,
      desc: 'Module de concentration avancé. +15% focus'
    }
  },
  {
    id: '3',
    title: 'Réparer les Cellules Endommagées',
    description: 'Lancez un diagnostic complet et rétablissez les connexions cellulaires endommagées.',
    category: 'Maintenance',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r3',
      name: 'Sérum Vital-X',
      icon: '🧪',
      type: 'Consommable',
      rarity: 'rare',
      count: 1,
      desc: 'Accélère la reconstruction cellulaire. +25% santé'
    }
  },
  {
    id: '4',
    title: 'Synchroniser avec le Serveur Maître',
    description: 'Établissez une connexion sécurisée avec le serveur maître et téléchargez les mises à jour critiques.',
    category: 'Communication',
    difficulty: 'difficile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r4',
      name: 'Cristal Neuronal Premium',
      icon: '💎',
      type: 'Module',
      rarity: 'epic',
      count: 1,
      desc: 'Amplificateur neuronal de classe premium. +30% tous les stats'
    }
  },
  {
    id: '5',
    title: 'Neutraliser les Parasites Nanotech',
    description: 'Détectez et éliminez tous les parasites nanotech qui s\'installent dans les système.',
    category: 'Sécurité',
    difficulty: 'difficile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r5',
      name: 'Nano-Shield Avancé',
      icon: '🛡️',
      type: 'Module',
      rarity: 'epic',
      count: 1,
      desc: 'Bouclier de protection nanotech. +40% défense'
    }
  },
  {
    id: '6',
    title: 'Augmenter la Capacité de Stockage',
    description: 'Débloquez de nouveaux emplacements de stockage neural en optimisant la compression des données.',
    category: 'Stockage',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'neural',
    reward: {
      id: 'r6',
      name: 'Expansion Mémoire',
      icon: '🧠',
      type: 'Module',
      rarity: 'common',
      count: 2,
      desc: 'Augmente la capacité de stockage de 50%'
    }
  },

  // === MISSIONS RÉELLES (Vie Quotidienne) ===
  {
    id: '7',
    title: 'Ranger la Chambre',
    description: 'Trier et ranger votre chambre. Faire le lit, laver les vêtements, ranger le sol.',
    category: 'Tâches Ménagères',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r7',
      name: 'Points de Nettoyage',
      icon: '🧹',
      type: 'Progression',
      rarity: 'common',
      count: 10,
      desc: '+10 points de satisfaction personnelle'
    }
  },
  {
    id: '8',
    title: 'Faire 30 minutes de Sport',
    description: 'Faire de l\'exercice : course, yoga, musculation, vélo, natation ou autre.',
    category: 'Sport',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r8',
      name: 'Boost d\'Énergie',
      icon: '⚡',
      type: 'Buff',
      rarity: 'common',
      count: 1,
      desc: '+15% énergie et bien-être'
    }
  },
  {
    id: '9',
    title: 'Travailler sur un Projet Personnel',
    description: 'Consacrer du temps à un projet qui vous passionne (codage, design, musique, etc...).',
    category: 'Projets Personnels',
    difficulty: 'difficile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r9',
      name: 'Cristal de Créativité',
      icon: '✨',
      type: 'Boost',
      rarity: 'rare',
      count: 1,
      desc: '+20% productivité pendant 24h'
    }
  },
  {
    id: '10',
    title: 'Session de Peinture ou Dessin',
    description: 'Consacrer 1-2 heures à la peinture, au dessin, ou à toute forme d\'art créatif.',
    category: 'Art & Créativité',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r10',
      name: 'Palette d\'Inspiration',
      icon: '🎨',
      type: 'Tool',
      rarity: 'rare',
      count: 1,
      desc: 'Débloquez des idées créatives'
    }
  },
  {
    id: '11',
    title: 'Apprendre quelque chose de Nouveau',
    description: 'Suivre un cours en ligne, lire un livre, regarder un tutoriel sur un sujet qui vous intéresse.',
    category: 'Apprentissage',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r11',
      name: 'Savoir Accumulé',
      icon: '📚',
      type: 'Buff',
      rarity: 'common',
      count: 15,
      desc: '+15 points de connaissance'
    }
  },
  {
    id: '12',
    title: 'Méditation ou Relaxation',
    description: 'Prendre 15-20 minutes pour méditer ou faire une activité relaxante (yoga, respiration, etc).',
    category: 'Santé & Bien-être',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r12',
      name: 'Sérénité +1',
      icon: '🧘',
      type: 'Buff',
      rarity: 'common',
      count: 1,
      desc: '+25% sérénité et calme'
    }
  },
  {
    id: '13',
    title: 'Jeu ou Loisir Amusant',
    description: 'Jouer à un jeu vidéo, jeu de société, ou faire une activité ludique pour décompresser.',
    category: 'Loisirs',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r13',
      name: 'Boost de Plaisir',
      icon: '🎮',
      type: 'Buff',
      rarity: 'common',
      count: 1,
      desc: '+30% bonheur et détente'
    }
  },
  {
    id: '14',
    title: 'Travailler 2h sur ses Objetifs Pro',
    description: 'Travailler sur votre carrière, améliorer vos compétences, avancer sur un projet important.',
    category: 'Travail',
    difficulty: 'difficile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    reward: {
      id: 'r14',
      name: 'Promo XP',
      icon: '💼',
      type: 'Buff',
      rarity: 'epic',
      count: 50,
      desc: '+50 points de progression carrière'
    }
  }
];

export function useMissions() {
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_MISSIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Reward[]>([]);

  // Charger l'inventaire depuis localStorage
  useEffect(() => {
    const savedInventory = localStorage.getItem('playerInventory');
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (err) {
        console.error('Error parsing inventory:', err);
      }
    }
  }, []);

  // Sauvegarder l'inventaire dans localStorage
  const saveInventory = (newInventory: Reward[]) => {
    setInventory(newInventory);
    localStorage.setItem('playerInventory', JSON.stringify(newInventory));
    window.dispatchEvent(new CustomEvent(INVENTORY_EVENT, { detail: { inventory: newInventory } }));
  };

  const getXpGain = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'facile':
        return 15;
      case 'moyen':
        return 35;
      case 'difficile':
        return 60;
      default:
        return 15;
    }
  };

  const getCreditGain = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'facile':
        return 10;
      case 'moyen':
        return 20;
      case 'difficile':
        return 35;
      default:
        return 10;
    }
  };

  // Charger les missions
  const fetchQuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching missions from API...');
      const response = await fetch(`${API_URL}/missions/current`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const missions = data.missions || [];
      
      console.log(`Loaded ${missions.length} missions from API`);
      
      if (missions.length > 0) {
        setQuests(missions);
      } else {
        console.log('No missions from API, using defaults and seeding...');
        setQuests(DEFAULT_MISSIONS);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching missions:', errorMsg);
      setError(errorMsg);
      setQuests(DEFAULT_MISSIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  // Seed les missions
  const seedMissions = async () => {
    try {
      console.log('Sending seed request to API...');
      const response = await fetch(`${API_URL}/missions/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Seed failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Seed result:', result);
      
      // Re-fetch après seed
      setTimeout(() => fetchQuests(), 500);
    } catch (err) {
      console.error('Error seeding missions:', err);
    }
  };

  // Charger les missions au montage
  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  // Compléter une mission
  const completeMission = async (questId: string) => {
    try {
      console.log(`Completing mission ${questId}...`);
      
      // Trouver la mission pour récupérer la récompense
      const quest = quests.find((q) => q.id === questId);
      if (!quest) {
        throw new Error('Mission non trouvée localement');
      }

      // Essayer de compléter via l'API
      let apiSuccess = false;
      let apiMessage = '';
      
      try {
        const response = await fetch(`${API_URL}/missions/${questId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const result = await response.json();
          apiSuccess = result.success;
          apiMessage = result.message || '';
          
          if (!apiSuccess) {
            console.warn(`API returned success=false: ${apiMessage}`);
          }
        } else {
          console.warn(`API error: ${response.status}`);
        }
      } catch (apiErr) {
        // Si l'API échoue, on continue avec la complétion locale
        console.warn('API call failed, completing locally:', apiErr);
      }

      // Compléter la mission localement avec sa récompense
      if (quest.reward) {
        const newInventory = [...inventory];
        const existingItem = newInventory.find((item) => item.id === quest.reward!.id);

        if (existingItem) {
          existingItem.count += quest.reward.count;
        } else {
          newInventory.push(quest.reward);
        }

        saveInventory(newInventory);
        console.log(`✅ Reward granted: ${quest.reward.name}`);
      }

      const xpGain = getXpGain(quest.difficulty);
      const currentXp = Number(localStorage.getItem(XP_STORAGE_KEY)) || 0;
      const newXpTotal = currentXp + xpGain;
      localStorage.setItem(XP_STORAGE_KEY, String(newXpTotal));
      window.dispatchEvent(
        new CustomEvent(XP_EVENT, { detail: { totalXp: newXpTotal, gain: xpGain } })
      );

      const creditGain = getCreditGain(quest.difficulty);
      const currentCredits = Number(localStorage.getItem(WALLET_KEY)) || 0;
      const newCredits = currentCredits + creditGain;
      localStorage.setItem(WALLET_KEY, String(newCredits));
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENT, { detail: { credits: newCredits, gain: creditGain } })
      );

      // Marquer la mission comme complétée
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, completed: true } : q
        )
      );

      return { success: true, reward: quest.reward, xpGain, totalXp: newXpTotal, creditGain, credits: newCredits };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error completing mission:', errorMsg);
      throw new Error(`❌ Erreur: ${errorMsg}`);
    }
  };

  // Toggle pin
  const togglePin = async (questId: string, isPinned: boolean) => {
    try {
      await fetch(`${API_URL}/missions/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !isPinned }),
      });

      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, isPinned: !isPinned } : q
        )
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  // Créer une mission
  const createQuest = async (title: string, category: string, difficulty: string) => {
    try {
      const response = await fetch(`${API_URL}/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, difficulty }),
      });

      if (!response.ok) {
        throw new Error(`Create failed: ${response.status}`);
      }

      const newQuest = await response.json();
      setQuests((prev) => [newQuest, ...prev]);
    } catch (err) {
      console.error('Error creating mission:', err);
    }
  };

  return {
    quests,
    loading,
    error,
    inventory,
    completeMission,
    togglePin,
    createQuest,
    seedMissions,
    refetch: fetchQuests
  };
}
