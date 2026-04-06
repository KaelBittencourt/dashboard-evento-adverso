import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { FallEvent } from "@/hooks/useQuedas";
import {
  FallEvolutionData,
  ReincidenteData,
  AcompanhanteDanoData,
} from "@/lib/fallsAnalytics";
import { Download, Users, MapPin, X, FileText } from "lucide-react";

/* ──────── Shared Styles ──────── */

const FALL_COLORS = {
  primary: "hsl(199, 89%, 48%)",
  danger: "hsl(0, 72%, 55%)",
  warning: "hsl(25, 95%, 53%)",
  success: "hsl(142, 71%, 45%)",
  purple: "hsl(280, 65%, 50%)",
  teal: "hsl(172, 66%, 50%)",
  amber: "hsl(47, 96%, 53%)",
  pink: "hsl(328, 86%, 70%)",
};

const LOCAL_COLORS: Record<string, string> = {
  Quarto: "hsl(199, 89%, 48%)",
  Banheiro: "hsl(172, 66%, 50%)",
  Corredor: "hsl(47, 96%, 53%)",
  "Cadeira/Poltrona": "hsl(25, 95%, 53%)",
  "Sala/Área Comum": "hsl(280, 65%, 50%)",
  Refeitório: "hsl(328, 86%, 70%)",
  Maca: "hsl(0, 72%, 55%)",
  "Posto de Enfermagem": "hsl(142, 71%, 45%)",
  Acolhimento: "hsl(220, 70%, 60%)",
};

const CHART_PALETTE = [
  "hsl(199, 89%, 48%)",
  "hsl(172, 66%, 50%)",
  "hsl(47, 96%, 53%)",
  "hsl(25, 95%, 53%)",
  "hsl(0, 72%, 55%)",
  "hsl(280, 65%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(328, 86%, 70%)",
];

const axisStyle = {
  fill: "hsl(215, 15%, 52%)",
  fontSize: 11,
};

/* ──────── ChartCard wrapper ──────── */

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

/* ──────── 1. Evolução Mensal de Quedas ──────── */

export function FallEvolutionChart({ data }: { data: FallEvolutionData[] }) {
  return (
    <ChartCard
      title="Evolução Mensal de Quedas"
      subtitle="Total de quedas e quedas com dano ao longo do tempo"
      className="lg:col-span-2"
    >
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFallTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FALL_COLORS.primary} stopOpacity={0.4} />
                <stop offset="95%" stopColor={FALL_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFallDano" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={FALL_COLORS.danger} stopOpacity={0.4} />
                <stop offset="95%" stopColor={FALL_COLORS.danger} stopOpacity={0} />
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
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                color: "hsl(var(--foreground))",
                fontSize: "12px",
                padding: "8px 12px",
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
              name="Total de Quedas"
              stroke={FALL_COLORS.primary}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorFallTotal)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: FALL_COLORS.primary }}
            />
            <Area
              type="monotone"
              dataKey="comDano"
              name="Com Dano"
              stroke={FALL_COLORS.danger}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorFallDano)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: FALL_COLORS.danger }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

/* ──────── 2. Por Local da Queda (horizontal bar) ──────── */

interface LocalData {
  name: string;
  total: number;
  comDano: number;
}

