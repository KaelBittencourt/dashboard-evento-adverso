import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string | null;
  trendLabel?: string;
  icon: string;
  variant?: "default" | "primary" | "danger" | "warning" | "success";
  mono?: boolean;
}

const variantConfig = {
  default: {
    border: "border-border/60",
    bg: "",
    iconBg: "bg-muted",
    iconGlow: "",
    valueColor: "text-foreground",
  },
  primary: {
    border: "border-primary/20",
    bg: "bg-primary/[0.03]",
    iconBg: "bg-primary/10",
    iconGlow: "shadow-[0_0_12px_hsl(199_89%_48%/0.15)]",
    valueColor: "text-gradient-primary",
  },
  danger: {
    border: "border-destructive/20",
    bg: "bg-destructive/[0.03]",
    iconBg: "bg-destructive/10",
    iconGlow: "shadow-[0_0_12px_hsl(0_72%_55%/0.15)]",
    valueColor: "text-destructive",
  },
  warning: {
    border: "border-severity-moderate/20",
    bg: "bg-severity-moderate/[0.03]",
    iconBg: "bg-severity-moderate/10",
    iconGlow: "shadow-[0_0_12px_hsl(25_95%_53%/0.15)]",
    valueColor: "text-severity-moderate",
  },
  success: {
    border: "border-severity-none/20",
    bg: "bg-severity-none/[0.03]",
    iconBg: "bg-severity-none/10",
    iconGlow: "shadow-[0_0_12px_hsl(142_71%_45%/0.15)]",
    valueColor: "text-severity-none",
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
}: KpiCardProps) {
  const trendNum = trend ? parseFloat(trend) : null;
  const isUp = trendNum !== null && trendNum > 0;
  const isDown = trendNum !== null && trendNum < 0;
  const config = variantConfig[variant];

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border
        ${config.border} ${config.bg}
        bg-gradient-to-br from-card to-card/80
        p-4 transition-all duration-300
        hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
        hover:-translate-y-0.5
      `}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header: Icon + Title */}
        <div className="flex items-center gap-2.5">
          <div
            className={`
              flex items-center justify-center w-8 h-8 rounded-lg
              ${config.iconBg} ${config.iconGlow}
              transition-transform duration-300 group-hover:scale-110
            `}
          >
            <span className="text-sm leading-none">{icon}</span>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-tight flex-1">
            {title}
          </p>
        </div>

        {/* Value */}
        <div className="flex items-end justify-between gap-2">
          <p
            className={`text-[1.625rem] font-bold leading-none tracking-tight ${mono ? "font-mono" : ""
              } ${config.valueColor}`}
          >
            {value}
          </p>

          {trendNum !== null && (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${isUp
                  ? "text-destructive bg-destructive/10"
                  : isDown
                    ? "text-severity-none bg-severity-none/10"
                    : "text-muted-foreground bg-muted"
                }`}
            >
              {isUp ? (
                <TrendingUp size={11} strokeWidth={2.5} />
              ) : isDown ? (
                <TrendingDown size={11} strokeWidth={2.5} />
              ) : (
                <Minus size={11} strokeWidth={2.5} />
              )}
              <span>
                {isUp ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>

        {/* Subtitle / Trend Label */}
        {(subtitle || trendLabel) && (
          <p className="text-[11px] text-muted-foreground/80 leading-tight">
            {subtitle}
            {trendLabel && (
              <span className="text-muted-foreground/50"> · {trendLabel}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

interface KpiGridProps {
  children: ReactNode;
}

export function KpiGrid({ children }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {children}
    </div>
  );
}
