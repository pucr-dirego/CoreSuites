import { useEffect } from "react";
import KPISection from "../components/KPISection";
import TriagePanel from "../components/TriagePanel";
import AuditPanel from "../components/AuditPanel";
import OperationalCoverage from "../components/landing/OperationalCoverage";
import { useEquipos } from "../hooks/useEquipos";
import type { InventoryQuickFilter } from "../interfaces/inventoryFilters";
import "../styles/LandingPage.css";

interface LandingPageProps {
  onOpenInventoryWithFilter?: (filter: InventoryQuickFilter) => void;
}

function LandingPage({ onOpenInventoryWithFilter }: LandingPageProps) {
  const {
    equipos,
    isLoading,
    error,
    total,
    equiposBuenos,
    equiposCriticos,
    equiposInactivos,
    recargarEquipos,
  } = useEquipos();

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

  const equiposRegulares = equipos.filter(
    (equipo) => equipo.estadoFuncionamiento === "Regular"
  ).length;

  return (
    <main className="landing-page">
      <section className="landing-content">
        <div className="landing-title-block">
          <p className="landing-eyebrow">Centro de Operaciones TI</p>
          <h1>Inventario TI</h1>
          <p>
            Dashboard operativo para supervisar equipos, estado general,
            equipos críticos y actividad reciente.
          </p>

          <div className="landing-total-assets">
            <span>Total de activos TI registrados:</span>
            <strong>{isLoading ? "..." : total}</strong>
          </div>
        </div>

        {error && <div className="data-error">{error}</div>}

        <KPISection
          equiposBuenos={equiposBuenos}
          equiposRegulares={equiposRegulares}
          equiposCriticos={equiposCriticos}
          equiposInactivos={equiposInactivos}
          isLoading={isLoading}
          onOpenInventoryWithFilter={onOpenInventoryWithFilter}
        />

        <section className="dashboard-grid">
          <TriagePanel equipos={equipos} isLoading={isLoading} />
          <AuditPanel equipos={equipos} isLoading={isLoading} />
        </section>

        <OperationalCoverage />
      </section>
    </main>
  );
}

export default LandingPage;