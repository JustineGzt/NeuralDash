import type { StatsInput } from '../../utils/emotionLogic';

interface Props {
  stats: StatsInput;
}

interface NeedBarProps {
  label: string;
  value: number;
  icon: string;
}

// Fonction pour définir la couleur de la barre selon le pourcentage
const getStatColor = (value: number) => {
  if (value < 25) return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
  if (value < 50) return 'bg-orange-500 shadow-[0_0_10px_#f97316]';
  return 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]';
};

const NeedBar = ({ label, value, icon }: NeedBarProps) => (
  <div className="mb-4 group">
    <div className="flex justify-between items-end mb-1 px-1">
      <span className="text-[10px] font-black tracking-widest text-cyan-100/60 uppercase flex items-center gap-2">
        <span className="text-cyan-400">{icon}</span> {label}
      </span>
      <span className={`text-xs font-mono font-bold ${value < 25 ? 'text-red-500' : 'text-cyan-300'}`}>
        {Math.round(value)}%
      </span>
    </div>

    {/* Conteneur de la barre segmentee */}
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

export const AvatarBesoins = ({ stats }: Props) => {
  return (
    <div className="bg-black/20 backdrop-blur-md border border-cyan-500/20 p-6 rounded-xl w-full max-w-xs shadow-2xl">
      <h3 className="text-cyan-400 text-[11px] font-black tracking-[0.4em] uppercase mb-6 border-b border-cyan-500/30 pb-2">
        Biometric Monitor
      </h3>

      <div className="space-y-2">
        <NeedBar label="Vital Signs" value={stats.health} icon="♥" />
        <NeedBar label="Energy Cell" value={stats.energy} icon="⚡" />
        <NeedBar label="System Sync" value={stats.system} icon="⚙" />
        
        {/* On ajoute les stats optionnelles si elles existent */}
        {stats.focus !== undefined && (
          <NeedBar label="Neural Focus" value={stats.focus} icon="👁" />
        )}
        {stats.shield !== undefined && (
          <NeedBar label="Defense Grid" value={stats.shield} icon="⛨" />
        )}
      </div>

      {/* Petit footer décoratif */}
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
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