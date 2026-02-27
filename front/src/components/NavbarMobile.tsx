import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `w-full text-left px-4 py-3 rounded-lg transition-all ${
    isActive
      ? 'border-l-2 border-fuchsia-300 text-fuchsia-100 bg-fuchsia-400/15'
      : 'border-l-2 border-cyan-300/30 text-cyan-200/60 hover:text-cyan-100 hover:border-cyan-300'
  }`;

export const NavbarMobile = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-300/30 bg-black/80 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
          <span className="text-sm font-bold uppercase tracking-widest text-cyan-100">Quest</span>
        </div>
        
        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="flex flex-col gap-1.5 px-2 py-2 rounded-lg hover:bg-cyan-400/10 transition-colors"
          aria-label="Menu"
        >
          <div className={`h-0.5 w-6 bg-cyan-300 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <div className={`h-0.5 w-6 bg-cyan-300 transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 w-6 bg-cyan-300 transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="border-b border-cyan-300/30 bg-black/90 backdrop-blur-lg">
          <div className="flex flex-col gap-2 p-4">
            <NavLink
              to="/"
              className={linkClass}
              onClick={closeMenu}
            >
              🏠 Home
            </NavLink>
            <NavLink
              to="/missions"
              className={linkClass}
              onClick={closeMenu}
            >
              ⚔️ Missions
            </NavLink>
            <NavLink
              to="/aventure"
              className={linkClass}
              onClick={closeMenu}
            >
              🗺️ Aventure
            </NavLink>
            <NavLink
              to="/boutique"
              className={linkClass}
              onClick={closeMenu}
            >
              🏪 Boutique
            </NavLink>
            <NavLink
              to="/inventaire"
              className={linkClass}
              onClick={closeMenu}
            >
              🎒 Inventaire
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
};
