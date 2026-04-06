import { useQuedas, FallFilters } from "@/hooks/useQuedas";
import {
  getFallKPIs,
  getFallEvolutionData,
  getFallByLocalData,
  getFallByUnidadeData,
  getReincidentesData,
  getAcompanhanteDanoData,
  getFallByWeekdayData,
  getFallByTurnoData,
  getFallHeatmapData,
  generateFallInsights,
} from "@/lib/fallsAnalytics";
import { KpiCard, KpiGrid } from "@/components/dashboard/KpiCard";
import {
  FallEvolutionChart,
  FallLocalChart,
  FallUnidadeChart,
  ReincidentesTable,
  AcompanhanteDanoChart,
  FallTurnoChart,
  FallWeekdayChart,
  FallHeatmapChart,
  FallDataTable,
  FallInsightsPanel,
} from "@/components/dashboard/FallsCharts";
import {
  RefreshCw,
  Filter,
  Calendar,
  Plus,
  ArrowDownCircle,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  UserX,
  Users,
  MapPin,
  Repeat,
  Moon,
  Activity,
} from "lucide-react";
import { useRef } from "react";
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher";

const inputClass =
  "bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 w-full placeholder:text-muted-foreground/40";

const selectClass =
  "filter-select bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 appearance-none cursor-pointer w-full truncate";

