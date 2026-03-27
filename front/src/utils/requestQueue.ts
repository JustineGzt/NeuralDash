/**
 * Gestionnaire de requêtes critique pour optimiser les performances API
 * - Batching des requêtes
 * - Déduplication
 * - Prioritization
 * - Progressive loading
 */

interface RequestOptions {
  priority?: 'critical' | 'high' | 'normal' | 'low';
  cacheDuration?: number; // ms
  timeout?: number; // ms
}

interface QueuedRequest<T = unknown> {
  key: string;
  fn: () => Promise<T>;
  options: RequestOptions;
  timestamp: number;
  retries: number;
}

class RequestQueue {
  private queue: Map<string, QueuedRequest> = new Map();
  private results: Map<string, { data: unknown; timestamp: number }> = new Map();
  private inFlight: Set<string> = new Set();
  private maxRetries = 3;
  private batchDelay = 50; // ms
  private processBatchTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Ajouter une requête à la queue
   */
  async add<T>(key: string, fn: () => Promise<T>, options: RequestOptions = {}): Promise<T> {
    // Retourner en cache si disponible et valide
    const cached = this.results.get(key);
    if (cached) {
      const ttl = options.cacheDuration || 60000;
      if (Date.now() - cached.timestamp < ttl) {
        return cached.data as T;
      }
      this.results.delete(key);
    }

    // Retourner la requête en cours si déjà en vol
    if (this.inFlight.has(key)) {
      return this.waitForInFlight<T>(key);
    }

    // Ajouter à la queue
    this.queue.set(key, {
      key,
      fn,
      options: { priority: 'normal', cacheDuration: 60000, timeout: 10000, ...options },
      timestamp: Date.now(),
      retries: 0,
    });

    // Déclencher le traitement par batch
    this.scheduleBatchProcessing();
    
    return this.waitForInFlight<T>(key);
  }

  /**
   * Traiter la batch de requêtes
   */
  private async processBatch() {
    if (this.queue.size === 0) return;

    // Trier par priorité
    const requests = Array.from(this.queue.values()).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      return priorityOrder[a.options.priority || 'normal'] - priorityOrder[b.options.priority || 'normal'];
    });

    // Marquer comme en vol
    requests.forEach(req => {
      this.inFlight.add(req.key);
      this.queue.delete(req.key);
    });

    // Exécuter en parallèle
    await Promise.all(requests.map(req => this.executeRequest(req)));
  }

  /**
   * Exécuter une requête avec retry
   */
  private async executeRequest(req: QueuedRequest) {
    try {
      const controller = new AbortController();
      const timeout = req.options.timeout || 10000;
      const timer = setTimeout(() => controller.abort(), timeout);

      const data = await Promise.race([
        req.fn(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => reject(new Error('Request timeout')));
        }),
      ]);

      clearTimeout(timer);
      this.results.set(req.key, { data, timestamp: Date.now() });
    } catch (error) {
      if (req.retries < this.maxRetries) {
        req.retries++;
        // Retry avec exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, req.retries) * 100));
        await this.executeRequest(req);
      } else {
        console.error(`Request failed after ${this.maxRetries} retries: ${req.key}`, error);
      }
    } finally {
      this.inFlight.delete(req.key);
    }
  }

  /**
   * Attendre que la requête soit en vol
   */
  private async waitForInFlight<T>(key: string, maxWait = 30000): Promise<T> {
    const start = Date.now();
    while (this.inFlight.has(key) || !this.results.has(key)) {
      if (Date.now() - start > maxWait) {
        throw new Error(`Request timeout waiting for: ${key}`);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return this.results.get(key)?.data as T;
  }

  /**
   * Planifier le traitement des batches
   */
  private scheduleBatchProcessing() {
    if (this.processBatchTimer) return;
    
    this.processBatchTimer = setTimeout(() => {
      this.processBatchTimer = null;
      this.processBatch();
    }, this.batchDelay);
  }

  /**
   * Vider la cache
   */
  clearCache(pattern?: RegExp) {
    if (!pattern) {
      this.results.clear();
    } else {
      Array.from(this.results.keys()).forEach(key => {
        if (pattern.test(key)) {
          this.results.delete(key);
        }
      });
    }
  }

  /**
   * Obtenir les stats
   */
  getStats() {
    return {
      queued: this.queue.size,
      inFlight: this.inFlight.size,
      cached: this.results.size,
    };
  }
}

// Singleton instance
const requestQueue = new RequestQueue();

/**
 * API helper avec batching automatique
 */
export async function batchedFetch<T = unknown>(
  url: string,
  options?: RequestOptions & { method?: string; body?: unknown }
) {
  const method = options?.method || 'GET';
  const key = `${method}:${url}`;

  return requestQueue.add<T>(
    key,
    async () => {
      const headers: Record<string, string> = {};
      if (options?.body) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json() as Promise<T>;
    },
    options
  );
}

/**
 * Helper pour charger les données en progressive loading
 */
export async function progressiveLoad<T>(
  dataSources: Array<{
    key: string;
    fetch: () => Promise<T>;
    priority?: 'critical' | 'high' | 'normal' | 'low';
  }>,
  onProgress?: (key: string, data: T) => void
) {
  const results: Record<string, T> = {};

  // Trier par priorité
  const sorted = dataSources.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    return (
      (priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'])
    );
  });

  // Charger critiques d'abord
  const critical = sorted.filter(ds => ds.priority === 'critical');
  const others = sorted.filter(ds => ds.priority !== 'critical');

  // Attendre les critiques
  for (const ds of critical) {
    try {
      const data = await requestQueue.add<T>(
        ds.key,
        () => ds.fetch(),
        { priority: 'critical', cacheDuration: 60000 }
      );
      results[ds.key] = data;
      onProgress?.(ds.key, data);
    } catch (err) {
      console.error(`Failed to load ${ds.key}:`, err);
    }
  }

  // Charger les autres en parallèle en arrière-plan
  others.forEach(ds => {
    requestQueue.add<T>(
      ds.key,
      () => ds.fetch(),
      { priority: ds.priority || 'normal', cacheDuration: 60000 }
    ).then(data => {
      results[ds.key] = data;
      onProgress?.(ds.key, data);
    }).catch(err => {
      console.error(`Failed to load ${ds.key}:`, err);
    });
  });

  return results;
}

/**
 * Export de la queue pour des opérations avancées
 */
export { requestQueue };
