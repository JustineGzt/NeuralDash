/**
 * Lazy page loader - Séparé pour faire travailler le Fast Refresh correctement
 */

import { lazy } from 'react';

type ImportFactory = () => Promise<{ default: React.ComponentType<unknown> }>;

// Raw import factories — used for prefetching
export const lazyImportMap: Record<string, ImportFactory> = {
  Login: () => import('../pages/Login').then(m => ({ default: m.Login })),
  Register: () => import('../pages/Register').then(m => ({ default: m.Register })),
  ForgotPassword: () => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })),
  Home: () => import('../pages/Home').then(m => ({ default: m.Home })),
  Missions: () => import('../pages/Missions').then(m => ({ default: m.Missions })),
  Inventaire: () => import('../pages/Inventaire').then(m => ({ default: m.Inventaire })),
  Aventure: () => import('../pages/Aventure').then(m => ({ default: m.Aventure })),
  Boutique: () => import('../pages/Boutique').then(m => ({ default: m.Boutique })),
  PrivacyPolicy: () => import('../pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })),
  TermsOfService: () => import('../pages/TermsOfService').then(m => ({ default: m.TermsOfService })),
};

export const lazyPages = {
  Login: lazy(lazyImportMap.Login),
  Register: lazy(lazyImportMap.Register),
  ForgotPassword: lazy(lazyImportMap.ForgotPassword),
  Home: lazy(lazyImportMap.Home),
  Missions: lazy(lazyImportMap.Missions),
  Inventaire: lazy(lazyImportMap.Inventaire),
  Aventure: lazy(lazyImportMap.Aventure),
  Boutique: lazy(lazyImportMap.Boutique),
  PrivacyPolicy: lazy(lazyImportMap.PrivacyPolicy),
  TermsOfService: lazy(lazyImportMap.TermsOfService),
};

