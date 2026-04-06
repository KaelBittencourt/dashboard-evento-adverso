import { FallEvent } from "@/hooks/useQuedas";
import { format, differenceInDays, getDay, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";

/* ──────────────────── KPIs ──────────────────── */

export interface FallKPIs {
  total: number;
  comDano: number;
  semDano: number;
  taxaDano: string;
  last30: number;
  prev30: number;
  trend: string | null;
  pacientesUnicos: number;
  pacientesReincidentes: number;
  taxaReincidencia: string;
  comAcompanhante: number;
  semAcompanhante: number;
  taxaSemAcompanhante: string;
  topLocal: [string, number] | null;
  topUnidade: [string, number] | null;
  mediaQuedaMes: string;
  quedaNoturna: number;
  taxaNoturna: string;
}

export function getFallKPIs(events: FallEvent[], allEvents: FallEvent[]): FallKPIs {
  const total = events.length;
  const comDano = events.filter((e) => e.quedaComDano).length;
  const semDano = total - comDano;
  const taxaDano = total > 0 ? ((comDano / total) * 100).toFixed(1) : "0";

  const now = new Date();
  const last30 = events.filter(
    (e) => e.dataQueda && differenceInDays(now, e.dataQueda) <= 30
  ).length;
  const prev30 = events.filter(
    (e) =>
      e.dataQueda &&
      differenceInDays(now, e.dataQueda) > 30 &&
      differenceInDays(now, e.dataQueda) <= 60
  ).length;
  const trend =
    prev30 > 0 ? (((last30 - prev30) / prev30) * 100).toFixed(1) : null;

  // Pacientes reincidentes
  const nameCount: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.nomePaciente) return;
    const key = e.nomePaciente.toUpperCase().trim();
    nameCount[key] = (nameCount[key] || 0) + 1;
  });
  const pacientesUnicos = Object.keys(nameCount).length;
  const pacientesReincidentes = Object.values(nameCount).filter((c) => c > 1).length;
  const taxaReincidencia =
    pacientesUnicos > 0
      ? ((pacientesReincidentes / pacientesUnicos) * 100).toFixed(1)
      : "0";

  // Acompanhante
  const comAcomp = events.filter(
    (e) => e.acompanhante.toLowerCase() === "sim"
  ).length;
  const semAcomp = events.filter(
    (e) => e.acompanhante.toLowerCase() === "não" || e.acompanhante === ""
  ).length;
  const taxaSemAcompanhante =
    total > 0 ? ((semAcomp / total) * 100).toFixed(1) : "0";

  // Top Local
  const byLocal: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.localQueda) return;
    byLocal[e.localQueda] = (byLocal[e.localQueda] || 0) + 1;
  });
  const topLocal = Object.entries(byLocal).sort((a, b) => b[1] - a[1])[0] || null;

  // Top Unidade
  const byUnidade: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.unidade) return;
    byUnidade[e.unidade] = (byUnidade[e.unidade] || 0) + 1;
  });
  const topUnidade = Object.entries(byUnidade).sort((a, b) => b[1] - a[1])[0] || null;

  // Média por mês
  const months = new Set<string>();
  events.forEach((e) => {
    if (e.dataQueda) months.add(format(e.dataQueda, "yyyy-MM"));
  });
  const mediaQuedaMes =
    months.size > 0 ? (total / months.size).toFixed(1) : "0";

  // Quedas noturnas
  const quedaNoturna = events.filter((e) => e.turno === "Noite").length;
  const taxaNoturna = total > 0 ? ((quedaNoturna / total) * 100).toFixed(1) : "0";

  return {
    total,
    comDano,
    semDano,
    taxaDano,
    last30,
    prev30,
    trend,
    pacientesUnicos,
    pacientesReincidentes,
    taxaReincidencia,
    comAcompanhante: comAcomp,
    semAcompanhante: semAcomp,
    taxaSemAcompanhante,
    topLocal,
    topUnidade,
    mediaQuedaMes,
    quedaNoturna,
    taxaNoturna,
  };
}

/* ──────────────────── Evolução mensal ──────────────────── */

export interface FallEvolutionData {
  month: string;
  total: number;
  comDano: number;
}

export function getFallEvolutionData(events: FallEvent[]): FallEvolutionData[] {
  const byMonth: Record<string, { total: number; comDano: number }> = {};

  events.forEach((e) => {
    if (!e.dataQueda) return;
    const key = format(e.dataQueda, "MM/yyyy");
    if (!byMonth[key]) byMonth[key] = { total: 0, comDano: 0 };
    byMonth[key].total++;
    if (e.quedaComDano) byMonth[key].comDano++;
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
        total: val.total,
        comDano: val.comDano,
      };
    });
}

