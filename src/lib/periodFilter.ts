export const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] as const;

export function periodKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function yearPeriodKeys(year: number) {
  return Array.from({ length: 12 }, (_, index) => periodKey(year, index + 1));
}

export function currentYearPeriods() {
  return yearPeriodKeys(new Date().getFullYear());
}

export function collectYears(dates: (Date | null | undefined)[]) {
  const years = new Set<number>([new Date().getFullYear()]);
  for (const date of dates) {
    if (date) years.add(date.getFullYear());
  }
  return [...years].sort((a, b) => b - a);
}

export function samePeriods(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const selected = new Set(a);
  return b.every((period) => selected.has(period));
}

export function matchesPeriod(date: Date | null, periods: string[]) {
  if (periods.length === 0) return true;
  if (!date) return false;
  return periods.includes(periodKey(date.getFullYear(), date.getMonth() + 1));
}

export function togglePeriod(periods: string[], key: string) {
  return periods.includes(key) ? periods.filter((period) => period !== key) : [...periods, key];
}

export function toggleYearPeriods(periods: string[], year: number) {
  const keys = yearPeriodKeys(year);
  const allSelected = keys.every((key) => periods.includes(key));
  if (allSelected) return periods.filter((period) => !keys.includes(period));
  const selected = new Set(periods);
  keys.forEach((key) => selected.add(key));
  return [...selected];
}

export function periodLabel(periods: string[]) {
  if (periods.length === 0) return "Todos os períodos";

  const byYear = new Map<string, number[]>();
  for (const period of periods) {
    const [year, month] = period.split("-");
    const months = byYear.get(year) ?? [];
    months.push(Number(month));
    byYear.set(year, months);
  }

  const parts = [...byYear.entries()]
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, months]) => {
      const sorted = [...months].sort((a, b) => a - b);
      if (sorted.length === 12) return year;
      const names = sorted.map((month) => MONTH_LABELS[month - 1]).join(", ");
      return `${names}/${year}`;
    });

  const label = parts.join(" · ");
  return label.length > 36 ? `${periods.length} períodos` : label;
}
