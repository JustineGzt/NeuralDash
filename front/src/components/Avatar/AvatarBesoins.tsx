import { useState } from 'react';
import type { StatsInput } from '../../utils/emotionLogic';
import type { PlayerNeeds } from '../../types/needs';

interface Props {
  stats: StatsInput;
  needs: PlayerNeeds;
}

interface NeedBarProps {
  label: string;
  value: number;
  icon: string;
  subtitle?: string;
}

// Fonction pour définir la couleur de la barre selon le pourcentage
const getStatColor = (value: number) => {
  if (value < 25) return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
  if (value < 50) return 'bg-orange-500 shadow-[0_0_10px_#f97316]';
  if (value < 75) return 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
  return 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]';
};

// Fonction pour obtenir le statut textuel
const getStatusText = (value: number) => {
  if (value < 25) return 'CRITIQUE';
  if (value < 50) return 'FAIBLE';
  if (value < 75) return 'STABLE';
  return 'OPTIMAL';
};

const NeedBar = ({ label, value, icon, subtitle }: NeedBarProps) => (
  <div className="mb-3 group">
    <div className="flex justify-between items-end mb-1.5 px-1">
      <div className="flex flex-col">
        <span className="text-[10px] font-black tracking-widest text-cyan-100/60 uppercase flex items-center gap-2">
          <span className="text-cyan-400">{icon}</span> {label}
        </span>
        {subtitle && (
          <span className="text-[8px] text-cyan-300/40 ml-6 mt-0.5">{subtitle}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
          value < 25 ? 'bg-red-500/20 text-red-400' : 
          value < 50 ? 'bg-orange-500/20 text-orange-400' :
          value < 75 ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-cyan-500/20 text-cyan-300'
        }`}>
          {getStatusText(value)}
        </span>
        <span className={`text-xs font-mono font-bold ${value < 25 ? 'text-red-500' : 'text-cyan-300'}`}>
          {Math.round(value)}%
        </span>
      </div>
    </div>

    {/* Conteneur de la barre segmentée */}
    <div className="h-3 bg-black/40 border border-white/10 rounded-sm p-0.5 relative overflow-hidden">
      <div
        className={`h-full transition-all duration-1000 ease-out rounded-sm ${getStatColor(value)}`}
        style={{ width: `${value}%` }}
      />
      {/* Effet de hachures style HUD */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_80%,rgba(0,0,0,0.4)_81%,rgba(0,0,0,0.4)_100%)] bg-size-[6px_100%] pointer-events-none" />
    </div>
  </div>
);

export const AvatarBesoins = ({ stats, needs }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const globalNeedsScore = Math.round(
    (needs.hunger +
      needs.thirst +
      needs.engagement +
      needs.productivity +
      needs.energy +
      needs.focus +
      needs.mood) /
      7
  );

  return (
    <div className="bg-black/20 backdrop-blur-md border border-cyan-500/20 rounded-xl w-full max-w-sm shadow-2xl transition-all duration-300">
      {/* Header avec bouton d'expansion */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-cyan-500/5 transition-colors rounded-t-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-cyan-400 text-[11px] font-black tracking-[0.4em] uppercase border-b border-cyan-500/30 pb-2 flex-1">
            Biometric Monitor
          </h3>
          <button 
            className="ml-3 text-cyan-400 hover:text-cyan-300 transition-colors text-lg"
            aria-label={isExpanded ? "Réduire" : "Développer"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        <p className="text-[8px] text-cyan-300/40 mt-2 uppercase tracking-wider">
          {isExpanded ? 'Affichage détaillé actif' : 'Cliquez pour plus de détails'}
        </p>
        <div className="mt-2 inline-flex items-center gap-2 rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1">
          <span className="text-[8px] uppercase tracking-widest text-cyan-200/60">Niveau global</span>
          <span className="text-[10px] font-black text-cyan-200">{globalNeedsScore}%</span>
        </div>
      </div>

      {/* Stats principales (toujours visibles) */}
      <div className="px-6 pb-4">
        <div className="space-y-2">
          <NeedBar label="Faim" value={needs.hunger} icon="🍽" subtitle="Niveau de satiété" />
          <NeedBar label="Soif" value={needs.thirst} icon="💧" subtitle="Niveau d'hydratation" />
          <NeedBar label="Anti-Ennui" value={needs.engagement} icon="🎮" subtitle="Stimulation mentale" />
          <NeedBar label="Productivité" value={needs.productivity} icon="📈" subtitle="Capacité de production" />
        </div>
      </div>

      {/* Stats détaillées (visibles seulement quand expanded) */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-200 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-4 border-t border-cyan-500/20 pt-4">
          <h4 className="text-cyan-300/70 text-[9px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
            <span className="h-1 w-1 bg-cyan-400 rounded-full animate-pulse" />
            Noyau Biométrique
          </h4>
          
          <div className="space-y-2">
            <NeedBar label="Vital Signs" value={stats.health} icon="♥" subtitle="Santé physique globale" />
            <NeedBar label="Energy Cell" value={stats.energy} icon="⚡" subtitle="Réserve énergétique" />
            <NeedBar label="System Sync" value={stats.system} icon="⚙" subtitle="Synchronisation cognitive" />
          </div>
        </div>

        <div className="px-6 pb-4 border-t border-cyan-500/20 pt-4">
          <h4 className="text-cyan-300/70 text-[9px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
            <span className="h-1 w-1 bg-violet-400 rounded-full animate-pulse" />
            Besoins Primaires
          </h4>
          
          <div className="space-y-2">
            <NeedBar label="Faim" value={needs.hunger} icon="🍲" subtitle="Satiété actuelle" />
            <NeedBar label="Soif" value={needs.thirst} icon="🧴" subtitle="Hydratation actuelle" />
            <NeedBar label="Moral" value={needs.mood} icon="🙂" subtitle="Équilibre émotionnel" />
          </div>
        </div>

        <div className="px-6 pb-4 border-t border-cyan-500/20 pt-4">
          <h4 className="text-cyan-300/70 text-[9px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
            <span className="h-1 w-1 bg-pink-400 rounded-full animate-pulse" />
            Focus Mental
          </h4>
          
          <div className="space-y-2">
            <NeedBar label="Anti-Ennui" value={needs.engagement} icon="🎧" subtitle="Capacité à rester engagé" />
            <NeedBar label="Focus" value={needs.focus} icon="🎯" subtitle="Niveau de concentration" />
            <NeedBar label="Moral" value={needs.mood} icon="✨" subtitle="Stabilité émotionnelle" />
          </div>
        </div>

        <div className="px-6 pb-6 border-t border-cyan-500/20 pt-4">
          <h4 className="text-cyan-300/70 text-[9px] font-black tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
            <span className="h-1 w-1 bg-green-400 rounded-full animate-pulse" />
            Performance
          </h4>
          
          <div className="space-y-2">
            <NeedBar label="Productivité" value={needs.productivity} icon="📊" subtitle="Efficacité d'exécution" />
            <NeedBar label="Énergie" value={needs.energy} icon="🔋" subtitle="Niveau d'activité" />
            <NeedBar label="Focus" value={needs.focus} icon="🧠" subtitle="Maintien de l'attention" />
          </div>
        </div>
      </div>

      {/* Footer décoratif */}
      <div className="px-6 pb-4 pt-2 border-t border-white/5 flex justify-between items-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-cyan-500 animate-pulse" />
          <div className="w-1 h-1 bg-cyan-500/40" />
          <div className="w-1 h-1 bg-cyan-500/10" />
        </div>
        <span className="text-[8px] text-white/20 font-mono uppercase tracking-tighter">
          Hardware: v2.0.4-Stable
        </span>
      </div>
    </div>
  );
};