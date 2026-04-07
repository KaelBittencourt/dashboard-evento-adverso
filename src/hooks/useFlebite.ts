import { useState, useEffect, useMemo } from "react";

export interface PhlebitisEvent {
  timestamp: Date | null;
  unidade: string;
  nomePaciente: string;
  dataNascimento: string;
  membroCateter: string;       // MSD, MSE, etc. normalised
  membroCateterRaw: string;    // original text
  dataInstalacao: Date | null;
  descricao: string;
  turno: string;
  diasAteNotificacao: number | null; // days between installation and timestamp
  tipoCateter: string;         // "Periférico" | "Central" | "Não Informado"
  sinaisFlogisticos: string[]; // extracted symptoms
}

export interface PhlebitisFilters {
  dateStart: string;
  dateEnd: string;
  membro: string;
  unidade: string;
  tipoCateter: string;
}

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1f5oG1A7-6TOUww1BkYdpo4A1si0OhkzVU36auHWTO-M/export?format=csv";

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(" ");
  const datePart = parts[0];
  const [d, m, y] = datePart.split("/");
  if (!d || !m || !y) return null;
  const year = Number(y);
  if (year < 1900 || year > 2100) return null;
  const timePart = parts[1] || "00:00:00";
  const [hh, mm, ss] = timePart.split(":");
  return new Date(
    year,
    Number(m) - 1,
    Number(d),
    Number(hh || 0),
    Number(mm || 0),
    Number(ss || 0)
  );
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(cell.trim()); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim()); rows.push(row); row = []; cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  return rows;
}

function normalizeMembro(raw: string): string {
  if (!raw) return "Não Informado";
  const upper = raw.toUpperCase().trim();
  if (upper.includes("SUB CLAVIA") || upper.includes("SUBCLAVIA") || upper.includes("CENTRAL")) {
    if (upper.includes("D")) return "CVC Subclávia D";
    if (upper.includes("E")) return "CVC Subclávia E";
    return "CVC Subclávia";
  }
  if (upper.includes("MSD") && upper.includes("MSE")) return "MSD e MSE";
  if (upper.startsWith("MSD") || upper.includes("MÃO DIREITA") || upper.includes("MAO DIREITA") || upper === "MSD") return "MSD";
  if (upper.startsWith("MSE") || upper.includes("MÃO ESQUERDA") || upper === "MSE") return "MSE";
  if (upper.includes("MIE") || upper.includes("MID")) return upper.includes("MIE") ? "MIE" : "MID";
  if (upper.includes("AVC")) {
    if (upper.includes("D")) return "CVC Subclávia D";
    return "CVC Subclávia E";
  }
  return raw.length > 20 ? raw.substring(0, 18) + "…" : raw;
}

function detectTipoCateter(membro: string, desc: string): string {
  const lower = (membro + " " + desc).toLowerCase();
  if (lower.includes("central") || lower.includes("sub clavia") || lower.includes("subclavia") || lower.includes("avc ")) return "Central";
  if (lower.includes("scalp") || lower.includes("avp") || lower.includes("abo") || lower.includes("flexivel") || lower.includes("flexível") || lower.includes("periférico") || lower.includes("periferico")) return "Periférico";
  return "Periférico"; // default for most IV lines
}

function extractSinais(desc: string): string[] {
  if (!desc) return [];
  const lower = desc.toLowerCase();
  const sinais: string[] = [];
  if (lower.includes("rubor") || lower.includes("vermelhid") || lower.includes("hiperemia") || lower.includes("eritema")) sinais.push("Rubor/Hiperemia");
  if (lower.includes("edema") || lower.includes("inchaço") || lower.includes("infiltra")) sinais.push("Edema/Infiltração");
  if (lower.includes("dor") || lower.includes("algia")) sinais.push("Dor");
  if (lower.includes("calor") || lower.includes("quente")) sinais.push("Calor");
  if (lower.includes("purulenta") || lower.includes("secreção") || lower.includes("secrecao")) sinais.push("Secreção");
  if (lower.includes("endurecimento") || lower.includes("endureci")) sinais.push("Endurecimento");
  return sinais;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function normalizeUnidade(raw: string): string {
  if (!raw) return "";
  const t = raw.trim();
  if (t.toUpperCase() === "INTERNAÇÃO" || t.toUpperCase() === "INTERNACAO") {
    return "Unidade de Internação";
  }
  return t;
}

function rowToEvent(r: string[]): PhlebitisEvent {
  const ts = parseDate(r[0]);
  const dataInstalacao = parseDate(r[5]);
  const desc = r[6] || "";

  let turno = "";
  if (ts) {
    const h = ts.getHours();
    if (h >= 6 && h < 12) turno = "Manhã";
    else if (h >= 12 && h < 18) turno = "Tarde";
    else turno = "Noite";
  }

  const dias = (dataInstalacao && ts) ? diffDays(dataInstalacao, ts) : null;

  return {
    timestamp: ts,
    unidade: normalizeUnidade(r[1]),
    nomePaciente: r[2] || "",
    dataNascimento: r[3] || "",
    membroCateter: normalizeMembro(r[4]),
    membroCateterRaw: r[4] || "",
    dataInstalacao,
    descricao: desc,
    turno,
    diasAteNotificacao: dias !== null && dias >= 0 ? dias : null,
    tipoCateter: detectTipoCateter(r[4] || "", desc),
    sinaisFlogisticos: extractSinais(desc),
  };
}

export function useFlebite() {
  const [events, setEvents] = useState<PhlebitisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFilters] = useState<PhlebitisFilters>({
    dateStart: `${new Date().getFullYear()}-01-01`,
    dateEnd: "",
    membro: "",
    unidade: "",
    tipoCateter: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const data = rows.slice(1).filter((r) => r.length >= 5 && r[0]).map(rowToEvent).filter((e) => e.timestamp);
      setEvents(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filters.membro && e.membroCateter !== filters.membro) return false;
      if (filters.unidade && e.unidade !== filters.unidade) return false;
      if (filters.tipoCateter && e.tipoCateter !== filters.tipoCateter) return false;
      if (filters.dateStart && e.timestamp) {
        if (e.timestamp < new Date(filters.dateStart)) return false;
      }
      if (filters.dateEnd && e.timestamp) {
        const end = new Date(filters.dateEnd);
        end.setHours(23, 59, 59);
        if (e.timestamp > end) return false;
      }
      return true;
    });
  }, [events, filters]);

  const options = useMemo(() => ({
    membros: [...new Set(events.map((e) => e.membroCateter).filter(Boolean))].sort(),
    unidades: [...new Set(events.map((e) => e.unidade).filter(Boolean))].sort(),
    tipos: [...new Set(events.map((e) => e.tipoCateter).filter(Boolean))].sort(),
  }), [events]);

  return { events, filteredEvents, loading, error, lastUpdated, filters, setFilters, options, refetch: fetchData };
}
