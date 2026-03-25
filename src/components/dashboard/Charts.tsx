import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  AreaChart,
  Area,
  ReferenceLine,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const CHART_COLORS = [
  "hsl(199, 89%, 48%)",
  "hsl(172, 66%, 50%)",
  "hsl(47, 96%, 53%)",
  "hsl(25, 95%, 53%)",
  "hsl(0, 72%, 55%)",
  "hsl(280, 65%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(328, 86%, 70%)",
];

const DAMAGE_COLORS: Record<string, string> = {
  Nenhum: "hsl(142, 71%, 45%)",
  Leve: "hsl(47, 96%, 53%)",
  Moderado: "hsl(25, 95%, 53%)",
  Severo: "hsl(0, 72%, 55%)",
  Morte: "hsl(280, 65%, 50%)",
};

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 11%)",
  border: "1px solid hsl(220, 14%, 18%)",
  borderRadius: "8px",
  color: "hsl(210, 20%, 92%)",
  fontSize: "12px",
};

const axisStyle = {
  fill: "hsl(215, 15%, 52%)",
  fontSize: 11,
};

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl border border-border/60
        bg-gradient-to-br from-card to-card/80
        p-5 transition-all duration-300
        hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5
        animate-fade-in ${className}
      `}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface EvolutionData {
  month: string;
  total: number;
  critical: number;
}

export function EvolutionChart({ data }: { data: EvolutionData[] }) {
  return (
    <ChartCard
      title="Evolução Temporal"
      subtitle="Frequência histórica de eventos e criticidade"
      className="lg:col-span-2"
    >
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ ...axisStyle, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />

            <YAxis
              tick={{ ...axisStyle, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
                padding: "8px 12px"
              }}
              itemStyle={{ fontWeight: 500 }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
            />

            <Legend
              wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))", paddingTop: "10px" }}
              iconType="circle"
              iconSize={8}
            />

            <Area
              type="monotone"
              dataKey="total"
              name="Total de Eventos"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(199, 89%, 48%)", filter: "drop-shadow(0 0 4px hsl(199 89% 48% / 0.5))" }}
            />

            <Area
              type="monotone"
              dataKey="critical"
              name="Críticos (Severo/Morte)"
              stroke="hsl(0, 72%, 55%)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCritical)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "hsl(0, 72%, 55%)", filter: "drop-shadow(0 0 4px hsl(0 72% 55% / 0.5))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

interface PieData {
  name: string;
  value: number;
}

export function EventTypeChart({ data }: { data: PieData[] }) {
  const top = data.slice(0, 7);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Por Tipo de Evento" subtitle="Ranking das principais recorrências">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {top.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = CHART_COLORS[i % CHART_COLORS.length];

          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5 max-w-[75%]">
                  <div
                    className="w-1.5 h-3.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                  />
                  <span className="font-semibold text-foreground/90 tracking-tight truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{item.value}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

export function DamageChart({ data }: { data: PieData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // Ordem lógica de gravidade
  const order = ["Nenhum", "Leve", "Moderado", "Severo", "Morte"];
  const sortedData = [...data].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  return (
    <ChartCard title="Por Gravidade do Dano" subtitle="Distribuição e percentuais">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {sortedData.map((item) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = DAMAGE_COLORS[item.name] || CHART_COLORS[0];

          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full ring-2 ring-offset-1"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}80`,
                      "--tw-ring-color": `${color}40`,
                      "--tw-ring-offset-color": "hsl(var(--card))"
                    } as React.CSSProperties}
                  />
                  <span className="font-semibold text-foreground/90 tracking-tight">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{item.value}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

interface UnidadeData {
  unidade: string;
  total: number;
  Nenhum: number;
  Leve: number;
  Moderado: number;
  Severo: number;
  Morte: number;
}

