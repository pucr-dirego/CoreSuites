import type { SupplierAssignment } from "../../../interfaces/supplierDirectory";

interface SupplierAssignmentsSectionProps {
  assignments: SupplierAssignment[];
  onAdd: () => void;
  onEdit: (assignment: SupplierAssignment) => void;
}

function getAssignmentStatusLabel(status: SupplierAssignment["status"]) {
  const labels: Record<SupplierAssignment["status"], string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    revision: "En revisión",
    implementacion: "En implementación",
  };

  return labels[status];
}

export function SupplierAssignmentsSection({
  assignments,
  onAdd,
  onEdit,
}: SupplierAssignmentsSectionProps) {
  return (
    <section className="supplier-detail-section">
      <div className="supplier-section-heading">
        <div>
          <h4>Servicios y asignaciones</h4>
          <p>Relación proveedor, servicio, sucursal y ubicación interna.</p>
        </div>

        <button type="button" className="supplier-section-button" onClick={onAdd}>
          Agregar asignación
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="supplier-inline-empty">
          Este proveedor todavía no tiene servicios o sucursales asignadas.
        </div>
      ) : (
        <div className="supplier-assignment-list">
          {assignments.map((assignment) => (
            <article key={assignment.id} className="supplier-assignment-card">
              <div>
                <strong>{assignment.serviceName}</strong>
                <p>
                  {assignment.branchName}
                  {assignment.internalLocationName
                    ? ` / ${assignment.internalLocationName}`
                    : ""}
                </p>
              </div>

              <div className="supplier-assignment-meta">
                <span>{assignment.contactName || "Sin contacto asignado"}</span>
                <span
                  className={`supplier-assignment-status supplier-assignment-${assignment.status}`}
                >
                  {getAssignmentStatusLabel(assignment.status)}
                </span>
              </div>

              <button
                type="button"
                className="supplier-small-action"
                onClick={() => onEdit(assignment)}
              >
                Editar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}