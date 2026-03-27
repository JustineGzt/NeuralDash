type AvatarPanelProps = {
  name: string;
  role: string;
};

export const AvatarPanel = ({ name, role }: AvatarPanelProps) => (
  <div className="relative flex flex-col items-center gap-3">
    <div className="relative">
      <div className="h-36 w-36 rounded-2xl border border-cyan-400/50 bg-slate-950/70 shadow-[0_0_30px_rgba(34,211,238,0.35)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px), linear-gradient(rgba(34,211,238,0.15) 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
        <div className="relative h-full w-full flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border border-cyan-300/70 bg-cyan-400/20" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-9 w-20 rounded-full border border-cyan-400/40 bg-cyan-500/10" />
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em]">
        {role}
      </div>
    </div>
    <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-100/95">Callsign</div>
    <div className="text-sm font-semibold text-white">{name}</div>
  </div>
);