export function UnidadeBarChart({ data }: { data: UnidadeData[] }) {
  // Ordenar pelos maiores volumes para o visual ficar num formato funil decrescente elegante
  const sorted = [...data].sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(...sorted.map((d) => d.total), 1);
  const categories = ["Nenhum", "Leve", "Moderado", "Severo", "Morte"];

  return (
    <ChartCard
      title="Eventos por Setor × Gravidade"
      subtitle="Volume e distribuição empilhada de danos"
      className="lg:col-span-2 flex flex-col"
    >
      <div className="flex-1 w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col gap-4 lg:gap-5 pr-2 overflow-y-auto custom-scrollbar">
        {sorted.map((row) => {
          // Define the max length of the stacked bar based on its size relative to the largest unit
          const overallPct = (row.total / maxTotal) * 100;

          return (
            <div key={row.unidade} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <span className="font-semibold text-foreground/90 tracking-tight truncate max-w-[75%]">
                  {row.unidade}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">
                    {row.total}
                  </span>
                </div>
              </div>

              {/* HTML Stacked Progress Bar */}
              <div className="w-full bg-muted/10 rounded-full h-2 flex overflow-hidden group-hover:bg-muted/20 transition-colors duration-300">
                <div
                  className="h-full flex overflow-hidden rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallPct}%` }}
                >
                  {categories.map((cat) => {
                    const catValue = row[cat as keyof typeof row] as number;
                    if (catValue === 0) return null;

                    const innerPct = row.total > 0 ? (catValue / row.total) * 100 : 0;
                    const color = DAMAGE_COLORS[cat];

                    return (
                      <div
                        key={cat}
                        className="h-full relative group-hover:brightness-110 transition-all cursor-pointer"
                        style={{ width: `${innerPct}%`, backgroundColor: color }}
                        title={`${cat}: ${catValue} evento(s)`}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Mini-Legend */}
      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground justify-center">
        {categories.map(cat => (
          <div key={cat} className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: DAMAGE_COLORS[cat], boxShadow: `0 0 4px ${DAMAGE_COLORS[cat]}80` }}
            />
            <span className="tracking-wide uppercase font-medium">{cat}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

interface WeekdayData {
  day: string;
  count: number;
}

export function WeekdayChart({ data }: { data: WeekdayData[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <ChartCard title="Por Dia da Semana" subtitle="Volume e frequência de eventos">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex items-end justify-between gap-2 lg:gap-4 pt-6 pb-2">
        {data.map((item, i) => {
          const isWeekend = i === 0 || i === 6;
          const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

          return (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative">
              <div
                className="w-full relative flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-1 mt-auto"
                style={{ height: '100%' }}
              >
                {/* Count Label Above Bar */}
                <div className="w-full flex justify-center mb-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                  <span className={`text-[11px] font-bold transition-colors ${isWeekend ? 'text-muted-foreground/80' : 'text-foreground/90'} group-hover:text-primary`}>
                    {item.count}
                  </span>
                </div>

                {/* Modern Bar with Gradient */}
                <div
                  className={`w-full rounded-t-[5px] transition-all duration-300 ease-out overflow-hidden relative
                    bg-gradient-to-t from-primary/10 to-primary/80 border-t border-primary group-hover:to-primary group-hover:shadow-[0_0_15px_hsl(199_89%_48%/0.3)]
                    ${isWeekend ? 'opacity-60 saturate-50' : ''}
                  `}
                  style={{ height: `${heightPct}%`, minHeight: '4px' }}
                >
                  {/* Subtle inner glare on hover */}
                  <div className="absolute inset-0 bg-white/10 w-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>

              {/* Day Label */}
              <span className={`mt-3 text-[11px] font-medium transition-colors duration-200 uppercase tracking-widest
                ${isWeekend ? 'text-muted-foreground/60' : 'text-muted-foreground/90'}
                group-hover:text-primary
              `}>
                {item.day.substring(0, 3)}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

interface ParetoData {
  name: string;
  fullName: string;
  value: number;
  cumulative: number;
}

export function ParetoChart({ data }: { data: ParetoData[] }) {
  const topData = data.slice(0, 7);
  // O total é baseado em todos os dados para que a porcentagem mostre a representatividade real
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Concentração de Causas"
      subtitle="Principais focos de eventos adversos"
    >
      <div className="w-full h-[260px] md:h-[300px] 2xl:h-[360px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {topData.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = CHART_COLORS[i % CHART_COLORS.length];

          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5 max-w-[70%]">
                  <div
                    className="w-2 h-2 rounded-full ring-2 ring-offset-1 flex-shrink-0"
                    style={{
                      backgroundColor: color,
                      boxShadow: `0 0 8px ${color}80`,
                      "--tw-ring-color": `${color}40`,
                      "--tw-ring-offset-color": "hsl(var(--card))"
                    } as React.CSSProperties}
                  />
                  <span className="font-semibold text-foreground/90 tracking-tight truncate" title={item.fullName}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{item.value}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

export function HeatmapChart({ data }: { data: HeatmapData[] }) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const matrix: Record<string, number[]> = {};
  days.forEach((d) => {
    matrix[d] = new Array(24).fill(0);
  });
  data.forEach((d) => {
    if (matrix[d.day]) matrix[d.day][d.hour] = d.value;
  });

  // Paleta monocromática ciano — do sutil ao vibrante
  const getColor = (val: number) => {
    if (val === 0) return "hsl(220, 14%, 14%)";
    const t = val / maxVal;
    // Interpolação suave: azul escuro → ciano → ciano brilhante
    const h = 199 - t * 10;        // 199 → 189
    const s = 50 + t * 40;         // 50% → 90%
    const l = 18 + t * 38;         // 18% → 56%
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <ChartCard
      title="Heatmap de Eventos"
      subtitle="Densidade por dia da semana × horário"
      className="lg:col-span-2 flex flex-col"
    >
      <div className="flex-1 w-full flex flex-col justify-center min-h-[220px] md:min-h-[260px] 2xl:min-h-[320px] overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: 640 }} className="pb-2">

          {/* Hour labels */}
          <div className="flex ml-9 mb-2">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="flex-1 text-center text-muted-foreground/60 font-mono"
                style={{ fontSize: 9 }}
              >
                {i % 3 === 0 ? `${String(i).padStart(2, "0")}` : ""}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[2px]">
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-2">
                <span
                  className={`w-7 text-right flex-shrink-0 font-medium tracking-wide ${di === 0 || di === 6 ? "text-primary/60" : "text-muted-foreground/70"
                    }`}
                  style={{ fontSize: 10 }}
                >
                  {day}
                </span>
                <div className="flex flex-1 gap-[2px]">
                  {matrix[day].map((val, h) => (
                    <div
                      key={h}
                      className={`
                        flex-1 rounded-[4px] transition-all duration-200 relative
                        hover:rounded-[5px] hover:z-20
                        ${val > 0
                          ? "hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-card hover:scale-[1.3] hover:-translate-y-0.5"
                          : ""
                        }
                      `}
                      style={{
                        height: 22,
                        backgroundColor: getColor(val),
                        cursor: val > 0 ? "pointer" : "default",
                      }}
                    >
                      {val > 0 && <title>{`${day} ${h}h — ${val} evento(s)`}</title>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-4 ml-9 justify-end pt-3 border-t border-border/20">
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>
              Nenhum
            </span>
            <div className="flex gap-[2px]">
              {[0, 0.15, 0.3, 0.5, 0.7, 0.85, 1].map((v, i) => (
                <div
                  key={i}
                  className="w-4 h-[10px] rounded-[3px]"
                  style={{ backgroundColor: getColor(v * maxVal) }}
                />
              ))}
            </div>
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>
              Máx ({maxVal})
            </span>
          </div>

        </div>
      </div>
    </ChartCard>
  );
}
