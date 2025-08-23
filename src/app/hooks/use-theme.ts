import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ThemeMode } from "../../lib/theme-config";

export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeLabel = (): string => {
    if (!mounted) return "Theme";
    if (theme === "system") return "System";
    return resolvedTheme === "dark" ? "Dark" : "Light";
  };

  const isDark = resolvedTheme === "dark";

  return {
    // Next-themes original values
    theme: theme as ThemeMode | undefined,
    setTheme: (theme: ThemeMode) => setTheme(theme),
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    systemTheme: systemTheme as "light" | "dark" | undefined,

    // Custom utilities
    mounted,
    cycleTheme,
    getThemeLabel,
    isDark,
  };
}
