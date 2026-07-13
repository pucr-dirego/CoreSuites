import type { EquipoDashboard } from "../interfaces/equipos";
import "../styles/TriagePanel.css";

interface TriagePanelProps {
  equipos: EquipoDashboard[];
  isLoading: boolean;
}

function TriagePanel({ equipos, isLoading }: TriagePanelProps) {
  const equiposCriticos = equipos
    .filter(
      (equipo) =>
        equipo.estadoFuncionamiento === "Malo" ||
        equipo.estadoFuncionamiento === "Disfuncional"
    )
    .sort((a, b) => {
      const fechaA = new Date(a.modifiedon ?? a.createdon ?? 0).getTime();
      const fechaB = new Date(b.modifiedon ?? b.createdon ?? 0).getTime();

      return fechaB - fechaA;
    })
    .slice(0, 5);

  return (
    <section className="triage-panel">
      <div className="panel-header">
        <h3>Equipos críticos</h3>
        <span>Atención requerida</span>
      </div>

      {isLoading && <div className="empty-state">Cargando equipos...</div>}

      {!isLoading && equiposCriticos.length === 0 && (
        <div className="empty-state">
          No hay equipos críticos registrados.
        </div>
      )}

      {!isLoading && equiposCriticos.length > 0 && (
        <div className="triage-list">
          {equiposCriticos.map((equipo) => (
            <article className="triage-item" key={equipo.id}>
              <div>
                <strong>{equipo.hostname}</strong>
                <p>
                  {equipo.tipoEquipo} · {equipo.marca} {equipo.modelo}
                </p>
              </div>

              <div className="triage-tags">
                <span
                  className={`triage-tag ${
                    equipo.estadoFuncionamiento === "Disfuncional"
                      ? "triage-tag-danger"
                      : "triage-tag-warning"
                  }`}
                >
                  {equipo.estadoFuncionamiento}
                </span>

                <span className="triage-tag triage-tag-neutral">
                  {equipo.departamento}
                </span>

                <span className="triage-tag triage-tag-neutral">
                  {equipo.sucursal}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TriagePanel;