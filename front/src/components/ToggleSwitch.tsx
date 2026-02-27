type ToggleSwitchProps = {
  enabled: boolean;
};

export const ToggleSwitch = ({ enabled }: ToggleSwitchProps) => (
  <div
    className={`h-6 w-11 rounded-full border ${
      enabled ? 'border-cyan-300/60 bg-cyan-400/40' : 'border-fuchsia-300/40 bg-fuchsia-500/10'
    } relative`}
  >
    <div
      className={`absolute top-0.5 h-4 w-4 rounded-full transition-all ${
        enabled
          ? 'left-5 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
          : 'left-1 bg-fuchsia-300/70 shadow-[0_0_10px_rgba(232,121,249,0.7)]'
      }`}
    />
  </div>
);
