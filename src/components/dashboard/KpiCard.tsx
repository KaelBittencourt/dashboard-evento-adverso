import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string | null;
  trendLabel?: string;
  icon: ReactNode;
  variant?: "default" | "primary" | "danger" | "warning" | "success";
  mono?: boolean;
  valueClassName?: string;
}

const variantConfig = {
  default: {
    accent: "hsl(215, 15%, 52%)",
    accentMuted: "hsl(215, 15%, 52%, 0.12)",
    valueColor: "text-foreground",
  },
  primary: {
    accent: "hsl(199, 89%, 48%)",
    accentMuted: "hsl(199, 89%, 48%, 0.12)",
    valueColor: "text-foreground",
  },
  danger: {
    accent: "hsl(0, 72%, 55%)",
    accentMuted: "hsl(0, 72%, 55%, 0.12)",
    valueColor: "text-foreground",
  },
  warning: {
    accent: "hsl(25, 95%, 53%)",
    accentMuted: "hsl(25, 95%, 53%, 0.12)",
    valueColor: "text-foreground",
  },
  success: {
    accent: "hsl(142, 71%, 45%)",
    accentMuted: "hsl(142, 71%, 45%, 0.12)",
    valueColor: "text-foreground",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  variant = "default",
  mono = false,
  valueClassName,
}: KpiCardProps) {
  const trendNum = trend ? parseFloat(trend) : null;
  const isUp = trendNum !== null && trendNum > 0;
  const isDown = trendNum !== null && trendNum < 0;
  const config = variantConfig[variant];

  return (
    <div className="group relative h-full flex flex-col justify-between rounded-xl bg-card/60 border border-border/40 overflow-hidden transition-all duration-300 hover:border-border/80 hover:bg-card/80">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)` }}
      />

      <div className="px-4 py-3.5 flex flex-col flex-1">
        {/* Header: icon + title */}
        <div className="flex items-center gap-2 mb-2.5">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: config.accentMuted }}
          >
            <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
          </div>
          <span className="text-[10.5px] font-semibold text-foreground/80 uppercase tracking-widest truncate">
            {title}
          </span>
        </div>

        {/* Value row */}
        <div className="flex items-baseline gap-2">
          <span
            className={`font-bold tracking-tight ${
              mono ? "font-mono" : ""
            } ${config.valueColor} ${valueClassName || "text-[1.35rem] leading-none truncate"}`}
            title={typeof value === "string" ? value : undefined}
          >
            {value}
          </span>

          {trendNum !== null && (
            <span
              className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-[2px] rounded-md shrink-0 ${
                isUp
                  ? "text-red-400 bg-red-400/10"
                  : isDown
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-muted-foreground bg-muted/50"
              }`}
            >
              {isUp ? (
                <TrendingUp size={9} strokeWidth={2.5} />
              ) : isDown ? (
                <TrendingDown size={9} strokeWidth={2.5} />
              ) : (
                <Minus size={9} strokeWidth={2.5} />
              )}
              {isUp ? "+" : ""}
              {trend}%
            </span>
          )}
        </div>

        {/* Subtitle / Spacer */}
        <div className="mt-auto pt-1.5">
          {(subtitle || trendLabel) ? (
            <p className="text-[10.5px] font-medium text-muted-foreground leading-tight truncate">
              {subtitle}
              {trendLabel && (
                <span className="text-muted-foreground/80"> · {trendLabel}</span>
              )}
            </p>
          ) : (
            <div className="h-[12px] w-full" /> /* Preserves spacing for empty subtitle */
          )}
        </div>
      </div>
    </div>
  );
}

interface KpiGridProps {
  children: ReactNode;
}

export function KpiGrid({ children }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {children}
    </div>
  );
}
