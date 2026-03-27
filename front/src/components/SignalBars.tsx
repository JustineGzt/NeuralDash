type SignalBarsProps = {
  values: number[];
};

export const SignalBars = ({ values }: SignalBarsProps) => (
  <div className="flex items-end justify-center gap-1.5 sm:gap-2 md:gap-3 h-20 sm:h-24 md:h-28">
    {values.map((value, index) => (
      <div
        key={`${value}-${index}`}
        className="relative w-2.5 sm:w-3 md:w-3.5 h-full rounded-sm bg-cyan-500/10 border border-cyan-500/20 overflow-hidden"
      >
        <div
          className="absolute bottom-0 w-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
          style={{ height: `${value}%` }}
        />
      </div>
    ))}
  </div>
);
