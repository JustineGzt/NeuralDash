import type { Mission } from '../types/mission';

type MissionCardProps = {
  mission: Mission;
};

const STATUS_STYLES: Record<Mission['status'], { chip: string; border: string; dot: string }> = {
  NEW: {
    chip: 'bg-cyan-400 text-black',
    border: 'border-cyan-500/40 bg-cyan-400/10 shadow-[0_0_18px_rgba(34,211,238,0.25)]',
    dot: 'bg-cyan-400 animate-pulse',
  },
  WORK: {
    chip: 'bg-amber-300 text-black',
    border: 'border-amber-300/40 bg-amber-300/10 shadow-[0_0_18px_rgba(252,211,77,0.25)]',
    dot: 'bg-amber-300 animate-pulse',
  },
  DONE: {
    chip: 'bg-emerald-300 text-black',
    border: 'border-emerald-300/40 bg-emerald-300/10 shadow-[0_0_18px_rgba(52,211,153,0.25)]',
    dot: 'bg-emerald-300',
  },
};

export const MissionCard = ({ mission }: MissionCardProps) => {
  const styles = STATUS_STYLES[mission.status];

  return (
    <div
      className={`rounded-xl border ${styles.border} p-4 transition-all hover:border-cyan-300/70 bg-black/40`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[9px] font-black px-2 py-1 rounded ${styles.chip} uppercase tracking-[0.2em]`}>
          {mission.tag ?? mission.status}
        </span>
        <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
      </div>
      <h3 className="text-sm text-white font-semibold mb-1">{mission.title}</h3>
      <p className="text-[10px] text-cyan-200/60 uppercase tracking-[0.25em]">{mission.detail}</p>
      {mission.reward && (
        <p className="mt-2 text-[11px] text-cyan-100/80">Reward: {mission.reward}</p>
      )}
    </div>
  );
};