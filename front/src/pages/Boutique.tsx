import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TopHeader } from '../components/TopHeader';
import { useInventory } from '../hooks/useInventory';
import { useWallet } from '../hooks/useWallet';
import { usePremiumWallet } from '../hooks/usePremiumWallet';
import { useAuth } from '../hooks/useAuth';
import { useVisualTheme } from '../hooks/useVisualTheme';
import type { UiThemeId } from '../hooks/useVisualTheme';
import { getCheckoutSessionStatus, getPaymentPackages, redirectToStripeCheckout } from '../lib/payments';
import type { JourneyProfile, PaymentPackage } from '../lib/payments';
import { getScopedStorageItem, setScopedStorageItem } from '../utils/userStorage';
import type { Reward } from '../types/quest';

type ShopItem = Reward & { price: number };
type SellableItem = Reward & { sellPrice: number };
type PremiumShopItem = Reward & { crystalPrice: number };

const FALLBACK_CRYSTAL_PACKAGES: PaymentPackage[] = [
  {
    id: 'pkg-starter',
    label: 'Starter',
    amount: 100,
    bonus: 0,
    totalCrystals: 100,
    unitAmountCents: 99,
    price: '0.99 €',
    popular: false,
  },
  {
    id: 'pkg-explorer',
    label: 'Explorateur',
    amount: 500,
    bonus: 50,
    totalCrystals: 550,
    unitAmountCents: 399,
    price: '3.99 €',
    popular: true,
  },
  {
    id: 'pkg-commander',
    label: 'Commandant',
    amount: 1200,
    bonus: 200,
    totalCrystals: 1400,
    unitAmountCents: 799,
    price: '7.99 €',
    popular: false,
  },
  {
    id: 'pkg-elite',
    label: 'Elite',
    amount: 2800,
    bonus: 700,
    totalCrystals: 3500,
    unitAmountCents: 1499,
    price: '14.99 €',
    popular: false,
  },
];

const CLAIMED_PAYMENT_SESSIONS_KEY = 'claimedPaymentSessions';

const PREMIUM_ITEMS: PremiumShopItem[] = [
  {
    id: 'premium-suit-01',
    name: 'Combinaison Phantome',
    icon: '🥷',
    type: 'Armure',
    rarity: 'epic',
    count: 1,
    desc: 'Furtivite +40% | Vitesse +20%',
    crystalPrice: 250,
  },
  {
    id: 'premium-ship-01',
    name: 'Vaisseau Nebula Prime',
    icon: '🌌',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Toutes stats +30%',
    crystalPrice: 600,
  },
  {
    id: 'premium-blade-01',
    name: 'Lame Solaire',
    icon: '⚔️',
    type: 'Arme',
    rarity: 'epic',
    count: 1,
    desc: 'Attaque +50% | Energie +25%',
    crystalPrice: 400,
  },
  {
    id: 'premium-orb-01',
    name: 'Orbe Omega',
    icon: '🔮',
    type: 'Artefact',
    rarity: 'epic',
    count: 1,
    desc: 'XP +15% sur toutes les missions',
    crystalPrice: 350,
  },
  {
    id: 'premium-wings-01',
    name: 'Ailes Stellaires',
    icon: '🪽',
    type: 'Equipement',
    rarity: 'epic',
    count: 1,
    desc: 'Deplacement +60%',
    crystalPrice: 300,
  },
  {
    id: 'premium-core-01',
    name: 'Noyau Quantique',
    icon: '⚛️',
    type: 'Module',
    rarity: 'epic',
    count: 1,
    desc: 'Calcul +45% | Sync +30%',
    crystalPrice: 500,
  },
];

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'ship-legend-01',
    name: 'Vaisseau Legendaire Helios',
    icon: '🚀',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Attaque +25% | Bouclier +15%',
    price: 420,
  },
  {
    id: 'ship-legend-02',
    name: 'Vaisseau Legendaire Nyx',
    icon: '🛸',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Vitesse +30% | Scan +20%',
    price: 380,
  },
  {
    id: 'ship-legend-03',
    name: 'Vaisseau Legendaire Axiom',
    icon: '🛰️',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Precision +22% | Defense +18%',
    price: 460,
  },
  {
    id: 'shop-armor-01',
    name: 'Armure Aegis',
    icon: '🛡️',
    type: 'Armure',
    rarity: 'epic',
    count: 1,
    desc: 'Defense +18%',
    price: 180,
  },
  {
    id: 'shop-hat-01',
    name: 'Casque Polaris',
    icon: '🪖',
    type: 'Chapeau',
    rarity: 'rare',
    count: 1,
    desc: 'Focus +12%',
    price: 95,
  },
  {
    id: 'shop-drone-01',
    name: 'Drone Echo',
    icon: '🛰️',
    type: 'Support',
    rarity: 'rare',
    count: 1,
    desc: 'Scan +15%',
    price: 110,
  },
  {
    id: 'shop-probe-01',
    name: 'Sonde Spectre',
    icon: '📡',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Analyse +6%',
    price: 40,
  },
  {
    id: 'shop-prism-01',
    name: 'Prisme Dore',
    icon: '🔶',
    type: 'Artefact',
    rarity: 'rare',
    count: 1,
    desc: 'Signal +10%',
    price: 120,
  },
  {
    id: 'shop-beacon-01',
    name: 'Balise Quantum',
    icon: '📍',
    type: 'Outil',
    rarity: 'common',
    count: 2,
    desc: 'Repere +8%',
    price: 35,
  },
  {
    id: 'shop-kit-01',
    name: 'Kit Diagnostic',
    icon: '🧪',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Diagnostic +6%',
    price: 45,
  },
  {
    id: 'shop-filter-01',
    name: 'Filtre Alpha',
    icon: '🧫',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Stabilisation +4%',
    price: 30,
  },
  {
    id: 'shop-glove-01',
    name: 'Gant Neuron',
    icon: '🧤',
    type: 'Equipement',
    rarity: 'common',
    count: 1,
    desc: 'Precision +5%',
    price: 28,
  },
  {
    id: 'shop-crystal-01',
    name: 'Cristal Memoire',
    icon: '💎',
    type: 'Artefact',
    rarity: 'rare',
    count: 1,
    desc: 'Compression +12%',
    price: 130,
  },
  {
    id: 'shop-key-01',
    name: 'Cle Crypt',
    icon: '🔑',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Acces securise',
    price: 38,
  },
  {
    id: 'shop-core-01',
    name: 'Noyau Relais',
    icon: '💠',
    type: 'Module',
    rarity: 'epic',
    count: 1,
    desc: 'Transmission +20%',
    price: 210,
  },
];

