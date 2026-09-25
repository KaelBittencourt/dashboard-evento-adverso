import { Calendar, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  MONTH_LABELS,
  periodKey,
  periodLabel,
  togglePeriod,
  toggleYearPeriods,
  yearPeriodKeys,
} from "@/lib/periodFilter";

interface PeriodFilterProps {
  years: number[];
  value: string[];
  onChange: (periods: string[]) => void;
}

export function PeriodFilter({ years, value, onChange }: PeriodFilterProps) {
  const selected = new Set(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 bg-card/80 hover:bg-card border border-border/50 text-foreground text-[11px] rounded-lg px-3 py-2 w-full min-h-[34px] focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200"
          title="Filtrar por mês e ano"
        >
          <Calendar size={13} className="text-muted-foreground shrink-0" />
          <span className="truncate flex-1 text-left">{periodLabel(value)}</span>
          <ChevronDown size={12} className="text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" avoidCollisions={false} className="w-[320px] p-3">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Mês e ano</p>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-primary hover:text-primary/80 font-medium"
          >
            Todos
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Marque um ou mais meses. Sem seleção, todos os períodos entram.
        </p>
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {years.map((year) => {
            const keys = yearPeriodKeys(year);
            const selectedCount = keys.filter((key) => selected.has(key)).length;
            const yearSelected = selectedCount === keys.length;

            return (
              <div key={year}>
                <button
                  type="button"
                  onClick={() => onChange(toggleYearPeriods(value, year))}
                  className={`mb-2 inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
                    yearSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {year}
                  {selectedCount > 0 && !yearSelected ? ` · ${selectedCount}` : ""}
                </button>
                <div className="grid grid-cols-6 gap-1">
                  {MONTH_LABELS.map((label, index) => {
                    const key = periodKey(year, index + 1);
                    const isSelected = selected.has(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onChange(togglePeriod(value, key))}
                        className={`rounded-md px-1 py-1.5 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground hover:bg-secondary"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
