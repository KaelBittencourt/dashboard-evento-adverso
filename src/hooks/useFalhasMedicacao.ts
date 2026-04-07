import { useState, useEffect, useMemo } from "react";

export interface MedErrorEvent {
  timestamp: Date | null;
  medicamento: string;
  via: string;
  lote: string;
  validade: string;
  marca: string;
  descricaoFalha: string;
  tipoFalha: string;
  turno: string;
}

export interface MedErrorFilters {
  dateStart: string;
  dateEnd: string;
  tipoFalha: string;
  via: string;
  medicamento: string;
}

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1T_4oRct4nvv4Lt2wkHTAz4x7xGyfkDmOVtF4jBrURMo/export?format=csv";

const TIPO_FALHA_MAP: { keywords: string[]; tipo: string }[] = [
  { keywords: ["horario errado", "hor\xe1rio errado", "periodo errado", "per\xedodo errado", "hora errada", "manh\xe3", "noite", "turno da manh\xe3", "turno da noite", "mandada em hor\xe1rio", "encaminhado para turno", "medica\xe7\xe3o do per\xedodo"], tipo: "Hor\xe1rio Incorreto" },
  { keywords: ["n\xe3o veio", "nao veio", "n\xe3o foi mandada", "nao foi mandada", "n\xe3o foi enviada", "nao foi enviada", "n\xe3o dispensou", "nao dispensou", "n\xe3o aparece", "nao aparece", "falta algumas"], tipo: "Medica\xe7\xe3o N\xe3o Enviada" },
  { keywords: ["dilui", "diluir", "reconstitui", "reconstituir", "desprezo", "descarte"], tipo: "Erro de Dilui\xe7\xe3o/Preparo" },
  { keywords: ["refrigera", "geladeira", "armazena", "r\xf3tulo de abertura", "sem r\xf3tulo", "nao foi colocado", "n\xe3o foi colocado", "etiqueta"], tipo: "Armazenamento Inadequado" },
  { keywords: ["super dose", "superdose", "dosagem", "metade", "1/2", "metade cp", "dose errada"], tipo: "Erro de Dosagem" },
  { keywords: ["ev", "im", "via de administra\xe7\xe3o", "via errada", "prescreve", "prescri", "via de admin"], tipo: "Via Incorreta" },
  { keywords: ["confundir", "misturadas", "troca", "encaminhou em alguns kits", "apresenta"], tipo: "Medicamento Similar/Confus\xe3o" },
  { keywords: ["falta na male", "falta na mal", "veio em falta"], tipo: "Medica\xe7\xe3o Faltante" },
  { keywords: ["comunica", "rispida", "rispida", "falta de comunica"], tipo: "Falha de Comunica\xe7\xe3o" },
  { keywords: ["reembolso", "reembols"], tipo: "Erro de Reembolso" },
];

function classifyFalha(desc: string): string {
  if (!desc) return "Outra";
  const lower = desc.toLowerCase().replace(/"/g, "");
  for (const rule of TIPO_FALHA_MAP) {
    if (rule.keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return rule.tipo;
    }
  }
  return "Outra";
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
  return new Date(year, Number(m) - 1, Number(d), Number(hh || 0), Number(mm || 0), Number(ss || 0));
}

function rowToEvent(r: string[]): MedErrorEvent {
  const ts = parseDate(r[0]);
  let turno = "";
  if (ts) {
    const h = ts.getHours();
    if (h >= 6 && h < 12) turno = "Manh\xe3";
    else if (h >= 12 && h < 18) turno = "Tarde";
    else turno = "Noite";
  }
  return {
    timestamp: ts,
    medicamento: r[1] || "",
    via: r[2] || "",
    lote: r[3] || "",
    validade: r[4] || "",
    marca: r[5] || "",
    descricaoFalha: (r[6] || "").replace(/^"|"$/g, "").trim(),
    tipoFalha: classifyFalha(r[6] || ""),
    turno,
  };
}

export function useFalhasMedicacao() {
  const [events, setEvents] = useState<MedErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFilters] = useState<MedErrorFilters>({
    dateStart: `${new Date().getFullYear()}-01-01`,
    dateEnd: "",
    tipoFalha: "",
    via: "",
    medicamento: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const data = rows.slice(1).filter((r) => r.length >= 5 && r[0]).map(rowToEvent);
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
      if (filters.tipoFalha && e.tipoFalha !== filters.tipoFalha) return false;
      if (filters.via && e.via !== filters.via) return false;
      if (filters.medicamento && e.medicamento !== filters.medicamento) return false;
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
    tiposFalha: [...new Set(events.map((e) => e.tipoFalha).filter(Boolean))].sort(),
    vias: [...new Set(events.map((e) => e.via).filter(Boolean))].sort(),
    medicamentos: [...new Set(events.map((e) => e.medicamento).filter(Boolean))].sort(),
  }), [events]);

  return { events, filteredEvents, loading, error, lastUpdated, filters, setFilters, options, refetch: fetchData };
}
