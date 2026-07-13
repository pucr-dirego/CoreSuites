import type { EquipoDashboard } from "../interfaces/equipos";
import "../styles/AuditPanel.css";

interface AuditPanelProps {
  equipos: EquipoDashboard[];
  isLoading: boolean;
}

type TipoMovimiento = "alta" | "actualizacion" | "baja";

function obtenerFechaMovimiento(equipo: EquipoDashboard) {
  return equipo.modifiedon ?? equipo.createdon ?? "";
}

function obtenerTipoMovimiento(equipo: EquipoDashboard): TipoMovimiento {
  if (!equipo.activo) {
    return "baja";
  }

  const fechaCreacion = new Date(equipo.createdon ?? 0).getTime();
  const fechaModificacion = new Date(equipo.modifiedon ?? 0).getTime();

  if (!fechaCreacion || !fechaModificacion) {
    return "alta";
  }

  const diferenciaMs = Math.abs(fechaModificacion - fechaCreacion);

  if (diferenciaMs <= 5000) {
    return "alta";
  }

  return "actualizacion";
}

function obtenerTextoMovimiento(tipo: TipoMovimiento) {
  if (tipo === "alta") {
    return "Alta de equipo";
  }

  if (tipo === "baja") {
    return "Baja lógica";
  }

  return "Actualización";
}

function formatearFecha(fecha?: string) {
  if (!fecha) {
    return "Sin fecha";
  }

  const fechaValida = new Date(fecha);

  if (Number.isNaN(fechaValida.getTime())) {
    return fecha;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(fechaValida);
}

function AuditPanel({ equipos, isLoading }: AuditPanelProps) {
  const actividadReciente = [...equipos]
    .sort((a, b) => {
      const fechaA = new Date(obtenerFechaMovimiento(a) || 0).getTime();
      const fechaB = new Date(obtenerFechaMovimiento(b) || 0).getTime();

      return fechaB - fechaA;
    })
    .slice(0, 5);

  return (
    <section className="audit-panel">
      <div className="panel-header">
        <h3>Actividad reciente</h3>
        <span>Bitácora operativa</span>
      </div>

      {isLoading && <div className="empty-state">Cargando actividad...</div>}

      {!isLoading && actividadReciente.length === 0 && (
        <div className="empty-state">No hay actividad reciente disponible.</div>
      )}

      {!isLoading && actividadReciente.length > 0 && (
        <div className="audit-list">
          {actividadReciente.map((equipo) => {
            const tipoMovimiento = obtenerTipoMovimiento(equipo);

            return (
              <article className="audit-item" key={equipo.id}>
                <div className="audit-item-main">
                  <strong>{equipo.hostname}</strong>

                  <span
                    className={`audit-movement-badge audit-movement-${tipoMovimiento}`}
                  >
                    {obtenerTextoMovimiento(tipoMovimiento)}
                  </span>
                </div>

                <p>
                  {equipo.sucursal} · {equipo.departamento}
                </p>

                <span className="audit-date">
                  {formatearFecha(obtenerFechaMovimiento(equipo))}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AuditPanel;