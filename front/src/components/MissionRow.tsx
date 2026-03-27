import type { Quest } from '../types/quest';
import { ToggleSwitch } from './ToggleSwitch';
import { getQuestIcon } from '../utils/icons';
import { useState } from 'react';

type MissionRowProps = {
  quest: Quest;
  onTogglePin: (questId: string, isPinned: boolean) => void;
  onComplete?: (questId: string) => Promise<void>;
};

export const MissionRow = ({ quest, onTogglePin, onComplete }: MissionRowProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReward, setShowReward] = useState(false);

  const handleToggle = () => {
    onTogglePin(quest.id, quest.isPinned);
  };

  const handleComplete = async () => {
    if (!onComplete || quest.completed) return;
    
    setIsCompleting(true);
    try {
      await onComplete(quest.id);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    } finally {
      setIsCompleting(false);
    }
  };

  const icon = quest.iconUrl || getQuestIcon(quest.category);
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facile':
      case 'easy':
        return 'text-green-400';
      case 'moyen':
      case 'medium':
        return 'text-yellow-400';
      case 'difficile':
      case 'hard':
        return 'text-red-400';
      default:
        return 'text-fuchsia-400';
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'rare':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const formatNeedEffects = (effects?: Quest['needsEffects']) => {
    if (!effects) return '';

    const labels: Record<string, string> = {
      hunger: 'Faim',
      thirst: 'Soif',
      engagement: 'Anti-ennui',
      productivity: 'Prod',
      energy: 'Energie',
      focus: 'Focus',
      mood: 'Moral',
    };

    return Object.entries(effects)
      .filter(([, value]) => typeof value === 'number' && value > 0)
      .slice(0, 2)
      .map(([key, value]) => `+${value} ${labels[key] ?? key}`)
      .join(' / ');
  };

  const needsBoostText = formatNeedEffects(quest.needsEffects);

  return (
    <>
      <div className={`flex items-center justify-between rounded-xl border transition-all ${
        quest.completed
          ? 'border-fuchsia-300/10 bg-fuchsia-500/5 opacity-50'
          : 'border-fuchsia-300/30 bg-fuchsia-500/10 hover:border-fuchsia-300/60'
      } px-4 py-3 shadow-[0_0_18px_rgba(232,121,249,0.2)]`}>
        <div className="flex items-center gap-4 flex-1">
          <div className="h-10 w-10 rounded-lg border border-fuchsia-300/40 bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300 text-2xl">
            {typeof icon === 'string' && icon.startsWith('http') ? (
              <img src={icon} alt={quest.title} className="h-8 w-8" />
            ) : (
              icon
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-fuchsia-100 uppercase tracking-[0.2em]">
              {quest.title}
            </p>
            {quest.description && (
              <p className="text-[9px] text-fuchsia-200/50 mt-1 line-clamp-1">
                {quest.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className={`text-[10px] uppercase tracking-[0.35em] ${getDifficultyColor(quest.difficulty)}`}>
                [{quest.category} - {quest.difficulty}]
              </p>
              {(quest.missionType === 'personal' || quest.isUserCreated) && (
                <span className="text-[7px] px-1.5 py-0.5 rounded border border-violet-400/40 bg-violet-500/10 text-violet-300 font-bold uppercase tracking-widest">
                  Personnel
                </span>
              )}
              {quest.missionType === 'real' && (
                <span className="text-[7px] px-1.5 py-0.5 rounded border border-green-500/40 bg-green-500/10 text-green-300 font-bold uppercase tracking-widest">
                  Réelle
                </span>
              )}
              {quest.missionType === 'neural' && (
                <span className="text-[7px] px-1.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-bold uppercase tracking-widest">
                  Neurale
                </span>
              )}
              {(quest.isNeedsMission || needsBoostText) && (
                <span className="text-[7px] px-1.5 py-0.5 rounded border border-amber-400/50 bg-amber-500/10 text-amber-200 font-bold uppercase tracking-widest">
                  Besoins
                </span>
              )}
              {needsBoostText && (
                <span className="text-[8px] px-2 py-0.5 rounded border border-amber-300/40 bg-amber-500/10 text-amber-100/90 font-bold uppercase tracking-wider">
                  {needsBoostText}
                </span>
              )}
              {quest.reward && (
                <span className={`text-[8px] px-2 py-0.5 rounded border font-bold uppercase tracking-widest ${getRarityColor(quest.reward.rarity)}`}>
                  {quest.reward.name} x{quest.reward.count}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!quest.completed ? (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded border border-lime-500/40 bg-lime-500/10 text-lime-300 hover:bg-lime-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompleting ? 'Complétage...' : 'Compléter'}
            </button>
          ) : (
            <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded border border-green-500/40 bg-green-500/10 text-green-400">
              ✓ Complétée
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-200/70">
            {quest.isPinned ? 'Pin' : 'Unpin'}
          </span>
          <button onClick={handleToggle} className="cursor-pointer" disabled={quest.completed}>
            <ToggleSwitch enabled={quest.isPinned} />
          </button>
        </div>
      </div>

      {showReward && quest.reward && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-green-500/20 border border-green-500/40 rounded-lg p-3 text-center text-sm text-green-200 mb-3">
          🎉 Récompense reçue: {quest.reward.icon} <span className="font-bold">{quest.reward.name} x{quest.reward.count}</span>
        </div>
      )}
    </>
  );
};
