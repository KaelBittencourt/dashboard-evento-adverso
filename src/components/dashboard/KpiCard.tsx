import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

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
    bar: "bg-muted-foreground/40",
    wash: "bg-muted",
  },
  primary: {
    bar: "bg-primary",
    wash: "bg-primary/10",
  },
  danger: {
    bar: "bg-destructive",
    wash: "bg-destructive/10",
  },
  warning: {
    bar: "bg-severity-moderate",
    wash: "bg-severity-moderate/10",
  },
  success: {
    bar: "bg-severity-none",
    wash: "bg-severity-none/10",
  },
};

function isNumericDisplay(value: string | number) {
  if (typeof value === "number") return true;
  return /^-?[\d.,]+%?$/.test(String(value).trim());
}

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
  const numeric = isNumericDisplay(value);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_1px_2px_hsl(220_20%_10%/0.05)] transition-shadow duration-200 hover:shadow-[0_10px_24px_-16px_hsl(220_20%_10%/0.28)]">
      <div className={cn("absolute inset-y-3 left-0 w-[3px] rounded-r-full", config.bar)} />

      <div className="flex h-full flex-col px-4 py-3.5 pl-5">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-1 text-[11px] font-medium leading-snug text-muted-foreground line-clamp-2">
            {title}
          </p>
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.wash)}>
            <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
          </div>
        </div>

        <div className="mt-2.5 min-w-0">
          <span
            className={cn(
              "block min-w-0 text-foreground",
              valueClassName ||
                (numeric
                  ? "text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums"
                  : "text-[15px] font-semibold leading-snug line-clamp-2"),
              mono && numeric && "font-mono",
            )}
            title={typeof value === "string" ? value : undefined}
          >
            {value}
          </span>
        </div>

        <div className="mt-auto pt-2.5">
          {trendNum !== null && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  isUp && "bg-red-500/10 text-red-700 dark:text-red-400",
                  isDown && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                  !isUp && !isDown && "bg-muted text-muted-foreground",
                )}
              >
                {isUp ? (
                  <TrendingUp size={11} strokeWidth={2.5} />
                ) : isDown ? (
                  <TrendingDown size={11} strokeWidth={2.5} />
                ) : (
                  <Minus size={11} strokeWidth={2.5} />
                )}
                {isUp ? "+" : ""}
                {trend}%
              </span>
              {trendLabel && (
                <span className="truncate text-[11px] text-muted-foreground">{trendLabel}</span>
              )}
            </div>
          )}
          {subtitle && (
            <p className={cn("text-[11px] leading-snug text-muted-foreground line-clamp-2", trendNum !== null && "mt-1")}>
              {subtitle}
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {children}
    </div>
  );
}
