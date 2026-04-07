import { useState, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════ */

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1T_4oRct4nvv4Lt2wkHTAz4x7xGyfkDmOVtF4jBrURMo/export?format=csv";

/**
 * Mapeamento de colunas do CSV:
 * 0 → Carimbo de data/hora  (DD/MM/YYYY HH:MM:SS)
 * 1 → NOME MEDICAMENTO
 * 2 → VIA                   (EV, IM, VO, SC)
 * 3 → LOTE
 * 4 → VALIDADE              (DD/MM/YYYY)
 * 5 → MARCA
 * 6 → QUAL FALHA OCORREU?   (texto livre, pode ter múltiplas linhas)
 */

/* ═══════════════════════════════════════════════════════
   CLASSIFICAÇÃO DE TIPO DE FALHA
   ═══════════════════════════════════════════════════════ */

const TIPO_FALHA_MAP: { keywords: string[]; tipo: string }[] = [
  {
    keywords: [
      "horario errado", "horário errado", "periodo errado", "período errado",
      "hora errada", "mandada em horário", "encaminhado para turno",
      "medicação do período", "turno da manhã medicação que quem administra",
      "quem administra é a noite", "encaminhada para o turno",
    ],
    tipo: "Horário Incorreto",
  },
  {
    keywords: [
      "não veio", "nao veio", "não foi mandada", "nao foi mandada",
      "não foi enviada", "nao foi enviada", "não dispensou", "nao dispensou",
      "não aparece", "nao aparece", "falta algumas", "não foi manda",
      "veio em falta",
    ],
    tipo: "Medicação Não Enviada",
  },
  {
    keywords: [
      "diluição", "diluir", "reconstituição", "reconstituir",
      "desprezo", "descarte", "erro de diluição",
    ],
    tipo: "Erro de Diluição/Preparo",
  },
  {
    keywords: [
      "refrigera", "geladeira", "armazena", "rótulo de abertura",
      "sem rótulo", "não foi colocado", "nao foi colocado", "etiqueta",
    ],
    tipo: "Armazenamento Inadequado",
  },
  {
    keywords: [
      "super dose", "superdose", "dosagem", "metade", "1/2",
      "metade cp", "dose errada", "1cp", "1/2cp",
    ],
    tipo: "Erro de Dosagem",
  },
  {
    keywords: [
      "via de administração", "via errada", "prescreve", "prescri",
      "via de admin",
    ],
    tipo: "Via Incorreta",
  },
  {
    keywords: [
      "confundir", "misturadas", "troca", "encaminhou em alguns kits",
      "apresenta",
    ],
    tipo: "Medicamento Similar/Confusão",
  },
  {
    keywords: ["falta na male", "falta na mal", "veio em falta", "maeleta"],
    tipo: "Medicação Faltante",
  },
  {
    keywords: ["comunica", "rispida", "falta de comunica"],
    tipo: "Falha de Comunicação",
  },
  {
    keywords: ["reembolso", "reembols"],
    tipo: "Erro de Reembolso",
  },
  {
    keywords: ["alergia", "alérgi"],
    tipo: "Alergia Não Observada",
  },
  {
    keywords: ["prescrever manualmente", "não aparece na prescrição"],
    tipo: "Falha no Sistema/Prescrição",
  },
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

/* ═══════════════════════════════════════════════════════
   PARSER CSV ROBUSTO (suporta campos multilinha)
   ═══════════════════════════════════════════════════════ */

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
      if (row.some((c) => c !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some((c) => c !== "")) rows.push(row);
  }
  return rows;
}

/* ═══════════════════════════════════════════════════════
   PARSE DE DATAS
   ═══════════════════════════════════════════════════════ */

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(" ");
  const datePart = parts[0];
  const segs = datePart.split("/");
  if (segs.length !== 3) return null;
  const [d, m, y] = segs;
  if (!d || !m || !y) return null;
  const year = Number(y);
  if (year < 1900 || year > 2100) return null;
  const timePart = parts[1] || "00:00:00";
  const [hh, mm, ss] = timePart.split(":");
  return new Date(year, Number(m) - 1, Number(d), Number(hh || 0), Number(mm || 0), Number(ss || 0));
}

/* ═══════════════════════════════════════════════════════
   NORMALIZAÇÃO DE NOMES DE MEDICAMENTOS
   Remove acentos, normaliza espaços e padroniza capitalização
   para evitar duplicatas (ex: "cloreto de sódio" vs "cloreto de sodio")
   ═══════════════════════════════════════════════════════ */

function normalizeMarca(raw: string): string {
  if (!raw) return "Não informado";
  const semAcento = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const limpo = semAcento.replace(/\s+/g, " ").trim().toUpperCase();
  if (!limpo || limpo === "-" || limpo === "N/A" || limpo === "NAO SE APLICA" || limpo === "NÃO SE APLICA" || limpo === "N") return "Não informado";
  return limpo;
}

function normalizeMedicamento(raw: string): string {
  if (!raw) return "";
  // Remove acentos usando decomposição Unicode
  const semAcento = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  // Normaliza espaços (múltiplos → um só) e trim
  const limpo = semAcento.replace(/\s+/g, " ").trim();
  // Capitaliza: primeira letra de cada palavra maiúscula, resto minúsculo
  // Exceção para siglas comuns (mg, ml, inj, etc) que ficam minúsculas
  return limpo
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
}

/* ═══════════════════════════════════════════════════════
   CONVERSÃO LINHA → EVENTO
   ═══════════════════════════════════════════════════════ */

function rowToEvent(r: string[]): MedErrorEvent {
  const ts = parseDate(r[0]);

  // Turno derivado do horário do timestamp
  let turno = "";
  if (ts) {
    const h = ts.getHours();
    if (h >= 6 && h < 12) turno = "Manhã";
    else if (h >= 12 && h < 18) turno = "Tarde";
    else turno = "Noite";
  }

  const rawDesc = (r[6] || "").replace(/^"|"$/g, "").trim();

  return {
    timestamp: ts,
    medicamento: normalizeMedicamento(r[1] || ""),
    via: (r[2] || "").trim().toUpperCase(),
    lote: (r[3] || "").trim(),
    validade: (r[4] || "").trim(),
    marca: normalizeMarca(r[5] || ""),
    descricaoFalha: rawDesc,
    tipoFalha: classifyFalha(rawDesc),
    turno,
  };
}

/* ═══════════════════════════════════════════════════════
   HOOK PRINCIPAL
   ═══════════════════════════════════════════════════════ */

export function useFalhasMedicacao() {
  const [events, setEvents] = useState<MedErrorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [filters, setFilters] = useState<MedErrorFilters>({
    dateStart: "",
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

      // Pula cabeçalho (linha 0). Exige >= 7 colunas para ter o campo descricaoFalha (índice 6)
      const data = rows
        .slice(1)
        .filter((r) => r.length >= 7 && r[0])
        .map(rowToEvent);

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

  /* Filtragem reativa */
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

  /* Opções para selects */
  const options = useMemo(() => ({
    tiposFalha: [...new Set(events.map((e) => e.tipoFalha).filter(Boolean))].sort(),
    vias: [...new Set(events.map((e) => e.via).filter(Boolean))].sort(),
    medicamentos: [...new Set(events.map((e) => e.medicamento).filter(Boolean))].sort(),
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
