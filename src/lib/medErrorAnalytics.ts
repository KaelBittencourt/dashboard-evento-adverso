import { MedErrorEvent } from "@/hooks/useFalhasMedicacao";
import { format, differenceInDays, getDay, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ──────────────── KPIs ──────────────── */

export interface MedErrorKPIs {
  total: number;
  last30: number;
  prev30: number;
  trend: string | null;
  topMedicamento: [string, number] | null;
  topTipoFalha: [string, number] | null;
  topVia: [string, number] | null;
  mediaPorMes: string;
  eventosSemanaUtil: number;
  eventosFimDeSemana: number;
  turnoMaisFrequente: string;
  medicamentosUnicos: number;
  taxaHorarioIncorreto: string;
}

export function getMedErrorKPIs(events: MedErrorEvent[], all: MedErrorEvent[]): MedErrorKPIs {
  const total = events.length;
  const now = new Date();

  const last30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) <= 30).length;
  const prev30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) > 30 && differenceInDays(now, e.timestamp) <= 60).length;
  const trend = prev30 > 0 ? (((last30 - prev30) / prev30) * 100).toFixed(1) : null;

  // Top medicamento
  const byMed: Record<string, number> = {};
  events.forEach((e) => { if (e.medicamento) byMed[e.medicamento.toUpperCase().trim()] = (byMed[e.medicamento.toUpperCase().trim()] || 0) + 1; });
  const topMedEntry = Object.entries(byMed).sort((a, b) => b[1] - a[1])[0] || null;
  const topMedicamento = topMedEntry ? [topMedEntry[0], topMedEntry[1]] as [string, number] : null;

  // Top tipo de falha
  const byTipo: Record<string, number> = {};
  events.forEach((e) => { if (e.tipoFalha) byTipo[e.tipoFalha] = (byTipo[e.tipoFalha] || 0) + 1; });
  const topTipoEntry = Object.entries(byTipo).sort((a, b) => b[1] - a[1])[0] || null;
  const topTipoFalha = topTipoEntry ? [topTipoEntry[0], topTipoEntry[1]] as [string, number] : null;

  // Top via
  const byVia: Record<string, number> = {};
  events.forEach((e) => { if (e.via) byVia[e.via] = (byVia[e.via] || 0) + 1; });
  const topViaEntry = Object.entries(byVia).sort((a, b) => b[1] - a[1])[0] || null;
  const topVia = topViaEntry ? [topViaEntry[0], topViaEntry[1]] as [string, number] : null;

  // Média por mês
  const months = new Set<string>();
  events.forEach((e) => { if (e.timestamp) months.add(format(e.timestamp, "yyyy-MM")); });
  const mediaPorMes = months.size > 0 ? (total / months.size).toFixed(1) : "0";

  // Dia útil vs fim de semana
  const eventosSemanaUtil = events.filter((e) => e.timestamp && getDay(e.timestamp) > 0 && getDay(e.timestamp) < 6).length;
  const eventosFimDeSemana = events.filter((e) => e.timestamp && (getDay(e.timestamp) === 0 || getDay(e.timestamp) === 6)).length;

  // Turno mais frequente
  const byTurno: Record<string, number> = {};
  events.forEach((e) => { if (e.turno) byTurno[e.turno] = (byTurno[e.turno] || 0) + 1; });
  const turnoMaisFrequente = Object.entries(byTurno).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Medicamentos únicos
  const medicamentosUnicos = Object.keys(byMed).length;

  // Taxa de horário incorreto
  const horarioIncorreto = events.filter((e) => e.tipoFalha === "Horário Incorreto").length;
  const taxaHorarioIncorreto = total > 0 ? ((horarioIncorreto / total) * 100).toFixed(1) : "0";

  return { total, last30, prev30, trend, topMedicamento, topTipoFalha, topVia, mediaPorMes, eventosSemanaUtil, eventosFimDeSemana, turnoMaisFrequente, medicamentosUnicos, taxaHorarioIncorreto };
}

