import { AdverseEvent } from "@/hooks/useAdverseEvents";
import {
  format,
  parseISO,
  startOfMonth,
  differenceInDays,
  getDay,
  getHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function getKPIs(events: AdverseEvent[], allEvents: AdverseEvent[]) {
  const total = events.length;

  const withDamage = events.filter((e) => e.danos && e.danos !== "Nenhum").length;
  const withoutDamage = total - withDamage;
  const critical = events.filter((e) =>
    ["Severo", "Morte"].includes(e.danos)
  ).length;
  const criticalPct = total > 0 ? ((critical / total) * 100).toFixed(1) : "0";
  const damagePct = total > 0 ? ((withDamage / total) * 100).toFixed(1) : "0";

  // Avg resolution time (days between dataEvento and timestamp)
  const resolved = events.filter(
    (e) => e.dataEvento && e.timestamp
  );
  const avgResolutionDays =
    resolved.length > 0
      ? (
          resolved.reduce((sum, e) => {
            const diff = differenceInDays(e.timestamp!, e.dataEvento!);
            return sum + Math.max(0, diff);
          }, 0) / resolved.length
        ).toFixed(1)
      : "N/A";

  // Events per month (last 12 months)
  const byMonth: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.dataEvento) return;
    const key = format(e.dataEvento, "MMM/yy", { locale: ptBR });
    byMonth[key] = (byMonth[key] || 0) + 1;
  });

  // Trend: compare last 30d vs previous 30d
  const now = new Date();
  const last30 = events.filter(
    (e) => e.dataEvento && differenceInDays(now, e.dataEvento) <= 30
  ).length;
  const prev30 = events.filter(
    (e) =>
      e.dataEvento &&
      differenceInDays(now, e.dataEvento) > 30 &&
      differenceInDays(now, e.dataEvento) <= 60
  ).length;
  const trend =
    prev30 > 0 ? (((last30 - prev30) / prev30) * 100).toFixed(1) : null;

  // By sector KPI
  const byUnidade: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.unidade) return;
    byUnidade[e.unidade] = (byUnidade[e.unidade] || 0) + 1;
  });
  const topUnidade = Object.entries(byUnidade).sort((a, b) => b[1] - a[1])[0];

  // By type KPI
  const byType: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.tipoEvento) return;
    byType[e.tipoEvento] = (byType[e.tipoEvento] || 0) + 1;
  });
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    withDamage,
    withoutDamage,
    critical,
    criticalPct,
    damagePct,
    avgResolutionDays,
    last30,
    prev30,
    trend,
    topUnidade,
    topType,
    byMonth,
  };
}

export function getEvolutionData(events: AdverseEvent[]) {
  const byMonth: Record<string, { total: number; critical: number }> = {};

  events.forEach((e) => {
    if (!e.dataEvento) return;
    const key = format(e.dataEvento, "MM/yyyy");
    if (!byMonth[key]) byMonth[key] = { total: 0, critical: 0 };
    byMonth[key].total++;
    if (["Severo", "Morte"].includes(e.danos)) byMonth[key].critical++;
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
        critical: val.critical,
      };
    });
}

export function getByTypeData(events: AdverseEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.tipoEvento) return;
    counts[e.tipoEvento] = (counts[e.tipoEvento] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

export function getByDamageData(events: AdverseEvent[]) {
  const order = ["Nenhum", "Leve", "Moderado", "Severo", "Morte"];
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    const d = e.danos || "N/A";
    counts[d] = (counts[d] || 0) + 1;
  });
  return order
    .filter((k) => counts[k])
    .map((name) => ({ name, value: counts[name] || 0 }));
}

