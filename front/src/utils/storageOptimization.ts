/**
 * Outil d'optimisation du stockage pour améliorer les performances de chargement
 * Gère le nettoyage et la compression des données IndexedDB/localStorage
 */

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB
const CLEANUP_THRESHOLD = 4 * 1024 * 1024; // 4MB

/**
 * Estime la taille du localStorage en octets
 */
export const estimateStorageSize = (): number => {
  let totalSize = 0;
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += key.length + item.length;
      }
    }
  }
  return totalSize;
};

/**
 * Nettoie les données obsolètes pour libérer de l'espace
 */
export const cleanupObsoleteData = (): number => {
  const keysToClean = [];
  const now = Date.now();
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      // Nettoyer les données avec timestamps obsolètes
      if (key.includes('::') && key.endsWith('_last_update')) {
        const lastUpdate = parseInt(localStorage.getItem(key) || '0', 10);
        if (now - lastUpdate > MAX_AGE_MS) {
          const baseKey = key.replace('_last_update', '');
          keysToClean.push(key, baseKey);
        }
      }

      // Nettoyer les clés temporaires
      if (key.startsWith('temp_') || key.startsWith('cache_')) {
        keysToClean.push(key);
      }
    }
  }

  let freedSize = 0;
  keysToClean.forEach((key) => {
    const item = localStorage.getItem(key);
    if (item) {
      freedSize += key.length + item.length;
      localStorage.removeItem(key);
    }
  });

  console.log(`[Storage] Freed ${(freedSize / 1024).toFixed(2)}KB from cleanup`);
  return freedSize;
};

/**
 * Compresse les données de l'inventaire pour réduire la taille
 */
export const compressInventoryData = (inventory: any[]): any[] => {
  return inventory.map((item) => ({
    id: item.id,
    n: item.name, // name -> n
    c: item.count, // count -> c
    t: item.type, // type -> t
    r: item.rarity, // rarity -> r
    d: item.desc, // desc -> d
    i: item.icon, // icon -> i
  }));
};

/**
 * Décompresse les données compressées
 */
export const decompressInventoryData = (compressed: any[]): any[] => {
  return compressed.map((item) => ({
    id: item.id,
    name: item.n,
    count: item.c,
    type: item.t,
    rarity: item.r,
    desc: item.d,
    icon: item.i,
  }));
};

/**
 * Paginates large datasets for lazy loading
 */
export const paginateData = <T,>(data: T[], pageSize: number = 20): T[][] => {
  const pages: T[][] = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

/**
 * Vérifie la santé du stockage et nettoie si nécessaire
 */
export const maintainStorageHealth = (): { cleaned: number; currentSize: number } => {
  const currentSize = estimateStorageSize();
  let cleaned = 0;

  if (currentSize > CLEANUP_THRESHOLD) {
    console.warn(`[Storage] Size (${(currentSize / 1024).toFixed(2)}KB) exceeds threshold`);
    cleaned = cleanupObsoleteData();
  }

  return {
    cleaned,
    currentSize: estimateStorageSize(),
  };
};

/**
 * Cache avec TTL (Time To Live) pour les données
 */
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl: number; // millisecondes

  constructor(ttlMinutes: number = 60) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Lazy loader pour les données volumineuses
 */
export class LazyLoader<T> {
  private data: T[] = [];
  private pageSize: number;
  private currentPage: number = 0;
  private pages: T[][] = [];

  constructor(data: T[], pageSize: number = 20) {
    this.data = data;
    this.pageSize = pageSize;
    this.pages = paginateData(data, pageSize);
  }

  hasNext(): boolean {
    return this.currentPage < this.pages.length - 1;
  }

  next(): T[] {
    if (this.hasNext()) {
      this.currentPage++;
      return this.pages[this.currentPage];
    }
    return [];
  }

  reset(): void {
    this.currentPage = 0;
  }

  current(): T[] {
    return this.pages[this.currentPage] || [];
  }

  goto(page: number): T[] {
    if (page >= 0 && page < this.pages.length) {
      this.currentPage = page;
      return this.pages[page];
    }
    return [];
  }
}

// Initialiser le nettoyage automatique au chargement
if (typeof window !== 'undefined') {
  // Nettoyer au chargement de la page
  window.addEventListener('load', () => {
    const health = maintainStorageHealth();
    if (health.cleaned > 0) {
      console.log(
        `[Storage] Maintenance: Freed ${(health.cleaned / 1024).toFixed(2)}KB, Current: ${(health.currentSize / 1024).toFixed(2)}KB`
      );
    }
  });

  // Nettoyer périodiquement (toutes les heures)
  setInterval(() => {
    maintainStorageHealth();
  }, 60 * 60 * 1000);
}
