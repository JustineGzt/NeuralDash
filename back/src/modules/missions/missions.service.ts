import { Injectable } from '@nestjs/common';
import { db } from '../../config/firebase';
import type { Quest, CreateQuestDto, UpdateQuestDto, Reward, CompleteMissionResponse, Mission, AchievementStatus } from './missions.interface';
import { ACHIEVEMENT_THRESHOLDS, CATEGORY_TITLES, KNOWN_CATEGORIES, NOVICE_LABEL, toRomanNumeral } from './achievements.config';

@Injectable()
export class MissionsService {
  private collection = db.collection('quests');

  // Missions par défaut en français avec récompenses
  private defaultMissions: Omit<Mission, 'id' | 'createdAt'>[] = [
    {
      title: 'Calibrer les Senseurs Neuraux',
      description: 'Synchronisez les senseurs neuraux avec le système de traitement central pour améliorer la précision des lectures.',
      category: 'Système',
      difficulty: 'facile',
      completed: false,
      isPinned: false,
      rotationId: '',
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
      title: 'Optimiser la Bande Passante',
      description: 'Réduisez la latence du réseau neural en optimisant les canaux de communication.',
      category: 'Réseau',
      difficulty: 'moyen',
      completed: false,
      isPinned: false,
      rotationId: '',
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
      title: 'Réparer les Cellules Endommagées',
      description: 'Lancez un diagnostic complet et rétablissez les connexions cellulaires endommagées.',
      category: 'Maintenance',
      difficulty: 'moyen',
      completed: false,
      isPinned: false,
      rotationId: '',
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
      title: 'Synchroniser avec le Serveur Maître',
      description: 'Établissez une connexion sécurisée avec le serveur maître et téléchargez les mises à jour critiques.',
      category: 'Communication',
      difficulty: 'difficile',
      completed: false,
      isPinned: false,
      rotationId: '',
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
      title: 'Neutraliser les Parasites Nanotech',
      description: 'Détectez et éliminez tous les parasites nanotech qui s\'installent dans les système.',
      category: 'Sécurité',
      difficulty: 'difficile',
      completed: false,
      isPinned: false,
      rotationId: '',
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
      title: 'Augmenter la Capacité de Stockage',
      description: 'Débloquez de nouveaux emplacements de stockage neural en optimisant la compression des données.',
      category: 'Stockage',
      difficulty: 'facile',
      completed: false,
      isPinned: false,
      rotationId: '',
      reward: {
        id: 'r6',
        name: 'Expansion Mémoire',
        icon: '🧠',
        type: 'Module',
        rarity: 'common',
        count: 2,
        desc: 'Augmente la capacité de stockage de 50%'
      }
    }
  ];

