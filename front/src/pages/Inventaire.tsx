import { useEffect, useMemo, useState } from 'react';
import { TopHeader } from '../components/TopHeader';
import { InventoryPanel } from '../components/InventoryPanel';

interface Item {
  id: string;
  name: string;
  desc?: string;
  icon: string;
  type?: string;
  rarity: 'common' | 'rare' | 'epic';
  count?: number;
}

interface Module {
  id: string;
  sourceItemId?: string;
  name: string;
  icon: string;
  stat: string;
  color: string;
  equipped: boolean;
}

const INVENTORY_KEY = 'playerInventory';
const MODULES_KEY = 'equippedModules';

export const Inventaire = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const storedModules = localStorage.getItem(MODULES_KEY);
    if (storedModules) {
      try {
        setModules(JSON.parse(storedModules));
        return;
      } catch (error) {
        console.error('Error loading modules:', error);
      }
    }

    const defaults: Module[] = [
      { id: 'm1', name: 'Neural Link v2', icon: '🧠', stat: 'Focus +12%', color: 'border-cyan-400', equipped: true },
      { id: 'm2', name: 'Sub-Dermal Plating', icon: '🛡️', stat: 'Shield +20%', color: 'border-emerald-400', equipped: true }
    ];
    setModules(defaults);
    localStorage.setItem(MODULES_KEY, JSON.stringify(defaults));
  }, []);

  const equipableTypes = useMemo(() => new Set(['module', 'armure', 'chapeau']), []);
  const isEquipable = selectedItem?.type
    ? equipableTypes.has(selectedItem.type.toLowerCase())
    : false;

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
  };

  const handleUnequipModule = (moduleId: string) => {
    setModules((prev) => {
      const target = prev.find((mod) => mod.id === moduleId);
      const next = prev.filter((mod) => mod.id !== moduleId);
      localStorage.setItem(MODULES_KEY, JSON.stringify(next));

      if (target) {
        addToInventory({
          id: target.sourceItemId ?? target.id,
          name: target.name,
          icon: target.icon,
          desc: target.stat,
          rarity: target.color.includes('purple') ? 'epic' : target.color.includes('blue') ? 'rare' : 'common',
          type: 'Module',
          count: 1,
        });
      }

      return next;
    });
  };

  const handleRecycleInventory = () => {
    if (selectedItem) {
      const nextInventory = applyInventoryChange(selectedItem.id, -1);
      if (nextInventory) {
        alert(`Module "${selectedItem.name}" recyclé avec succès!`);
        setSelectedItem(null);
      }
    }
  };

  const handleUseItem = () => {
    if (!selectedItem) return;
    const nextInventory = applyInventoryChange(selectedItem.id, -1);
    if (!nextInventory) return;

    if (selectedItem.type === 'Progression' || selectedItem.name.toLowerCase().includes('xp')) {
      applyXpGain(15);
    }

    alert(`Objet "${selectedItem.name}" utilise.`);
    setSelectedItem(null);
  };

  const handleEquipItem = () => {
    if (!selectedItem || !isEquipable) return;
    const nextInventory = applyInventoryChange(selectedItem.id, -1);
    if (!nextInventory) return;

    const module = createModuleFromItem(selectedItem);
    setModules((prev) => {
      const next = [module, ...prev];
      localStorage.setItem(MODULES_KEY, JSON.stringify(next));
      return next;
    });

    alert(`Objet "${selectedItem.name}" equipe.`);
    setSelectedItem(null);
  };

  const applyInventoryChange = (itemId: string, delta: number) => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    if (!stored) return null;
    let inventory: Item[] = [];

    try {
      inventory = JSON.parse(stored) as Item[];
    } catch (error) {
      console.error('Error parsing inventory:', error);
      return null;
    }

    const index = inventory.findIndex((item) => item.id === itemId);
    if (index === -1) return null;

    const target = inventory[index];
    const nextCount = Math.max(0, (target.count ?? 0) + delta);

    if (nextCount <= 0) {
      inventory.splice(index, 1);
    } else {
      inventory[index] = { ...target, count: nextCount };
    }

    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent('inventory:updated', { detail: { inventory } }));
    return inventory;
  };

  const addToInventory = (item: Item) => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    const inventory: Item[] = stored ? (JSON.parse(stored) as Item[]) : [];
    const index = inventory.findIndex((existing) => existing.id === item.id);

    if (index >= 0) {
      const count = (inventory[index].count ?? 0) + (item.count ?? 1);
      inventory[index] = { ...inventory[index], count };
    } else {
      inventory.push({ ...item, count: item.count ?? 1 });
    }

    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    window.dispatchEvent(new CustomEvent('inventory:updated', { detail: { inventory } }));
  };

  const createModuleFromItem = (item: Item): Module => {
    const rarityColor = item.rarity === 'epic'
      ? 'border-purple-400'
      : item.rarity === 'rare'
        ? 'border-blue-400'
        : 'border-cyan-400';

    return {
      id: `${item.id}-${Date.now()}`,
      sourceItemId: item.id,
      name: item.name,
      icon: item.icon,
      stat: item.desc || 'Module actif',
      color: rarityColor,
      equipped: true,
    };
  };

  const applyXpGain = (amount: number) => {
    if (!amount || amount <= 0) return;
    const storedXp = Number(localStorage.getItem('playerXpTotal')) || 0;
    const nextXp = storedXp + amount;
    localStorage.setItem('playerXpTotal', String(nextXp));
    window.dispatchEvent(new CustomEvent('xp:updated', { detail: { totalXp: nextXp, gain: amount } }));
  };

  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background : Grille lointaine et lueur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-size-[100px_100px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <TopHeader />

        {/* Header de Page Spécifique */}
        <div className="mt-8 mb-6 flex items-baseline gap-4">
          <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
            Neural <span className="text-cyan-400">Storage</span>
          </h1>
          <span className="text-[10px] text-cyan-500/50 tracking-[0.3em] uppercase">User_ID: Eva_Alot_01</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- COLONNE GAUCHE (4/12) : BIO-MODULES ACTIFS --- */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-cyan-500/50" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">Systèmes Connectés</h2>
            </div>
            
            <div className="space-y-3">
              {modules.filter(mod => mod.equipped).map((mod) => (
                <div key={mod.id} className={`relative group border-l-2 ${mod.color} bg-white/5 p-4 rounded-r-lg backdrop-blur-sm hover:bg-white/10 transition-all`}>
                  <div className="flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{mod.icon}</div>
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{mod.name}</p>
                        <p className="text-[9px] text-cyan-400 opacity-70 uppercase mt-1">{mod.stat}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleUnequipModule(mod.id)}
                      className="text-[9px] text-cyan-400/60 hover:text-red-400 transition-colors px-2 py-1 border border-cyan-500/20 rounded text-xs opacity-0 group-hover:opacity-100"
                    >
                      Désequip
                    </button>
                  </div>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-px bg-cyan-500/30" />
                </div>
              ))}
              
              {/* Slot Vide */}
              {modules.filter(mod => mod.equipped).length < 3 && (
                <div className="border border-dashed border-white/10 p-4 rounded-lg flex items-center justify-center opacity-30 hover:opacity-50 transition-opacity cursor-pointer">
                  <span className="text-[9px] uppercase tracking-widest">+ Installer Module</span>
                </div>
              )}
            </div>
          </div>

          {/* --- COLONNE CENTRALE (5/12) : INVENTAIRE --- */}
          <div className="lg:col-span-5">
             <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-8 bg-cyan-500/50" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">Banque de Données Physiques</h2>
            </div>
            <InventoryPanel onSelectItem={handleSelectItem} selectedItemId={selectedItem?.id} />
          </div>

          {/* --- COLONNE DROITE (3/12) : ANALYSEUR --- */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-cyan-500/20 bg-black/60 p-5 backdrop-blur-md relative overflow-hidden group">
              {/* Header Analyseur */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Scanner</span>
                <span className="text-[9px] font-mono text-cyan-400/40 animate-pulse font-bold">LIVE_SCAN</span>
              </div>

              {/* Zone Visuelle de l'Analyseur */}
              <div className="relative aspect-square border border-cyan-500/20 bg-cyan-950/20 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                {/* Effet de radar qui tourne */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(34,211,238,0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-2 border border-cyan-500/10 rounded-full" />
                <div className="absolute inset-8 border border-cyan-500/10 rounded-full" />
                <div className="absolute top-1/2 left-1/2 w-[150%] h-px bg-cyan-400/20 origin-left animate-[spin_4s_linear_infinite]" />
                
                {/* Icône de l'objet ou point d'interrogation */}
                {selectedItem ? (
                  <span className="text-5xl drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] z-10">{selectedItem.icon}</span>
                ) : (
                  <span className="text-3xl text-cyan-500/20 font-black">?</span>
                )}

                {/* Scanline horizontale */}
                <div className="absolute inset-0 w-full h-1/2 bg-cyan-400/5 border-b border-cyan-400/20 animate-scan-slow pointer-events-none" />
              </div>

              {/* Infos de l'objet sélectionné */}
              {selectedItem ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-xs font-bold text-white uppercase tracking-wide">{selectedItem.name}</p>
                  <div className="flex gap-2">
                    {selectedItem.type && (
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-bold">{selectedItem.type}</span>
                    )}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      selectedItem.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>{selectedItem.rarity}</span>
                  </div>
                  {selectedItem.desc && (
                    <p className="text-[10px] text-cyan-100/60 leading-relaxed mt-2 border-t border-white/5 pt-2">
                      {selectedItem.desc}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-cyan-100/30 text-center italic">
                  Sélectionnez un module pour extraction de données...
                </p>
              )}
            </div>

            {/* Boutons d'action rapides */}
            <button 
              onClick={handleRecycleInventory}
              disabled={!selectedItem}
              className={`w-full py-3 rounded text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                selectedItem 
                  ? 'bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 cursor-pointer' 
                  : 'bg-cyan-500/5 border border-cyan-500/10 text-cyan-300/50 cursor-not-allowed'
              }`}
            >
              <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
              Recycler Inventaire
            </button>

            <button 
              onClick={handleUseItem}
              disabled={!selectedItem}
              className={`w-full py-3 rounded text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                selectedItem 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer' 
                  : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-300/50 cursor-not-allowed'
              }`}
            >
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
              Utiliser Objet
            </button>

            <button 
              onClick={handleEquipItem}
              disabled={!selectedItem || !isEquipable}
              className={`w-full py-3 rounded text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                selectedItem && isEquipable
                  ? 'bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 cursor-pointer' 
                  : 'bg-purple-500/5 border border-purple-500/10 text-purple-300/50 cursor-not-allowed'
              }`}
            >
              <span className="w-1 h-1 bg-purple-400 rounded-full animate-ping" />
              Equiper Objet
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};