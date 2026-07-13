import type { InventoryQuickFilter } from "../interfaces/inventoryFilters";
import "../styles/KPISection.css";

interface KPISectionProps {
  equiposBuenos: number;
  equiposRegulares: number;
  equiposCriticos: number;
  equiposInactivos: number;
  isLoading: boolean;
  onOpenInventoryWithFilter?: (filter: InventoryQuickFilter) => void;
}

function KPISection({
  equiposBuenos,
  equiposRegulares,
  equiposCriticos,
  equiposInactivos,
  isLoading,
  onOpenInventoryWithFilter,
}: KPISectionProps) {
  const mostrarValor = (valor: number) => (isLoading ? "..." : valor);

  const abrirInventario = (filter: InventoryQuickFilter) => {
    if (isLoading) return;
    onOpenInventoryWithFilter?.(filter);
  };

  return (
    <section className="kpi-section">
      <button
        type="button"
        className="kpi-card kpi-good kpi-card-clickable"
        onClick={() => abrirInventario("buen_estado")}
        disabled={isLoading}
        aria-label="Ver equipos en buen estado en inventario"
      >
        <span>Equipos en buen estado</span>
        <strong>{mostrarValor(equiposBuenos)}</strong>
        <p className="kpi-card-detail">Excelente + Bueno</p>
        <p className="kpi-card-detail">Click para mostrar</p>
      </button>

      <button
        type="button"
        className="kpi-card kpi-warning kpi-card-clickable"
        onClick={() => abrirInventario("revision_preventiva")}
        disabled={isLoading}
        aria-label="Ver equipos en revisión preventiva en inventario"
      >
        <span>Revisión preventiva</span>
        <strong>{mostrarValor(equiposRegulares)}</strong>
        <p className="kpi-card-detail">Regular</p>
        <p className="kpi-card-detail">Click para mostrar</p>
      </button>

      <button
        type="button"
        className="kpi-card kpi-danger kpi-card-clickable"
        onClick={() => abrirInventario("criticos")}
        disabled={isLoading}
        aria-label="Ver equipos críticos en inventario"
      >
        <span>Equipos críticos</span>
        <strong>{mostrarValor(equiposCriticos)}</strong>
        <p className="kpi-card-detail">Malo + Disfuncional</p>
        <p className="kpi-card-detail">Click para mostrar</p>
      </button>

      <button
        type="button"
        className="kpi-card kpi-muted kpi-card-clickable"
        onClick={() => abrirInventario("inactivos")}
        disabled={isLoading}
        aria-label="Ver equipos inactivos en inventario"
      >
        <span>Equipos inactivos</span>
        <strong>{mostrarValor(equiposInactivos)}</strong>
        <p className="kpi-card-detail">Baja lógica</p>
        <p className="kpi-card-detail">Click para mostrar</p>
      </button>
    </section>
  );
}

export default KPISection;