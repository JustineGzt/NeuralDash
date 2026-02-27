import { useEffect, useMemo, useState } from 'react';

type XpPanelProps = {
  initialTotalXp?: number;
};

type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  levelXp: number;
};

const BASE_XP = 120;
const GROWTH = 1.35;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const XP_STORAGE_KEY = 'playerXpTotal';
const XP_EVENT = 'xp:updated';

const getLevelInfo = (totalXp: number): LevelInfo => {
  let level = 1;
  let levelXp = BASE_XP;
  let remaining = Math.max(0, Math.floor(totalXp));

  while (remaining >= levelXp) {
    remaining -= levelXp;
    level += 1;
    levelXp = Math.round(levelXp * GROWTH);
  }

  return {
    level,
    xpIntoLevel: remaining,
    xpToNext: levelXp - remaining,
    levelXp,
  };
};

const getRankLabel = (level: number) => {
  if (level >= 20) return 'Commandant';
  if (level >= 14) return 'Vanguard';
  if (level >= 8) return 'Operateur';
  if (level >= 4) return 'Agent';
  return 'Cadet';
};

export const XpPanel = ({ initialTotalXp = 0 }: XpPanelProps) => {
  const [totalXp, setTotalXp] = useState(initialTotalXp);
  const [recentGain, setRecentGain] = useState(0);

  const levelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);
  const progress = clamp((levelInfo.xpIntoLevel / levelInfo.levelXp) * 100, 0, 100);

  useEffect(() => {
    const savedXp = Number(localStorage.getItem(XP_STORAGE_KEY));
    if (!Number.isNaN(savedXp)) {
      setTotalXp(savedXp);
    }

    const handleXpEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      if (typeof event.detail?.totalXp === 'number') {
        setTotalXp(event.detail.totalXp as number);
      }
      if (typeof event.detail?.gain === 'number') {
        setRecentGain(event.detail.gain as number);
        window.setTimeout(() => setRecentGain(0), 2000);
      }
    };

    const handleStorageChange = (storageEvent: StorageEvent) => {
      if (storageEvent.key !== XP_STORAGE_KEY) return;
      const next = Number(storageEvent.newValue);
      if (!Number.isNaN(next)) setTotalXp(next);
    };

    window.addEventListener(XP_EVENT, handleXpEvent);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener(XP_EVENT, handleXpEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-cyan-500/30 bg-black/40 p-5 shadow-[0_0_22px_rgba(34,211,238,0.2)]">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-cyan-200/70">
        <span>Experience</span>
        <span className="text-cyan-100">Niveau {levelInfo.level}</span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-cyan-100 font-semibold">{getRankLabel(levelInfo.level)}</p>
            <p className="text-[10px] text-cyan-200/60 uppercase tracking-[0.3em]">XP totale</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-cyan-100">{totalXp}</p>
            <p className="text-[9px] text-cyan-200/60">+{levelInfo.xpToNext} jusqu'au prochain</p>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full border border-cyan-500/30 bg-black/70 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-cyan-200/60">
          <span>{levelInfo.xpIntoLevel} / {levelInfo.levelXp}</span>
          {recentGain > 0 ? (
            <span className="text-emerald-300">+{recentGain} XP</span>
          ) : (
            <span>Stable</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-cyan-200/50">
        <span>XP verrouillee sur progression</span>
        <span>Sync</span>
      </div>
    </section>
  );
};
