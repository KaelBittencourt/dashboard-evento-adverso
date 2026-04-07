import { useState, useEffect, useMemo } from "react";

export interface FallEvent {
  timestamp: Date | null;
  unidade: string;
  nomePaciente: string;
  dataNascimento: string;
  localQueda: string;
  dataQueda: Date | null;
  acompanhante: string;      // "Sim", "Não", "" or "Talvez"
  relatoQueda: string;
  profissionalAcionado: string;
  condutaTomada: string;
  quedaComDano: boolean;
  descricaoDano: string;
  turno: string;
}

export interface FallFilters {
  dateStart: string;
  dateEnd: string;
  localQueda: string;
  unidade: string;
  dano: string;         // "all" | "sim" | "nao"
  acompanhante: string; // "all" | "sim" | "nao"
}

const QUEDAS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1XaYBrEs3Ssuuv0GAYTOLZTbYCt0-l5W_0mSYDZtagBw/export?format=csv";

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(" ");
  const datePart = parts[0];
  const [d, m, y] = datePart.split("/");
  if (!d || !m || !y) return null;
  const timePart = parts[1] || "00:00:00";
  const [hh, mm, ss] = timePart.split(":");
  const year = Number(y);
  if (year < 1900 || year > 2100) return null;
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
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

/**
 * Normalises the free-text "Local da Queda" into a smaller set of categories.
 */
function normalizeLocal(raw: string): string {
  if (!raw) return "Não Informado";
  const lower = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (lower.includes("quarto") || lower.includes("leito")) return "Quarto";
  if (lower.includes("banheiro") || lower.includes("wc") || lower.includes("sanitario")) return "Banheiro";
  if (lower.includes("corredor")) return "Corredor";
  if (lower.includes("refeitorio") || lower.includes("refeicao") || lower.includes("janta") || lower.includes("mesa")) return "Refeitório";
  if (lower.includes("cadeira") || lower.includes("poltrona")) return "Cadeira/Poltrona";
  if (lower.includes("sala")) return "Sala/Área Comum";
  if (lower.includes("maca")) return "Maca";
  if (lower.includes("posto")) return "Posto de Enfermagem";
  if (lower.includes("acolhimento")) return "Acolhimento";
  return raw.length > 25 ? raw.substring(0, 23) + "…" : raw;
}

function rowToFallEvent(r: string[]): FallEvent {
  const timestampDate = parseDate(r[0]);
  const dataQueda = parseDate(r[5]) || timestampDate;

  let turno = "";
  const ref = timestampDate;
  if (ref) {
    const h = ref.getHours();
    if (h >= 6 && h < 12) turno = "Manhã";
    else if (h >= 12 && h < 18) turno = "Tarde";
    else turno = "Noite";
  }

  const danoRaw = (r[10] || "").toLowerCase().trim();
  const quedaComDano = danoRaw === "sim" || danoRaw === "sim,";

  return {
    timestamp: timestampDate,
    unidade: r[1] || "",
    nomePaciente: r[2] || "",
    dataNascimento: r[3] || "",
    localQueda: normalizeLocal(r[4]),
    dataQueda,
    acompanhante: (r[6] || "").trim(),
    relatoQueda: r[7] || "",
    profissionalAcionado: r[8] || "",
    condutaTomada: r[9] || "",
    quedaComDano,
    descricaoDano: quedaComDano ? (r[11] || "") : "",
    turno,
  };
}

export function useQuedas() {
  const [events, setEvents] = useState<FallEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFilters] = useState<FallFilters>({
    dateStart: "",
    dateEnd: "",
    localQueda: "",
    unidade: "",
    dano: "all",
    acompanhante: "all",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(QUEDAS_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const data = rows
        .slice(1)
        .filter((r) => r.length >= 5 && r[0])
        .map(rowToFallEvent)
        .filter((e) => e.dataQueda);
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
      if (filters.localQueda && e.localQueda !== filters.localQueda) return false;
      if (filters.unidade && e.unidade !== filters.unidade) return false;
      if (filters.dano === "sim" && !e.quedaComDano) return false;
      if (filters.dano === "nao" && e.quedaComDano) return false;
      if (filters.acompanhante === "sim") {
        const a = e.acompanhante.toLowerCase();
        if (a !== "sim") return false;
      }
      if (filters.acompanhante === "nao") {
        const a = e.acompanhante.toLowerCase();
        if (a === "sim") return false;
      }
      if (filters.dateStart && e.dataQueda) {
        const start = new Date(filters.dateStart);
        if (e.dataQueda < start) return false;
      }
      if (filters.dateEnd && e.dataQueda) {
        const end = new Date(filters.dateEnd);
        end.setHours(23, 59, 59);
        if (e.dataQueda > end) return false;
      }
      return true;
    });
  }, [events, filters]);

  const options = useMemo(() => ({
    locais: [...new Set(events.map((e) => e.localQueda).filter(Boolean))].sort(),
    unidades: [...new Set(events.map((e) => e.unidade).filter(Boolean))].sort(),
  }), [events]);

  return {
    events,
    filteredEvents,
    loading,
    error,
    lastUpdated,
    filters,
    setFilters,
    options,
    refetch: fetchData,
  };
}
