import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useState } from "react";
import { PhlebitisEvent } from "@/hooks/useFlebite";
import { Download, Users, Syringe, Sparkles, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

/* ──────── Shared ──────── */

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
  COLORS.primary, COLORS.teal, COLORS.amber, COLORS.warning,
  COLORS.danger, COLORS.purple, COLORS.success, COLORS.pink,
];

const axisStyle = { fill: "hsl(215, 15%, 52%)", fontSize: 11 };

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
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

/* ──────── 1. Evolução Mensal ──────── */

export function PhlebitisEvolutionChart({ data }: { data: { month: string; total: number; central: number }[] }) {
  return (
    <ChartCard title="Evolução Mensal de Flebites" subtitle="Total e flebites em cateter central" className="lg:col-span-2">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPhlTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPhlCentral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" vertical={false} />
            <XAxis dataKey="month" tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={10} />
            <YAxis tick={{ ...axisStyle, fontSize: 10 }} axisLine={false} tickLine={false} tickMargin={10} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "12px", color: "hsl(var(--foreground))", fontSize: "12px", padding: "8px 12px" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(var(--muted-foreground))", paddingTop: "10px" }} iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="total" name="Total de Flebites" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorPhlTotal)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.primary }} />
            <Area type="monotone" dataKey="central" name="Cateter Central" stroke={COLORS.danger} strokeWidth={2.5} fillOpacity={1} fill="url(#colorPhlCentral)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.danger }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ──────── 2. Por Membro ──────── */

export function PhlebitisMembroChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title="Flebites por Localização" subtitle="Membro/região onde o cateter estava instalado">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {data.slice(0, 8).map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
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
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${pct}%`, backgroundColor: color }}>
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

/* ──────── 3. Sinais flogísticos ──────── */

export function PhlebitisSinaisChart({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const SINAL_COLORS: Record<string, string> = {
    "Rubor/Hiperemia": COLORS.danger,
    "Edema/Infiltração": COLORS.primary,
    "Dor": COLORS.warning,
    "Calor": COLORS.amber,
    "Secreção": COLORS.purple,
    "Endurecimento": COLORS.teal,
  };

  return (
    <ChartCard title="Sinais Flogísticos" subtitle="Sintomas identificados nos relatos">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const color = SINAL_COLORS[item.name] || PALETTE[i % PALETTE.length];
          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full ring-2 ring-offset-1" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80`, "--tw-ring-color": `${color}40`, "--tw-ring-offset-color": "hsl(var(--card))" } as React.CSSProperties} />
                  <span className="font-semibold text-foreground/90 tracking-tight">{item.name}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{item.value}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style={{ width: `${pct}%`, backgroundColor: color }}>
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

/* ──────── 4. Dias até notificação (histogram bars) ──────── */

export function PhlebitisDiasChart({ data }: { data: { range: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <ChartCard title="Tempo Cateter → Flebite" subtitle="Dias entre instalação e notificação">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex items-end justify-between gap-2 lg:gap-3 pt-6 pb-2">
        {data.map((item) => {
          const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={item.range} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
              <div className="w-full relative flex flex-col justify-end mt-auto" style={{ height: "100%" }}>
                <div className="w-full flex justify-center mb-1.5">
                  <span className="text-[11px] font-bold text-foreground/90 group-hover:text-primary transition-colors">{item.count}</span>
                </div>
                <div
                  className="w-full rounded-t-[5px] transition-all duration-300 ease-out overflow-hidden relative bg-gradient-to-t from-primary/10 to-primary/80 border-t border-primary group-hover:to-primary group-hover:shadow-[0_0_15px_hsl(199_89%_48%/0.3)]"
                  style={{ height: `${heightPct}%`, minHeight: "4px" }}
                >
                  <div className="absolute inset-0 bg-white/10 w-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <span className="mt-3 text-[10px] font-medium text-muted-foreground/90 group-hover:text-primary uppercase tracking-wider transition-colors">{item.range}</span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ──────── 5. Por Unidade ──────── */

export function PhlebitisUnidadeChart({ data }: { data: { unidade: string; total: number; central: number; periferico: number }[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  return (
    <ChartCard title="Flebites por Setor" subtitle="Volume e tipo de cateter" className="lg:col-span-2 flex flex-col">
      <div className="flex-1 w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col gap-4 lg:gap-5 pr-2 overflow-y-auto custom-scrollbar">
        {data.map((row) => {
          const overallPct = (row.total / maxTotal) * 100;
          const centralPct = row.total > 0 ? (row.central / row.total) * 100 : 0;
          return (
            <div key={row.unidade} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <span className="font-semibold text-foreground/90 tracking-tight truncate max-w-[55%]">{row.unidade}</span>
                <div className="flex items-center gap-3">
                  {row.central > 0 && <span className="text-[10px] text-destructive/80 font-medium">{row.central} central</span>}
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">{row.total}</span>
                </div>
              </div>
              <div className="w-full bg-muted/10 rounded-full h-2 flex overflow-hidden group-hover:bg-muted/20 transition-colors duration-300">
                <div className="h-full flex overflow-hidden rounded-full transition-all duration-1000 ease-out" style={{ width: `${overallPct}%` }}>
                  <div className="h-full relative group-hover:brightness-110 transition-all" style={{ width: `${100 - centralPct}%`, backgroundColor: COLORS.primary }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  </div>
                  {row.central > 0 && (
                    <div className="h-full relative group-hover:brightness-110 transition-all" style={{ width: `${centralPct}%`, backgroundColor: COLORS.danger }}>
                      <div className="absolute inset-0 bg-white/20 animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.primary }} /><span className="tracking-wide uppercase font-medium">Periférico</span></div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS.danger }} /><span className="tracking-wide uppercase font-medium">Central</span></div>
      </div>
    </ChartCard>
  );
}

/* ──────── 6. Reincidentes Table ──────── */

export function PhlebitisReincidentesTable({ data }: { data: { nome: string; totalFlebites: number; unidades: string[]; ultimaOcorrencia: Date | null }[] }) {
  if (data.length === 0) return (
    <ChartCard title="Pacientes Reincidentes" subtitle="Nenhum reincidente" className="w-full">
      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Nenhum paciente com mais de uma flebite.</div>
    </ChartCard>
  );
  return (
    <div className="w-full flex flex-col group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-severity-moderate/10"><Users size={14} className="text-severity-moderate" /></div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Pacientes Reincidentes</h3>
            <p className="text-[11px] text-foreground/60 mt-0.5">Pacientes com 2+ flebites</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-severity-moderate/80 bg-severity-moderate/10 px-2 py-0.5 rounded-full">{data.length} paciente{data.length > 1 ? "s" : ""}</span>
      </div>
      <div className="overflow-x-auto overflow-y-auto max-h-[260px] custom-scrollbar rounded-md border border-border/40">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
            <tr className="border-b border-border/40">
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Paciente</th>
              <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Flebites</th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Setores</th>
              <th className="text-right text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Última</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((p, idx) => (
              <tr key={idx} className="border-b border-border/20 hover:bg-primary/[0.03] transition-colors">
                <td className="py-2.5 px-4 text-xs font-medium text-foreground">{p.nome}</td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold ${p.totalFlebites >= 4 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{p.totalFlebites}</span>
                </td>
                <td className="py-2.5 px-4 text-xs text-muted-foreground">{p.unidades.join(", ")}</td>
                <td className="py-2.5 px-4 text-right text-xs font-mono text-muted-foreground">{p.ultimaOcorrencia ? p.ultimaOcorrencia.toLocaleDateString("pt-BR") : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────── 7. Dia da semana ──────── */

export function PhlebitisWeekdayChart({ data }: { data: { day: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <ChartCard title="Por Dia da Semana" subtitle="Notificações de flebite por dia">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex items-end justify-between gap-2 lg:gap-4 pt-6 pb-2">
        {data.map((item, i) => {
          const isWeekend = i === 0 || i === 6;
          const heightPct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          return (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
              <div className="w-full relative flex flex-col justify-end mt-auto" style={{ height: "100%" }}>
                <div className="w-full flex justify-center mb-1.5"><span className={`text-[11px] font-bold ${isWeekend ? "text-muted-foreground/80" : "text-foreground/90"} group-hover:text-primary transition-colors`}>{item.count}</span></div>
                <div className={`w-full rounded-t-[5px] transition-all duration-300 ease-out overflow-hidden relative bg-gradient-to-t from-primary/10 to-primary/80 border-t border-primary group-hover:to-primary ${isWeekend ? "opacity-60" : ""}`} style={{ height: `${heightPct}%`, minHeight: "4px" }}>
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

/* ──────── 8. Heatmap ──────── */

export function PhlebitisHeatmapChart({ data }: { data: { day: string; hour: number; value: number }[] }) {
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
      <div className="flex-1 w-full flex flex-col justify-center min-h-[220px] md:min-h-[260px] overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: 640 }} className="pb-2">
          <div className="flex ml-9 mb-2">
            {Array.from({ length: 24 }, (_, i) => (<div key={i} className="flex-1 text-center text-muted-foreground/60 font-mono" style={{ fontSize: 9 }}>{i % 3 === 0 ? String(i).padStart(2, "0") : ""}</div>))}
          </div>
          <div className="flex flex-col gap-[2px]">
            {days.map((day, di) => (
              <div key={day} className="flex items-center gap-2">
                <span className={`w-7 text-right flex-shrink-0 font-medium tracking-wide ${di === 0 || di === 6 ? "text-primary/60" : "text-muted-foreground/70"}`} style={{ fontSize: 10 }}>{day}</span>
                <div className="flex flex-1 gap-[2px]">
                  {matrix[day].map((val, h) => (
                    <div key={h} className={`flex-1 rounded-[4px] transition-all duration-200 ${val > 0 ? "hover:ring-2 hover:ring-primary/50 hover:scale-[1.3] hover:-translate-y-0.5" : ""}`} style={{ height: 22, backgroundColor: getColor(val), cursor: val > 0 ? "pointer" : "default" }}>
                      {val > 0 && <title>{`${day} ${h}h — ${val} flebite(s)`}</title>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4 ml-9 justify-end pt-3 border-t border-border/20">
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>Nenhuma</span>
            <div className="flex gap-[2px]">{[0, 0.2, 0.4, 0.6, 0.8, 1].map((v, i) => (<div key={i} className="w-4 h-[10px] rounded-[3px]" style={{ backgroundColor: getColor(v * maxVal) }} />))}</div>
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>Máx ({maxVal})</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

/* ──────── 9. Tabela de registros com modal ──────── */

const SINAL_BADGE_COLORS: Record<string, string> = {
  "Rubor/Hiperemia": "bg-red-500/10 text-red-400 border-red-500/20",
  "Edema/Infiltração": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Dor": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Calor": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Secreção": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Endurecimento": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export function PhlebitisDataTable({ events }: { events: PhlebitisEvent[] }) {
  // Ordenar flebites pela data de instalação (mais recente primeiro)
  const sorted = [...events].sort((a, b) => {
    const timeA = a.dataInstalacao?.getTime() || 0;
    const timeB = b.dataInstalacao?.getTime() || 0;
    return timeB - timeA;
  });
  const display = sorted.slice(0, 100);
  const [selectedEvent, setSelectedEvent] = useState<PhlebitisEvent | null>(null);

  function exportCSV() {
    const headers = ["Data", "Paciente", "Setor", "Membro", "Tipo Cateter", "Data Instalação", "Sinais", "Descrição"];
    const rows = events.map((e) => [
      e.timestamp ? e.timestamp.toLocaleDateString("pt-BR") : "", e.nomePaciente, e.unidade, e.membroCateter, e.tipoCateter,
      e.dataInstalacao ? e.dataInstalacao.toLocaleDateString("pt-BR") : "", e.sinaisFlogisticos.join("; "), e.descricao,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `flebites_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10"><Syringe size={14} className="text-primary" /></div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">Registros de Flebite</h3>
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
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Paciente</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Setor</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Membro</th>
                <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Tipo</th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Sinais</th>
              </tr>
            </thead>
            <tbody>
              {display.map((e, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedEvent(e)}
                  className="border-b border-border/20 hover:bg-primary/[0.05] transition-colors cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">{e.dataInstalacao?.toLocaleDateString("pt-BR") || "Não Informado"}</td>
                  <td className="py-2.5 px-4 text-xs font-medium text-foreground max-w-[180px] truncate" title={e.nomePaciente}>{e.nomePaciente}</td>
                  <td className="py-2.5 px-4 text-xs text-foreground/80">{e.unidade}</td>
                  <td className="py-2.5 px-4 text-xs text-foreground/80">{e.membroCateter}</td>
                  <td className="py-2.5 px-4 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${e.tipoCateter === "Central" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{e.tipoCateter}</span></td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground max-w-[200px] truncate" title={e.sinaisFlogisticos.join(", ")}>{e.sinaisFlogisticos.join(", ") || "Não Informado"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ──────── Modal de Detalhes ──────── */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Ficha de Flebite</DialogTitle>
            <DialogDescription>
              Resumo completo da notificação de flebite
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dados do Paciente */}
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Dados do Paciente</h4>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Nome:</span> {selectedEvent.nomePaciente || "Não Identificado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Nascimento:</span> {selectedEvent.dataNascimento || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Setor/Unidade:</span> {selectedEvent.unidade || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Turno do Registro:</span> {selectedEvent.turno || "Não Informado"}</div>
              </div>

              {/* Dados do Cateter */}
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Dados do Cateter</h4>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Membro/Localização:</span>{" "}
                  <span className="font-semibold">{selectedEvent.membroCateter}</span>
                  {selectedEvent.membroCateterRaw !== selectedEvent.membroCateter && (
                    <span className="text-muted-foreground/60 text-xs ml-1">({selectedEvent.membroCateterRaw})</span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Tipo de Cateter:</span>{" "}
                  <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedEvent.tipoCateter === "Central"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {selectedEvent.tipoCateter}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Data de Instalação:</span>{" "}
                  {selectedEvent.dataInstalacao ? selectedEvent.dataInstalacao.toLocaleDateString("pt-BR") : "Não Informado"}
                </div>
              </div>

              {/* Sinais Flogísticos */}
              <div className="p-4 rounded-lg bg-severity-moderate/5 border border-severity-moderate/20 space-y-3 md:col-span-2">
                <h4 className="font-semibold text-sm border-b border-severity-moderate/20 pb-2 mb-2">Sinais Flogísticos Identificados</h4>
                {selectedEvent.sinaisFlogisticos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.sinaisFlogisticos.map((sinal) => (
                      <span
                        key={sinal}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          SINAL_BADGE_COLORS[sinal] || "bg-muted/50 text-foreground/80 border-border/40"
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {sinal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum sinal flogístico identificado no relato.</p>
                )}
              </div>

              {/* Descrição completa */}
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3 md:col-span-2">
                <h4 className="font-semibold text-sm border-b border-destructive/20 pb-2 mb-2">Relato Completo</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selectedEvent.descricao || "Não Informado"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ──────── 10. Insights Panel ──────── */

const typeConfig = {
  danger: { border: "border-destructive/20", bg: "bg-destructive/[0.04]", icon: AlertTriangle, iconColor: "text-destructive" },
  warning: { border: "border-severity-moderate/20", bg: "bg-severity-moderate/[0.04]", icon: AlertCircle, iconColor: "text-severity-moderate" },
  success: { border: "border-severity-none/20", bg: "bg-severity-none/[0.04]", icon: CheckCircle2, iconColor: "text-severity-none" },
};

export function PhlebitisInsightsPanel({ insights }: { insights: { type: "danger" | "warning" | "success"; message: string }[] }) {
  if (insights.length === 0) return null;
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10"><Sparkles size={14} className="text-primary" /></div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Insights de Flebite</h3>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-full">{insights.length} alerta{insights.length > 1 ? "s" : ""}</span>
      </div>
      <div className="flex flex-col gap-2">
        {insights.map((insight, i) => { const config = typeConfig[insight.type]; const Icon = config.icon; return (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:translate-x-0.5 ${config.border} ${config.bg}`}>
            <Icon size={14} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />
            <p className="text-[13px] text-foreground/85 leading-relaxed">{insight.message}</p>
          </div>
        ); })}
      </div>
    </div>
  );
}
