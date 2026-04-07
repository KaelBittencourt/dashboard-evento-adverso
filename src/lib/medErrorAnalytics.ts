import { MedErrorEvent } from "@/hooks/useFalhasMedicacao";
import { format, differenceInDays, getDay, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ═══════════════════════════════════════════════════════
   KPIs
   ═══════════════════════════════════════════════════════ */

export interface MedErrorKPIs {
  total: number;
  last30: number;
  prev30: number;
  trend: string | null;
  topMedicamento: [string, number] | null;
  topMarca: [string, number] | null;
  topVia: [string, number] | null;
  mediaPorMes: string;
  eventosSemanaUtil: number;
  eventosFimDeSemana: number;
  turnoMaisFrequente: string;
  medicamentosUnicos: number;
  taxaHorarioIncorreto: string;
}

function topEntry(map: Record<string, number>): [string, number] | null {
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? [sorted[0][0], sorted[0][1]] : null;
}

export function getMedErrorKPIs(events: MedErrorEvent[]): MedErrorKPIs {
  const total = events.length;
  const now = new Date();

  const last30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) <= 30).length;
  const prev30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) > 30 && differenceInDays(now, e.timestamp) <= 60).length;
  const trend = prev30 > 0 ? (((last30 - prev30) / prev30) * 100).toFixed(1) : null;

  // Agrupamentos
  const byMed: Record<string, number> = {};
  const byMarca: Record<string, number> = {};
  const byVia: Record<string, number> = {};
  const byTurno: Record<string, number> = {};

  events.forEach((e) => {
    const nome = e.medicamento?.trim();
    if (nome) byMed[nome] = (byMed[nome] || 0) + 1;
    if (e.marca && e.marca !== "Não informado") byMarca[e.marca] = (byMarca[e.marca] || 0) + 1;
    if (e.via) byVia[e.via] = (byVia[e.via] || 0) + 1;
    if (e.turno) byTurno[e.turno] = (byTurno[e.turno] || 0) + 1;
  });

  // Média por mês
  const months = new Set<string>();
  events.forEach((e) => { if (e.timestamp) months.add(format(e.timestamp, "yyyy-MM")); });
  const mediaPorMes = months.size > 0 ? (total / months.size).toFixed(1) : "0";

  // Dia útil vs fim de semana
  const eventosSemanaUtil = events.filter((e) => e.timestamp && getDay(e.timestamp) > 0 && getDay(e.timestamp) < 6).length;
  const eventosFimDeSemana = events.filter((e) => e.timestamp && (getDay(e.timestamp) === 0 || getDay(e.timestamp) === 6)).length;

  const turnoMaisFrequente = topEntry(byTurno)?.[0] || "N/A";
  const medicamentosUnicos = Object.keys(byMed).filter(Boolean).length;

  const horarioIncorreto = events.filter((e) => e.tipoFalha === "Horário Incorreto").length;
  const taxaHorarioIncorreto = total > 0 ? ((horarioIncorreto / total) * 100).toFixed(1) : "0";

  return {
    total,
    last30,
    prev30,
    trend,
    topMedicamento: topEntry(byMed),
    topMarca: topEntry(byMarca),
    topVia: topEntry(byVia),
    mediaPorMes,
    eventosSemanaUtil,
    eventosFimDeSemana,
    turnoMaisFrequente,
    medicamentosUnicos,
    taxaHorarioIncorreto,
  };
}

/* ═══════════════════════════════════════════════════════
   EVOLUÇÃO MENSAL
   ═══════════════════════════════════════════════════════ */

export function getMedErrorEvolution(events: MedErrorEvent[]) {
  const byMonth: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.timestamp) return;
    const key = format(e.timestamp, "MM/yyyy");
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => {
      const [am, ay] = a.split("/").map(Number);
      const [bm, by] = b.split("/").map(Number);
      return ay !== by ? ay - by : am - bm;
    })
    .map(([key, val]) => {
      const [m, y] = key.split("/");
      return {
        month: format(new Date(Number(y), Number(m) - 1), "MMM/yy", { locale: ptBR }),
        total: val,
      };
    });
}

/* ═══════════════════════════════════════════════════════
   POR MARCA
   ═══════════════════════════════════════════════════════ */

