import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, variant = "default", trend, subtitle }) {
  // Variant styles for luxury dark theme
  const variantConfig = {
    violet: {
      iconBg: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
      glow: "hover:border-violet-500/40 hover:shadow-[0_0_30px_-10px_rgba(139,92,246,0.3)]",
      accent: "from-violet-500/20 to-transparent",
    },
    emerald: {
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      glow: "hover:border-emerald-500/40 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]",
      accent: "from-emerald-500/20 to-transparent",
    },
    rose: {
      iconBg: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
      glow: "hover:border-rose-500/40 hover:shadow-[0_0_30px_-10px_rgba(244,63,94,0.3)]",
      accent: "from-rose-500/20 to-transparent",
    },
    cyan: {
      iconBg: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
      glow: "hover:border-cyan-500/40 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]",
      accent: "from-cyan-500/20 to-transparent",
    },
    default: {
      iconBg: "bg-zinc-800 text-zinc-300 border border-zinc-700/50",
      glow: "hover:border-zinc-700 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.05)]",
      accent: "from-zinc-500/10 to-transparent",
    }
  };

  const config = variantConfig[variant] || variantConfig.default;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#12131A]/90 border border-white/[0.08] p-5 backdrop-blur-xl transition-all duration-300 group ${config.glow}`}>
      {/* Top Subtle Ambient Radial Highlight */}
      <div className={`absolute top-0 right-0 w-36 h-28 bg-gradient-to-bl ${config.accent} pointer-events-none opacity-40 blur-xl`} />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-zinc-400 tracking-tight">{title}</span>
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${config.iconBg}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div>
          <div className="text-2xl sm:text-[28px] font-bold text-white tracking-[-0.03em] tabular-numbers leading-tight">
            {value}
          </div>

          {(trend || subtitle) && (
            <div className="flex items-center gap-2 mt-2">
              {trend && (
                <span className={`inline-flex items-center gap-1 text-[11.5px] font-medium px-2 py-0.5 rounded-full border ${
                  trend.startsWith('+') || trend.toLowerCase().includes('positive')
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                    : trend.startsWith('-') || trend.toLowerCase().includes('negative')
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/25'
                    : 'bg-white/[0.06] text-zinc-400 border-white/[0.08]'
                }`}>
                  {trend.startsWith('+') ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : trend.startsWith('-') ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : null}
                  {trend}
                </span>
              )}
              {subtitle && (
                <span className="text-[12px] text-zinc-400 truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}