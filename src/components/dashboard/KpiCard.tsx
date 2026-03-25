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
}

const variantConfig = {
  default: {
    border: "border-border/60",
    bg: "",
    valueColor: "text-foreground",
  },
  primary: {
    border: "border-primary/20",
    bg: "bg-primary/[0.03]",
    valueColor: "text-gradient-primary",
  },
  danger: {
    border: "border-destructive/20",
    bg: "bg-destructive/[0.03]",
    valueColor: "text-destructive",
  },
  warning: {
    border: "border-severity-moderate/20",
    bg: "bg-severity-moderate/[0.03]",
    valueColor: "text-severity-moderate",
  },
  success: {
    border: "border-severity-none/20",
    bg: "bg-severity-none/[0.03]",
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

      <div className="relative z-10 flex items-center gap-4">
        {/* Left: Icon */}
        <div
          className={`
            flex items-center justify-center shrink-0
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
          `}
        >
          <span className="text-2xl leading-none">{icon}</span>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col flex-1 min-w-0">
          <p className="text-[10px] font-medium text-foreground/70 uppercase tracking-widest leading-tight truncate mb-1">
            {title}
          </p>

          <div className="flex items-center gap-2 mb-1">
            <p
              className={`text-2xl font-bold leading-none tracking-tight truncate ${
                mono ? "font-mono" : ""
              } ${config.valueColor}`}
            >
              {value}
            </p>

            {trendNum !== null && (
              <div
                className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                  isUp
                    ? "text-destructive bg-destructive/10"
                    : isDown
                    ? "text-severity-none bg-severity-none/10"
                    : "text-muted-foreground bg-muted"
                }`}
              >
                {isUp ? (
                  <TrendingUp size={10} strokeWidth={2.5} />
                ) : isDown ? (
                  <TrendingDown size={10} strokeWidth={2.5} />
                ) : (
                  <Minus size={10} strokeWidth={2.5} />
                )}
                <span>
                  {isUp ? "+" : ""}
                  {trend}%
                </span>
              </div>
            )}
          </div>

          {(subtitle || trendLabel) && (
            <p className="text-[10px] text-foreground/60 leading-tight truncate">
              {subtitle}
              {trendLabel && (
                <span className="text-foreground/50 font-medium"> · {trendLabel}</span>
              )}
            </p>
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {children}
    </div>
  );
}
