import { useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowDownCircle, Syringe, Pill } from "lucide-react";

const dashboards = [
  {
    path: "/",
    label: "Eventos Adversos",
    icon: Activity,
    color: "hsl(199, 89%, 48%)",
  },
  {
    path: "/quedas",
    label: "Quedas",
    icon: ArrowDownCircle,
    color: "hsl(280, 65%, 50%)",
  },
  {
    path: "/flebite",
    label: "Flebite",
    icon: Syringe,
    color: "hsl(172, 66%, 50%)",
  },
  {
    path: "/falhas-medicacao",
    label: "Falhas de Medicação",
    icon: Pill,
    color: "hsl(47, 96%, 53%)",
  },
];

export function DashboardSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();

  const current = dashboards.find((d) => d.path === location.pathname) || dashboards[0];

  return (
    <div className="flex flex-col gap-1">
      {/* Tab-pill switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50 border border-border/60 backdrop-blur-sm">
        {dashboards.map((d) => {
          const isActive = d.path === location.pathname;
          const Icon = d.icon;

          return (
            <button
              key={d.path}
              onClick={() => navigate(d.path)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-tight
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }
              `}
            >
              {/* Active glow */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md -z-10" />
              )}
              <Icon
                size={14}
                strokeWidth={2.5}
                className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`}
              />
              <span>{d.label}</span>
              {/* Active dot indicator */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground/80 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Subtitle */}
      <p className="text-[10px] text-muted-foreground/70 font-medium tracking-wide uppercase pl-1 pt-1.5">
        Núcleo de Segurança do Paciente
      </p>
    </div>
  );
}
