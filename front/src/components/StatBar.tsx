type StatBarProps = {
  label: string;
  percent: number;
  accent: string;
};

export const StatBar = ({ label, percent, accent }: StatBarProps) => (
  <div className="w-full">
    <div className="flex justify-between text-[10px] text-cyan-300 font-semibold mb-2 uppercase tracking-[0.4em]">
      <span>{label}</span>
      <span>{percent}%</span>
    </div>
    <div className="h-2 bg-black/60 rounded-full border border-cyan-500/30 overflow-hidden">
      <div
        className={`h-full ${accent} transition-all duration-1000`}
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);