export default function Quedas() {
  const {
    events,
    filteredEvents,
    loading,
    error,
    lastUpdated,
    filters,
    setFilters,
    options,
    refetch,
  } = useQuedas();
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const kpis = getFallKPIs(filteredEvents, events);
  const evolutionData = getFallEvolutionData(filteredEvents);
  const localData = getFallByLocalData(filteredEvents);
  const unidadeData = getFallByUnidadeData(filteredEvents);
  const reincidentes = getReincidentesData(filteredEvents);
  const acompanhanteDano = getAcompanhanteDanoData(filteredEvents);
  const weekdayData = getFallByWeekdayData(filteredEvents);
  const turnoData = getFallByTurnoData(filteredEvents);
  const heatmapData = getFallHeatmapData(filteredEvents);
  const insights = generateFallInsights(filteredEvents, events);

  const update = (key: keyof FallFilters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const clearFilters = () =>
    setFilters({
      dateStart: "2024-01-01",
      dateEnd: "",
      localQueda: "",
      unidade: "",
      dano: "all",
      acompanhante: "all",
    });

  const hasFilters =
    filters.dateStart !== "2024-01-01" ||
    filters.dateEnd !== "" ||
    filters.localQueda !== "" ||
    filters.unidade !== "" ||
    filters.dano !== "all" ||
    filters.acompanhante !== "all";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ──── HEADER ──── */}
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-header backdrop-blur-sm">
        {/* Status bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 border-b border-border/50 w-full gap-3 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-severity-none animate-pulse-dot" />
              <span className="text-xs text-muted-foreground font-mono">
                {lastUpdated
                  ? `Atualizado ${lastUpdated.toLocaleTimeString("pt-BR")}`
                  : "Carregando..."}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Atualiza a cada 5 min</span>
            <button
              onClick={refetch}
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
                Registrar Queda
              </a>
            </div>

            {/* Falls-specific filters */}
            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full mt-3 border-t border-border/40 pt-4">
              <div className="hidden lg:flex items-center gap-1.5 mr-2">
                <Filter size={13} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Filtros
                </span>
              </div>

              {/* Dates */}
              <div className="flex-1 min-w-[115px] relative">
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 flex items-center justify-center p-1"
                  onClick={() => startRef.current?.showPicker()}
                >
                  <Calendar size={13} strokeWidth={2.5} />
                </div>
                <input
                  ref={startRef}
                  type="date"
                  min="2024-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  value={filters.dateStart}
                  onChange={(e) => update("dateStart", e.target.value)}
                  className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`}
                />
              </div>
              <span className="text-muted-foreground text-xs text-center flex-shrink-0">
                até
              </span>
              <div className="flex-1 min-w-[115px] relative">
                <div
                  className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 flex items-center justify-center p-1"
                  onClick={() => endRef.current?.showPicker()}
                >
                  <Calendar size={13} strokeWidth={2.5} />
                </div>
                <input
                  ref={endRef}
                  type="date"
                  min="2024-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  value={filters.dateEnd}
                  onChange={(e) => update("dateEnd", e.target.value)}
                  className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`}
                />
              </div>

              {/* Unidade */}
              <div className="flex-1 min-w-[140px] relative">
                <select
                  value={filters.unidade}
                  onChange={(e) => update("unidade", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Todos os setores</option>
                  {options.unidades.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Local */}
              <div className="flex-1 min-w-[130px] relative">
                <select
                  value={filters.localQueda}
                  onChange={(e) => update("localQueda", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Todos os locais</option>
                  {options.locais.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Com/Sem Dano */}
              <div className="flex-1 min-w-[120px] relative">
                <select
                  value={filters.dano}
                  onChange={(e) => update("dano", e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Ambos</option>
                  <option value="sim">Com Dano</option>
                  <option value="nao">Sem Dano</option>
                </select>
              </div>

              {/* Acompanhante */}
              <div className="flex-1 min-w-[130px] relative">
                <select
                  value={filters.acompanhante}
                  onChange={(e) => update("acompanhante", e.target.value)}
                  className={selectClass}
                >
                  <option value="all">Ambos</option>
                  <option value="sim">Com Acompanhante</option>
                  <option value="nao">Sem Acompanhante</option>
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

      {/* ──── MAIN ──── */}
      <main
        id="dashboard-content"
        className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-5 space-y-5 lg:space-y-6 w-full"
      >
        {loading && filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Carregando dados de quedas do Google Sheets...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="card-glass border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            ⚠️ Erro ao carregar dados: {error}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && !error && (
          <div className="card-glass p-8 text-center text-muted-foreground text-sm">
            Nenhuma queda encontrada com os filtros selecionados.
          </div>
        )}

        {filteredEvents.length > 0 && (
          <>
            {/* ──── KPI CARDS ──── */}
            <section className="space-y-3 overflow-x-auto pb-2">
              <div className="flex flex-col md:flex-row gap-3 md:min-w-max w-full">
                <div className="flex-1 min-w-[140px]"><KpiCard title="Total de Quedas" value={kpis.total} icon={<ArrowDownCircle className="text-primary" />} variant="primary" mono /></div>
                <div className="flex-1 min-w-[140px]"><KpiCard title="Últimos 30 dias" value={kpis.last30} icon={<CalendarDays className="text-muted-foreground" />} mono trend={kpis.trend} trendLabel="vs 30d ant." /></div>
                <div className="flex-1 min-w-[140px]"><KpiCard title="Quedas com Dano" value={kpis.comDano} icon={<AlertTriangle className="text-destructive" />} variant="danger" mono subtitle={`${kpis.taxaDano}% do total`} /></div>
                <div className="flex-1 min-w-[140px]"><KpiCard title="Quedas sem Dano" value={kpis.semDano} icon={<ShieldCheck className="text-severity-none" />} variant="success" mono subtitle={`${(100 - parseFloat(kpis.taxaDano)).toFixed(1)}%`} /></div>
                <div className="flex-1 min-w-[140px]"><KpiCard title="Sem Acompanhante" value={`${kpis.taxaSemAcompanhante}%`} icon={<UserX className="text-severity-moderate" />} variant="warning" mono subtitle={`${kpis.semAcompanhante} de ${kpis.total}`} /></div>
                <div className="flex-1 min-w-[140px]"><KpiCard title="Média/Mês" value={kpis.mediaQuedaMes} icon={<Activity className="text-muted-foreground" />} mono subtitle="quedas por mês" /></div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:min-w-max w-full">
                <div className="flex-1 min-w-[160px]"><KpiCard title="Reincidentes" value={kpis.pacientesReincidentes} icon={<Repeat className="text-severity-moderate" />} variant="warning" mono subtitle={`${kpis.taxaReincidencia}% dos pacientes`} /></div>
                {kpis.topLocal && <div className="flex-1 min-w-[160px]"><KpiCard title="Local Mais Frequente" value={kpis.topLocal[0]} icon={<MapPin className="text-primary" />} subtitle={`${kpis.topLocal[1]} quedas`} /></div>}
                {kpis.topUnidade && <div className="flex-1 min-w-[160px]"><KpiCard title="Setor Mais Afetado" value={kpis.topUnidade[0]} icon={<Users className="text-destructive" />} variant="danger" subtitle={`${kpis.topUnidade[1]} quedas`} /></div>}
                <div className="flex-1 min-w-[160px]"><KpiCard title="Quedas Noturnas" value={`${kpis.taxaNoturna}%`} icon={<Moon className="text-purple-400" />} mono subtitle={`${kpis.quedaNoturna} no turno noturno`} /></div>
              </div>
            </section>

            {/* ──── INSIGHTS ──── */}
            <FallInsightsPanel insights={insights} />

            {/* ──── Evolução + Local da Queda ──── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FallEvolutionChart data={evolutionData} />
              <FallLocalChart data={localData} />
            </section>

            {/* ──── Acompanhante×Dano + Turno ──── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <AcompanhanteDanoChart data={acompanhanteDano} />
              <FallUnidadeChart data={unidadeData} />
            </section>

            {/* ──── Dia da semana + Heatmap ──── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FallTurnoChart data={turnoData} />
              <FallHeatmapChart data={heatmapData} />
            </section>

            {/* ──── Pacientes Reincidentes + Dia da Semana ──── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FallWeekdayChart data={weekdayData} />
              <ReincidentesTable data={reincidentes} />
            </section>

            {/* ──── Tabela de dados ──── */}
            <section className="grid grid-cols-1 gap-4 mt-4">
              <FallDataTable events={filteredEvents} />
            </section>
          </>
        )}
      </main>

      {/* ──── FOOTER ──── */}
      <footer className="border-t border-border px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground w-full gap-2 sm:gap-0 text-center sm:text-left">
        <span>Núcleo de Segurança do Paciente · Dashboard de Quedas</span>
        <span>
          Fonte: Google Sheets · {filteredEvents.length} registros
        </span>
      </footer>
    </div>
  );
}