/* ──────────────── Evolução mensal ──────────────── */

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

/* ──────────────── Por tipo de falha ──────────────── */

export function getMedErrorByTipo(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.tipoFalha) counts[e.tipoFalha] = (counts[e.tipoFalha] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ──────────────── Por via ──────────────── */

export function getMedErrorByVia(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.via) counts[e.via] = (counts[e.via] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ──────────────── Top medicamentos ──────────────── */

export function getMedErrorTopMedicamentos(events: MedErrorEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.medicamento) counts[e.medicamento.toUpperCase().trim()] = (counts[e.medicamento.toUpperCase().trim()] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ──────────────── Por turno ──────────────── */

export function getMedErrorByTurno(events: MedErrorEvent[]) {
  const turnos = ["Manhã", "Tarde", "Noite"];
  const counts: Record<string, number> = {};
  turnos.forEach((t) => (counts[t] = 0));
  events.forEach((e) => { if (e.turno) counts[e.turno] = (counts[e.turno] || 0) + 1; });
  return turnos.map((turno) => ({ turno, total: counts[turno] || 0 }));
}

/* ──────────────── Dia da semana ──────────────── */

export function getMedErrorByWeekday(events: MedErrorEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = new Array(7).fill(0);
  events.forEach((e) => { if (e.timestamp) counts[getDay(e.timestamp)]++; });
  return days.map((day, i) => ({ day, count: counts[i] }));
}

/* ──────────────── Heatmap ──────────────── */

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
  days.forEach((day) => { for (let h = 0; h < 24; h++) data.push({ day, hour: h, value: matrix[day]?.[h] || 0 }); });
  return data;
}

/* ──────────────── Insights ──────────────── */

export function generateMedErrorInsights(events: MedErrorEvent[], all: MedErrorEvent[]) {
  const insights: { type: "danger" | "warning" | "success"; message: string }[] = [];
  const kpis = getMedErrorKPIs(events, all);

  if (kpis.prev30 > 0 && kpis.last30 > kpis.prev30 * 1.2) {
    const pct = (((kpis.last30 - kpis.prev30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "danger", message: `⚠️ Aumento de ${pct}% nas falhas nos últimos 30 dias (${kpis.last30}) vs período anterior (${kpis.prev30}).` });
  } else if (kpis.prev30 > 0 && kpis.last30 < kpis.prev30 * 0.8) {
    const pct = (((kpis.prev30 - kpis.last30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "success", message: `✅ Redução de ${pct}% nas falhas nos últimos 30 dias. Boa evolução!` });
  }

  if (kpis.topTipoFalha) {
    const pct = kpis.total > 0 ? ((kpis.topTipoFalha[1] / kpis.total) * 100).toFixed(0) : 0;
    insights.push({ type: "danger", message: `🔴 Tipo de falha mais frequente: "${kpis.topTipoFalha[0]}" com ${kpis.topTipoFalha[1]} ocorrências (${pct}%).` });
  }

  if (kpis.topMedicamento) {
    insights.push({ type: "warning", message: `💊 Medicamento mais envolvido em falhas: "${kpis.topMedicamento[0]}" com ${kpis.topMedicamento[1]} ocorrência(s).` });
  }

  if (kpis.eventosFimDeSemana > 0 && kpis.total > 0) {
    const pct = ((kpis.eventosFimDeSemana / kpis.total) * 100).toFixed(0);
    insights.push({ type: "warning", message: `📅 ${kpis.eventosFimDeSemana} falha(s) ocorreram em finais de semana (${pct}%). Atenção ao plantio.` });
  }

  if (parseFloat(kpis.taxaHorarioIncorreto) > 15) {
    insights.push({ type: "warning", message: `⏰ ${kpis.taxaHorarioIncorreto}% das falhas são por horário incorreto — revisar processo de envio de medicações.` });
  }

  return insights;
}