const getRarityColor = (rarity: Reward['rarity']) => {
  switch (rarity) {
    case 'epic':
      return 'border-purple-400/40 text-purple-200';
    case 'rare':
      return 'border-blue-400/40 text-blue-200';
    default:
      return 'border-amber-300/30 text-amber-200';
  }
};

const getDefaultPrice = (rarity: Reward['rarity']) => {
  switch (rarity) {
    case 'epic':
      return 160;
    case 'rare':
      return 80;
    default:
      return 30;
  }
};

export const Boutique = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { inventory, addItem, removeItem } = useInventory();
  const { credits, addCredits, spendCredits } = useWallet();
  const { crystals, addCrystals, spendCrystals } = usePremiumWallet();
  const { availableThemes, ownedThemeIds, activeThemeId, setActiveTheme, unlockAndActivateTheme } = useVisualTheme();

  const activeTheme = useMemo(
    () => availableThemes.find((theme) => theme.id === activeThemeId) ?? null,
    [activeThemeId, availableThemes]
  );

  const [message, setMessage] = useState<string | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payStep, setPayStep] = useState<'select' | 'confirm' | 'processing' | 'done'>('select');
  const [selectedPkg, setSelectedPkg] = useState<PaymentPackage | null>(null);
  const [paymentPackages, setPaymentPackages] = useState<PaymentPackage[]>(FALLBACK_CRYSTAL_PACKAGES);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [journeyProfile, setJourneyProfile] = useState<JourneyProfile>('explorer');
  const [creditedCrystals, setCreditedCrystals] = useState(0);

  const hasSessionBeenClaimed = useCallback((sessionId: string) => {
    try {
      const raw = getScopedStorageItem(CLAIMED_PAYMENT_SESSIONS_KEY, user?.uid);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) && parsed.includes(sessionId);
    } catch {
      return false;
    }
  }, [user?.uid]);

  const markSessionAsClaimed = useCallback((sessionId: string) => {
    try {
      const raw = getScopedStorageItem(CLAIMED_PAYMENT_SESSIONS_KEY, user?.uid);
      const parsed = raw ? JSON.parse(raw) : [];
      const sessions = Array.isArray(parsed) ? parsed.map((entry) => String(entry)) : [];
      if (!sessions.includes(sessionId)) {
        sessions.push(sessionId);
      }
      setScopedStorageItem(CLAIMED_PAYMENT_SESSIONS_KEY, JSON.stringify(sessions.slice(-25)), user?.uid);
    } catch {
      setScopedStorageItem(CLAIMED_PAYMENT_SESSIONS_KEY, JSON.stringify([sessionId]), user?.uid);
    }
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    const loadPackages = async () => {
      try {
        const serverPackages = await getPaymentPackages();
        if (!cancelled && serverPackages.length > 0) {
          setPaymentPackages(serverPackages);
        }
      } catch {
        if (!cancelled) {
          setPaymentPackages(FALLBACK_CRYSTAL_PACKAGES);
        }
      }
    };

    void loadPackages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const paymentState = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentState === 'cancelled') {
      setCheckoutError('Paiement annule. Aucun debit n\'a ete effectue.');
      setShowPayModal(false);
      setSearchParams((params) => {
        params.delete('payment');
        params.delete('session_id');
        return params;
      }, { replace: true });
      return;
    }

    if (paymentState !== 'success' || !sessionId) {
      return;
    }

    let cancelled = false;

    const claimPayment = async () => {
      if (hasSessionBeenClaimed(sessionId)) {
        if (!cancelled) {
          setMessage('Paiement deja synchronise sur cet appareil.');
          setPayStep('done');
        }
        return;
      }

      setPayStep('processing');
      setShowPayModal(true);
      setCheckoutError(null);

      try {
        const status = await getCheckoutSessionStatus(sessionId);
        if (status.paymentStatus !== 'paid') {
          throw new Error('La transaction Stripe est en attente de confirmation.');
        }

        if (!cancelled) {
          const crystalsToAdd = Math.max(0, Number(status.crystalsTotal) || 0);
          if (crystalsToAdd > 0) {
            addCrystals(crystalsToAdd);
          }
          markSessionAsClaimed(sessionId);
          setCreditedCrystals(crystalsToAdd);
          setPayStep('done');
          setMessage(`Paiement valide: ${crystalsToAdd} cristaux credites.`);
          setTimeout(() => setMessage(null), 2600);
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage = error instanceof Error ? error.message : 'Verification de paiement impossible.';
          setCheckoutError(errorMessage);
          setPayStep('confirm');
        }
      } finally {
        if (!cancelled) {
          setSearchParams((params) => {
            params.delete('payment');
            params.delete('session_id');
            return params;
          }, { replace: true });
        }
      }
    };

    void claimPayment();

    return () => {
      cancelled = true;
    };
  }, [addCrystals, hasSessionBeenClaimed, markSessionAsClaimed, searchParams, setSearchParams]);

  const sellableItems = useMemo<SellableItem[]>(() => {
    return inventory.map((item) => {
      const shopItem = SHOP_ITEMS.find((entry) => entry.id === item.id);
      const basePrice = shopItem ? shopItem.price : getDefaultPrice(item.rarity);
      return { ...item, sellPrice: Math.max(1, Math.floor(basePrice * 0.6)) };
    });
  }, [inventory]);

  const handleBuy = (item: ShopItem) => {
    const ok = spendCredits(item.price);
    if (!ok) {
      setMessage('Credits insuffisants.');
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    addItem(item, 1);
    setMessage(`Objet achete: ${item.name}`);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSell = (item: SellableItem) => {
    const ok = removeItem(item.id, 1);
    if (!ok) {
      setMessage("Objet introuvable dans l'inventaire.");
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    addCredits(item.sellPrice);
    setMessage(`Objet vendu: ${item.name}`);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleBuyPremium = (item: PremiumShopItem) => {
    const ok = spendCrystals(item.crystalPrice);
    if (!ok) {
      setMessage('Cristaux insuffisants. Rechargez votre compte.');
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    addItem(item, 1);
    setMessage(`Objet premium obtenu: ${item.name}`);
    setTimeout(() => setMessage(null), 2500);
  };

  const openPayModal = () => {
    setSelectedPkg(null);
    setPayStep('select');
    setCheckoutError(null);
    setShowPayModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedPkg) return;
    setPayStep('confirm');
  };

  const finalizePurchase = async () => {
    if (!selectedPkg) return;

    setCheckoutError(null);
    setPayStep('processing');

    try {
      await redirectToStripeCheckout(selectedPkg.id, {
        userId: user?.uid,
        email: user?.email ?? undefined,
        locale: navigator.language,
        themeId: activeThemeId,
        journeyProfile,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Redirection vers Stripe impossible.';
      setCheckoutError(errorMessage);
      setPayStep('confirm');
    }
  };

  const handleBuyTheme = (themeId: UiThemeId, themeName: string, price: number) => {
    if (ownedThemeIds.includes(themeId)) {
      setActiveTheme(themeId);
      setMessage(`Theme active: ${themeName}`);
      setTimeout(() => setMessage(null), 2200);
      return;
    }

    const ok = spendCrystals(price);
    if (!ok) {
      setMessage('Cristaux insuffisants pour ce theme.');
      setTimeout(() => setMessage(null), 2600);
      return;
    }

    // Atomic unlock + activate (avoids stale-state issue with separate calls)
    unlockAndActivateTheme(themeId);
    setMessage(`Theme debloque: ${themeName}`);
    setTimeout(() => setMessage(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-amber-100 px-4 py-10">
      <div className="relative max-w-6xl mx-auto">
        <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_65%)]" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(94,234,212,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(253,230,138,0.2) 1px, transparent 1px)',
            backgroundSize: '90px 90px',
          }}
        />

        <div className="relative z-10 border border-emerald-300/30 rounded-[28px] bg-[#0f141c]/80 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_45px_rgba(6,78,59,0.6)]">
          <TopHeader />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-100/90">Boutique & Marche Noir</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-black uppercase text-emerald-100">Terminal d'Achat</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-emerald-300/30 bg-black/40 px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-100/90">Credits</p>
                <p className="text-xl font-semibold text-emerald-200">{credits} cr</p>
              </div>
              <div className="rounded-2xl border border-violet-400/40 bg-black/40 px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.3em] text-violet-200/95">Cristaux</p>
                <p className="text-xl font-semibold text-violet-300">💠 {crystals}</p>
              </div>
              <button
                onClick={openPayModal}
                className="rounded-2xl border border-violet-400/50 bg-violet-500/15 px-4 py-3 hover:bg-violet-500/25 transition-colors"
              >
                <p className="text-[9px] uppercase tracking-[0.3em] text-violet-200/95">Recharger</p>
                <p className="text-sm font-semibold text-violet-200">+ Cristaux</p>
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          <section className="mt-8 rounded-2xl border border-violet-400/30 bg-[#0a0a14]/70 p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-violet-200/95">Boutique Premium</p>
                <p className="mt-1 text-[9px] text-violet-100/90">Items exclusifs - achat avec cristaux uniquement</p>
              </div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-violet-300 border border-violet-400/30 rounded-full px-2 py-1">
                {PREMIUM_ITEMS.length} items
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {PREMIUM_ITEMS.map((item) => (
                <div key={item.id} className="rounded-xl border border-violet-400/25 bg-black/50 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-violet-500 to-transparent" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl">{item.icon}</p>
                      <p className="mt-1 text-sm font-semibold text-violet-100">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-violet-100/90">{item.type}</p>
                    </div>
                    <span className="text-[8px] uppercase tracking-[0.3em] rounded-full border border-violet-400/40 text-violet-200 px-2 py-1 shrink-0">
                      premium
                    </span>
                  </div>
                  <p className="mt-2 text-[10px] text-violet-100/85">{item.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-violet-300">💠 {item.crystalPrice}</span>
                    <button
                      onClick={() => handleBuyPremium(item)}
                      disabled={crystals < item.crystalPrice}
                      className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-violet-100 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Acheter
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-violet-400/20 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-violet-200/95">Themes visuels alternatifs</p>
                  <p className="mt-1 text-[9px] text-violet-100/90">Dark blood red, gold, neon green - achetables en cristaux.</p>
                </div>
                <div className="rounded-xl border border-violet-400/35 bg-violet-500/10 px-3 py-2">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-violet-200/95">Theme actif</p>
                  <p className="text-xs font-semibold text-violet-100">{activeTheme?.name ?? 'Par defaut'}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableThemes.map((theme) => {
                  const isOwned = ownedThemeIds.includes(theme.id);
                  const isActive = activeThemeId === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`rounded-xl border bg-black/45 p-4 transition-all ${
                        isActive
                          ? 'border-violet-300 shadow-[0_0_20px_rgba(167,139,250,0.35)]'
                          : 'border-violet-400/20'
                      }`}
                    >
                      <div className={`h-12 rounded-md bg-linear-to-r ${theme.accent}`} />
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-violet-100">{theme.name}</p>
                        {isActive ? (
                          <span className="rounded-full border border-emerald-400/60 bg-emerald-500/15 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-emerald-300">Actif</span>
                        ) : isOwned ? (
                          <span className="rounded-full border border-cyan-400/50 bg-cyan-500/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-cyan-300">Possede</span>
                        ) : (
                          <span className="rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] text-amber-300">Verrouille</span>
                        )}
                      </div>
                      <p className="mt-1 text-[10px] text-violet-100/85">{theme.description}</p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-violet-200">💠 {theme.price}</span>
                        <button
                          onClick={() => handleBuyTheme(theme.id, theme.name, theme.price)}
                          disabled={isActive || (!isOwned && crystals < theme.price)}
                          className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-violet-100 hover:bg-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isActive ? 'Actif' : isOwned ? 'Mettre actif' : 'Acheter'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <section className="rounded-2xl border border-emerald-300/25 bg-black/50 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-100/90">Stock boutique</p>
                <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-300">{SHOP_ITEMS.length} items</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {SHOP_ITEMS.map((item) => (
                  <div key={item.id} className="rounded-xl border border-emerald-300/20 bg-black/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg">{item.icon}</p>
                        <p className="text-sm font-semibold text-emerald-100">{item.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-emerald-100/90">{item.type}</p>
                      </div>
                      <span className={`text-[9px] uppercase tracking-[0.3em] rounded-full border px-2 py-1 ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-emerald-100/85">{item.desc}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-emerald-200">{item.price} cr</span>
                      <button
                        onClick={() => handleBuy(item)}
                        className="rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-emerald-100 hover:bg-emerald-500/20"
                      >
                        Acheter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-300/25 bg-black/50 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100/90">Vente rapide</p>
                <span className="text-[9px] uppercase tracking-[0.3em] text-amber-300">{sellableItems.length} objets</span>
              </div>

              {sellableItems.length === 0 ? (
                <p className="mt-4 text-sm text-amber-100/85">Aucun objet a vendre.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sellableItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-amber-300/20 bg-black/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg">{item.icon}</p>
                          <p className="text-sm font-semibold text-amber-100">{item.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-amber-100/90">
                            x{item.count} - {item.type}
                          </p>
                        </div>
                        <span className={`text-[9px] uppercase tracking-[0.3em] rounded-full border px-2 py-1 ${getRarityColor(item.rarity)}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm text-amber-200">+{item.sellPrice} cr</span>
                        <button
                          onClick={() => handleSell(item)}
                          className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-amber-100 hover:bg-amber-500/20"
                        >
                          Vendre
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-[20px] border border-violet-400/40 bg-[#0d0d1a] p-6 shadow-[0_0_60px_rgba(139,92,246,0.4)]">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-violet-500 to-transparent rounded-t-[20px]" />

            <button
              onClick={() => {
                if (payStep === 'processing') return;
                setShowPayModal(false);
              }}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 text-lg leading-none"
            >
              x
            </button>

            {checkoutError && (
              <div className="mt-6 rounded-lg border border-rose-400/40 bg-rose-500/15 p-3 text-xs text-rose-100">
                {checkoutError}
              </div>
            )}

            {payStep === 'select' && (
              <>
                <p className="text-[10px] uppercase tracking-[0.4em] text-violet-300/70">Recharge de cristaux</p>
                <h2 className="mt-2 text-xl font-black text-violet-100">Choisissez un package</h2>
                <p className="mt-1 text-[10px] text-violet-200/50">Paiement securise Stripe + credits instantanes apres confirmation.</p>

                <div className="mt-4 rounded-xl border border-violet-400/25 bg-black/45 p-3">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-violet-300/70">Profil de parcours</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setJourneyProfile('explorer')}
                      className={`rounded-lg border px-2 py-2 text-[9px] uppercase tracking-[0.2em] transition-colors ${
                        journeyProfile === 'explorer'
                          ? 'border-cyan-300/70 bg-cyan-500/20 text-cyan-100'
                          : 'border-cyan-400/25 bg-cyan-500/5 text-cyan-200/80 hover:bg-cyan-500/10'
                      }`}
                    >
                      Explorateur
                    </button>
                    <button
                      onClick={() => setJourneyProfile('competitor')}
                      className={`rounded-lg border px-2 py-2 text-[9px] uppercase tracking-[0.2em] transition-colors ${
                        journeyProfile === 'competitor'
                          ? 'border-amber-300/70 bg-amber-500/20 text-amber-100'
                          : 'border-amber-400/25 bg-amber-500/5 text-amber-200/80 hover:bg-amber-500/10'
                      }`}
                    >
                      Competiteur
                    </button>
                    <button
                      onClick={() => setJourneyProfile('collector')}
                      className={`rounded-lg border px-2 py-2 text-[9px] uppercase tracking-[0.2em] transition-colors ${
                        journeyProfile === 'collector'
                          ? 'border-emerald-300/70 bg-emerald-500/20 text-emerald-100'
                          : 'border-emerald-400/25 bg-emerald-500/5 text-emerald-200/80 hover:bg-emerald-500/10'
                      }`}
                    >
                      Collectionneur
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {paymentPackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`relative rounded-xl border p-4 text-left transition-all ${
                        selectedPkg?.id === pkg.id
                          ? 'border-violet-400 bg-violet-500/20'
                          : 'border-violet-400/20 bg-black/40 hover:border-violet-400/50'
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-4 rounded-full bg-violet-500 px-2 py-0.5 text-[8px] uppercase tracking-[0.3em] text-white">
                          Populaire
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-violet-100">{pkg.label}</p>
                          <p className="text-[10px] text-violet-300">
                            💠 {pkg.amount} cristaux
                            {pkg.bonus > 0 && <span className="ml-1 text-emerald-400">+ {pkg.bonus} bonus</span>}
                          </p>
                        </div>
                        <p className="text-lg font-black text-violet-200">{pkg.price}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={confirmPurchase}
                  disabled={!selectedPkg}
                  className="mt-5 w-full rounded-xl border border-violet-400/50 bg-violet-500/20 py-3 text-sm font-semibold text-violet-100 hover:bg-violet-500/35 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continuer
                </button>
              </>
            )}

            {payStep === 'confirm' && selectedPkg && (
              <>
                <p className="text-[10px] uppercase tracking-[0.4em] text-violet-300/70">Confirmation</p>
                <h2 className="mt-2 text-xl font-black text-violet-100">Recapitulatif Stripe</h2>

                <div className="mt-5 rounded-xl border border-violet-400/25 bg-black/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-200/70">Package</span>
                    <span className="text-violet-100 font-semibold">{selectedPkg.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-200/70">Cristaux obtenus</span>
                    <span className="text-emerald-300 font-semibold">💠 {selectedPkg.totalCrystals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-violet-200/70">Parcours utilisateur</span>
                    <span className="text-violet-100 font-semibold capitalize">{journeyProfile}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-violet-400/20 pt-2 mt-2">
                    <span className="text-violet-200/70">Total</span>
                    <span className="text-violet-100 font-black text-base">{selectedPkg.price}</span>
                  </div>
                </div>

                <p className="mt-3 text-[9px] text-violet-200/40 text-center">
                  Vous serez redirige vers Stripe Checkout pour terminer le paiement en HTTPS.
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setPayStep('select')}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm text-white/60 hover:bg-white/10 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={finalizePurchase}
                    className="flex-1 rounded-xl border border-violet-400/50 bg-violet-500/25 py-3 text-sm font-semibold text-violet-100 hover:bg-violet-500/40 transition-colors"
                  >
                    Payer avec Stripe
                  </button>
                </div>
              </>
            )}

            {payStep === 'processing' && (
              <div className="flex flex-col items-center py-10 gap-3">
                <p className="text-4xl text-violet-200">...</p>
                <p className="text-base font-semibold text-violet-100">Preparation du checkout securise...</p>
                <p className="text-[10px] text-violet-200/60">Transmission du panier a Stripe</p>
              </div>
            )}

            {payStep === 'done' && (
              <div className="flex flex-col items-center py-6 gap-4">
                <p className="text-5xl">OK</p>
                <p className="text-xl font-black text-violet-100">Paiement accepte</p>
                <p className="text-sm text-violet-200/70">
                  💠 {creditedCrystals} cristaux ajoutes a votre compte.
                </p>
                <button
                  onClick={() => {
                    setShowPayModal(false);
                    setPayStep('select');
                    setSelectedPkg(null);
                    setCheckoutError(null);
                  }}
                  className="rounded-xl border border-violet-400/50 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100 hover:bg-violet-500/35"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