export function getMedErrorByMarca(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.marca && e.marca !== "Não informado") counts[e.marca] = (counts[e.marca] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ═══════════════════════════════════════════════════════
   POR VIA DE ADMINISTRAÇÃO
   ═══════════════════════════════════════════════════════ */

export function getMedErrorByVia(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.via) counts[e.via] = (counts[e.via] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ═══════════════════════════════════════════════════════
   TOP MEDICAMENTOS
   ═══════════════════════════════════════════════════════ */

export function getMedErrorTopMedicamentos(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    const nome = e.medicamento?.trim();
    if (nome) counts[nome] = (counts[nome] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ═══════════════════════════════════════════════════════
   POR TURNO
   ═══════════════════════════════════════════════════════ */

export function getMedErrorByTurno(events: MedErrorEvent[]) {
  const turnos = ["Manhã", "Tarde", "Noite"];
  const counts: Record<string, number> = {};
  turnos.forEach((t) => (counts[t] = 0));
  events.forEach((e) => { if (e.turno) counts[e.turno] = (counts[e.turno] || 0) + 1; });
  return turnos.map((turno) => ({ turno, total: counts[turno] || 0 }));
}

/* ═══════════════════════════════════════════════════════
   POR DIA DA SEMANA
   ═══════════════════════════════════════════════════════ */

export function getMedErrorByWeekday(events: MedErrorEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = new Array(7).fill(0);
  events.forEach((e) => { if (e.timestamp) counts[getDay(e.timestamp)]++; });
  return days.map((day, i) => ({ day, count: counts[i] }));
}

/* ═══════════════════════════════════════════════════════
   HEATMAP (DIA × HORA)
   ═══════════════════════════════════════════════════════ */

export function getMedErrorHeatmap(events: MedErrorEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const matrix: Record<string, Record<number, number>> = {};
  events.forEach((e) => {
    if (!e.timestamp) return;
    const d = days[getDay(e.timestamp)];
    const h = getHours(e.timestamp);
    if (!matrix[d]) matrix[d] = {};
    matrix[d][h] = (matrix[d][h] || 0) + 1;
  });
  const data: { day: string; hour: number; value: number }[] = [];
  days.forEach((day) => {
    for (let h = 0; h < 24; h++) data.push({ day, hour: h, value: matrix[day]?.[h] || 0 });
  });
  return data;
}

/* ═══════════════════════════════════════════════════════
   INSIGHTS AUTOMÁTICOS
   ═══════════════════════════════════════════════════════ */

export function generateMedErrorInsights(events: MedErrorEvent[]) {
  const insights: { type: "danger" | "warning" | "success"; message: string }[] = [];
  const kpis = getMedErrorKPIs(events);

  if (kpis.prev30 > 0 && kpis.last30 > kpis.prev30 * 1.2) {
    const pct = (((kpis.last30 - kpis.prev30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "danger", message: `⚠️ Aumento de ${pct}% nas falhas nos últimos 30 dias (${kpis.last30}) vs período anterior (${kpis.prev30}).` });
  } else if (kpis.prev30 > 0 && kpis.last30 < kpis.prev30 * 0.8) {
    const pct = (((kpis.prev30 - kpis.last30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "success", message: `✅ Redução de ${pct}% nas falhas nos últimos 30 dias. Boa evolução!` });
  }

  if (kpis.topMarca) {
    const pct = kpis.total > 0 ? ((kpis.topMarca[1] / kpis.total) * 100).toFixed(0) : 0;
    insights.push({ type: "danger", message: `🔴 Marca com mais problemas: "${kpis.topMarca[0]}" com ${kpis.topMarca[1]} ocorrências (${pct}%).` });
  }

  if (kpis.topMedicamento) {
    insights.push({ type: "warning", message: `💊 Medicamento mais envolvido em falhas: "${kpis.topMedicamento[0]}" com ${kpis.topMedicamento[1]} ocorrência(s).` });
  }

  if (kpis.eventosFimDeSemana > 0 && kpis.total > 0) {
    const pct = ((kpis.eventosFimDeSemana / kpis.total) * 100).toFixed(0);
    insights.push({ type: "warning", message: `📅 ${kpis.eventosFimDeSemana} falha(s) ocorreram em finais de semana (${pct}%). Atenção ao plantão.` });
  }

  if (parseFloat(kpis.taxaHorarioIncorreto) > 15) {
    insights.push({ type: "warning", message: `⏰ ${kpis.taxaHorarioIncorreto}% das falhas são por horário incorreto — revisar processo de envio de medicações.` });
  }

  return insights;
}
