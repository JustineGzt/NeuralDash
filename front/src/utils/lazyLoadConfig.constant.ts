/**
 * Configuration du lazy loading des pages
 * Stratégie et constantes de prefetch
 */

export const PREFETCH_STRATEGY = {
  // Pages à charger immédiatement (critiques)
  immediate: ['Login', 'Register'],
  
  // Pages à charger après 1s (probablement visitées)
  soon: ['Home', 'Missions'],
  
  // Pages à charger après 5s (peuvent être visitées)
  eventually: ['Inventaire', 'Aventure', 'Boutique'],
  
  // Pages à charger en idle callback (rarement visitées)
  idle: ['PrivacyPolicy', 'TermsOfService', 'ForgotPassword'],
} as const;

/**
 * Preload une page en arrière-plan (utile pour les prédictions)
 */
export const prefetchPage = (pageModule: () => Promise<unknown>): void => {
  // Utiliser requestIdleCallback si disponible, sinon setTimeout
  if ('requestIdleCallback' in window) {
    const win = window as unknown as Window & { requestIdleCallback: (cb: () => void) => void };
    win.requestIdleCallback(() => {
      pageModule();
    });
  } else {
    setTimeout(() => {
      pageModule();
    }, 2000);
  }
};

/**
 * Preload les ressources critiques (images, fonts, etc.)
 */
export const preloadCriticalResources = (): void => {
  if (typeof document === 'undefined') return;

  // Font already loaded via @import in index.css
};
