import React from 'react';
import { determineEmotion, getEmotionImagePath, type StatsInput } from '../../utils/emotionLogic';

interface PropsAvatarEmotion {
  stats: StatsInput;
}

export const AvatarGlobal: React.FC<PropsAvatarEmotion> = ({ stats }) => {
  const { emotion, intensity } = determineEmotion(stats);
  const imagePath = getEmotionImagePath(emotion);

  // Style dynamique selon l'émotion précise
  const getEmotionTheme = () => {
    switch (emotion) {
      case 'colere': 
        return 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-shake';
      case 'boost1': case 'boost2': case 'boost3':
        return 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.6)] animate-pulse';
      case 'boostDort':
        return 'border-indigo-800 shadow-[0_0_15px_rgba(30,27,75,0.4)] opacity-70';
      case 'supercontent': case 'confiant':
        return 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.7)]';
      case 'inquiet': case 'triste':
        return 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'surpris':
        return 'border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-105';
      default: // content, ennuie
        return 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]';
    }
  };

  return (
    <div className="relative group flex flex-col items-center">
      {/* Cadre holographique avec transition fluide */}
      <div className={`
        w-40 h-40 border-2 rounded-lg p-1 transition-all duration-700 ease-in-out
        ${getEmotionTheme()}
      `}>
        {/* Container de l'image */}
        <div className="w-full h-full bg-black/90 rounded overflow-hidden relative">
          <img 
            src={imagePath} 
            alt={`Avatar ${emotion}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{
              // Effet de saturation basé sur l'intensité
              filter: `saturate(${0.5 + intensity / 100}) brightness(${0.8 + intensity / 500})`,
            }}
          />
          
          {/* Scanline animée (L'effet de ligne qui passe) */}
          <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-cyan-400/5 to-transparent h-full w-full animate-scan" />
        </div>
      </div>

      {/* Badge de Statut sous l'avatar */}
      <div className="mt-3 px-3 py-1 bg-black/40 border border-white/10 rounded-full backdrop-blur-sm">
        <span className="text-[9px] font-black tracking-[0.25em] text-cyan-300 uppercase italic">
          {emotion} • {intensity}%
        </span>
      </div>

      {/* Barre de "Sync" (Intensité) */}
      <div className="w-24 h-1 bg-gray-800 rounded-full mt-2 overflow-hidden border border-white/5">
        <div 
          className="h-full bg-linear-to-r from-cyan-600 to-cyan-300 transition-all duration-1000"
          style={{ width: `${intensity}%` }}
        />
      </div>
    </div>
  );
};