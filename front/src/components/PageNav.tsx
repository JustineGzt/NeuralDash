import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.4em] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border transition-all ${
    isActive
      ? 'border-fuchsia-300/70 text-fuchsia-100 bg-fuchsia-400/15 shadow-[0_0_18px_rgba(232,121,249,0.35)]'
      : 'border-cyan-300/30 text-cyan-200/60 bg-cyan-400/5 hover:text-cyan-100 hover:border-cyan-300/70'
  }`;

export const PageNav = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-6 left-0 right-0 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 px-2 sm:px-0">
      <div className="mx-auto w-full sm:w-auto rounded-2xl border border-cyan-300/30 bg-black/50 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3 overflow-x-auto">
            <span className="hidden sm:block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
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
            <span className="hidden sm:block h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
          </div>

          {!loading && user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="shrink-0 whitespace-nowrap text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.32em] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-rose-300/50 text-rose-100 bg-rose-500/15 transition-all hover:border-rose-300/80 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? 'Deconnexion...' : 'Deconnexion'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
