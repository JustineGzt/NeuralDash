import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';

export const TopHeader: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const { credits } = useWallet();

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[10px] uppercase tracking-[0.4em] text-cyan-200/60 font-mono">
      {/* Côté Gauche : Identité */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="absolute inset-0 h-2 w-2 rounded-full bg-cyan-400 animate-ping opacity-20" />
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          <span className="text-cyan-100 font-bold">BioOS // UNIT-01</span>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="text-[9px]">Status: <span className="text-emerald-400">Online</span></span>
        </div>
      </div>

      {/* Côté Droit : Données Systèmes */}
      <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 md:border-none pt-2 md:pt-0">
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[8px]">Time</span>
          <span className="text-cyan-100">{time}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[8px]">Signal</span>
          <span className="text-cyan-100">96%</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[8px]">Credits</span>
          <span className="text-amber-200">{credits}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[8px]">Sector</span>
          <span className="text-cyan-100">04</span>
        </div>
      </div>
    </header>
  );
};