  async findAll(): Promise<Quest[]> {
    try {
      const snapshot = await this.collection.get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Quest));
    } catch (error) {
      console.error('Error fetching all quests:', error);
      return [];
    }
  }

  async findByRotation(rotationId: string): Promise<Quest[]> {
    try {
      const snapshot = await this.collection
        .where('rotationId', '==', rotationId)
        .get();
      
      // Si vide, créer les missions par défaut
      if (snapshot.empty) {
        console.log(`No missions found for rotation ${rotationId}, creating default missions...`);
        await this.seedMissions(rotationId);
        const newSnapshot = await this.collection
          .where('rotationId', '==', rotationId)
          .get();
        return newSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Quest));
      }
      
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Quest));
    } catch (error) {
      console.error(`Error fetching missions for rotation ${rotationId}:`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Quest | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Quest;
  }

  async create(dto: CreateQuestDto, rotationId: string): Promise<Quest> {
    const quest: Omit<Quest, 'id'> = {
      ...dto,
      description: dto.description || '',
      createdAt: Date.now(),
      rotationId,
      isPinned: false,
      completed: false,
      reward: dto.reward || {
        id: 'default',
        name: 'Récompense',
        icon: '⭐',
        type: 'Item',
        rarity: 'common',
        count: 1
      }
    };
    const docRef = await this.collection.add(quest);
    return { id: docRef.id, ...quest };
  }

  async update(id: string, dto: UpdateQuestDto): Promise<Quest | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    
    await docRef.update(dto as Record<string, unknown>);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() } as Quest;
  }

  async delete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    
    await docRef.delete();
    return true;
  }

  async completeMission(missionId: string): Promise<CompleteMissionResponse> {
    try {
      const mission = await this.findOne(missionId);
      
      if (!mission) {
        return {
          success: false,
          message: 'Mission non trouvée'
        };
      }

      if (mission.completed) {
        return {
          success: false,
          message: 'Mission déjà complétée'
        };
      }

      // Marquer la mission comme complétée
      const updated = await this.update(missionId, { completed: true });

      return {
        success: true,
        message: `Mission "${mission.title}" complétée avec succès!`,
        reward: mission.reward,
        mission: updated || undefined
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur lors de la complétion de la mission'
      };
    }
  }

  async getAchievements(): Promise<AchievementStatus[]> {
    const snapshot = await this.collection.where('completed', '==', true).get();
    const counts: Record<string, number> = {};

    snapshot.docs.forEach((doc) => {
      const data = doc.data() as Quest;
      if (!data.category) return;
      counts[data.category] = (counts[data.category] || 0) + 1;
    });

    const categories = new Set<string>([...KNOWN_CATEGORIES, ...Object.keys(counts)]);
    return Array.from(categories).map((category) =>
      this.buildAchievementStatus(category, counts[category] || 0)
    );
  }

  private async populateMissionsIfEmpty(): Promise<void> {
    const rotationId = this.getCurrentRotationId();
    const snapshot = await this.collection.where('rotationId', '==', rotationId).get();
    
    if (snapshot.empty) {
      await this.seedMissions(rotationId);
    }
  }

  private async seedMissions(rotationId: string): Promise<void> {
    console.log(`Seeding missions for rotation: ${rotationId}`);
    try {
      for (const mission of this.defaultMissions) {
        const questData: Omit<Mission, 'id'> = {
          ...mission,
          rotationId,
          createdAt: Date.now()
        };
        const docRef = await this.collection.add(questData);
        console.log(`Created mission: ${docRef.id} - ${mission.title}`);
      }
    } catch (error) {
      console.error(`Error seeding missions:`, error);
      throw error;
    }
  }

  async seedAllMissions(): Promise<{ success: boolean; count: number; message: string }> {
    const rotationId = this.getCurrentRotationId();
    
    try {
      // Vérifier si déjà peuplé
      const existing = await this.collection.where('rotationId', '==', rotationId).get();
      
      if (!existing.empty) {
        return {
          success: true,
          count: existing.size,
          message: `Missions already exist for rotation ${rotationId}. Total: ${existing.size}`
        };
      }

      await this.seedMissions(rotationId);
      
      return {
        success: true,
        count: this.defaultMissions.length,
        message: `Successfully seeded ${this.defaultMissions.length} missions for rotation ${rotationId}`
      };
    } catch (error) {
      console.error('Error in seedAllMissions:', error);
      return {
        success: false,
        count: 0,
        message: `Error seeding missions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  getCurrentRotationId(): string {
    const now = Date.now();
    const ROTATION_INTERVAL = 3 * 60 * 60 * 1000; // 3h
    const rotationIndex = Math.floor(now / ROTATION_INTERVAL);
    return `rotation-${rotationIndex}`;
  }

  private buildAchievementStatus(category: string, completedCount: number): AchievementStatus {
    const baseTitle = CATEGORY_TITLES[category] || category;
    let tier = 0;

    for (let index = 0; index < ACHIEVEMENT_THRESHOLDS.length; index += 1) {
      if (completedCount >= ACHIEVEMENT_THRESHOLDS[index]) {
        tier = index + 1;
      }
    }

    const label = tier === 0 ? NOVICE_LABEL : `${baseTitle} ${toRomanNumeral(tier)}`;
    const nextThreshold = ACHIEVEMENT_THRESHOLDS.find((value) => value > completedCount) ?? null;

    return {
      category,
      completedCount,
      label,
      tier,
      nextThreshold,
    };
  }
}
