import { useFalhasMedicacao, MedErrorFilters } from "@/hooks/useFalhasMedicacao";
import {
  getMedErrorKPIs, getMedErrorEvolution, getMedErrorByTipo, getMedErrorByVia,
  getMedErrorTopMedicamentos, getMedErrorByTurno, getMedErrorByWeekday,
  getMedErrorHeatmap, generateMedErrorInsights,
} from "@/lib/medErrorAnalytics";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  MedErrorEvolutionChart, MedErrorTipoFalhaChart, MedErrorViaChart,
  MedErrorTopMedChart, MedErrorTurnoChart, MedErrorWeekdayChart,
  MedErrorHeatmapChart, MedErrorDataTable, MedErrorInsightsPanel,
} from "@/components/dashboard/MedErrorCharts";
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher";
import {
  RefreshCw, Filter, Calendar, Plus, AlertTriangle, CalendarDays,
  Pill, Clock, BarChart2, ShieldX, Moon, TrendingUp,
} from "lucide-react";
import { useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   CLASSES DE ESTILO
   ═══════════════════════════════════════════════════════ */

const inputClass =
  "bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 w-full placeholder:text-muted-foreground/40";

const selectClass =
  "filter-select bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 appearance-none cursor-pointer w-full truncate";

/* ═══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═══════════════════════════════════════════════════════ */

export default function FalhasMedicacao() {
  const {
    events, filteredEvents, loading, error,
    lastUpdated, filters, setFilters, options, refetch,
  } = useFalhasMedicacao();

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  /* ── Analytics (memoizados) ── */
  const kpis = useMemo(() => getMedErrorKPIs(filteredEvents), [filteredEvents]);
  const evolutionData = useMemo(() => getMedErrorEvolution(filteredEvents), [filteredEvents]);
  const tipoData = useMemo(() => getMedErrorByTipo(filteredEvents), [filteredEvents]);
  const viaData = useMemo(() => getMedErrorByVia(filteredEvents), [filteredEvents]);
  const topMedData = useMemo(() => getMedErrorTopMedicamentos(filteredEvents), [filteredEvents]);
  const turnoData = useMemo(() => getMedErrorByTurno(filteredEvents), [filteredEvents]);
  const weekdayData = useMemo(() => getMedErrorByWeekday(filteredEvents), [filteredEvents]);
  const heatmapData = useMemo(() => getMedErrorHeatmap(filteredEvents), [filteredEvents]);
  const insights = useMemo(() => generateMedErrorInsights(filteredEvents), [filteredEvents]);

  /* ── Filtros helpers ── */
  const update = (key: keyof MedErrorFilters, value: string) =>
    setFilters({ ...filters, [key]: value });

  const clearFilters = () =>
    setFilters({ dateStart: "", dateEnd: "", tipoFalha: "", via: "", medicamento: "" });

  const hasFilters =
    filters.dateStart !== "" || filters.dateEnd !== "" ||
    filters.tipoFalha !== "" || filters.via !== "" || filters.medicamento !== "";

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ════════════════════════════════════════════
          HEADER
          ════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-header backdrop-blur-sm">
        {/* Barra de status */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 border-b border-border/50 w-full gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-severity-none animate-pulse-dot" />
            <span className="text-xs text-muted-foreground font-mono">
              {lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString("pt-BR")}` : "Carregando..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Atualiza a cada 5 min</span>
            <button
              onClick={refetch}
              disabled={loading}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
              title="Recarregar"
            >
              <RefreshCw size={14} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Switcher + Filtros */}
        <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-4 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <DashboardSwitcher />
              <a
                href="https://forms.gle/4qXmfmeAVSfgd8Pc6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium transition-colors flex-shrink-0"
              >
                <Plus size={16} />Registrar Falha de Medicação
              </a>
            </div>

            {/* Barra de filtros */}
            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full mt-3 border-t border-border/40 pt-4">
              <div className="hidden lg:flex items-center gap-1.5 mr-2">
                <Filter size={13} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Filtros</span>
              </div>

              {/* Data início */}
              <div className="flex-1 min-w-[115px] relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 p-1" onClick={() => startRef.current?.showPicker()}>
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
              <span className="text-muted-foreground text-xs text-center flex-shrink-0">até</span>

              {/* Data fim */}
              <div className="flex-1 min-w-[115px] relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 p-1" onClick={() => endRef.current?.showPicker()}>
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

              {/* Tipo de Falha */}
              <div className="flex-1 min-w-[140px]">
                <select value={filters.tipoFalha} onChange={(e) => update("tipoFalha", e.target.value)} className={selectClass}>
                  <option value="">Todos os tipos</option>
                  {options.tiposFalha.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>

              {/* Via */}
              <div className="flex-1 min-w-[120px]">
                <select value={filters.via} onChange={(e) => update("via", e.target.value)} className={selectClass}>
                  <option value="">Todas as vias</option>
                  {options.vias.map((v) => (<option key={v} value={v}>{v}</option>))}
                </select>
              </div>

              {/* Medicamento */}
              <div className="flex-1 min-w-[140px]">
                <select value={filters.medicamento} onChange={(e) => update("medicamento", e.target.value)} className={selectClass}>
                  <option value="">Todos os medicamentos</option>
                  {options.medicamentos.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>

              {hasFilters && (
                <div className="flex-shrink-0 pl-1">
                  <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors">
                    Limpar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════
          CONTEÚDO PRINCIPAL
          ════════════════════════════════════════════ */}
      <main id="dashboard-content" className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-5 space-y-5 lg:space-y-6 w-full">

        {/* Loading */}
        {loading && filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando dados de falhas de medicação...</p>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="card-glass border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            ⚠ Erro ao carregar dados: {error}
          </div>
        )}

        {/* Vazio */}
        {!loading && filteredEvents.length === 0 && !error && (
          <div className="card-glass p-8 text-center text-muted-foreground text-sm">
            Nenhuma falha encontrada com os filtros selecionados.
          </div>
        )}

        {/* Dashboard */}
        {filteredEvents.length > 0 && (
          <>
            {/* ── KPIs Linha 1 ── */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 min-w-0">
                <KpiCard title="Total de Falhas" value={kpis.total} icon={<AlertTriangle className="text-destructive" />} variant="danger" mono />
                <KpiCard title="Últimos 30 dias" value={kpis.last30} icon={<CalendarDays className="text-muted-foreground" />} mono trend={kpis.trend} trendLabel="vs 30d ant." />
                <KpiCard title="Média/Mês" value={kpis.mediaPorMes} icon={<BarChart2 className="text-muted-foreground" />} mono subtitle="falhas por mês" />
                <KpiCard title="Horário Incorreto" value={`${kpis.taxaHorarioIncorreto}%`} icon={<Clock className="text-amber-500" />} variant="warning" mono subtitle="falhas de horário" />
                <KpiCard title="Medicamentos Únicos" value={kpis.medicamentosUnicos} icon={<Pill className="text-primary" />} variant="primary" mono subtitle="envolvidos em falhas" />
              </div>
            </section>

            {/* ── KPIs Linha 2 ── */}
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-w-0">
                {kpis.topMedicamento && (
                  <KpiCard
                    title="Medicamento Mais Citado"
                    value={kpis.topMedicamento[0].length > 22 ? kpis.topMedicamento[0].slice(0, 20) + "…" : kpis.topMedicamento[0]}
                    icon={<Pill className="text-destructive" />}
                    variant="danger"
                    subtitle={`${kpis.topMedicamento[1]} ocorrências`}
                  />
                )}
                {kpis.topTipoFalha && (
                  <KpiCard
                    title="Falha Mais Frequente"
                    value={kpis.topTipoFalha[0].length > 22 ? kpis.topTipoFalha[0].slice(0, 20) + "…" : kpis.topTipoFalha[0]}
                    icon={<ShieldX className="text-amber-500" />}
                    variant="warning"
                    subtitle={`${kpis.topTipoFalha[1]} ocorrências`}
                  />
                )}
                {kpis.topVia && (
                  <KpiCard
                    title="Via Mais Envolvida"
                    value={kpis.topVia[0]}
                    icon={<TrendingUp className="text-primary" />}
                    subtitle={`${kpis.topVia[1]} falhas`}
                  />
                )}
                <KpiCard
                  title="Fim de Semana"
                  value={`${kpis.eventosFimDeSemana}`}
                  icon={<Moon className="text-purple-400" />}
                  mono
                  subtitle={`${kpis.total > 0 ? ((kpis.eventosFimDeSemana / kpis.total) * 100).toFixed(0) : 0}% do total`}
                />
              </div>
            </section>

            {/* ── Insights ── */}
            <MedErrorInsightsPanel insights={insights} />

            {/* ── Evolução + Tipo de Falha ── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <MedErrorEvolutionChart data={evolutionData} />
              <MedErrorTipoFalhaChart data={tipoData} />
            </section>

            {/* ── Top Medicamentos + Via ── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <MedErrorTopMedChart data={topMedData} />
              <MedErrorViaChart data={viaData} />
            </section>

            {/* ── Turno + Dia da semana ── */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MedErrorTurnoChart data={turnoData} />
              <MedErrorWeekdayChart data={weekdayData} />
            </section>

            {/* ── Heatmap ── */}
            <section>
              <MedErrorHeatmapChart data={heatmapData} />
            </section>

            {/* ── Tabela ── */}
            <section className="grid grid-cols-1 gap-4 mt-4">
              <MedErrorDataTable events={filteredEvents} />
            </section>
          </>
        )}
      </main>

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer className="border-t border-border px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground w-full gap-2 sm:gap-0 text-center sm:text-left">
        <span>Núcleo de Segurança do Paciente · Dashboard de Falhas de Medicação</span>
        <span>Fonte: Google Sheets · {filteredEvents.length} registros</span>
      </footer>
    </div>
  );
}
