/**
 * Lazy page loader - Séparé pour faire travailler le Fast Refresh correctement
 */

import { lazy } from 'react';

export const lazyPages = {
  // Pages d'authentification
  Login: lazy(() => import('../pages/Login').then(m => ({ default: m.Login }))),
  Register: lazy(() => import('../pages/Register').then(m => ({ default: m.Register }))),
  ForgotPassword: lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword }))),
  
  // Pages principales
  Home: lazy(() => import('../pages/Home').then(m => ({ default: m.Home }))),
  Missions: lazy(() => import('../pages/Missions').then(m => ({ default: m.Missions }))),
  Inventaire: lazy(() => import('../pages/Inventaire').then(m => ({ default: m.Inventaire }))),
  Aventure: lazy(() => import('../pages/Aventure').then(m => ({ default: m.Aventure }))),
  Boutique: lazy(() => import('../pages/Boutique').then(m => ({ default: m.Boutique }))),
  
  // Pages légales
  PrivacyPolicy: lazy(() => import('../pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy }))),
  TermsOfService: lazy(() => import('../pages/TermsOfService').then(m => ({ default: m.TermsOfService }))),
};
