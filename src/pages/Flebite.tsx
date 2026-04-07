import { useFlebite, PhlebitisFilters } from "@/hooks/useFlebite";
import {
  getPhlebitisKPIs, getPhlebitisEvolution, getPhlebitisByMembro, getPhlebitisByUnidade,
  getPhlebitisBySinais, getPhlebitisReincidentes,
  getPhlebitisByWeekday, getPhlebitisHeatmap, getPhlebitisByTurno, generatePhlebitisInsights,
} from "@/lib/phlebitisAnalytics";
import { KpiCard, KpiGrid } from "@/components/dashboard/KpiCard";
import {
  PhlebitisEvolutionChart, PhlebitisMembroChart, PhlebitisSinaisChart,
  PhlebitisUnidadeChart, PhlebitisReincidentesTable,
  PhlebitisWeekdayChart, PhlebitisHeatmapChart, PhlebitisDataTable, PhlebitisInsightsPanel,
} from "@/components/dashboard/PhlebitisCharts";
import { DashboardSwitcher } from "@/components/dashboard/DashboardSwitcher";
import {
  RefreshCw, Filter, Calendar, Plus, Syringe, CalendarDays, Activity,
  AlertTriangle, Repeat, Building2, Thermometer, BarChart2,
} from "lucide-react";
import { useRef } from "react";

const inputClass = "bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 w-full placeholder:text-muted-foreground/40";
const selectClass = "filter-select bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 appearance-none cursor-pointer w-full truncate";

