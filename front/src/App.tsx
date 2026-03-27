import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PageNav } from './components/PageNav';
import { CookieConsent } from './components/CookieConsent';
import { LegalFooter } from './components/LegalFooter';
import { useVisualTheme } from './hooks/useVisualTheme';
import { lazyPages, lazyImportMap } from './utils/pageLazyLoader';
import { withSuspense } from './utils/withSuspenseFn';
import { prefetchPage, PREFETCH_STRATEGY } from './utils/lazyLoadConfig.constant';
import { SpeedInsights } from "@vercel/speed-insights/react";

const Home = withSuspense(lazyPages.Home);
const Missions = withSuspense(lazyPages.Missions);
const Inventaire = withSuspense(lazyPages.Inventaire);
const Aventure = withSuspense(lazyPages.Aventure);
const Boutique = withSuspense(lazyPages.Boutique);
const Login = withSuspense(lazyPages.Login);
const Register = withSuspense(lazyPages.Register);
const ForgotPassword = withSuspense(lazyPages.ForgotPassword);
const PrivacyPolicy = withSuspense(lazyPages.PrivacyPolicy);
const TermsOfService = withSuspense(lazyPages.TermsOfService);

export default function App() {
  const { activeThemeId } = useVisualTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-ui-theme', activeThemeId);
  }, [activeThemeId]);

  // Prefetch des pages selon la stratégie
  useEffect(() => {
    // Charger immédiatement les pages critiques
    PREFETCH_STRATEGY.immediate.forEach(page => {
      const importFn = lazyImportMap[page];
      if (importFn) prefetchPage(importFn);
    });

    // Charger avec un petit délai
    const soon = setTimeout(() => {
      PREFETCH_STRATEGY.soon.forEach(page => {
        const importFn = lazyImportMap[page];
        if (importFn) prefetchPage(importFn);
      });
    }, 1000);

    // Charger les pages moins critiques après 5s
    const eventually = setTimeout(() => {
      PREFETCH_STRATEGY.eventually.forEach(page => {
        const importFn = lazyImportMap[page];
        if (importFn) prefetchPage(importFn);
      });
    }, 5000);

    return () => {
      clearTimeout(soon);
      clearTimeout(eventually);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/aventure" element={<Aventure />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/inventaire" element={<Inventaire />} />
          </Routes>
          <PageNav />
        </div>
        <LegalFooter />
        <CookieConsent />
        <SpeedInsights />
      </div>
    </BrowserRouter>
  );
}