import { useEffect, useRef, useState } from "react";
import type { VistaCoreSuppliers } from "../../interfaces/coreSuppliersNavigation";
import ThemeToggle from "../ThemeToggle";
import "../../styles/Header.css";

interface CoreSuppliersHeaderProps {
  vistaActiva: VistaCoreSuppliers;
  onNavigate: (vista: VistaCoreSuppliers) => void;
  onBackToHub: () => void;
}

const coreSuppliersNavItems: Array<{
  id: VistaCoreSuppliers;
  label: string;
}> = [
  {
    id: "inicio",
    label: "Inicio",
  },
  {
    id: "proveedores",
    label: "Proveedores",
  },
  {
    id: "servicios",
    label: "Servicios",
  },
  {
    id: "contactos",
    label: "Contactos",
  },
  {
    id: "sucursales",
    label: "Sucursales",
  },
];

function CoreSuppliersHeader({
  vistaActiva,
  onNavigate,
}: CoreSuppliersHeaderProps) {
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
        <h2>CoreSuppliers</h2>
        <span>Catálogo de Proveedores TI</span>
      </div>

      <nav className="app-nav" aria-label="Navegación CoreSuppliers">
        {coreSuppliersNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={vistaActiva === item.id ? "nav-active" : ""}
            aria-current={vistaActiva === item.id ? "page" : undefined}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <ThemeToggle />
    </header>
  );
}

export default CoreSuppliersHeader;