import { useEffect, useState, useCallback } from 'react';
import type { Quest, Reward, Category, Difficulty } from '../types/quest';
import type { NeedEffects } from '../types/needs';
import { applyNeedsBoost } from '../utils/needsState';
import { useAuth } from './useAuth';
import {
  getScopedStorageItem,
  getStorageScopeId,
  setScopedStorageItem,
} from '../utils/userStorage';
import { maintainStorageHealth } from '../utils/storageOptimization';
import { progressiveLoad } from '../utils/requestQueue';

const API_URL = 'http://localhost:3001/api';
const INVENTORY_EVENT = 'inventory:updated';
const XP_EVENT = 'xp:updated';
const INVENTORY_STORAGE_KEY = 'playerInventory';
const XP_STORAGE_KEY = 'playerXpTotal';
const WALLET_EVENT = 'wallet:updated';
const WALLET_STORAGE_KEY = 'playerCredits';
const USER_CREATED_MISSION_IDS_KEY = 'userCreatedMissionIds';

const getUserCreatedMissionIds = (userId?: string | null): string[] => {
  try {
    const raw = getScopedStorageItem(USER_CREATED_MISSION_IDS_KEY, userId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((id) => String(id)) : [];
  } catch {
    return [];
  }
};

const saveUserCreatedMissionIds = (ids: string[], userId?: string | null) => {
  setScopedStorageItem(USER_CREATED_MISSION_IDS_KEY, JSON.stringify(ids), userId);
};

const markPersonalMissions = (missions: Quest[], userId?: string | null): Quest[] => {
  const personalIds = new Set(getUserCreatedMissionIds(userId));

  return missions.map((mission) => {
    const id = String(mission.id);
    if (!personalIds.has(id)) return mission;

    return {
      ...mission,
      missionType: 'personal',
      isUserCreated: true,
    };
  });
};

const CATEGORY_NEEDS_BASE_EFFECTS: Partial<Record<Category, NeedEffects>> = {
  'Tâches Ménagères': { productivity: 8, mood: 6, energy: 5 },
  Sport: { energy: 14, mood: 10, engagement: 8, thirst: 6 },
  'Projets Personnels': { productivity: 12, focus: 10, mood: 7, engagement: 6 },
  'Art & Créativité': { mood: 10, engagement: 12, focus: 8 },
  Apprentissage: { focus: 12, productivity: 10, engagement: 6 },
  'Santé & Bien-être': { hunger: 10, thirst: 14, energy: 9, mood: 9 },
  Loisirs: { engagement: 14, mood: 10, energy: 5 },
  Travail: { productivity: 14, focus: 11, engagement: 5 },
};

const DIFFICULTY_NEEDS_MULTIPLIER: Record<Difficulty, number> = {
  facile: 1,
  moyen: 1.2,
  difficile: 1.4,
};

const hasNeedEffects = (effects?: NeedEffects): effects is NeedEffects =>
  Boolean(effects && Object.keys(effects).length > 0);

const scaleNeedsEffects = (baseEffects: NeedEffects, multiplier: number): NeedEffects => {
  const scaled: NeedEffects = {};

  for (const key of Object.keys(baseEffects) as Array<keyof NeedEffects>) {
    const value = baseEffects[key];
    if (typeof value !== 'number') continue;
    scaled[key] = Math.round(value * multiplier);
  }

  return scaled;
};

const inferNeedsEffects = (category: string, difficulty: string): NeedEffects | undefined => {
  const baseEffects = CATEGORY_NEEDS_BASE_EFFECTS[category as Category];
  if (!baseEffects) return undefined;

  const multiplier = DIFFICULTY_NEEDS_MULTIPLIER[difficulty as Difficulty] ?? 1;
  const scaled = scaleNeedsEffects(baseEffects, multiplier);
  return hasNeedEffects(scaled) ? scaled : undefined;
};

const getNeedsEffectsForQuest = (quest: Quest): NeedEffects | undefined => {
  if (hasNeedEffects(quest.needsEffects)) {
    return quest.needsEffects;
  }
  return inferNeedsEffects(quest.category, quest.difficulty);
};

const markNeedsMissions = (missions: Quest[]): Quest[] => {
  return missions.map((mission) => {
    const effects = getNeedsEffectsForQuest(mission);
    const isNeedsMission = mission.isNeedsMission ?? hasNeedEffects(effects);

    return {
      ...mission,
      needsEffects: effects,
      isNeedsMission,
    };
  });
};

const hydrateMissions = (missions: Quest[], userId?: string | null): Quest[] => {
  return markNeedsMissions(markPersonalMissions(missions, userId));
};

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
  },
  {
    id: '15',
    title: 'Boire 750 ml d\'Eau',
    description: 'Remplir une gourde et boire 750 ml pour remonter la jauge de soif.',
    category: 'Santé & Bien-être',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      thirst: 22,
      energy: 6,
    },
    reward: {
      id: 'r15',
      name: 'Gourde Isotherme',
      icon: '🧴',
      type: 'Objet',
      rarity: 'common',
      count: 1,
      desc: '+Hydratation rapide'
    }
  },
  {
    id: '16',
    title: 'Préparer un Repas Équilibré',
    description: 'Composer une assiette complète (protéines, légumes, féculents) pour remonter la faim.',
    category: 'Santé & Bien-être',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      hunger: 24,
      mood: 8,
      energy: 10,
    },
    reward: {
      id: 'r16',
      name: 'Lunch Box Nutrition+',
      icon: '🍱',
      type: 'Objet',
      rarity: 'rare',
      count: 1,
      desc: '+Satiété et énergie durable'
    }
  },
  {
    id: '17',
    title: 'Session Focus 25 min (Pomodoro)',
    description: 'Lancer un minuteur et travailler sans distraction pendant 25 minutes.',
    category: 'Travail',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      productivity: 20,
      focus: 18,
      mood: 5,
    },
    reward: {
      id: 'r17',
      name: 'Minuteur Pomodoro',
      icon: '⏱',
      type: 'Objet',
      rarity: 'rare',
      count: 1,
      desc: '+Productivité ciblée'
    }
  },
  {
    id: '18',
    title: 'Pause Anti-Ennui 20 min',
    description: 'Faire une activité plaisir hors écran: musique, marche ou mini-jeu créatif.',
    category: 'Loisirs',
    difficulty: 'facile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      engagement: 24,
      mood: 14,
    },
    reward: {
      id: 'r18',
      name: 'Kit Anti-Ennui',
      icon: '🎲',
      type: 'Objet',
      rarity: 'common',
      count: 1,
      desc: '+Engagement et fun'
    }
  },
  {
    id: '19',
    title: 'Routine Sport Express 15 min',
    description: 'Faire un mini circuit cardio/renfo pour relancer le corps et l\'énergie.',
    category: 'Sport',
    difficulty: 'moyen',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      energy: 18,
      mood: 12,
      engagement: 8,
    },
    reward: {
      id: 'r19',
      name: 'Bande Élastique Active',
      icon: '🏋️',
      type: 'Objet',
      rarity: 'common',
      count: 1,
      desc: '+Énergie instantanée'
    }
  },
  {
    id: '20',
    title: 'Rituel Calme Avant Sommeil',
    description: '20 minutes de routine sans écran: respiration, étirements et préparation du coucher.',
    category: 'Santé & Bien-être',
    difficulty: 'difficile',
    completed: false,
    isPinned: false,
    rotationId: 'default',
    createdAt: Date.now(),
    missionType: 'real',
    isNeedsMission: true,
    needsEffects: {
      energy: 22,
      focus: 12,
      mood: 15,
    },
    reward: {
      id: 'r20',
      name: 'Masque de Nuit Premium',
      icon: '😴',
      type: 'Objet',
      rarity: 'epic',
      count: 1,
      desc: '+Récupération nocturne'
    }
  }
];

