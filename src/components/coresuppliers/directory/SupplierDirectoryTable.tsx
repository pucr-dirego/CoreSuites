import type { SupplierListItem, SupplierStatus } from "../../../interfaces/supplierDirectory";

interface SupplierDirectoryTableProps {
  suppliers: SupplierListItem[];
  isLoading: boolean;
  selectedSupplierId: string | null;
  onSelectSupplier: (supplierId: string) => void;
}

function getStatusLabel(status: SupplierStatus) {
  const labels: Record<SupplierStatus, string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    observacion: "En observación",
    pendiente: "Pendiente",
  };

  return labels[status];
}

export function SupplierDirectoryTable({
  suppliers,
  isLoading,
  selectedSupplierId,
  onSelectSupplier,
}: SupplierDirectoryTableProps) {
  if (isLoading) {
    return (
      <section className="supplier-directory-table-card">
        <div className="supplier-table-loading">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (suppliers.length === 0) {
    return (
      <section className="supplier-directory-table-card">
        <div className="supplier-empty-state">
          <strong>No hay proveedores para mostrar.</strong>
          <p>Cuando existan coincidencias, aparecerán en este directorio.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="supplier-directory-table-card">
      <div className="supplier-table-header">
        <div>
          <h3>Proveedores</h3>
          <p>Listado operativo para consulta y revisión rápida.</p>
        </div>
      </div>

      <div className="supplier-table-wrapper">
        <table className="supplier-directory-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Contacto principal</th>
              <th>Servicios</th>
              <th>Sucursales</th>
              <th>Alertas</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className={selectedSupplierId === supplier.id ? "supplier-row-selected" : ""}
              >
                <td>
                  <div className="supplier-name-cell">
                    <strong>{supplier.name}</strong>
                    <span>{supplier.businessName || supplier.rfc || "Sin razón social"}</span>
                  </div>
                </td>

                <td>
                  <span className={`supplier-status-pill supplier-status-${supplier.status}`}>
                    {getStatusLabel(supplier.status)}
                  </span>
                </td>

                <td>
                  <div className="supplier-contact-cell">
                    <strong>{supplier.mainContactName || "Sin contacto"}</strong>
                    <span>
                      {supplier.mainContactEmail ||
                        supplier.mainContactPhone ||
                        "Información pendiente"}
                    </span>
                  </div>
                </td>

                <td>{supplier.servicesCount}</td>
                <td>{supplier.branchesCount}</td>

                <td>
                  {supplier.alertsCount > 0 ? (
                    <span className="supplier-alert-count">{supplier.alertsCount}</span>
                  ) : (
                    <span className="supplier-no-alerts">Sin alertas</span>
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    className="supplier-row-action"
                    onClick={() => onSelectSupplier(supplier.id)}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}