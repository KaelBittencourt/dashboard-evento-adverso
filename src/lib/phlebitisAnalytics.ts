import { PhlebitisEvent } from "@/hooks/useFlebite";
import { format, differenceInDays, getDay, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ──────────────── KPIs ──────────────── */

export interface PhlebitisKPIs {
  total: number;
  last30: number;
  prev30: number;
  trend: string | null;
  periferico: number;
  central: number;
  taxaCentral: string;
  pacientesUnicos: number;
  pacientesReincidentes: number;
  taxaReincidencia: string;
  topUnidade: [string, number] | null;
  topMembro: [string, number] | null;
  mediaQuedaMes: string;
  mediaDiasInstalacao: string;
  topSinal: [string, number] | null;
  turnoMaisFrequente: string;
}

export function getPhlebitisKPIs(events: PhlebitisEvent[], all: PhlebitisEvent[]): PhlebitisKPIs {
  const total = events.length;
  const now = new Date();

  const last30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) <= 30).length;
  const prev30 = events.filter((e) => e.timestamp && differenceInDays(now, e.timestamp) > 30 && differenceInDays(now, e.timestamp) <= 60).length;
  const trend = prev30 > 0 ? (((last30 - prev30) / prev30) * 100).toFixed(1) : null;

  const periferico = events.filter((e) => e.tipoCateter === "Periférico").length;
  const central = events.filter((e) => e.tipoCateter === "Central").length;
  const taxaCentral = total > 0 ? ((central / total) * 100).toFixed(1) : "0";

  // Reincidentes
  const byName: Record<string, number> = {};
  events.forEach((e) => { if (e.nomePaciente) byName[e.nomePaciente.toUpperCase().trim()] = (byName[e.nomePaciente.toUpperCase().trim()] || 0) + 1; });
  const pacientesUnicos = Object.keys(byName).length;
  const pacientesReincidentes = Object.values(byName).filter((c) => c > 1).length;
  const taxaReincidencia = pacientesUnicos > 0 ? ((pacientesReincidentes / pacientesUnicos) * 100).toFixed(1) : "0";

  // Top unidade
  const byUnidade: Record<string, number> = {};
  events.forEach((e) => { if (e.unidade) byUnidade[e.unidade] = (byUnidade[e.unidade] || 0) + 1; });
  const topUnidade = Object.entries(byUnidade).sort((a, b) => b[1] - a[1])[0] || null;

  // Top membro
  const byMembro: Record<string, number> = {};
  events.forEach((e) => { if (e.membroCateter) byMembro[e.membroCateter] = (byMembro[e.membroCateter] || 0) + 1; });
  const topMembro = Object.entries(byMembro).sort((a, b) => b[1] - a[1])[0] || null;

  // Média/mês
  const months = new Set<string>();
  events.forEach((e) => { if (e.timestamp) months.add(format(e.timestamp, "yyyy-MM")); });
  const mediaQuedaMes = months.size > 0 ? (total / months.size).toFixed(1) : "0";

  // Média dias instalação → notificação
  const diasArr = events.filter((e) => e.diasAteNotificacao !== null).map((e) => e.diasAteNotificacao!);
  const mediaDiasInstalacao = diasArr.length > 0 ? (diasArr.reduce((a, b) => a + b, 0) / diasArr.length).toFixed(1) : "N/A";

  // Top sinal
  const bySignal: Record<string, number> = {};
  events.forEach((e) => e.sinaisFlogisticos.forEach((s) => { bySignal[s] = (bySignal[s] || 0) + 1; }));
  const topSinal = Object.entries(bySignal).sort((a, b) => b[1] - a[1])[0] || null;

  // Turno mais frequente
  const byTurno: Record<string, number> = {};
  events.forEach((e) => { if (e.turno) byTurno[e.turno] = (byTurno[e.turno] || 0) + 1; });
  const turnoMaisFrequente = Object.entries(byTurno).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return { total, last30, prev30, trend, periferico, central, taxaCentral, pacientesUnicos, pacientesReincidentes, taxaReincidencia, topUnidade, topMembro, mediaQuedaMes, mediaDiasInstalacao, topSinal, turnoMaisFrequente };
}

/* ──────────────── Evolução mensal ──────────────── */