export function useMissions() {
  const { user, loading: authLoading } = useAuth();
  const [quests, setQuests] = useState<Quest[]>(markNeedsMissions(DEFAULT_MISSIONS));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Reward[]>([]);
  const storageScope = getStorageScopeId(user?.uid);

  const readInventory = useCallback(() => {
    // Vérifier et nettoyer le stockage si nécessaire
    const health = maintainStorageHealth();
    if (health.cleaned > 0) {
      console.log(`[Inventory] Freed ${(health.cleaned / 1024).toFixed(2)}KB during load`);
    }

    const savedInventory = getScopedStorageItem(INVENTORY_STORAGE_KEY, user?.uid);
    if (!savedInventory) return [];

    try {
      return JSON.parse(savedInventory) as Reward[];
    } catch (err) {
      console.error('Error parsing inventory:', err);
      return [];
    }
  }, [user?.uid]);

  const saveInventory = useCallback(
    (newInventory: Reward[]) => {
      setInventory(newInventory);
      try {
        setScopedStorageItem(INVENTORY_STORAGE_KEY, JSON.stringify(newInventory), user?.uid);
      } catch (err) {
        // Si la sauvegarde échoue (probablement quota dépassé), essayer de nettoyer et réessayer
        console.warn('Storage quota exceeded, attempting cleanup...', err);
        const health = maintainStorageHealth();
        if (health.cleaned > 0) {
          try {
            setScopedStorageItem(INVENTORY_STORAGE_KEY, JSON.stringify(newInventory), user?.uid);
            console.log('[Inventory] Retry successful after cleanup');
          } catch (retryErr) {
            console.error('[Inventory] Save failed even after cleanup:', retryErr);
          }
        }
      }
      window.dispatchEvent(
        new CustomEvent(INVENTORY_EVENT, {
          detail: { inventory: newInventory, scope: storageScope },
        })
      );
    },
    [storageScope, user?.uid]
  );

  const getRequestHeaders = useCallback(
    async (includeJson = false) => {
      const headers = new Headers();

      if (includeJson) {
        headers.set('Content-Type', 'application/json');
      }

      if (user) {
        try {
          headers.set('Authorization', `Bearer ${await user.getIdToken()}`);
        } catch (err) {
          console.warn('Unable to attach Firebase token to missions request:', err);
        }
        headers.set('x-user-id', user.uid);
      } else {
        headers.set('x-user-id', storageScope);
      }

      return headers;
    },
    [storageScope, user]
  );

  // Charger l'inventaire depuis localStorage
  useEffect(() => {
    if (authLoading) return;
    setInventory(readInventory());
  }, [authLoading, readInventory]);

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
    if (authLoading) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching missions and inventory...');
      
      // Utiliser le progressive loading pour charger les données critiques en parallèle
      const headers = await getRequestHeaders();
      const results = await progressiveLoad(
        [
          {
            key: 'missions',
            fetch: async () => {
              const response = await fetch(`${API_URL}/missions/current`, { headers });
              if (!response.ok) throw new Error(`API error: ${response.status}`);
              return response.json();
            },
            priority: 'critical',
          },
          {
            key: 'inventory',
            fetch: async () => {
              const response = await fetch(`${API_URL}/inventory`, { headers });
              if (!response.ok) return { inventory: [] };
              return response.json();
            },
            priority: 'high',
          },
        ],
        (key, _data) => {
          console.log(`Loaded: ${key}`);
        }
      );

      const missions = results.missions?.missions || [];
      const inventory = results.inventory?.inventory || [];

      console.log(`Loaded ${missions.length} missions and ${inventory.length} inventory items`);

      if (missions.length > 0) {
        setQuests(hydrateMissions(missions, user?.uid));
        if (inventory.length > 0) {
          setInventory(inventory);
        }
      } else {
        console.log('No missions from API, using defaults...');
        setQuests(hydrateMissions(DEFAULT_MISSIONS, user?.uid));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkError =
        err instanceof TypeError && err.message.toLowerCase().includes('fetch');
      if (isNetworkError) {
        console.warn('Backend unavailable, using default missions.');
      } else {
        console.error('Error fetching missions:', errorMsg);
      }
      setError(null);
      setQuests(hydrateMissions(DEFAULT_MISSIONS, user?.uid));
    } finally {
      setLoading(false);
    }
  }, [authLoading, getRequestHeaders, user?.uid]);

  // Seed les missions
  const seedMissions = async () => {
    try {
      console.log('Sending seed request to API...');
      const response = await fetch(`${API_URL}/missions/seed`, {
        method: 'POST',
        headers: await getRequestHeaders(true),
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
    if (authLoading) return;
    // Nettoyer le stockage avant de charger
    const health = maintainStorageHealth();
    if (health.cleaned > 0) {
      console.log(`[Missions] Storage maintenance: Freed ${(health.cleaned / 1024).toFixed(2)}KB`);
    }
    fetchQuests();
  }, [authLoading, fetchQuests]);

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
          headers: await getRequestHeaders(true),
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
        const newInventory = [...readInventory()];
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
      const currentXp = Number(getScopedStorageItem(XP_STORAGE_KEY, user?.uid)) || 0;
      const newXpTotal = currentXp + xpGain;
      setScopedStorageItem(XP_STORAGE_KEY, String(newXpTotal), user?.uid);
      window.dispatchEvent(
        new CustomEvent(XP_EVENT, {
          detail: { totalXp: newXpTotal, gain: xpGain, scope: storageScope },
        })
      );

      const creditGain = getCreditGain(quest.difficulty);
      const currentCredits = Number(getScopedStorageItem(WALLET_STORAGE_KEY, user?.uid)) || 0;
      const newCredits = currentCredits + creditGain;
      setScopedStorageItem(WALLET_STORAGE_KEY, String(newCredits), user?.uid);
      window.dispatchEvent(
        new CustomEvent(WALLET_EVENT, {
          detail: { credits: newCredits, gain: creditGain, scope: storageScope },
        })
      );

      // Marquer la mission comme complétée
      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, completed: true } : q
        )
      );

      const missionNeedsBoost = getNeedsEffectsForQuest(quest);
      if (hasNeedEffects(missionNeedsBoost)) {
        applyNeedsBoost(missionNeedsBoost, 'mission-complete', user?.uid);
      }

      return {
        success: true,
        reward: quest.reward,
        xpGain,
        totalXp: newXpTotal,
        creditGain,
        credits: newCredits,
        needsBoost: missionNeedsBoost,
      };
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
        headers: await getRequestHeaders(true),
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

  // Créer une mission (local-first, puis sync API optionnel)
  const createQuest = async (title: string, category: string, difficulty: string, description?: string): Promise<boolean> => {
    try {
      // 1. Créer la mission localement immédiatement
      const localId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      const needsEffects = inferNeedsEffects(category, difficulty);
      
      const personalQuest: Quest = {
        id: localId,
        title: title.trim(),
        description: description?.trim() || undefined,
        category: category as Category,
        difficulty: difficulty as Difficulty,
        createdAt: now,
        rotationId: `user-created-${now}`,
        isPinned: false,
        completed: false,
        missionType: 'personal',
        isUserCreated: true,
        isNeedsMission: hasNeedEffects(needsEffects),
        needsEffects,
      };

      // 2. Sauvegarder l'ID dans localStorage
      const savedIds = getUserCreatedMissionIds(user?.uid);
      if (!savedIds.includes(localId)) {
        saveUserCreatedMissionIds([...savedIds, localId], user?.uid);
      }

      // 3. Ajouter à la liste immédiatement
      setQuests((prev) => [personalQuest, ...prev]);

      // 4. Optionnel: Tenter de synchroniser avec l'API en arrière-plan
      try {
        await fetch(`${API_URL}/missions`, {
          method: 'POST',
          headers: await getRequestHeaders(true),
          body: JSON.stringify({ title, category, difficulty, description }),
        });
      } catch {
        // L'API n'est pas disponible mais la mission locale fonctionne
        console.log('Mission créée localement (API non disponible)');
      }

      return true; // Succès
    } catch (err) {
      console.error('Erreur création mission:', err);
      return false; // Échec
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