/* ──────────────────── Por local da queda ──────────────────── */

export function getFallByLocalData(events: FallEvent[]) {
  const counts: Record<string, { total: number; comDano: number }> = {};
  events.forEach((e) => {
    if (!e.localQueda) return;
    if (!counts[e.localQueda]) counts[e.localQueda] = { total: 0, comDano: 0 };
    counts[e.localQueda].total++;
    if (e.quedaComDano) counts[e.localQueda].comDano++;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, val]) => ({ name, total: val.total, comDano: val.comDano }));
}

/* ──────────────────── Por unidade ──────────────────── */

export function getFallByUnidadeData(events: FallEvent[]) {
  const counts: Record<string, { total: number; comDano: number; semAcomp: number }> = {};
  events.forEach((e) => {
    if (!e.unidade) return;
    if (!counts[e.unidade]) counts[e.unidade] = { total: 0, comDano: 0, semAcomp: 0 };
    counts[e.unidade].total++;
    if (e.quedaComDano) counts[e.unidade].comDano++;
    if (e.acompanhante.toLowerCase() !== "sim") counts[e.unidade].semAcomp++;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([unidade, val]) => ({
      unidade,
      total: val.total,
      comDano: val.comDano,
      semDano: val.total - val.comDano,
      semAcomp: val.semAcomp,
    }));
}

/* ──────────────────── Pacientes Reincidentes ──────────────────── */

export interface ReincidenteData {
  nome: string;
  totalQuedas: number;
  comDano: number;
  unidades: string[];
  ultimaQueda: Date | null;
}

export function getReincidentesData(events: FallEvent[]): ReincidenteData[] {
  const map: Record<
    string,
    { nome: string; total: number; comDano: number; unidades: Set<string>; ultima: Date | null }
  > = {};

  events.forEach((e) => {
    if (!e.nomePaciente) return;
    const key = e.nomePaciente.toUpperCase().trim();
    if (!map[key]) {
      map[key] = {
        nome: e.nomePaciente,
        total: 0,
        comDano: 0,
        unidades: new Set(),
        ultima: null,
      };
    }
    map[key].total++;
    if (e.quedaComDano) map[key].comDano++;
    if (e.unidade) map[key].unidades.add(e.unidade);
    if (e.dataQueda && (!map[key].ultima || e.dataQueda > map[key].ultima!)) {
      map[key].ultima = e.dataQueda;
    }
  });

  return Object.values(map)
    .filter((p) => p.total > 1)
    .sort((a, b) => b.total - a.total)
    .map((p) => ({
      nome: p.nome,
      totalQuedas: p.total,
      comDano: p.comDano,
      unidades: [...p.unidades],
      ultimaQueda: p.ultima,
    }));
}

/* ──────────────────── Acompanhante vs Dano (análise cruzada) ──────────────────── */

export interface AcompanhanteDanoData {
  label: string;
  comDano: number;
  semDano: number;
  total: number;
}

export function getAcompanhanteDanoData(events: FallEvent[]): AcompanhanteDanoData[] {
  const groups = {
    "Com Acompanhante": { comDano: 0, semDano: 0, total: 0 },
    "Sem Acompanhante": { comDano: 0, semDano: 0, total: 0 },
  };

  events.forEach((e) => {
    const key =
      e.acompanhante.toLowerCase() === "sim" ? "Com Acompanhante" : "Sem Acompanhante";
    groups[key].total++;
    if (e.quedaComDano) groups[key].comDano++;
    else groups[key].semDano++;
  });

  return Object.entries(groups).map(([label, val]) => ({
    label,
    ...val,
  }));
}

/* ──────────────────── Dia da semana ──────────────────── */

export function getFallByWeekdayData(events: FallEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = new Array(7).fill(0);
  const dano = new Array(7).fill(0);
  events.forEach((e) => {
    if (!e.dataQueda) return;
    const d = getDay(e.dataQueda);
    counts[d]++;
    if (e.quedaComDano) dano[d]++;
  });
  return days.map((day, i) => ({ day, total: counts[i], comDano: dano[i] }));
}

/* ──────────────────── Turno ──────────────────── */

export function getFallByTurnoData(events: FallEvent[]) {
  const turnos = ["Manhã", "Tarde", "Noite"];
  const counts: Record<string, { total: number; comDano: number }> = {};
  turnos.forEach((t) => (counts[t] = { total: 0, comDano: 0 }));

  events.forEach((e) => {
    if (!e.turno) return;
    if (!counts[e.turno]) counts[e.turno] = { total: 0, comDano: 0 };
    counts[e.turno].total++;
    if (e.quedaComDano) counts[e.turno].comDano++;
  });

  return turnos.map((turno) => ({
    turno,
    total: counts[turno]?.total || 0,
    comDano: counts[turno]?.comDano || 0,
  }));
}

/* ──────────────────── Heatmap ──────────────────── */

export function getFallHeatmapData(events: FallEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data: { day: string; hour: number; value: number }[] = [];
  const matrix: Record<string, Record<number, number>> = {};

  events.forEach((e) => {
    if (!e.timestamp) return;
    const d = days[getDay(e.timestamp)];
    const h = getHours(e.timestamp);
    if (!matrix[d]) matrix[d] = {};
    matrix[d][h] = (matrix[d][h] || 0) + 1;
  });

  days.forEach((day) => {
    for (let h = 0; h < 24; h++) {
      data.push({ day, hour: h, value: matrix[day]?.[h] || 0 });
    }
  });
  return data;
}

/* ──────────────────── Insights específicos de Quedas ──────────────────── */

export function generateFallInsights(events: FallEvent[], allEvents: FallEvent[]) {
  const insights: { type: "danger" | "warning" | "success"; message: string }[] = [];
  const kpis = getFallKPIs(events, allEvents);

  // Tendência
  if (kpis.prev30 > 0 && kpis.last30 > kpis.prev30 * 1.2) {
    const pct = (((kpis.last30 - kpis.prev30) / kpis.prev30) * 100).toFixed(0);
    insights.push({
      type: "danger",
      message: `⚠️ Aumento de ${pct}% nas quedas nos últimos 30 dias (${kpis.last30}) vs período anterior (${kpis.prev30}).`,
    });
  } else if (kpis.prev30 > 0 && kpis.last30 < kpis.prev30 * 0.8) {
    const pct = (((kpis.prev30 - kpis.last30) / kpis.prev30) * 100).toFixed(0);
    insights.push({
      type: "success",
      message: `✅ Redução de ${pct}% nas quedas nos últimos 30 dias. Boa evolução!`,
    });
  }

  // Reincidência
  if (kpis.pacientesReincidentes > 0) {
    insights.push({
      type: "warning",
      message: `🔁 ${kpis.pacientesReincidentes} paciente(s) reincidente(s) detectado(s), representando ${kpis.taxaReincidencia}% dos pacientes.`,
    });
  }

  // Sem acompanhante
  if (parseFloat(kpis.taxaSemAcompanhante) > 60) {
    insights.push({
      type: "danger",
      message: `👤 ${kpis.taxaSemAcompanhante}% das quedas ocorreram SEM acompanhante presente. Recomendada atenção à supervisão.`,
    });
  }

  // Setor crítico
  if (kpis.topUnidade) {
    const pct = kpis.total > 0 ? ((kpis.topUnidade[1] / kpis.total) * 100).toFixed(0) : 0;
    insights.push({
      type: "danger",
      message: `🏥 Setor com maior incidência de quedas: "${kpis.topUnidade[0]}" com ${kpis.topUnidade[1]} ocorrências (${pct}% do total).`,
    });
  }

  // Local mais frequente
  if (kpis.topLocal) {
    insights.push({
      type: "warning",
      message: `📍 Local mais frequente de quedas: "${kpis.topLocal[0]}" — ${kpis.topLocal[1]} ocorrências.`,
    });
  }

  // Noturnas
  if (parseFloat(kpis.taxaNoturna) > 30) {
    insights.push({
      type: "warning",
      message: `🌙 ${kpis.taxaNoturna}% das quedas ocorreram no turno noturno (${kpis.quedaNoturna} quedas). Avaliar iluminação e rondas.`,
    });
  }

  // Taxa de dano
  if (parseFloat(kpis.taxaDano) > 20) {
    insights.push({
      type: "danger",
      message: `🔴 ${kpis.taxaDano}% das quedas resultaram em dano ao paciente.`,
    });
  } else if (parseFloat(kpis.taxaDano) < 10 && kpis.total > 5) {
    insights.push({
      type: "success",
      message: `✅ Apenas ${kpis.taxaDano}% das quedas resultaram em dano. Baixo índice de lesões.`,
    });
  }

  return insights;
}