export function getPhlebitisEvolution(events: PhlebitisEvent[]) {
  const byMonth: Record<string, { total: number; central: number }> = {};
  events.forEach((e) => {
    if (!e.timestamp) return;
    const key = format(e.timestamp, "MM/yyyy");
    if (!byMonth[key]) byMonth[key] = { total: 0, central: 0 };
    byMonth[key].total++;
    if (e.tipoCateter === "Central") byMonth[key].central++;
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => { const [am, ay] = a.split("/").map(Number); const [bm, by] = b.split("/").map(Number); return ay !== by ? ay - by : am - bm; })
    .map(([key, val]) => { const [m, y] = key.split("/"); return { month: format(new Date(Number(y), Number(m) - 1), "MMM/yy", { locale: ptBR }), total: val.total, central: val.central }; });
}

/* ──────────────── Por membro ──────────────── */

export function getPhlebitisByMembro(events: PhlebitisEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => { if (e.membroCateter) counts[e.membroCateter] = (counts[e.membroCateter] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ──────────────── Por unidade ──────────────── */

export function getPhlebitisByUnidade(events: PhlebitisEvent[]) {
  const counts: Record<string, { total: number; central: number }> = {};
  events.forEach((e) => {
    if (!e.unidade) return;
    if (!counts[e.unidade]) counts[e.unidade] = { total: 0, central: 0 };
    counts[e.unidade].total++;
    if (e.tipoCateter === "Central") counts[e.unidade].central++;
  });
  return Object.entries(counts).sort((a, b) => b[1].total - a[1].total).map(([unidade, val]) => ({ unidade, total: val.total, central: val.central, periferico: val.total - val.central }));
}

/* ──────────────── Sinais flogísticos ──────────────── */

export function getPhlebitisBySinais(events: PhlebitisEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => e.sinaisFlogisticos.forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
}

/* ──────────────── Dias até notificação (histogram) ──────────────── */

export function getPhlebitisDiasHistogram(events: PhlebitisEvent[]) {
  const buckets: Record<string, number> = { "0d": 0, "1d": 0, "2d": 0, "3d": 0, "4-5d": 0, "6-10d": 0, "11+d": 0 };
  events.forEach((e) => {
    if (e.diasAteNotificacao === null) return;
    const d = e.diasAteNotificacao;
    if (d === 0) buckets["0d"]++;
    else if (d === 1) buckets["1d"]++;
    else if (d === 2) buckets["2d"]++;
    else if (d === 3) buckets["3d"]++;
    else if (d <= 5) buckets["4-5d"]++;
    else if (d <= 10) buckets["6-10d"]++;
    else buckets["11+d"]++;
  });
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

/* ──────────────── Reincidentes ──────────────── */

export function getPhlebitisReincidentes(events: PhlebitisEvent[]) {
  const map: Record<string, { nome: string; total: number; unidades: Set<string>; ultima: Date | null }> = {};
  events.forEach((e) => {
    if (!e.nomePaciente) return;
    const key = e.nomePaciente.toUpperCase().trim();
    if (!map[key]) map[key] = { nome: e.nomePaciente, total: 0, unidades: new Set(), ultima: null };
    map[key].total++;
    if (e.unidade) map[key].unidades.add(e.unidade);
    if (e.timestamp && (!map[key].ultima || e.timestamp > map[key].ultima!)) map[key].ultima = e.timestamp;
  });
  return Object.values(map).filter((p) => p.total > 1).sort((a, b) => b.total - a.total).map((p) => ({ nome: p.nome, totalFlebites: p.total, unidades: [...p.unidades], ultimaOcorrencia: p.ultima }));
}

/* ──────────────── Dia da semana ──────────────── */

export function getPhlebitisByWeekday(events: PhlebitisEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = new Array(7).fill(0);
  events.forEach((e) => { if (e.timestamp) counts[getDay(e.timestamp)]++; });
  return days.map((day, i) => ({ day, count: counts[i] }));
}

/* ──────────────── Heatmap ──────────────── */

export function getPhlebitisHeatmap(events: PhlebitisEvent[]) {
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

/* ──────────────── Turno ──────────────── */

export function getPhlebitisByTurno(events: PhlebitisEvent[]) {
  const turnos = ["Manhã", "Tarde", "Noite"];
  const counts: Record<string, number> = {};
  turnos.forEach((t) => (counts[t] = 0));
  events.forEach((e) => { if (e.turno) counts[e.turno] = (counts[e.turno] || 0) + 1; });
  return turnos.map((turno) => ({ turno, total: counts[turno] || 0 }));
}

/* ──────────────── Insights ──────────────── */

export function generatePhlebitisInsights(events: PhlebitisEvent[], all: PhlebitisEvent[]) {
  const insights: { type: "danger" | "warning" | "success"; message: string }[] = [];
  const kpis = getPhlebitisKPIs(events, all);

  if (kpis.prev30 > 0 && kpis.last30 > kpis.prev30 * 1.2) {
    const pct = (((kpis.last30 - kpis.prev30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "danger", message: `⚠️ Aumento de ${pct}% nas flebites nos últimos 30 dias (${kpis.last30}) vs período anterior (${kpis.prev30}).` });
  } else if (kpis.prev30 > 0 && kpis.last30 < kpis.prev30 * 0.8) {
    const pct = (((kpis.prev30 - kpis.last30) / kpis.prev30) * 100).toFixed(0);
    insights.push({ type: "success", message: `✅ Redução de ${pct}% nas flebites nos últimos 30 dias. Boa evolução!` });
  }

  if (kpis.central > 0) {
    insights.push({ type: "danger", message: `🔴 ${kpis.central} flebite(s) em cateter central detectada(s) — risco elevado de complicação.` });
  }

  if (kpis.pacientesReincidentes > 0) {
    insights.push({ type: "warning", message: `🔁 ${kpis.pacientesReincidentes} paciente(s) reincidente(s) — ${kpis.taxaReincidencia}% dos pacientes.` });
  }

  if (kpis.topUnidade) {
    const pct = kpis.total > 0 ? ((kpis.topUnidade[1] / kpis.total) * 100).toFixed(0) : 0;
    insights.push({ type: "warning", message: `🏥 Setor com maior incidência: "${kpis.topUnidade[0]}" com ${kpis.topUnidade[1]} ocorrências (${pct}%).` });
  }

  if (kpis.mediaDiasInstalacao !== "N/A" && parseFloat(kpis.mediaDiasInstalacao) > 3) {
    insights.push({ type: "warning", message: `⏱️ Tempo médio de permanência do cateter até a flebite: ${kpis.mediaDiasInstalacao} dias. Avaliar troca preventiva.` });
  }

  if (kpis.topSinal) {
    insights.push({ type: "warning", message: `📋 Sinal flogístico mais frequente: "${kpis.topSinal[0]}" — presente em ${kpis.topSinal[1]} notificações.` });
  }

  return insights;
}