export function FallLocalChart({ data }: { data: LocalData[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <ChartCard title="Quedas por Local" subtitle="Onde as quedas estão acontecendo">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-3 lg:gap-4 pr-1">
        {data.slice(0, 8).map((item, i) => {
          const pct = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
          const danoPct = item.total > 0 ? (item.comDano / item.total) * 100 : 0;
          const color = LOCAL_COLORS[item.name] || CHART_PALETTE[i % CHART_PALETTE.length];

          return (
            <div key={item.name} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2.5 max-w-[65%]">
                  <div
                    className="w-1.5 h-3.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                  />
                  <span className="font-semibold text-foreground/90 tracking-tight truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {item.comDano > 0 && (
                    <span className="text-[10px] text-destructive/80 font-medium">
                      {item.comDano} c/ dano
                    </span>
                  )}
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">
                    {item.total}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden flex"
                  style={{ width: `${pct}%` }}
                >
                  {/* portion without dano */}
                  <div
                    className="h-full"
                    style={{
                      width: `${100 - danoPct}%`,
                      backgroundColor: color,
                    }}
                  />
                  {/* portion with dano */}
                  {item.comDano > 0 && (
                    <div
                      className="h-full"
                      style={{
                        width: `${danoPct}%`,
                        backgroundColor: FALL_COLORS.danger,
                      }}
                    />
                  )}
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

/* ──────── 3. Quedas por Unidade ──────── */

interface UnidadeData {
  unidade: string;
  total: number;
  comDano: number;
  semDano: number;
  semAcomp: number;
}

export function FallUnidadeChart({ data }: { data: UnidadeData[] }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <ChartCard
      title="Quedas por Setor"
      subtitle="Volume, danos e ausência de acompanhante"
      className="lg:col-span-2 flex flex-col"
    >
      <div className="flex-1 w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col gap-4 lg:gap-5 pr-2 overflow-y-auto custom-scrollbar">
        {data.map((row) => {
          const overallPct = (row.total / maxTotal) * 100;
          const danoPct = row.total > 0 ? (row.comDano / row.total) * 100 : 0;

          return (
            <div key={row.unidade} className="flex flex-col gap-1.5 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <span className="font-semibold text-foreground/90 tracking-tight truncate max-w-[55%]">
                  {row.unidade}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">
                    {row.semAcomp} s/ acomp.
                  </span>
                  <span className="text-[10px] text-destructive/80 font-medium">
                    {row.comDano} dano
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground w-8 text-right">
                    {row.total}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted/10 rounded-full h-2 flex overflow-hidden group-hover:bg-muted/20 transition-colors duration-300">
                <div
                  className="h-full flex overflow-hidden rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${overallPct}%` }}
                >
                  <div
                    className="h-full relative group-hover:brightness-110 transition-all"
                    style={{
                      width: `${100 - danoPct}%`,
                      backgroundColor: FALL_COLORS.primary,
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  </div>
                  {row.comDano > 0 && (
                    <div
                      className="h-full relative group-hover:brightness-110 transition-all"
                      style={{
                        width: `${danoPct}%`,
                        backgroundColor: FALL_COLORS.danger,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FALL_COLORS.primary }} />
          <span className="tracking-wide uppercase font-medium">Sem Dano</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: FALL_COLORS.danger }} />
          <span className="tracking-wide uppercase font-medium">Com Dano</span>
        </div>
      </div>
    </ChartCard>
  );
}

/* ──────── 4. Pacientes Reincidentes ──────── */

export function ReincidentesTable({ data }: { data: ReincidenteData[] }) {
  if (data.length === 0) {
    return (
      <ChartCard title="Pacientes Reincidentes" subtitle="Nenhum paciente reincidente encontrado" className="lg:col-span-2">
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
          Nenhum paciente com mais de uma queda registrada no período.
        </div>
      </ChartCard>
    );
  }

  return (
    <div className="lg:col-span-2 flex flex-col group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-severity-moderate/10">
            <Users size={14} className="text-severity-moderate" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Pacientes Reincidentes
            </h3>
            <p className="text-[11px] text-foreground/60 mt-0.5">
              Pacientes com 2 ou mais quedas registradas
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-severity-moderate/80 bg-severity-moderate/10 px-2 py-0.5 rounded-full">
          {data.length} paciente{data.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[300px] custom-scrollbar rounded-md border border-border/40">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
            <tr className="border-b border-border/40">
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                Paciente
              </th>
              <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                Nº Quedas
              </th>
              <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                Com Dano
              </th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                Setores
              </th>
              <th className="text-right text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                Última Queda
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 15).map((p, idx) => (
              <tr
                key={idx}
                className={`
                  border-b border-border/20 transition-colors duration-150
                  hover:bg-primary/[0.03]
                  ${idx === 0 ? "bg-destructive/[0.02]" : ""}
                `}
              >
                <td className="py-2.5 px-4 text-xs font-medium text-foreground">
                  {p.nome}
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold ${
                    p.totalQuedas >= 5
                      ? "bg-destructive/10 text-destructive"
                      : p.totalQuedas >= 3
                      ? "bg-severity-moderate/10 text-severity-moderate"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {p.totalQuedas}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className={`text-xs font-semibold ${
                    p.comDano > 0 ? "text-destructive" : "text-muted-foreground/50"
                  }`}>
                    {p.comDano}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-xs text-muted-foreground">
                  {p.unidades.join(", ")}
                </td>
                <td className="py-2.5 px-4 text-right text-xs font-mono text-muted-foreground">
                  {p.ultimaQueda ? p.ultimaQueda.toLocaleDateString("pt-BR") : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────── 5. Acompanhante vs Dano ──────── */

export function AcompanhanteDanoChart({ data }: { data: AcompanhanteDanoData[] }) {
  return (
    <ChartCard title="Acompanhante × Dano" subtitle="Presença de acompanhante vs. ocorrência de dano">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-6 px-2">
        {data.map((group) => {
          const total = group.total || 1;
          const danoPct = (group.comDano / total) * 100;
          const semPct = (group.semDano / total) * 100;
          const isSemAcomp = group.label === "Sem Acompanhante";

          return (
            <div key={group.label} className="flex flex-col gap-2 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isSemAcomp ? "bg-severity-moderate" : "bg-severity-none"}`}
                  />
                  <span className="text-xs font-semibold text-foreground/90">{group.label}</span>
                </div>
                <span className="font-mono text-xs font-bold text-foreground">{group.total}</span>
              </div>

              <div className="w-full h-6 bg-muted/20 rounded-lg overflow-hidden flex relative">
                <div
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white/90 transition-all duration-1000"
                  style={{
                    width: `${semPct}%`,
                    backgroundColor: FALL_COLORS.success,
                    minWidth: semPct > 5 ? undefined : 0,
                  }}
                >
                  {semPct > 15 && `${group.semDano} sem dano`}
                </div>
                <div
                  className="h-full flex items-center justify-center text-[10px] font-bold text-white/90 transition-all duration-1000"
                  style={{
                    width: `${danoPct}%`,
                    backgroundColor: FALL_COLORS.danger,
                    minWidth: danoPct > 5 ? undefined : 0,
                  }}
                >
                  {danoPct > 15 && `${group.comDano} c/ dano`}
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span>Sem dano: {semPct.toFixed(1)}%</span>
                <span className="text-destructive/70">Com dano: {danoPct.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ──────── 6. Turno de Quedas (donut + bars) ──────── */

interface TurnoData {
  turno: string;
  total: number;
  comDano: number;
}

const TURNO_COLORS: Record<string, string> = {
  Manhã: "hsl(47, 96%, 53%)",
  Tarde: "hsl(25, 95%, 53%)",
  Noite: "hsl(280, 65%, 50%)",
};

export function FallTurnoChart({ data }: { data: TurnoData[] }) {
  const totalGeral = data.reduce((s, d) => s + d.total, 0);

  return (
    <ChartCard title="Quedas por Turno" subtitle="Distribuição e risco por período do dia">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex flex-col justify-center gap-5 px-1">
        {data.map((item) => {
          const pct = totalGeral > 0 ? (item.total / totalGeral) * 100 : 0;
          const danoPct = item.total > 0 ? (item.comDano / item.total) * 100 : 0;
          const color = TURNO_COLORS[item.turno] || FALL_COLORS.primary;
          const icon = item.turno === "Manhã" ? "☀️" : item.turno === "Tarde" ? "🌤️" : "🌙";

          return (
            <div key={item.turno} className="flex flex-col gap-2 group">
              <div className="flex items-center justify-between text-xs transition-transform duration-200 group-hover:translate-x-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="font-semibold text-foreground/90">{item.turno}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-muted-foreground">{pct.toFixed(1)}%</span>
                  <span className="font-mono text-xs font-bold text-foreground">{item.total}</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground ml-7">
                <span className="text-destructive/70">{item.comDano} com dano ({danoPct.toFixed(0)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

/* ──────── 7. Dia da semana com dano sobreposto ──────── */

interface WeekdayData {
  day: string;
  total: number;
  comDano: number;
}

export function FallWeekdayChart({ data }: { data: WeekdayData[] }) {
  const maxCount = Math.max(...data.map((d) => d.total), 1);

  return (
    <ChartCard title="Quedas por Dia da Semana" subtitle="Volume total e com dano">
      <div className="w-full h-[220px] md:h-[260px] 2xl:h-[320px] flex items-end justify-between gap-2 lg:gap-4 pt-6 pb-2">
        {data.map((item, i) => {
          const isWeekend = i === 0 || i === 6;
          const heightPct = maxCount > 0 ? (item.total / maxCount) * 100 : 0;
          const danoHeightPct = maxCount > 0 ? (item.comDano / maxCount) * 100 : 0;

          return (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative">
              <div
                className="w-full relative flex flex-col justify-end transition-transform duration-300 group-hover:-translate-y-1 mt-auto"
                style={{ height: "100%" }}
              >
                <div className="w-full flex justify-center mb-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-bold transition-colors ${isWeekend ? "text-muted-foreground/80" : "text-foreground/90"} group-hover:text-primary`}>
                      {item.total}
                    </span>
                    {item.comDano > 0 && (
                      <span className="text-[9px] text-destructive font-semibold">
                        {item.comDano}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col justify-end" style={{ height: `${heightPct}%`, minHeight: "4px" }}>
                  {/* dano bar on top */}
                  {item.comDano > 0 && (
                    <div
                      className="w-full rounded-t-[5px] bg-gradient-to-t from-destructive/40 to-destructive/80"
                      style={{ height: `${(item.comDano / item.total) * 100}%`, minHeight: "3px" }}
                    />
                  )}
                  {/* normal bar */}
                  <div
                    className={`w-full ${item.comDano === 0 ? "rounded-t-[5px]" : ""} transition-all duration-300 ease-out overflow-hidden relative
                    bg-gradient-to-t from-primary/10 to-primary/80 border-t border-primary group-hover:to-primary group-hover:shadow-[0_0_15px_hsl(199_89%_48%/0.3)]
                    ${isWeekend ? "opacity-60 saturate-50" : ""}
                  `}
                    style={{ flex: 1, minHeight: "1px" }}
                  >
                    <div className="absolute inset-0 bg-white/10 w-full transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              </div>
              <span className={`mt-3 text-[11px] font-medium transition-colors duration-200 uppercase tracking-widest
                ${isWeekend ? "text-muted-foreground/60" : "text-muted-foreground/90"}
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

/* ──────── 8. Heatmap de Quedas ──────── */

interface HeatmapData {
  day: string;
  hour: number;
  value: number;
}

export function FallHeatmapChart({ data }: { data: HeatmapData[] }) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const matrix: Record<string, number[]> = {};
  days.forEach((d) => {
    matrix[d] = new Array(24).fill(0);
  });
  data.forEach((d) => {
    if (matrix[d.day]) matrix[d.day][d.hour] = d.value;
  });

  const getColor = (val: number) => {
    if (val === 0) return "hsl(220, 14%, 14%)";
    const t = val / maxVal;
    const h = 199 - t * 10;
    const s = 50 + t * 40;
    const l = 18 + t * 38;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <ChartCard
      title="Heatmap de Quedas"
      subtitle="Densidade por dia da semana × horário do registro"
      className="lg:col-span-2 flex flex-col"
    >
      <div className="flex-1 w-full flex flex-col justify-center min-h-[220px] md:min-h-[260px] 2xl:min-h-[320px] overflow-x-auto custom-scrollbar">
        <div style={{ minWidth: 640 }} className="pb-2">
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
                  className={`w-7 text-right flex-shrink-0 font-medium tracking-wide ${
                    di === 0 || di === 6 ? "text-primary/60" : "text-muted-foreground/70"
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
                        ${
                          val > 0
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
                      {val > 0 && <title>{`${day} ${h}h — ${val} queda(s)`}</title>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-4 ml-9 justify-end pt-3 border-t border-border/20">
            <span className="text-muted-foreground/50 font-medium uppercase tracking-widest" style={{ fontSize: 8 }}>
              Nenhuma
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

/* ──────── 9. Tabela de Registros de Quedas ──────── */

export function FallDataTable({ events }: { events: FallEvent[] }) {
  const [selectedEvent, setSelectedEvent] = useState<FallEvent | null>(null);
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.dataQueda?.getTime() || a.timestamp?.getTime() || 0;
    const timeB = b.dataQueda?.getTime() || b.timestamp?.getTime() || 0;
    return timeB - timeA;
  });
  const displayEvents = sortedEvents.slice(0, 100);

  function exportCSV() {
    const headers = [
      "Data da Queda",
      "Paciente",
      "Unidade",
      "Local da Queda",
      "Acompanhante",
      "Com Dano",
      "Descrição do Dano",
      "Turno",
    ];
    const rows = events.map((e) => [
      e.dataQueda ? e.dataQueda.toLocaleDateString("pt-BR") : "",
      e.nomePaciente,
      e.unidade,
      e.localQueda,
      e.acompanhante,
      e.quedaComDano ? "Sim" : "Não",
      e.descricaoDano,
      e.turno,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quedas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
    <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 w-full">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <MapPin size={14} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Registros de Quedas
            </h3>
            <p className="text-[11px] text-foreground/60 mt-0.5">
              Exibindo os {displayEvents.length} registros mais recentes
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border/60 bg-secondary/50 hover:bg-secondary hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <Download size={11} />
          CSV
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar rounded-md border border-border/40">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
            <tr className="border-b border-border/40">
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Data</th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Paciente</th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Setor</th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Local</th>
              <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Acomp.</th>
              <th className="text-center text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Dano</th>
              <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">Turno</th>
            </tr>
          </thead>
          <tbody>
            {displayEvents.length > 0 ? (
              displayEvents.map((e, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedEvent(e)}
                  className="border-b border-border/20 transition-colors duration-150 hover:bg-primary/[0.05] cursor-pointer"
                >
                  <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">
                    {e.dataQueda ? e.dataQueda.toLocaleDateString("pt-BR") : "N/A"}
                  </td>
                  <td className="py-2.5 px-4 text-xs font-medium text-foreground max-w-[200px] truncate" title={e.nomePaciente}>
                    {e.nomePaciente || "Não Identificado"}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-foreground/80">
                    {e.unidade}
                  </td>
                  <td className="py-2.5 px-4 text-xs text-foreground/80">
                    {e.localQueda}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      e.acompanhante.toLowerCase() === "sim"
                        ? "bg-severity-none/10 text-severity-none"
                        : "bg-severity-moderate/10 text-severity-moderate"
                    }`}>
                      {e.acompanhante || "Não Informado"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      e.quedaComDano
                        ? "bg-destructive/10 text-destructive"
                        : "bg-severity-none/10 text-severity-none"
                    }`}>
                      {e.quedaComDano ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-muted-foreground uppercase tracking-wider text-[10px]">
                    {e.turno}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Modal de Detalhes do Registro de Queda */}
    {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in p-4 sm:p-6" onClick={() => setSelectedEvent(null)}>
          <div className="bg-card w-full max-w-lg rounded-xl border border-border flex flex-col shadow-2xl relative overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Registro de Queda</h3>
                  <p className="text-[11px] text-muted-foreground">{selectedEvent.dataQueda?.toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Paciente</span>
                  <span className="text-sm font-medium text-foreground">{selectedEvent.nomePaciente || "Não Informado"}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Turno</span>
                    <span className="text-sm text-foreground/90">{selectedEvent.turno}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Acompanhante</span>
                    <span className="text-sm text-foreground/90">{selectedEvent.acompanhante || "Não Informado"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Setor</span>
                    <span className="text-sm text-foreground/90">{selectedEvent.unidade}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Local</span>
                    <span className="text-sm text-foreground/90">{selectedEvent.localQueda}</span>
                  </div>
                </div>

                <div className="flex flex-col p-3 rounded-lg bg-muted/10 border border-border/40 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Análise de Dano</span>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${selectedEvent.quedaComDano ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-severity-none/10 text-severity-none border border-severity-none/20"}`}>
                      {selectedEvent.quedaComDano ? "Com Dano Associado" : "Sem Dano Identificado"}
                    </span>
                  </div>
                  {selectedEvent.quedaComDano && selectedEvent.descricaoDano && (
                    <p className="text-[13px] text-foreground/80 leading-relaxed italic border-l-2 border-destructive/40 pl-3 py-1">
                      "{selectedEvent.descricaoDano}"
                    </p>
                  )}
                </div>
                <div className="flex flex-col p-3 rounded-lg bg-muted/10 border border-border/40 mt-2">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Ações Tomadas</span>
                  <div className="space-y-2.5">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-medium">Profissional Acionado:</span>
                      <span className="text-[12px] text-foreground/90">{selectedEvent.profissionalAcionado || "Não Informado"}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-medium">Conduta Tomada:</span>
                      <span className="text-[12px] text-foreground/90">{selectedEvent.condutaTomada || "Não Informado"}</span>
                    </div>
                  </div>
                </div>
                {selectedEvent.relatoQueda && (
                  <div className="flex flex-col p-3.5 rounded-lg border border-border/40 bg-background/50 mt-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText size={12} className="text-primary/70" />
                      Relato da Queda
                    </span>
                    <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {selectedEvent.relatoQueda}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-5 py-3 border-t border-border bg-muted/10 flex justify-end">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-secondary/80 text-secondary-foreground hover:bg-secondary rounded-md text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────── 10. Falls Insights Panel ──────── */

import { Sparkles, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

const typeConfig = {
  danger: {
    border: "border-destructive/20",
    bg: "bg-destructive/[0.04]",
    icon: AlertTriangle,
    iconColor: "text-destructive",
  },
  warning: {
    border: "border-severity-moderate/20",
    bg: "bg-severity-moderate/[0.04]",
    icon: AlertCircle,
    iconColor: "text-severity-moderate",
  },
  success: {
    border: "border-severity-none/20",
    bg: "bg-severity-none/[0.04]",
    icon: CheckCircle2,
    iconColor: "text-severity-none",
  },
};

export function FallInsightsPanel({
  insights,
}: {
  insights: { type: "danger" | "warning" | "success"; message: string }[];
}) {
  if (insights.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
          <Sparkles size={14} className="text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">
          Insights de Quedas
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
              <Icon size={14} className={`mt-0.5 flex-shrink-0 ${config.iconColor}`} />
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
