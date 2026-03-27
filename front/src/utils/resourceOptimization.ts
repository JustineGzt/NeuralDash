/**
 * Optimisation des ressources statiques
 * - Lazy loading des images
 * - Reduire les images (WebP, compression)
 * - Différer CSS/JS non-critiques
 * - Preload des ressources critiques
 */

/**
 * Configuration du lazy loading des images avec observer
 */
export const configureLazyImages = () => {
  if (typeof document === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        
        // Charger l'image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Charger le srcset
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute('data-srcset');
        }
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px', // Commencer à charger 50px avant la visibilité
  });

  // Observer toutes les images lazy
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

/**
 * Charger CSS non-critique de manière asynchrone
 */
export const loadNonCriticalCSS = (href: string) => {
  const link = document.createElement('link') as HTMLLinkElement;
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print';
  link.addEventListener('load', function() {
    this.media = 'all';
  });
  document.head.appendChild(link);
};

/**
 * Preload des ressources critiques
 */
export const preloadResource = (href: string, as: 'script' | 'style' | 'image' | 'font') => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = as;
  link.href = href;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

/**
 * Defer l'exécution des scripts non-critiques
 */
export const deferScriptLoad = (src: string, options?: { module?: boolean; noModule?: boolean }) => {
  if (typeof document === 'undefined') return;

  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  
  if (options?.module) {
    script.type = 'module';
  }
  if (options?.noModule) {
    script.noModule = true;
  }
  
  document.body.appendChild(script);
};

/**
 * Web Workers pour déport de calculs lourds
 */
export class WorkerPool {
  private workers: (Worker & { busy?: boolean })[] = [];
  private taskQueue: Array<{ fn: () => unknown; resolve: (value: unknown) => void; reject: (err: Error) => void }> = [];
  private maxWorkers = navigator.hardwareConcurrency || 4;

  constructor(scriptUrl: string, poolSize?: number) {
    const size = Math.min(poolSize || this.maxWorkers, this.maxWorkers);
    for (let i = 0; i < size; i++) {
      try {
        const worker = new Worker(scriptUrl);
        worker.onmessage = () => this.processQueue();
        this.workers.push(worker);
      } catch (err) {
        console.warn('Failed to create worker:', err);
      }
    }
  }

  run(data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ fn: () => data, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;

    const task = this.taskQueue.shift();
    if (!task) return;

    availableWorker.busy = true;
    availableWorker.postMessage(task.fn());
    
    // Listener pour la réponse
    const handler = (event: MessageEvent) => {
      task.resolve(event.data);
      availableWorker.busy = false;
      availableWorker.removeEventListener('message', handler);
      this.processQueue();
    };
    
    availableWorker.addEventListener('message', handler);
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
  }
}

/**
 * Optimiser les performances avec les Core Web Vitals
 */
export const optimizeWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Détecter les Web Vitals avec Web Vitals library si disponible
  try {
    // Observer les LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('Web Vital:', entry.name, entry.startTime);
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  } catch (err) {
    console.warn('Web Vitals observation not supported:', err);
  }
};

/**
 * Compresser les images côté client
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas conversion failed'));
          },
          'image/webp',
          quality
        );
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Initialiser tous les optimisations au chargement
 */
export const initializeResourceOptimizations = () => {
  configureLazyImages();
  optimizeWebVitals();


};
