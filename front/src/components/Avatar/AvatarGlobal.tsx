import React from 'react';
import { determineEmotion, getEmotionImagePath, type StatsInput } from '../../utils/emotionLogic';

interface Props {
  stats: StatsInput;
}

export const AvatarGlobal: React.FC<Props> = ({ stats }) => {
  // On récupère l'émotion calculée par ta logique
  const { emotion } = determineEmotion(stats);
  const imagePath = getEmotionImagePath(emotion);

  return (
    <div className="flex flex-col items-center group">
      {/* L'Avatar avec son cadre néon */}
      <div className={`
        relative w-48 h-48 border-2 rounded-lg p-1 transition-all duration-700
        ${stats.health < 25 ? 'border-red-500 shadow-[0_0_30px_#ef4444]' : 'border-cyan-400 shadow-[0_0_20px_#22d3ee]'}
      `}>
        {/* Fond noir et image */}
        <div className="w-full h-full bg-black rounded overflow-hidden relative">
          <img 
            src={imagePath} 
            alt={emotion}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Effet de scanline qui bouge */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-cyan-400/10 to-transparent h-full w-full animate-scan" />
        </div>
      </div>

      {/* Libellé de l'émotion */}
      <div className="mt-4 text-center">
        <span className="text-[10px] font-black tracking-[0.4em] text-cyan-300 uppercase bg-cyan-950/30 px-4 py-1 rounded-full border border-cyan-500/20">
          {emotion}
        </span>
      </div>
    </div>
  );
};