export function getByUnidadeData(events: AdverseEvent[]) {
  const counts: Record<string, Record<string, number>> = {};
  events.forEach((e) => {
    if (!e.unidade) return;
    if (!counts[e.unidade]) counts[e.unidade] = {};
    const d = e.danos || "Nenhum";
    counts[e.unidade][d] = (counts[e.unidade][d] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([unidade, danos]) => ({
      unidade: unidade.replace("Unidade de ", "").replace("Bloco ", ""),
      total: Object.values(danos).reduce((a, b) => a + b, 0),
      Nenhum: danos["Nenhum"] || 0,
      Leve: danos["Leve"] || 0,
      Moderado: danos["Moderado"] || 0,
      Severo: danos["Severo"] || 0,
      Morte: danos["Morte"] || 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getByWeekdayData(events: AdverseEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const counts = new Array(7).fill(0);
  events.forEach((e) => {
    if (!e.dataEvento) return;
    counts[getDay(e.dataEvento)]++;
  });
  return days.map((day, i) => ({ day, count: counts[i] }));
}

export function getHeatmapData(events: AdverseEvent[]) {
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const data: { day: string; hour: number; value: number }[] = [];
  const matrix: Record<string, Record<number, number>> = {};

  events.forEach((e) => {
    if (!e.dataEvento) return;
    const d = days[getDay(e.dataEvento)];
    const h = getHours(e.dataEvento);
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

export function getParetoData(events: AdverseEvent[]) {
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    if (!e.tipoEvento) return;
    counts[e.tipoEvento] = (counts[e.tipoEvento] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, v]) => s + v, 0);
  let cumulative = 0;
  return sorted.map(([name, value]) => {
    cumulative += value;
    return {
      name: name.length > 30 ? name.substring(0, 28) + "..." : name,
      fullName: name,
      value,
      cumulative: parseFloat(((cumulative / total) * 100).toFixed(1)),
    };
  });
}

export function getPerformanceTable(events: AdverseEvent[]) {
  const byUnidade: Record<
    string,
    { total: number; resolucaoDias: number[]; criticos: number }
  > = {};
  const totalEvents = events.length;

  events.forEach((e) => {
    if (!e.unidade) return;
    if (!byUnidade[e.unidade]) byUnidade[e.unidade] = { total: 0, resolucaoDias: [], criticos: 0 };
    byUnidade[e.unidade].total++;
    if (e.dataEvento && e.timestamp) {
      const diff = differenceInDays(e.timestamp, e.dataEvento);
      if (diff >= 0) byUnidade[e.unidade].resolucaoDias.push(diff);
    }
    if (["Severo", "Morte"].includes(e.danos)) byUnidade[e.unidade].criticos++;
  });

  return Object.entries(byUnidade)
    .map(([unidade, data]) => ({
      unidade,
      total: data.total,
      pctTotal:
        totalEvents > 0
          ? parseFloat(((data.total / totalEvents) * 100).toFixed(1))
          : 0,
      avgResolucao:
        data.resolucaoDias.length > 0
          ? parseFloat(
              (
                data.resolucaoDias.reduce((a, b) => a + b, 0) /
                data.resolucaoDias.length
              ).toFixed(1)
            )
          : null,
      criticos: data.criticos,
    }))
    .sort((a, b) => b.total - a.total);
}

export function generateInsights(events: AdverseEvent[], allEvents: AdverseEvent[]) {
  const insights: { type: "danger" | "warning" | "success"; message: string }[] = [];
  const now = new Date();

  const last30 = events.filter(
    (e) => e.dataEvento && differenceInDays(now, e.dataEvento) <= 30
  ).length;
  const prev30 = events.filter(
    (e) =>
      e.dataEvento &&
      differenceInDays(now, e.dataEvento) > 30 &&
      differenceInDays(now, e.dataEvento) <= 60
  ).length;

  if (prev30 > 0 && last30 > prev30 * 1.2) {
    const pct = (((last30 - prev30) / prev30) * 100).toFixed(0);
    insights.push({
      type: "danger",
      message: `⚠️ Aumento de ${pct}% nos eventos nos últimos 30 dias em comparação ao período anterior.`,
    });
  } else if (prev30 > 0 && last30 < prev30 * 0.8) {
    const pct = (((prev30 - last30) / prev30) * 100).toFixed(0);
    insights.push({
      type: "success",
      message: `✅ Redução de ${pct}% nos eventos nos últimos 30 dias. Boa evolução!`,
    });
  }

  // Top sector
  const byUnidade: Record<string, number> = {};
  events.forEach((e) => { if (e.unidade) byUnidade[e.unidade] = (byUnidade[e.unidade] || 0) + 1; });
  const topSector = Object.entries(byUnidade).sort((a, b) => b[1] - a[1])[0];
  if (topSector) {
    const pct = events.length > 0 ? ((topSector[1] / events.length) * 100).toFixed(0) : 0;
    insights.push({
      type: "danger",
      message: `🏥 Setor com maior incidência: "${topSector[0]}" com ${topSector[1]} eventos (${pct}% do total).`,
    });
  }

  // Top event type
  const byType: Record<string, number> = {};
  events.forEach((e) => { if (e.tipoEvento) byType[e.tipoEvento] = (byType[e.tipoEvento] || 0) + 1; });
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  if (topType) {
    insights.push({
      type: "warning",
      message: `📋 Tipo mais recorrente: "${topType[0]}" com ${topType[1]} ocorrências.`,
    });
  }

  // Avg resolution
  const resolved = events.filter((e) => e.dataEvento && e.timestamp);
  if (resolved.length > 0) {
    const avg =
      resolved.reduce((sum, e) => {
        const diff = differenceInDays(e.timestamp!, e.dataEvento!);
        return sum + Math.max(0, diff);
      }, 0) / resolved.length;

    if (avg > 7) {
      insights.push({
        type: "warning",
        message: `⏱️ Tempo médio de resolução de ${avg.toFixed(1)} dias. Recomendado: < 7 dias.`,
      });
    }
  }

  // Critical events
  const criticos = events.filter((e) => ["Severo", "Morte"].includes(e.danos));
  if (criticos.length > 0) {
    insights.push({
      type: "danger",
      message: `🔴 ${criticos.length} evento(s) com gravidade Severo ou Morte registrado(s).`,
    });
  }

  return insights;
}
