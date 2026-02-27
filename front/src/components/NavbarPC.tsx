import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-4 py-2 text-sm uppercase tracking-[0.3em] font-semibold transition-all group ${
    isActive
      ? 'text-fuchsia-100'
      : 'text-cyan-200/70 hover:text-cyan-100'
  }`;

const underlineClass = ({ isActive }: { isActive: boolean }) =>
  `absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r transition-all ${
    isActive
      ? 'from-cyan-300 via-fuchsia-300 to-cyan-300 opacity-100 w-full'
      : 'from-cyan-300 via-fuchsia-300 to-cyan-300 opacity-0 group-hover:opacity-100 w-0 group-hover:w-full'
  }`;

export const NavbarPC = () => {
  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50">
      <div className="border-b border-cyan-300/30 bg-black/70 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              <span className="text-lg font-bold uppercase tracking-widest text-cyan-100">
                Quest System
              </span>
              <span className="h-3 w-3 rounded-full bg-fuchsia-300 shadow-[0_0_10px_rgba(232,121,249,0.8)]" />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              className={linkClass}
            >
              {({ isActive }) => (
                <div className="relative">
                  <span>🏠 Home</span>
                  <div className={underlineClass({ isActive })} />
                </div>
              )}
            </NavLink>

            <NavLink
              to="/missions"
              className={linkClass}
            >
              {({ isActive }) => (
                <div className="relative">
                  <span>⚔️ Missions</span>
                  <div className={underlineClass({ isActive })} />
                </div>
              )}
            </NavLink>

            <NavLink
              to="/aventure"
              className={linkClass}
            >
              {({ isActive }) => (
                <div className="relative">
                  <span>🗺️ Aventure</span>
                  <div className={underlineClass({ isActive })} />
                </div>
              )}
            </NavLink>

            <NavLink
              to="/boutique"
              className={linkClass}
            >
              {({ isActive }) => (
                <div className="relative">
                  <span>🏪 Boutique</span>
                  <div className={underlineClass({ isActive })} />
                </div>
              )}
            </NavLink>

            <NavLink
              to="/inventaire"
              className={linkClass}
            >
              {({ isActive }) => (
                <div className="relative">
                  <span>🎒 Inventaire</span>
                  <div className={underlineClass({ isActive })} />
                </div>
              )}
            </NavLink>
          </div>

          {/* Right side accent */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
          </div>
        </div>
      </div>
    </nav>
  );
};