export default function Flebite() {
  const { events, filteredEvents, loading, error, lastUpdated, filters, setFilters, options, refetch } = useFlebite();
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const kpis = getPhlebitisKPIs(filteredEvents, events);
  const evolutionData = getPhlebitisEvolution(filteredEvents);
  const membroData = getPhlebitisByMembro(filteredEvents);
  const unidadeData = getPhlebitisByUnidade(filteredEvents);
  const sinaisData = getPhlebitisBySinais(filteredEvents);
  const reincidentes = getPhlebitisReincidentes(filteredEvents);
  const weekdayData = getPhlebitisByWeekday(filteredEvents);
  const heatmapData = getPhlebitisHeatmap(filteredEvents);
  const insights = generatePhlebitisInsights(filteredEvents, events);

  const update = (key: keyof PhlebitisFilters, value: string) => setFilters({ ...filters, [key]: value });
  const clearFilters = () => setFilters({ dateStart: `${new Date().getFullYear()}-01-01`, dateEnd: "", membro: "", unidade: "", tipoCateter: "" });
  const hasFilters = filters.dateStart !== `${new Date().getFullYear()}-01-01` || filters.dateEnd !== "" || filters.membro !== "" || filters.unidade !== "" || filters.tipoCateter !== "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-gradient-header backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 border-b border-border/50 w-full gap-3 md:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-severity-none animate-pulse-dot" />
            <span className="text-xs text-muted-foreground font-mono">{lastUpdated ? `Atualizado ${lastUpdated.toLocaleTimeString("pt-BR")}` : "Carregando..."}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Atualiza a cada 5 min</span>
            <button onClick={refetch} disabled={loading} className="p-1.5 rounded-md hover:bg-secondary transition-colors disabled:opacity-50" title="Recarregar">
              <RefreshCw size={14} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-4 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <DashboardSwitcher />
              <a href="https://forms.gle/tRXkTqPYmsMRtfaE7" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 rounded-md text-sm font-medium transition-colors flex-shrink-0">
                <Plus size={16} />Registrar Flebite
              </a>
            </div>

            <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full mt-3 border-t border-border/40 pt-4">
              <div className="hidden lg:flex items-center gap-1.5 mr-2">
                <Filter size={13} className="text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Filtros</span>
              </div>

              <div className="flex-1 min-w-[115px] relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 p-1" onClick={() => startRef.current?.showPicker()}>
                  <Calendar size={13} strokeWidth={2.5} />
                </div>
                <input ref={startRef} type="date" min={`${new Date().getFullYear()}-01-01`} max={new Date().toISOString().split("T")[0]} value={filters.dateStart} onChange={(e) => update("dateStart", e.target.value)} className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`} />
              </div>
              <span className="text-muted-foreground text-xs text-center flex-shrink-0">até</span>
              <div className="flex-1 min-w-[115px] relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer text-white hover:text-white/80 transition-colors z-10 p-1" onClick={() => endRef.current?.showPicker()}>
                  <Calendar size={13} strokeWidth={2.5} />
                </div>
                <input ref={endRef} type="date" min="2024-01-01" max={new Date().toISOString().split("T")[0]} value={filters.dateEnd} onChange={(e) => update("dateEnd", e.target.value)} className={`${inputClass} pl-8 [&::-webkit-calendar-picker-indicator]:hidden`} />
              </div>

              <div className="flex-1 min-w-[140px]">
                <select value={filters.unidade} onChange={(e) => update("unidade", e.target.value)} className={selectClass}>
                  <option value="">Todos os setores</option>
                  {options.unidades.map((u) => (<option key={u} value={u}>{u}</option>))}
                </select>
              </div>

              <div className="flex-1 min-w-[120px]">
                <select value={filters.membro} onChange={(e) => update("membro", e.target.value)} className={selectClass}>
                  <option value="">Todos os membros</option>
                  {options.membros.map((m) => (<option key={m} value={m}>{m}</option>))}
                </select>
              </div>

              <div className="flex-1 min-w-[130px]">
                <select value={filters.tipoCateter} onChange={(e) => update("tipoCateter", e.target.value)} className={selectClass}>
                  <option value="">Tipo de cateter</option>
                  {options.tipos.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>

              {hasFilters && (
                <div className="flex-shrink-0 pl-1">
                  <button onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors">Limpar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="dashboard-content" className="flex-1 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-5 space-y-5 lg:space-y-6 w-full">
        {loading && filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando dados de flebite...</p>
            </div>
          </div>
        )}

        {error && <div className="card-glass border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">⚠️ Erro: {error}</div>}
        {!loading && filteredEvents.length === 0 && !error && <div className="card-glass p-8 text-center text-muted-foreground text-sm">Nenhuma flebite encontrada com os filtros selecionados.</div>}

        {filteredEvents.length > 0 && (
          <>
            {/* KPIs */}
            <section className="space-y-3 overflow-x-auto pb-2">
              <div className="flex flex-col md:flex-row gap-3 md:min-w-max w-full">
                <div className="flex-1 min-w-[160px]"><KpiCard title="Total de Flebites" value={kpis.total} icon={<Syringe className="text-primary" />} variant="primary" mono /></div>
                <div className="flex-1 min-w-[160px]"><KpiCard title="Últimos 30 dias" value={kpis.last30} icon={<CalendarDays className="text-muted-foreground" />} mono trend={kpis.trend} trendLabel="vs 30d ant." /></div>
                <div className="flex-1 min-w-[160px]"><KpiCard title="Cateter Periférico" value={kpis.periferico} icon={<Activity className="text-emerald-500" />} variant="success" mono subtitle={`${kpis.total > 0 ? ((kpis.periferico / kpis.total) * 100).toFixed(0) : 0}% do total`} /></div>
                <div className="flex-1 min-w-[160px]"><KpiCard title="Cateter Central" value={kpis.central} icon={<AlertTriangle className="text-destructive" />} variant="danger" mono subtitle={`${kpis.taxaCentral}% — risco elevado`} /></div>
                <div className="flex-1 min-w-[160px]"><KpiCard title="Média/Mês" value={kpis.mediaQuedaMes} icon={<BarChart2 className="text-muted-foreground" />} mono subtitle="flebites/mês" /></div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:min-w-max w-full">
                <div className="flex-1 min-w-[180px]"><KpiCard title="Reincidentes" value={kpis.pacientesReincidentes} icon={<Repeat className="text-amber-500" />} variant="warning" mono subtitle={`${kpis.taxaReincidencia}% dos pacientes`} /></div>
                {kpis.topMembro && <div className="flex-1 min-w-[180px]"><KpiCard title="Membro Mais Afetado" value={kpis.topMembro[0]} icon={<Thermometer className="text-primary" />} variant="primary" subtitle={`${kpis.topMembro[1]} ocorrências`} /></div>}
                {kpis.topUnidade && <div className="flex-1 min-w-[180px]"><KpiCard title="Setor Mais Afetado" value={kpis.topUnidade[0]} icon={<Building2 className="text-muted-foreground" />} subtitle={`${kpis.topUnidade[1]} flebites`} /></div>}
                {kpis.topSinal && <div className="flex-1 min-w-[180px]"><KpiCard title="Sinal Mais Comum" value={kpis.topSinal[0]} icon={<AlertTriangle className="text-amber-500" />} variant="warning" subtitle={`${kpis.topSinal[1]} relatos`} /></div>}
              </div>
            </section>

            <PhlebitisInsightsPanel insights={insights} />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PhlebitisEvolutionChart data={evolutionData} />
              <PhlebitisMembroChart data={membroData} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PhlebitisSinaisChart data={sinaisData} />
              <PhlebitisUnidadeChart data={unidadeData} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <PhlebitisWeekdayChart data={weekdayData} />
              <PhlebitisHeatmapChart data={heatmapData} />
            </section>

            <section className="grid grid-cols-1 gap-4">
              <PhlebitisReincidentesTable data={reincidentes} />
            </section>

            <section className="grid grid-cols-1 gap-4 mt-4">
              <PhlebitisDataTable events={filteredEvents} />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border px-4 sm:px-6 md:px-10 lg:px-16 xl:px-[10rem] py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground w-full gap-2 sm:gap-0 text-center sm:text-left">
        <span>Núcleo de Segurança do Paciente · Dashboard de Flebite</span>
        <span>Fonte: Google Sheets · {filteredEvents.length} registros</span>
      </footer>
    </div>
  );
}
