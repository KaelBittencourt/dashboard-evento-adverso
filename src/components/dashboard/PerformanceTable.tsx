import { getPerformanceTable } from "@/lib/analytics";
import { AdverseEvent } from "@/hooks/useAdverseEvents";
import { Download, BarChart3 } from "lucide-react";

interface PerformanceTableProps {
  events: AdverseEvent[];
}

function exportCSV(events: AdverseEvent[]) {
  const headers = [
    "Nome do Paciente",
    "Data do Evento",
    "Tipo do Evento",
    "Unidade",
    "Danos",
    "Turno",
  ];
  const rows = events.map((e) => [
    e.nomePaciente,
    e.dataEvento ? e.dataEvento.toLocaleDateString("pt-BR") : "",
    e.tipoEvento,
    e.unidade,
    e.danos,
    e.turno,
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${c}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eventos_adversos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function PerformanceTable({ events }: PerformanceTableProps) {
  const data = getPerformanceTable(events);

  return (
    <div className="lg:col-span-2 flex flex-col group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
            <BarChart3 size={14} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Performance por Setor
            </h3>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Volume, participação e tempo médio
            </p>
          </div>
        </div>
        <button
          onClick={() => exportCSV(events)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-border/60 bg-secondary/50 hover:bg-secondary hover:border-primary/20 text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <Download size={11} />
          CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2.5 pl-2 pr-4">
                Setor
              </th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2.5 px-4">
                Total
              </th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2.5 px-4">
                % Total
              </th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2.5 px-4">
                Críticos
              </th>
              <th className="text-right text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2.5 pl-4">
                Resolução
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.unidade}
                className={`
                  border-b border-border/20 transition-colors duration-150
                  hover:bg-primary/[0.03]
                  ${i === 0 ? "bg-primary/[0.02]" : ""}
                `}
              >
                <td className="py-3 pl-2 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-offset-card"
                      style={{
                        backgroundColor:
                          i === 0
                            ? "hsl(0, 72%, 55%)"
                            : i === 1
                              ? "hsl(25, 95%, 53%)"
                              : "hsl(199, 89%, 48%)",
                        "--tw-ring-color":
                          i === 0
                            ? "hsl(0 72% 55% / 0.3)"
                            : i === 1
                              ? "hsl(25 95% 53% / 0.3)"
                              : "hsl(199 89% 48% / 0.3)",
                      } as React.CSSProperties}
                    />
                    <span className="text-foreground font-medium text-xs">
                      {row.unidade}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-foreground">
                  {row.total}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
                        style={{ width: `${Math.min(row.pctTotal, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground w-10 text-right">
                      {row.pctTotal}%
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-mono text-xs font-semibold ${row.criticos > 0 ? "text-destructive" : "text-muted-foreground/50"
                      }`}
                  >
                    {row.criticos}
                  </span>
                </td>
                <td className="py-3 pl-4 text-right">
                  <span
                    className={`inline-flex items-center font-mono text-[11px] font-medium px-1.5 py-0.5 rounded ${row.avgResolucao === null
                        ? "text-muted-foreground/50"
                        : row.avgResolucao > 7
                          ? "text-severity-moderate bg-severity-moderate/10"
                          : "text-severity-none bg-severity-none/10"
                      }`}
                  >
                    {row.avgResolucao !== null ? `${row.avgResolucao}d` : "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
