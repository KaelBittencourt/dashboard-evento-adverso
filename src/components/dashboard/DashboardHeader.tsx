import { Filters } from "@/hooks/useAdverseEvents";
import { RefreshCw, Filter, Calendar, Plus } from "lucide-react";
import { useRef } from "react";
import { DashboardSwitcher } from "./DashboardSwitcher";

interface DashboardHeaderProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  options: {
    tiposEvento: string[];
    unidades: string[];
    danos: string[];
    turnos: string[];
  };
  lastUpdated: Date | null;
  onRefresh: () => void;
  loading: boolean;
}

const inputClass =
  "bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 w-full placeholder:text-muted-foreground/40";

const selectClass =
  "filter-select bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 appearance-none cursor-pointer w-full truncate";

export function DashboardHeader({
  filters,
  setFilters,
  options,
  lastUpdated,
  onRefresh,
  loading,
}: DashboardHeaderProps) {
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof Filters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const clearFilters = () =>
    setFilters({ dateStart: `${new Date().getFullYear()}-01-01`, dateEnd: "", tipoEvento: "", unidade: "", danos: "", turno: "" });

  const hasFilters =
    filters.dateStart !== `${new Date().getFullYear()}-01-01` ||
    filters.dateEnd !== "" ||
    filters.tipoEvento !== "" ||
    filters.unidade !== "" ||
    filters.danos !== "" ||
    filters.turno !== "";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-gradient-header backdrop-blur-sm">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 border-b border-border/50 w-full gap-3 md:gap-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-severity-none animate-pulse-dot" />
            <span className="text-xs text-muted-foreground font-mono">
              {lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString("pt-BR")}` : "Carregando..."}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Atualiza a cada 5 min</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
            title="Recarregar Dados"
          >
            <RefreshCw
              size={14}
              className={`text-muted-foreground ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Title + Filters */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <DashboardSwitcher />

            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSc82dwssQmjmqrnE9ACIBHYX_b1FRqC3JwlVqs6M3TgEuWdig/viewform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium transition-colors flex-shrink-0"
            >
              <Plus size={16} />
              Registrar Evento
            </a>
          </div>

          <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full mt-3 border-t border-border/40 pt-4">
            <div className="hidden lg:flex items-center gap-1.5 mr-2">
              <Filter size={13} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Filtros</span>
            </div>

            <div className="flex-1 min-w-[115px] relative">
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 flex items-center justify-center p-1"
                onClick={() => startRef.current?.showPicker()}
                title="Abrir calendário"
              >
                <Calendar size={13} strokeWidth={2.5} />
              </div>
              <input
                ref={startRef}
                type="date"
                min={`${new Date().getFullYear()}-01-01`}
                max={new Date().toISOString().split("T")[0]}
                value={filters.dateStart}
                onChange={(e) => update("dateStart", e.target.value)}
                className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`}
                title="Data início"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <span className="text-muted-foreground text-xs text-center flex-shrink-0">até</span>
            <div className="flex-1 min-w-[115px] relative">
              <div
                className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 flex items-center justify-center p-1"
                onClick={() => endRef.current?.showPicker()}
                title="Abrir calendário"
              >
                <Calendar size={13} strokeWidth={2.5} />
              </div>
              <input
                ref={endRef}
                type="date"
                min={`${new Date().getFullYear()}-01-01`}
                max={new Date().toISOString().split("T")[0]}
                value={filters.dateEnd}
                onChange={(e) => update("dateEnd", e.target.value)}
                className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`}
                title="Data fim"
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="flex-1 min-w-[140px] relative">
              <select
                value={filters.unidade}
                onChange={(e) => update("unidade", e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os setores</option>
                {options.unidades.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[130px] relative">
              <select
                value={filters.tipoEvento}
                onChange={(e) => update("tipoEvento", e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os tipos</option>
                {options.tiposEvento.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[145px] relative">
              <select
                value={filters.danos}
                onChange={(e) => update("danos", e.target.value)}
                className={selectClass}
              >
                <option value="">Todas as gravidades</option>
                {options.danos.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[135px] relative">
              <select
                value={filters.turno}
                onChange={(e) => update("turno", e.target.value)}
                className={selectClass}
              >
                <option value="">Todos os turnos</option>
                {options.turnos.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <div className="flex-shrink-0 pl-1">
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
                >
                  Limpar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
