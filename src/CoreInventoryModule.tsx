import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import InventoryPage from "./pages/InventoryPage";
import DataQualityPage from "./pages/DataQualityPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import { CoreAIAssistant } from "./components/ai/CoreAIAssistant";
import { useEquipos } from "./hooks/useEquipos";
import type { VistaApp } from "./interfaces/navigation";
import type { AssistantEquipo } from "./components/ai/coreAssistantTypes";
import type { InventoryQuickFilter } from "./interfaces/inventoryFilters";

import "./styles/ModuleHomeButton.css";

type CoreInventoryModuleProps = {
  onBackToHub: () => void;
};

function CoreInventoryModule({ onBackToHub }: CoreInventoryModuleProps) {
  const [vistaActiva, setVistaActiva] = useState<VistaApp>("inicio");
  const [asistenteAbierto, setAsistenteAbierto] = useState(false);

  const [inventoryQuickFilter, setInventoryQuickFilter] =
    useState<InventoryQuickFilter>(null);

  const { equipos, recargarEquipos } = useEquipos();

  const abrirAssistant = useCallback(() => {
    setAsistenteAbierto(true);
    void recargarEquipos();
  }, [recargarEquipos]);

  const abrirInventarioConFiltro = useCallback(
    (filter: InventoryQuickFilter) => {
      setInventoryQuickFilter(filter);
      setVistaActiva("inventario");
    },
    []
  );

  useEffect(() => {
    const manejarDatosActualizados = () => {
      void recargarEquipos();
    };

    window.addEventListener(
      "coreinventory:datos-actualizados",
      manejarDatosActualizados
    );

    return () => {
      window.removeEventListener(
        "coreinventory:datos-actualizados",
        manejarDatosActualizados
      );
    };
  }, [recargarEquipos]);

  const equiposAssistant = useMemo<AssistantEquipo[]>(() => {
    return equipos.map((equipo) => ({
      id: equipo.id,
      hostname: equipo.hostname,
      tipoEquipo: equipo.tipoEquipo,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numeroSerie: equipo.numeroSerie,
      responsable: equipo.responsable,
      sucursal: equipo.sucursal,
      departamento: equipo.departamento,
      ubicacion: equipo.ubicacion || equipo.ubicacionExacta,
      estadoFuncionamiento: equipo.estadoFuncionamiento,
      condicionFisica: equipo.condicionFisica,
      observaciones: equipo.observaciones,
      activo: equipo.activo,
    }));
  }, [equipos]);

  const renderizarVista = () => {
    if (vistaActiva === "inventario") {
      return (
        <InventoryPage
          quickFilter={inventoryQuickFilter}
          onQuickFilterApplied={() => setInventoryQuickFilter(null)}
        />
      );
    }

    if (vistaActiva === "dashboard") {
      return <DashboardPage />;
    }

    if (vistaActiva === "calidad") {
      return <DataQualityPage />;
    }

    if (vistaActiva === "admin") {
      return <AdminPage />;
    }

    return (
      <LandingPage
        onOpenInventoryWithFilter={abrirInventarioConFiltro}
      />
    );
  };

  return (
    <>
      <button
        type="button"
        className="module-home-button"
        onClick={onBackToHub}
        aria-label="Volver al Hub"
        title="Volver al Hub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      </button>

      <Header
        vistaActiva={vistaActiva}
        onNavigate={setVistaActiva}
        onOpenAssistant={abrirAssistant}
      />

      {renderizarVista()}

      <CoreAIAssistant
        equipos={equiposAssistant}
        isOpen={asistenteAbierto}
        onClose={() => setAsistenteAbierto(false)}
      />
    </>
  );
}

export default CoreInventoryModule;