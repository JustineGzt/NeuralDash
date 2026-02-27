import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Quest } from '../types/quest';
import { getCurrentRotationId } from '../constants/quest';

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rotationId = getCurrentRotationId();

    // Listener: fetch quests that are pinned OR match current rotation
    const q = query(
      collection(db, 'quests'),
      where('rotationId', '==', rotationId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (docSnap) =>
            ({
              id: docSnap.id,
              ...docSnap.data(),
            } as Quest)
        );
        setQuests(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching quests:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createQuest = async (
    title: string,
    category: string,
    difficulty: string
  ) => {
    const rotationId = getCurrentRotationId();
    await addDoc(collection(db, 'quests'), {
      title,
      category,
      difficulty,
      createdAt: Date.now(),
      rotationId,
      isPinned: false,
    });
  };

  const togglePin = async (questId: string, isPinned: boolean) => {
    const questRef = doc(db, 'quests', questId);
    await updateDoc(questRef, { isPinned: !isPinned });
  };

  return { quests, loading, createQuest, togglePin };
}
