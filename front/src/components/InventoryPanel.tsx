import React from 'react';
import { useInventory } from '../hooks/useInventory';

interface Item {
  id: string;
  name: string;
  icon: string;
  count: number;
  rarity: 'common' | 'rare' | 'epic';
  desc?: string;
  type?: string;
}

interface InventoryPanelProps {
  onSelectItem?: (item: Item) => void;
  selectedItemId?: string;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onSelectItem, selectedItemId }) => {
  const { inventory } = useInventory();

  // Convertir les récompenses en items pour l'affichage
  const items: Item[] = inventory.map((reward) => ({
    id: reward.id,
    name: reward.name,
    icon: reward.icon,
    count: reward.count,
    rarity: reward.rarity,
    desc: reward.desc || '',
    type: reward.type || '',
  }));

  const totalSlots = 12; // Grille de 3x4
  const slots = Array.from({ length: totalSlots });
  const usedSlots = items.length;

  const handleItemClick = (item: Item) => {
    onSelectItem?.(item);
  };

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-5 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-cyan-200/60 font-black">
          Inventaire <span className="text-cyan-400">/ Bio-Storage</span>
        </h3>
        <span className="text-[9px] text-white/20 font-mono">Slot: {usedSlots}/{totalSlots}</span>
      </div>

      {/* Grille d'inventaire */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((_, index) => {
          const item = items[index];
          const isSelected = item?.id === selectedItemId;
          return (
            <div 
              key={index}
              onClick={() => item && handleItemClick(item)}
              className={`
                aspect-square rounded border flex items-center justify-center relative group transition-all duration-300 cursor-pointer
                ${item 
                  ? isSelected
                    ? 'border-cyan-300 bg-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    : 'border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/20 hover:border-cyan-400' 
                  : 'border-white/5 bg-white/2 hover:border-white/10'
                }
              `}
            >
              {item ? (
                <>
                  <span className={`transition-transform ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}>{item.icon}</span>
                  {/* Badge quantité */}
                  <span className="absolute bottom-1 right-1 text-[8px] font-bold text-cyan-300 bg-black/60 px-1 rounded">
                    x{item.count}
                  </span>
                  {/* Indicateur de rareté (petite barre colorée) */}
                  <div className={`absolute top-0 left-0 w-full h-px ${
                    item.rarity === 'epic' ? 'bg-purple-500' : item.rarity === 'rare' ? 'bg-blue-400' : 'bg-cyan-900'
                  }`} />
                </>
              ) : (
                <div className="w-1 h-1 bg-white/5 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Inventaire : Description rapide de l'item sélectionné */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <p className="text-[9px] text-cyan-200/40 italic leading-relaxed">
          Sélectionnez un module pour voir ses propriétés de synchronisation.
        </p>
      </div>
    </div>
  );
};