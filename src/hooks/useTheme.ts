import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "coreinventory-theme";

function obtenerTemaInicial(): Theme {
  const temaGuardado = localStorage.getItem(THEME_STORAGE_KEY);

  if (temaGuardado === "light" || temaGuardado === "dark") {
    return temaGuardado;
  }

  const sistemaPrefiereOscuro = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return sistemaPrefiereOscuro ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(obtenerTemaInicial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((temaActual) => (temaActual === "light" ? "dark" : "light"));
  }

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
}

