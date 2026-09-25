import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function isDocumentDark() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme ? resolvedTheme === "dark" : isDocumentDark();

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-1.5 rounded-md hover:bg-secondary transition-colors"
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Sun size={14} className="text-muted-foreground" />
      ) : (
        <Moon size={14} className="text-muted-foreground" />
      )}
    </button>
  );
}
