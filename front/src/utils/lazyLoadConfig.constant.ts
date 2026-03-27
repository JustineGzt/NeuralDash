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
export const prefetchPage = (pageModule: () => Promise<Record<string, unknown>>): void => {
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

  // Preload les fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = 'https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700;800&family=Share+Tech+Mono&display=swap';
  document.head.appendChild(link);
};
