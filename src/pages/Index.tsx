import { useAdverseEvents } from "@/hooks/useAdverseEvents";
import { getKPIs, getEvolutionData, getByTypeData, getByDamageData, getByUnidadeData, getByWeekdayData, getHeatmapData, getParetoData } from "@/lib/analytics";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KpiCard, KpiGrid } from "@/components/dashboard/KpiCard";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { EvolutionChart, EventTypeChart, DamageChart, UnidadeBarChart, WeekdayChart, ParetoChart, HeatmapChart } from "@/components/dashboard/Charts";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { 
  FileText, 
  CalendarDays, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Repeat, 
  BarChart2, 
  Siren 
} from "lucide-react";

export default function Index() {
  const { events, filteredEvents, loading, error, lastUpdated, filters, setFilters, options, refetch } = useAdverseEvents();

  const kpis = getKPIs(filteredEvents, events);
  const evolutionData = getEvolutionData(filteredEvents);
  const typeData = getByTypeData(filteredEvents);
  const damageData = getByDamageData(filteredEvents);
  const unidadeData = getByUnidadeData(filteredEvents);
  const weekdayData = getByWeekdayData(filteredEvents);
  const heatmapData = getHeatmapData(filteredEvents);
  const paretoData = getParetoData(filteredEvents);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader
        filters={filters}
        setFilters={setFilters}
        options={options}
        lastUpdated={lastUpdated}
        onRefresh={refetch}
        loading={loading}
      />

      <main id="dashboard-content" className="flex-1 px-4 md:px-6 xl:px-8 py-5 space-y-5 lg:space-y-6 max-w-7xl w-full mx-auto">
        {/* Loading / Error state */}
        {loading && filteredEvents.length === 0 && (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Carregando dados do Google Sheets...</p>
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
            Nenhum evento encontrado com os filtros selecionados.
          </div>
        )}

        {filteredEvents.length > 0 && (
          <>
            {/* KPI Cards */}
            <section>
              <KpiGrid>
                <KpiCard
                  title="Total de Eventos"
                  value={kpis.total}
                  icon={<FileText className="text-primary" />}
                  variant="primary"
                  mono
                  subtitle={`de ${events.length} no total`}
                />
                <KpiCard
                  title="Últimos 30 dias"
                  value={kpis.last30}
                  icon={<CalendarDays className="text-muted-foreground" />}
                  mono
                  trend={kpis.trend}
                  trendLabel="vs 30d anteriores"
                />
                <KpiCard
                  title="Com Dano"
                  value={kpis.withDamage}
                  icon={<Activity className="text-severity-moderate" />}
                  variant="warning"
                  mono
                  subtitle={`${kpis.damagePct}% do total`}
                />
                <KpiCard
                  title="Sem Dano"
                  value={kpis.withoutDamage}
                  icon={<ShieldCheck className="text-severity-none" />}
                  variant="success"
                  mono
                  subtitle={`${(100 - parseFloat(kpis.damagePct)).toFixed(1)}% do total`}
                />
                <KpiCard
                  title="Críticos"
                  value={kpis.critical}
                  icon={<AlertTriangle className="text-destructive" />}
                  variant="danger"
                  mono
                  subtitle={`${kpis.criticalPct}% (Severo/Morte)`}
                />
                <KpiCard
                  title="T. Médio Resolução"
                  value={kpis.avgResolutionDays === "N/A" ? "N/A" : `${kpis.avgResolutionDays}d`}
                  icon={<Clock className="text-muted-foreground" />}
                  mono
                  subtitle="dias após registro"
                />
              </KpiGrid>

              {/* Advanced KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {kpis.topUnidade && (
                  <KpiCard
                    title="Setor Crítico"
                    value={kpis.topUnidade[0].replace("Unidade de ", "").replace("Bloco ", "")}
                    icon={<Building2 className="text-destructive" />}
                    variant="danger"
                    subtitle={`${kpis.topUnidade[1]} eventos`}
                  />
                )}
                {kpis.topType && (
                  <KpiCard
                    title="Evento + Recorrente"
                    value={kpis.topType[0].length > 22 ? kpis.topType[0].slice(0, 20) + "..." : kpis.topType[0]}
                    icon={<Repeat className="text-severity-moderate" />}
                    variant="warning"
                    subtitle={`${kpis.topType[1]} ocorrências`}
                  />
                )}
                <KpiCard
                  title="Taxa de Eventos c/ Dano"
                  value={`${kpis.damagePct}%`}
                  icon={<BarChart2 className="text-muted-foreground" />}
                  mono
                  subtitle="eventos que causaram dano"
                />
                <KpiCard
                  title="Taxa Críticos"
                  value={`${kpis.criticalPct}%`}
                  icon={<Siren className={parseFloat(kpis.criticalPct) > 5 ? "text-destructive" : "text-muted-foreground"} />}
                  variant={parseFloat(kpis.criticalPct) > 5 ? "danger" : "default"}
                  mono
                  subtitle="Severo ou Morte"
                />
              </div>
            </section>

            {/* Insights */}
            <InsightsPanel events={filteredEvents} allEvents={events} />

            {/* Evolution + Event Type */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <EvolutionChart data={evolutionData} />
              <EventTypeChart data={typeData} />
            </section>

            {/* Damage + Sector breakdown */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <DamageChart data={damageData} />
              <UnidadeBarChart data={unidadeData} />
            </section>

            {/* Weekday + Heatmap */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <WeekdayChart data={weekdayData} />
              <HeatmapChart data={heatmapData} />
            </section>

            {/* Pareto */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ParetoChart data={paretoData} />
              <PerformanceTable events={filteredEvents} />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-border px-6 py-3 flex items-center justify-between text-xs text-muted-foreground w-full max-w-7xl mx-auto">
        <span>Núcleo de Segurança do Paciente · Dashboard de Eventos Adversos</span>
        <span>Fonte: Google Sheets · {filteredEvents.length} registros</span>
      </footer>
    </div>
  );
}
