import { MedErrorEvent } from "@/hooks/useFalhasMedicacao";
import {
  Sparkles, Download, Table2, AlertTriangle, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/* ═══════════════════════════════════════════════════════
   PALETA DE CORES
   ═══════════════════════════════════════════════════════ */

const COLORS = {
  primary: "hsl(199, 89%, 48%)",
  danger: "hsl(0, 72%, 55%)",
  warning: "hsl(25, 95%, 53%)",
  success: "hsl(142, 71%, 45%)",
  purple: "hsl(280, 65%, 50%)",
  teal: "hsl(172, 66%, 50%)",
  amber: "hsl(47, 96%, 53%)",
  pink: "hsl(328, 86%, 70%)",
};

const PALETTE = [
  COLORS.danger, COLORS.warning, COLORS.primary, COLORS.purple,
  COLORS.teal, COLORS.amber, COLORS.pink, COLORS.success,
];

const axisStyle = { fill: "hsl(215, 15%, 52%)", fontSize: 11 };

/* ═══════════════════════════════════════════════════════
   CHART CARD WRAPPER
   ═══════════════════════════════════════════════════════ */

function ChartCard({ title, subtitle, children, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 animate-fade-in ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-foreground/60 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. EVOLUÇÃO MENSAL (Área)
   ═══════════════════════════════════════════════════════ */

export function MedErrorEvolutionChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <ChartCard title="Evolução Mensal de Falhas" subtitle="Notificações por mês" className="lg:col-span-2">
      <div className="w-full aspect-[2.2/1] sm:aspect-[2.5/1] md:max-h-[300px] lg:aspect-[2/1]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMedTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
            <XAxis dataKey="month" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={10} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))", fontSize: "12px", padding: "8px 12px" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))", paddingTop: "10px" }} iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="total" name="Total de Falhas" stroke={COLORS.danger} strokeWidth={3} fillOpacity={1} fill="url(#colorMedTotal)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.danger }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   2. POR TIPO DE FALHA (barras horizontais)
   ═══════════════════════════════════════════════════════ */

export function MedErrorTipoFalhaChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title="Por Tipo de Falha" subtitle="Distribuição das categorias de erro">
      <div className="w-full flex flex-col justify-center gap-3 pr-1">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={item.name} className="flex flex-col gap-1 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5 max-w-[65%]">
                  <div className="w-1.5 h-3.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
                  <span className="font-semibold text-foreground/90 tracking-tight truncate" title={item.name}>{item.name}</span>
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{item.value}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   3. POR VIA DE ADMINISTRAÇÃO (donut)
   ═══════════════════════════════════════════════════════ */

const VIA_COLORS: Record<string, string> = {
  EV: COLORS.primary,
  IM: COLORS.warning,
  VO: COLORS.teal,
  SC: COLORS.purple,
};

function getViaColor(via: string): string {
  return VIA_COLORS[via] || COLORS.amber;
}

