import { generateInsights } from "@/lib/analytics";
import { AdverseEvent } from "@/hooks/useAdverseEvents";
import { Sparkles, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface InsightsPanelProps {
  events: AdverseEvent[];
  allEvents: AdverseEvent[];
}

const typeConfig = {
  danger: {
    border: "border-destructive/20",
    bg: "bg-destructive/[0.04]",
    dot: "bg-destructive",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  warning: {
    border: "border-severity-moderate/20",
    bg: "bg-severity-moderate/[0.04]",
    dot: "bg-severity-moderate",
    icon: AlertCircle,
    iconColor: "text-severity-moderate",
  },
  success: {
    border: "border-severity-none/20",
    bg: "bg-severity-none/[0.04]",
    dot: "bg-severity-none",
    icon: CheckCircle2,
    iconColor: "text-severity-none",
  },
};

export function InsightsPanel({ events, allEvents }: InsightsPanelProps) {
  const insights = generateInsights(events, allEvents);

  if (insights.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
          <Sparkles size={14} className="text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Insights Automáticos
        </h3>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">
          {insights.length} {insights.length === 1 ? "alerta" : "alertas"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;

          return (
            <div
              key={i}
              className={`
                flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
                hover:translate-x-0.5
                ${config.border} ${config.bg}
              `}
            >
              <Icon
                size={14}
                className={`mt-0.5 flex-shrink-0 ${config.iconColor}`}
              />
              <p className="text-[13px] text-foreground/85 leading-relaxed">
                {insight.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
