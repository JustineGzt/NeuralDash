import { useEffect, useState } from 'react';
import type { Reward } from '../types/quest';

const STARTER_ITEMS: Reward[] = [
  {
    id: 'starter-armor-01',
    name: 'Armure Neo-Carbon',
    icon: '🦾',
    type: 'Armure',
    rarity: 'rare',
    count: 1,
    desc: 'Defense +12%'
  },
  {
    id: 'starter-hat-01',
    name: 'Chapeau Holo-Visor',
    icon: '🎩',
    type: 'Chapeau',
    rarity: 'common',
    count: 1,
    desc: 'Focus +6%'
  },
  {
    id: 'starter-module-01',
    name: 'Module Stabilisateur',
    icon: '🧬',
    type: 'Module',
    rarity: 'common',
    count: 1,
    desc: 'Systeme +5%'
  },
  {
    id: 'starter-compass-01',
    name: 'Boussole',
    icon: '🧭',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Navigation +5%'
  },
  {
    id: 'starter-glove-01',
    name: 'Gant',
    icon: '🧤',
    type: 'Equipement',
    rarity: 'common',
    count: 1,
    desc: 'Precision +3%'
  },
  {
    id: 'starter-prism-01',
    name: 'Prisme',
    icon: '🔷',
    type: 'Artefact',
    rarity: 'rare',
    count: 1,
    desc: 'Signal +8%'
  },
  {
    id: 'starter-probe-01',
    name: 'Sonde',
    icon: '📡',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Scan +5%'
  },
  {
    id: 'starter-drone-01',
    name: 'Drone',
    icon: '🛰️',
    type: 'Support',
    rarity: 'rare',
    count: 1,
    desc: 'Exploration +10%'
  },
  {
    id: 'starter-beacon-01',
    name: 'Balises',
    icon: '📍',
    type: 'Outil',
    rarity: 'common',
    count: 2,
    desc: 'Repere +6%'
  },
  {
    id: 'starter-analyzer-01',
    name: 'Analyseur',
    icon: '🧿',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Detection +5%'
  },
  {
    id: 'starter-sensor-01',
    name: 'Capteur',
    icon: '📟',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Lecture +4%'
  },
  {
    id: 'starter-filter-01',
    name: 'Filtre',
    icon: '🧫',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Stabilisation +3%'
  }
];

export function useInventory() {
  const [inventory, setInventory] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const inventoryKey = 'playerInventory';
  const inventoryEvent = 'inventory:updated';

  const readInventory = () => {
    const savedInventory = localStorage.getItem(inventoryKey);
    if (savedInventory) {
      try {
        return JSON.parse(savedInventory) as Reward[];
      } catch (error) {
        console.error('Error loading inventory:', error);
      }
    }

    localStorage.setItem(inventoryKey, JSON.stringify(STARTER_ITEMS));
    return STARTER_ITEMS;
  };

  const writeInventory = (next: Reward[]) => {
    localStorage.setItem(inventoryKey, JSON.stringify(next));
    setInventory(next);
    window.dispatchEvent(new CustomEvent(inventoryEvent, { detail: { inventory: next } }));
  };

  const syncFromStorage = () => {
    setInventory(readInventory());
  };

  useEffect(() => {
    // Charger l'inventaire depuis localStorage
    syncFromStorage();
    setLoading(false);
  }, []);

  // Écouter les changements du localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === inventoryKey) syncFromStorage();
    };

    const handleInventoryEvent = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.inventory) {
        setInventory(event.detail.inventory as Reward[]);
        return;
      }
      syncFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(inventoryEvent, handleInventoryEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(inventoryEvent, handleInventoryEvent);
    };
  }, []);

  const addItem = (item: Reward, amount = 1) => {
    if (amount <= 0) return;
    const current = readInventory();
    const index = current.findIndex((entry) => entry.id === item.id);
    const count = item.count ?? 1;

    if (index >= 0) {
      const nextCount = (current[index].count ?? 0) + amount * count;
      current[index] = { ...current[index], count: nextCount };
    } else {
      current.push({ ...item, count: count * amount });
    }

    writeInventory([...current]);
  };

  const removeItem = (itemId: string, amount = 1) => {
    if (amount <= 0) return true;
    const current = readInventory();
    const index = current.findIndex((entry) => entry.id === itemId);
    if (index < 0) return false;

    const existing = current[index];
    const nextCount = (existing.count ?? 0) - amount;
    if (nextCount < 0) return false;

    if (nextCount === 0) {
      current.splice(index, 1);
    } else {
      current[index] = { ...existing, count: nextCount };
    }

    writeInventory([...current]);
    return true;
  };

  return { inventory, loading, addItem, removeItem };
}