function MedErrorViaTooltip({ total }: { total: number }) {
  return function ViaTooltipContent({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { name: string; value: number }; fill?: string }[] }) {
    if (active && payload && payload.length && payload[0]) {
      const entry = payload[0].payload;
      const { name, value } = entry;
      const pct = total > 0 ? (value / total) * 100 : 0;
      const color = payload[0].fill || getViaColor(name);
      return (
        <div className="rounded-lg border border-border/60 bg-card shadow-xl px-4 py-3 min-w-[170px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-sm font-bold text-foreground">{name}</span>
          </div>
          <div className="space-y-1 text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>Ocorrências</span>
              <span className="font-semibold text-foreground tabular-nums">{value}</span>
            </div>
            <div className="flex justify-between">
              <span>Participação</span>
              <span className="font-semibold text-foreground tabular-nums">{pct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
}

export function MedErrorViaChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title="Por Via de Administração" subtitle="Distribuição por via">
      <div className="w-full flex flex-col items-center gap-4">
        <div className="relative w-full aspect-[4/3] flex items-center justify-center">
          {data.length > 0 ? (
            <>
              {/* Centro do Donut — z-0 para ficar atrás do tooltip */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-2xl font-black text-foreground tabular-nums">{total}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={getViaColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={MedErrorViaTooltip({ total })}
                    isAnimationActive={true}
                    animationDuration={150}
                    wrapperStyle={{ zIndex: 50 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </div>

        {/* Mini Cards - Legendas */}
        {data.length > 0 && (
          <div className="w-full grid grid-cols-2 gap-2">
            {data.map((item) => {
              const pct = total > 0 ? (item.value / total) * 100 : 0;
              const color = getViaColor(item.name);
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-2.5 py-2 transition-all duration-200 hover:border-primary/20 hover:bg-muted/40 hover:translate-y-px"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground leading-none">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                      {item.value} · {pct.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   4. TOP MEDICAMENTOS (ranking limpo)
   ═══════════════════════════════════════════════════════ */

export function MedErrorTopMedChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const maxVal = data[0]?.value || 1;

  return (
    <ChartCard
      title="Medicamentos Mais Envolvidos"
      subtitle="Top 10 medicamentos com falhas"
      className="lg:col-span-2"
    >
      <div className="w-full flex flex-col gap-3 mt-1">
        {data.slice(0, 10).map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const barWidth = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          const color = PALETTE[i % PALETTE.length];

          return (
            <div key={item.name} className="relative flex items-center gap-3.5 group cursor-default transition-transform duration-300 hover:translate-x-1">
              {/* Badge de ranking */}
              <div className="flex flex-col items-center justify-center w-7 h-7 rounded-lg bg-muted/30 border border-border/40 text-[11px] font-mono font-bold text-muted-foreground transition-all duration-300 shadow-sm group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary group-hover:shadow-[0_0_12px_hsl(var(--primary))/0.15] flex-shrink-0">
                {i + 1}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <div className="flex items-end justify-between gap-2">
                  <span
                    className="text-[13px] font-semibold text-foreground/90 truncate tracking-tight transition-colors duration-300 group-hover:text-foreground"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <div className="flex items-baseline gap-3 flex-shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground font-medium">{pct.toFixed(1)}%</span>
                    <span className="font-mono text-xs font-bold text-foreground tabular-nums w-5 text-right">{item.value}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${barWidth}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   5. POR TURNO (cards modernos)
   ═══════════════════════════════════════════════════════ */

const TURNO_CONFIG: Record<string, { gradient: string; glow: string; icon: string; color: string }> = {
  "Manhã": {
    gradient: "linear-gradient(135deg, hsl(42, 92%, 55%), hsl(28, 90%, 50%))",
    glow: "hsl(42, 92%, 55%)",
    icon: "☀️",
    color: COLORS.amber,
  },
  "Tarde": {
    gradient: "linear-gradient(135deg, hsl(199, 89%, 48%), hsl(210, 80%, 42%))",
    glow: "hsl(199, 89%, 48%)",
    icon: "🌤️",
    color: COLORS.primary,
  },
  "Noite": {
    gradient: "linear-gradient(135deg, hsl(260, 60%, 50%), hsl(280, 65%, 45%))",
    glow: "hsl(260, 60%, 50%)",
    icon: "🌙",
    color: COLORS.purple,
  },
};

export function MedErrorTurnoChart({ data }: { data: { turno: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <ChartCard title="Por Turno" subtitle="Distribuição de falhas por turno">
      <div className="flex flex-col gap-3">
        {data.map((item) => {
          const config = TURNO_CONFIG[item.turno] || TURNO_CONFIG["Manhã"];
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          const barWidth = maxVal > 0 ? (item.total / maxVal) * 100 : 0;
          const isMax = item.total === maxVal && item.total > 0;

          return (
            <div
              key={item.turno}
              className={`group relative flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-lg ${
                isMax
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-border/30 bg-muted/10 hover:border-border/50"
              }`}
              style={isMax ? { boxShadow: `0 4px 20px ${config.glow}15` } : {}}
            >
              {/* Ícone + nome */}
              <div className="flex items-center gap-3 min-w-[100px]">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-lg text-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ background: config.gradient, boxShadow: `0 2px 10px ${config.glow}40` }}
                >
                  {config.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground tracking-tight">{item.turno}</span>
                  <span className="text-[10px] text-muted-foreground font-medium tabular-nums">{pct.toFixed(0)}% do total</span>
                </div>
              </div>

              {/* Barra + valor */}
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${barWidth}%`,
                      background: config.gradient,
                      boxShadow: `0 0 10px ${config.glow}60`,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <span className="font-mono text-lg font-bold text-foreground tabular-nums min-w-[28px] text-right">
                  {item.total}
                </span>
              </div>

              {/* Badge de destaque */}
              {isMax && (
                <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest bg-primary text-primary-foreground shadow-md">
                  Pico
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   6. DIA DA SEMANA (barras verticais)
   ═══════════════════════════════════════════════════════ */

export function MedErrorWeekdayChart({ data }: { data: { day: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <ChartCard title="Por Dia da Semana" subtitle="Notificações por dia">
      <div className="w-full aspect-[3/1] sm:aspect-[2.5/1] flex items-end justify-between gap-2 lg:gap-4 pt-6 pb-2">
        {data.map((item, i) => {
          const isWeekend = i === 0 || i === 6;
          const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
              <div className="w-full relative flex flex-col justify-end mt-auto" style={{ height: "100%" }}>
                <div className="w-full flex justify-center mb-1.5">
                  <span className={`text-[11px] font-bold ${isWeekend ? "text-muted-foreground/80" : "text-foreground/90"} group-hover:text-primary transition-colors`}>{item.count}</span>
                </div>
                <div
                  className={`w-full rounded-t-[5px] transition-all duration-300 ease-out overflow-hidden relative bg-gradient-to-t from-primary/10 to-primary/80 border-t border-primary ${isWeekend ? "opacity-60" : ""} group-hover:to-primary`}
                  style={{ height: `${heightPct}%`, minHeight: "4px" }}
                >
                  <div className="absolute inset-0 bg-white/10 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className={`mt-3 text-[11px] font-medium uppercase tracking-widest transition-colors ${isWeekend ? "text-muted-foreground/60" : "text-muted-foreground/90"} group-hover:text-primary`}>{item.day.substring(0, 3)}</span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   7. HEATMAP (DIA × HORA)
   ═══════════════════════════════════════════════════════ */

export function MedErrorHeatmapChart({ data }: { data: { day: string; hour: number; value: number }[] }) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const matrix: Record<string, number[]> = {};
  days.forEach((d) => { matrix[d] = new Array(24).fill(0); });
  data.forEach((d) => { if (matrix[d.day]) matrix[d.day][d.hour] = d.value; });

  const getColor = (val: number) => {
    if (val === 0) return "hsl(220, 14%, 14%)";
    const t = val / maxVal;
    return `hsl(${199 - t * 10}, ${50 + t * 40}%, ${18 + t * 38}%)`;
  };

  return (
    <ChartCard title="Heatmap de Notificações" subtitle="Densidade por dia × horário" className="lg:col-span-2 flex flex-col">
      <div className="flex-1 w-full flex flex-col justify-center overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: 640 }} className="pb-2">
          <div className="flex ml-9 mb-2">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 text-center text-muted-foreground/60 font-mono" style={{ fontSize: 9 }}>
                {i % 3 === 0 ? String(i).padStart(2, "0") : ""}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-[2px]">
            {days.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-7 text-right flex-shrink-0 font-medium tracking-wide text-muted-foreground/70" style={{ fontSize: 10 }}>{day}</span>
                <div className="flex flex-1 gap-[2px]">
                  {matrix[day].map((val, h) => (
                    <div key={h} className="flex-1 rounded-[4px] transition-all duration-200 cursor-default" style={{ height: 22, backgroundColor: getColor(val) }}>
                      {val > 0 && <title>{`${day} ${h}h — ${val} falha(s)`}</title>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 ml-9 justify-end pt-3 border-t border-border/20">
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>Nenhuma</span>
            <div className="flex gap-[2px]">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (
                <div key={i} className="w-4 h-[10px] rounded-[3px]" style={{ backgroundColor: getColor(v * maxVal) }} />
              ))}
            </div>
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>Máx ({maxVal})</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

/* ═══════════════════════════════════════════════════════
   8. TABELA DE REGISTROS
   ═══════════════════════════════════════════════════════ */

export function MedErrorDataTable({ events }: { events: MedErrorEvent[] }) {
  const sorted = [...events].sort((a, b) => {
    const timeA = a.timestamp?.getTime() || 0;
    const timeB = b.timestamp?.getTime() || 0;
    return timeB - timeA;
  });
  const display = sorted.slice(0, 100);
  const [selectedEvent, setSelectedEvent] = useState<MedErrorEvent | null>(null);

  function exportCSV() {
    const headers = ["Data", "Medicamento", "Via", "Lote", "Validade", "Marca", "Tipo de Falha", "Descrição"];
    const rows = events.map((e) => [
      e.timestamp ? e.timestamp.toLocaleDateString("pt-BR") : "",
      e.medicamento, e.via, e.lote, e.validade, e.marca, e.tipoFalha, e.descricaoFalha,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `falhas_medicacao_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10"><Table2 size={14} className="text-primary" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">Registros de Falhas</h3>
              <p className="text-[11px] text-foreground/60 mt-0.5">Clique em um registro para ver detalhes · {display.length} exibidos</p>
            </div>
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border/60 bg-secondary/50 hover:bg-secondary hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all duration-200"><Download size={11} />CSV</button>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar rounded-md border border-border/40">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <tr className="border-b border-border/40">
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Data</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Medicamento</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Via</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Tipo de Falha</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Marca</th>
              </tr>
            </thead>
            <tbody>
              {display.map((e, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedEvent(e)}
                  className="border-b border-border/20 hover:bg-primary/[0.05] transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{e.timestamp?.toLocaleDateString("pt-BR") || "—"}</td>
                  <td className="py-2.5 px-4 text-xs font-medium text-foreground max-w-[180px] truncate" title={e.medicamento}>{e.medicamento || "—"}</td>
                  <td className="py-2.5 px-4 text-xs text-foreground/80">{e.via || "—"}</td>
                  <td className="py-2.5 px-4 text-xs text-destructive/90">{e.tipoFalha}</td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground">{e.marca || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalhes da Falha</DialogTitle>
            <DialogDescription>
              Resumo completo da notificação de falha de medicação
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Dados do Medicamento</h4>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Nome:</span> {selectedEvent.medicamento || "—"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Via:</span> {selectedEvent.via || "—"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Lote:</span> {selectedEvent.lote || "—"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Validade:</span> {selectedEvent.validade || "—"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Marca:</span> {selectedEvent.marca || "—"}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Dados do Evento</h4>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Data/Hora:</span> {selectedEvent.timestamp ? selectedEvent.timestamp.toLocaleString("pt-BR") : "—"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Tipo de Falha:</span> <span className="font-semibold text-destructive">{selectedEvent.tipoFalha}</span></div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Turno:</span> {selectedEvent.turno || "—"}</div>
              </div>

              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 md:col-span-2 space-y-3">
                <h4 className="font-semibold text-sm border-b border-destructive/20 pb-2 mb-2">Relato Completo</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selectedEvent.descricaoFalha || "—"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   9. PAINEL DE INSIGHTS
   ═══════════════════════════════════════════════════════ */

const typeConfig = {
  danger: { border: "border-destructive/20", bg: "bg-destructive/[0.04]", icon: AlertTriangle, iconColor: "text-destructive" },
  warning: { border: "border-severity-moderate/20", bg: "bg-severity-moderate/[0.04]", icon: AlertCircle, iconColor: "text-severity-moderate" },
  success: { border: "border-severity-none/20", bg: "bg-severity-none/[0.04]", icon: CheckCircle2, iconColor: "text-severity-none" },
};

export function MedErrorInsightsPanel({ insights }: { insights: { type: "danger" | "warning" | "success"; message: string }[] }) {
  if (insights.length === 0) return null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10"><Sparkles size={14} className="text-primary" /></div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Insights de Falhas de Medicação</h3>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">{insights.length} alerta{insights.length > 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:translate-x-0.5 ${config.border} ${config.bg}`}>
              <Icon size={14} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              <p className="text-[13px] text-foreground/85 leading-relaxed">{insight.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
