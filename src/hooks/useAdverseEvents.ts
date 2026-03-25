import { useState, useEffect, useMemo } from "react";

export interface AdverseEvent {
  dataInternacao: string;
  nomePaciente: string;
  dataNascimento: string;
  idade: number;
  unidade: string;
  leito: string;
  registro: string;
  sexo: string;
  motivoInternacao: string;
  dataEvento: Date | null;
  turno: string;
  tipoEvento: string;
  acompanhante: string;
  localEvento: string;
  riscoPrelistado: string;
  nivelSensorialPre: string;
  nivelSensorialPos: string;
  danos: string;
  comunicadoMedico: string;
  avaliacaoPlantao: string;
  transferenciaSETOR: string;
  transferenciaINSTITUICAO: string;
  localTransferencia: string;
  timestamp: Date | null;
  descricaoEvento: string;
}

export interface Filters {
  dateStart: string;
  dateEnd: string;
  tipoEvento: string;
  unidade: string;
  danos: string;
  turno: string;
}

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1rzxITVCMKsrK4dSTz7XPbnp_pa1hHjkKmECie0iqF6c/export?format=csv";

function parseDate(str: string): Date | null {
  if (!str) return null;
  // Format: DD/MM/YYYY HH:MM:SS or DD/MM/YYYY
  const parts = str.trim().split(" ");
  const datePart = parts[0];
  const [d, m, y] = datePart.split("/");
  if (!d || !m || !y) return null;
  const timePart = parts[1] || "00:00:00";
  const [hh, mm, ss] = timePart.split(":");
  return new Date(
    Number(y),
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

function rowToEvent(r: string[]): AdverseEvent {
  return {
    dataInternacao: r[0] || "",
    nomePaciente: r[1] || "",
    dataNascimento: r[2] || "",
    idade: parseInt(r[3]) || 0,
    unidade: r[4] || "",
    leito: r[5] || "",
    registro: r[6] || "",
    sexo: r[7] || "",
    motivoInternacao: r[8] || "",
    dataEvento: parseDate(r[9]),
    turno: r[10] || "",
    tipoEvento: r[11] || "",
    acompanhante: r[12] || "",
    localEvento: r[13] || "",
    riscoPrelistado: r[14] || "",
    nivelSensorialPre: r[15] || "",
    nivelSensorialPos: r[16] || "",
    danos: r[17] || "",
    comunicadoMedico: r[18] || "",
    avaliacaoPlantao: r[19] || "",
    transferenciaSETOR: r[20] || "",
    transferenciaINSTITUICAO: r[21] || "",
    localTransferencia: r[22] || "",
    timestamp: parseDate(r[23]),
    descricaoEvento: r[26] || "",
  };
}

export function useAdverseEvents() {
  const [events, setEvents] = useState<AdverseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFilters] = useState<Filters>({
    dateStart: "2022-08-01",
    dateEnd: "",
    tipoEvento: "",
    unidade: "",
    danos: "",
    turno: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(SHEET_CSV_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const rows = parseCSV(text);
      const data = rows.slice(1).filter((r) => r.length > 5 && r[9]).map(rowToEvent);
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
    const interval = setInterval(fetchData, 5 * 60 * 1000); // 5 min cache
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filters.tipoEvento && e.tipoEvento !== filters.tipoEvento) return false;
      if (filters.unidade && e.unidade !== filters.unidade) return false;
      if (filters.danos && e.danos !== filters.danos) return false;
      if (filters.turno && e.turno !== filters.turno) return false;
      if (filters.dateStart && e.dataEvento) {
        const start = new Date(filters.dateStart);
        if (e.dataEvento < start) return false;
      }
      if (filters.dateEnd && e.dataEvento) {
        const end = new Date(filters.dateEnd);
        end.setHours(23, 59, 59);
        if (e.dataEvento > end) return false;
      }
      return true;
    });
  }, [events, filters]);

  // Unique options for filters
  const options = useMemo(() => ({
    tiposEvento: [...new Set(events.map((e) => e.tipoEvento).filter(Boolean))].sort(),
    unidades: [...new Set(events.map((e) => e.unidade).filter(Boolean))].sort(),
    danos: ["Nenhum", "Leve", "Moderado", "Severo", "Morte"],
    turnos: ["Manhã", "Tarde", "Noite"],
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
