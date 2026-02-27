import { MissionCard } from '../components/MissionCard';
import { SignalBars } from '../components/SignalBars';
import { AvatarGlobal } from '../components/Avatar/AvatarGlobal'; // Vérifie bien le nom du fichier
import { AvatarBesoins } from '../components/Avatar/AvatarBesoins'; // On importe le nouveau composant
import { missions } from '../data/missions';
import type { StatsInput } from '../utils/emotionLogic';
import { TopHeader } from '../components/TopHeader';
import { XpPanel } from '../components/XpPanel';

export const Home = () => {
  const userStats: StatsInput = {
    health: 76,
    energy: 54,
    system: 92,
    power: 72,
    shield: 84,
    focus: 96,
  };

  return (
    <div className="min-h-screen bg-[#03070b] text-cyan-200 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-6xl">
        {/* Effets de fond (inchangés) */}
        <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px), linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 border border-cyan-500/30 rounded-3xl bg-[#050b12]/80 backdrop-blur-xl p-6 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          
          <TopHeader/>
          <SignalBars values={[45, 70, 55, 80, 65, 90, 75, 50]}/>


          <div className="mt-8 grid gap-8 md:grid-cols-[1.1fr,1fr,1.1fr] items-center">
            
            {/* COLONNE GAUCHE : Utilisation de AvatarBesoins pour un look plus RPG */}
            <div className="space-y-4">
               <AvatarBesoins stats={userStats} />
            </div>

            {/* COLONNE CENTRE : Avatar Global */}
            <div className="flex justify-center">
              <AvatarGlobal stats={userStats} />
            </div>

            {/* COLONNE DROITE : Signes vitaux et Signaux */}
            <div className="space-y-6">
              <XpPanel initialTotalXp={0} />
              <div className="rounded-xl border border-cyan-500/20 bg-black/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-200/60">Signes vitaux</p>
                <div className="mt-4 flex items-center justify-between text-xs text-cyan-100">
                  <span>Pouls</span>
                  <span className="text-emerald-300">112 bpm</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-cyan-100">
                  <span>Température</span>
                  <span className="text-cyan-300">37.1 C</span>
                </div>
              </div>
              <SignalBars values={[82, 64, 92, 48, 78]} />
            </div>
          </div>

          {/* Journal de mission (Le reste est inchangé) */}
          <div className="relative mt-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cyan-500/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#050b12] px-5 text-[10px] font-black uppercase tracking-[0.5em] text-cyan-200/70">
                Journal de mission
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};