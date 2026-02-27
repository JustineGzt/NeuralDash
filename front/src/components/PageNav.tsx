import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-[10px] uppercase tracking-[0.4em] px-4 py-2 rounded-xl border transition-all ${
    isActive
      ? 'border-fuchsia-300/70 text-fuchsia-100 bg-fuchsia-400/15 shadow-[0_0_18px_rgba(232,121,249,0.35)]'
      : 'border-cyan-300/30 text-cyan-200/60 bg-cyan-400/5 hover:text-cyan-100 hover:border-cyan-300/70'
  }`;

export const PageNav = () => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/30 bg-black/50 px-4 py-2 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
      <NavLink to="/" className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/missions" className={linkClass}>
        Missions
      </NavLink>
      <NavLink to="/aventure" className={linkClass}>
        Aventure
      </NavLink>
      <NavLink to="/boutique" className={linkClass}>
        Boutique
      </NavLink>
      <NavLink to="/inventaire" className={linkClass}>
        Inventaire
      </NavLink>
      <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
    </div>
  </div>
);
