import { useMemo, useState } from 'react';
import { TopHeader } from '../components/TopHeader';
import { useInventory } from '../hooks/useInventory';
import { useWallet } from '../hooks/useWallet';
import type { Reward } from '../types/quest';

type ShopItem = Reward & { price: number };

type SellableItem = Reward & { sellPrice: number };

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'ship-legend-01',
    name: 'Vaisseau Legendaire Helios',
    icon: '🚀',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Attaque +25% | Bouclier +15%',
    price: 420
  },
  {
    id: 'ship-legend-02',
    name: 'Vaisseau Legendaire Nyx',
    icon: '🛸',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Vitesse +30% | Scan +20%',
    price: 380
  },
  {
    id: 'ship-legend-03',
    name: 'Vaisseau Legendaire Axiom',
    icon: '🛰️',
    type: 'Vaisseau',
    rarity: 'epic',
    count: 1,
    desc: 'Precision +22% | Defense +18%',
    price: 460
  },
  {
    id: 'shop-armor-01',
    name: 'Armure Aegis',
    icon: '🛡️',
    type: 'Armure',
    rarity: 'epic',
    count: 1,
    desc: 'Defense +18%',
    price: 180
  },
  {
    id: 'shop-hat-01',
    name: 'Casque Polaris',
    icon: '🪖',
    type: 'Chapeau',
    rarity: 'rare',
    count: 1,
    desc: 'Focus +12%',
    price: 95
  },
  {
    id: 'shop-drone-01',
    name: 'Drone Echo',
    icon: '🛰️',
    type: 'Support',
    rarity: 'rare',
    count: 1,
    desc: 'Scan +15%',
    price: 110
  },
  {
    id: 'shop-probe-01',
    name: 'Sonde Spectre',
    icon: '📡',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Analyse +6%',
    price: 40
  },
  {
    id: 'shop-prism-01',
    name: 'Prisme Dore',
    icon: '🔶',
    type: 'Artefact',
    rarity: 'rare',
    count: 1,
    desc: 'Signal +10%',
    price: 120
  },
  {
    id: 'shop-beacon-01',
    name: 'Balise Quantum',
    icon: '📍',
    type: 'Outil',
    rarity: 'common',
    count: 2,
    desc: 'Repere +8%',
    price: 35
  },
  {
    id: 'shop-kit-01',
    name: 'Kit Diagnostic',
    icon: '🧪',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Diagnostic +6%',
    price: 45
  },
  {
    id: 'shop-filter-01',
    name: 'Filtre Alpha',
    icon: '🧫',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Stabilisation +4%',
    price: 30
  },
  {
    id: 'shop-glove-01',
    name: 'Gant Neuron',
    icon: '🧤',
    type: 'Equipement',
    rarity: 'common',
    count: 1,
    desc: 'Precision +5%',
    price: 28
  },
  {
    id: 'shop-crystal-01',
    name: 'Cristal Memoire',
    icon: '💎',
    type: 'Artefact',
    rarity: 'rare',
    count: 1,
    desc: 'Compression +12%',
    price: 130
  },
  {
    id: 'shop-key-01',
    name: 'Cle Crypt',
    icon: '🔑',
    type: 'Outil',
    rarity: 'common',
    count: 1,
    desc: 'Acces securise',
    price: 38
  },
  {
    id: 'shop-core-01',
    name: 'Noyau Relais',
    icon: '💠',
    type: 'Module',
    rarity: 'epic',
    count: 1,
    desc: 'Transmission +20%',
    price: 210
  }
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
  const { inventory, addItem, removeItem } = useInventory();
  const { credits, addCredits, spendCredits } = useWallet();
  const [message, setMessage] = useState<string | null>(null);

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
      setMessage('Objet introuvable dans l\'inventaire.');
      setTimeout(() => setMessage(null), 2000);
      return;
    }
    addCredits(item.sellPrice);
    setMessage(`Objet vendu: ${item.name}`);
    setTimeout(() => setMessage(null), 2000);
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
            backgroundSize: '90px 90px'
          }}
        />

        <div className="relative z-10 border border-emerald-300/30 rounded-[28px] bg-[#0f141c]/80 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_45px_rgba(6,78,59,0.6)]">
          <TopHeader />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-200/60">Boutique & Marche Noir</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-black uppercase text-emerald-100">Terminal d'Achat</h1>
            </div>
            <div className="rounded-2xl border border-emerald-300/30 bg-black/40 px-4 py-3">
              <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-200/60">Credits disponibles</p>
              <p className="text-xl font-semibold text-emerald-200">{credits}</p>
            </div>
          </div>

          {message && (
            <div className="mt-5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <section className="rounded-2xl border border-emerald-300/25 bg-black/50 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-200/60">Stock boutique</p>
                <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-300">{SHOP_ITEMS.length} items</span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {SHOP_ITEMS.map((item) => (
                  <div key={item.id} className="rounded-xl border border-emerald-300/20 bg-black/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg">{item.icon}</p>
                        <p className="text-sm font-semibold text-emerald-100">{item.name}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-emerald-200/60">{item.type}</p>
                      </div>
                      <span className={`text-[9px] uppercase tracking-[0.3em] rounded-full border px-2 py-1 ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] text-emerald-200/60">{item.desc}</p>
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
                <p className="text-[10px] uppercase tracking-[0.4em] text-amber-200/60">Vente rapide</p>
                <span className="text-[9px] uppercase tracking-[0.3em] text-amber-300">{sellableItems.length} objets</span>
              </div>

              {sellableItems.length === 0 ? (
                <p className="mt-4 text-sm text-amber-200/60">Aucun objet a vendre.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {sellableItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-amber-300/20 bg-black/50 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-lg">{item.icon}</p>
                          <p className="text-sm font-semibold text-amber-100">{item.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-amber-200/60">
                            x{item.count} • {item.type}
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
    </div>
  );
};
