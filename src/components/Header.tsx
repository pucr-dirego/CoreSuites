import { useEffect, useRef, useState } from "react";
import type { VistaApp } from "../interfaces/navigation";
import "../styles/Header.css";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
  vistaActiva: VistaApp;
  onOpenAssistant: () => void;
  onNavigate: (vista: VistaApp) => void;
}

function Header({ vistaActiva, onNavigate, onOpenAssistant }: HeaderProps) {
  const [oculto, setOculto] = useState(false);
  const ultimaPosicionScroll = useRef(0);

  useEffect(() => {
    function manejarScroll() {
      const posicionActual = window.scrollY;
      const diferencia = posicionActual - ultimaPosicionScroll.current;

      if (posicionActual < 80) {
        setOculto(false);
      } else if (diferencia > 8) {
        setOculto(true);
      } else if (diferencia < -8) {
        setOculto(false);
      }

      ultimaPosicionScroll.current = posicionActual;
    }

    window.addEventListener("scroll", manejarScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", manejarScroll);
    };
  }, []);

  return (
    <header className={`app-header ${oculto ? "app-header-hidden" : ""}`}>
      <div className="app-header-brand">
        <h2>Inventario TI</h2>
        <span>Centro de Operaciones TI</span>
      </div>

      <nav className="app-nav">
        <button
          className={vistaActiva === "inicio" ? "nav-active" : ""}
          onClick={() => onNavigate("inicio")}
        >
          Inicio
        </button>

        <button
          className={vistaActiva === "inventario" ? "nav-active" : ""}
          onClick={() => onNavigate("inventario")}
        >
          Inventario
        </button>

        <button
          className={vistaActiva === "dashboard" ? "nav-active" : ""}
          onClick={() => onNavigate("dashboard")}
        >
          Dashboard
        </button>

        <button
        className={vistaActiva === "calidad" ? "nav-active" : ""}
        onClick={() => onNavigate("calidad")}
      >
        Calidad
      </button>

        <button
          className={vistaActiva === "admin" ? "nav-active" : ""}
          onClick={() => onNavigate("admin")}
        >
          Admin
        </button>

        <button
          type="button"
          className="nav-ai-button"
          onClick={onOpenAssistant}
        >
          IA-Lite
        </button>
      </nav>

      <ThemeToggle />
    </header>
  );
}

export default Header;