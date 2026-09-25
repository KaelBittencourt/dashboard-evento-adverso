import { useTheme } from "next-themes";

function isDocumentDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

export function useHeatmapColor() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme ? resolvedTheme === "dark" : isDocumentDark();

  return (val: number, maxVal: number) => {
    if (val <= 0) return isDark ? "hsl(220, 14%, 14%)" : "hsl(214, 20%, 92%)";
    const t = Math.min(val / Math.max(maxVal, 1), 1);
    if (isDark) {
      return `hsl(${199 - t * 10}, ${50 + t * 40}%, ${18 + t * 38}%)`;
    }
    return `hsl(${199 - t * 6}, ${42 + t * 48}%, ${88 - t * 40}%)`;
  };
}
