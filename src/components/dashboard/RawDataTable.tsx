import { AdverseEvent } from "@/hooks/useAdverseEvents";
import { Table } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RawDataTableProps {
  events: AdverseEvent[];
}

export function RawDataTable({ events }: RawDataTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<AdverseEvent | null>(null);

  // Ordenar eventos da data mais recente para a mais antiga
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = a.dataEvento?.getTime() || a.timestamp?.getTime() || 0;
    const timeB = b.dataEvento?.getTime() || b.timestamp?.getTime() || 0;
    return timeB - timeA;
  });

  // Limitar a exibição inicial caso haja muitos dados para não travar a UI (ex: 100 mais recentes)
  const displayEvents = sortedEvents.slice(0, 100);

  return (
    <>
      <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card to-card/80 p-5 animate-fade-in transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 w-full">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10">
              <Table size={14} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Tabela de Registros
              </h3>
              <p className="text-[11px] text-foreground/60 mt-0.5">
                Exibindo os {displayEvents.length} eventos mais recentes conforme os filtros aplicados
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[400px] custom-scrollbar rounded-md border border-border/40">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
              <tr className="border-b border-border/40">
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Data do Evento
                </th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Paciente
                </th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Tipo de Evento
                </th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Setor
                </th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Gravidade
                </th>
                <th className="text-left text-[10px] font-semibold text-foreground/60 uppercase tracking-wider py-3 px-4">
                  Turno
                </th>
              </tr>
            </thead>
            <tbody>
              {displayEvents.length > 0 ? (
                displayEvents.map((e, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedEvent(e)}
                    className="border-b border-border/20 transition-colors duration-150 hover:bg-primary/[0.05] cursor-pointer"
                  >
                    <td className="py-2.5 px-4 text-xs font-mono text-muted-foreground">
                      {e.dataEvento ? e.dataEvento.toLocaleDateString("pt-BR") : "Não Informado"}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-medium text-foreground">
                      {e.nomePaciente || "Não Informado"} {e.idade ? `(${e.idade})` : ""}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-foreground/80 max-w-[200px] truncate" title={e.tipoEvento}>
                      {e.tipoEvento}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-foreground/80">
                      {e.unidade}
                    </td>
                    <td className="py-2.5 px-4 text-xs">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${e.danos === "Morte" || e.danos === "Severo"
                          ? "bg-destructive/10 text-destructive"
                          : e.danos === "Moderado"
                            ? "bg-severity-moderate/10 text-severity-moderate"
                            : e.danos === "Leve"
                              ? "bg-primary/10 text-primary"
                              : "bg-severity-none/10 text-severity-none"
                          }`}
                      >
                        {e.danos || "Não Informado"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground uppercase tracking-wider text-[10px]">
                      {e.turno}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Ficha do Evento Adverso</DialogTitle>
            <DialogDescription>
              Resumo completo dos dados preenchidos no formulário
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Dados do Paciente</h4>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Nome:</span> {selectedEvent.nomePaciente || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Idade:</span> {selectedEvent.idade || "Não Informado"} anos</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Sexo:</span> {selectedEvent.sexo || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Nascimento:</span> {selectedEvent.dataNascimento || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Data Internação:</span> {selectedEvent.dataInternacao || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Motivo Internação:</span> {selectedEvent.motivoInternacao || "Não Informado"}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Localização e Envolvimento</h4>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Unidade:</span> {selectedEvent.unidade || "N/A"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Leito:</span> {selectedEvent.leito || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Local do Evento:</span> {selectedEvent.localEvento || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Turno:</span> {selectedEvent.turno || "Não Informado"}</div>
                <div className="text-sm"><span className="font-medium text-muted-foreground">Acompanhante:</span> {selectedEvent.acompanhante || "Não Informado"}</div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3 md:col-span-2">
                <h4 className="font-semibold text-sm border-b border-primary/20 pb-2 mb-2 text-primary">Classificação do Evento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Tipo de Evento:</span> {selectedEvent.tipoEvento || "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Data do Evento:</span> {selectedEvent.dataEvento ? selectedEvent.dataEvento.toLocaleString('pt-BR') : "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Gravidade dos Danos:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${selectedEvent.danos === "Morte" || selectedEvent.danos === "Severo"
                      ? "bg-destructive/10 text-destructive"
                      : selectedEvent.danos === "Moderado"
                        ? "bg-severity-moderate/10 text-severity-moderate"
                        : selectedEvent.danos === "Leve"
                          ? "bg-primary/10 text-primary"
                          : "bg-severity-none/10 text-severity-none"
                      }`}>
                      {selectedEvent.danos || "Não Informado"}
                    </span>
                  </div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Risco Pré-listado:</span> {selectedEvent.riscoPrelistado || "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Nº Registro/Prontuário:</span> {selectedEvent.registro || "Não Informado"}</div>
                </div>
              </div>

              {(selectedEvent.transferenciaSETOR || selectedEvent.transferenciaINSTITUICAO || selectedEvent.localTransferencia) && (
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 space-y-3 md:col-span-2">
                  <h4 className="font-semibold text-sm border-b border-blue-500/20 pb-2 mb-2 text-blue-500">Informações de Transferência</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="text-sm"><span className="font-medium text-muted-foreground">Houve Transferência de Setor?</span> {selectedEvent.transferenciaSETOR || "Não Informado"}</div>
                    <div className="text-sm"><span className="font-medium text-muted-foreground">Houve Transferência de Instituição?</span> {selectedEvent.transferenciaINSTITUICAO || "Não Informado"}</div>
                    {selectedEvent.localTransferencia && (
                      <div className="text-sm md:col-span-2"><span className="font-medium text-muted-foreground">Local da Transferência:</span> {selectedEvent.localTransferencia}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 space-y-3 md:col-span-2">
                <h4 className="font-semibold text-sm border-b border-destructive/20 pb-2 mb-2">Descrição Completa</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {selectedEvent.descricaoEvento || "Não Informado"}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/40 space-y-3 md:col-span-2">
                <h4 className="font-semibold text-sm border-b border-border/40 pb-2 mb-2">Avaliação e Condutas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Nível Sensorial Pré:</span> {selectedEvent.nivelSensorialPre || "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Nível Sensorial Pós:</span> {selectedEvent.nivelSensorialPos || "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Comunicado Médico:</span> {selectedEvent.comunicadoMedico || "Não Informado"}</div>
                  <div className="text-sm"><span className="font-medium text-muted-foreground">Avaliação no Plantão:</span> {selectedEvent.avaliacaoPlantao || "Não Informado"}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
