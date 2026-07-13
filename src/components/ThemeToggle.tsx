import { useTheme } from "../hooks/useTheme";
import "../styles/themeToggle.css";

export default function ThemeToggle() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      <span
        className={isDark ? "theme-icon theme-icon-sun" : "theme-icon theme-icon-moon"}
        aria-hidden="true"
      />

      <span className="theme-toggle-label">
        {theme === "dark" ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}