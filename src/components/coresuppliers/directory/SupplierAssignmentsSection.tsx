import type { SupplierAssignment } from "../../../interfaces/supplierDirectory";

interface SupplierAssignmentsSectionProps {
  assignments: SupplierAssignment[];
  onAdd: () => void;
  onEdit: (assignment: SupplierAssignment) => void;
}

function getNormalizedStatus(
  status: SupplierAssignment["status"]
): "activo" | "inactivo" {
  return status === "activo" ? "activo" : "inactivo";
}

function getAssignmentStatusLabel(
  status: SupplierAssignment["status"]
) {
  return getNormalizedStatus(status) === "activo"
    ? "Activo"
    : "Inactivo";
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

          <p>
            Relación del proveedor con servicios y sucursales.
          </p>
        </div>

        <button
          type="button"
          className="supplier-section-button"
          onClick={onAdd}
        >
          Agregar asignación
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="supplier-inline-empty">
          Este proveedor todavía no tiene servicios o sucursales asignadas.
        </div>
      ) : (
        <div className="supplier-assignment-list">
          {assignments.map((assignment) => {
            const normalizedStatus = getNormalizedStatus(
              assignment.status
            );

            return (
              <article
                key={assignment.id}
                className="supplier-assignment-card"
              >
                <div>
                  <strong>{assignment.serviceName}</strong>

                  <p>{assignment.branchName}</p>
                </div>

                <div className="supplier-assignment-meta">
                  <span
                    className={`supplier-assignment-status supplier-assignment-${normalizedStatus}`}
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
            );
          })}
        </div>
      )}
    </section>
  );
}