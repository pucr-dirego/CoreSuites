import { useState } from "react";
import type {
  SupplierListItem,
  SupplierStatus,
} from "../../../interfaces/supplierDirectory";
import { SupplierStatusConfirmModal } from "./SupplierStatusConfirmModal";

interface SupplierDirectoryTableProps {
  suppliers: SupplierListItem[];
  isLoading: boolean;
  isSaving: boolean;
  selectedSupplierId: string | null;
  onSelectSupplier: (supplierId: string) => void;
  onSetSupplierStatus: (
    supplierId: string,
    status: "activo" | "inactivo"
  ) => Promise<void> | void;
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
  isSaving,
  selectedSupplierId,
  onSelectSupplier,
  onSetSupplierStatus,
}: SupplierDirectoryTableProps) {
  const [statusTarget, setStatusTarget] =
    useState<SupplierListItem | null>(null);

  const handleConfirmStatus = async () => {
    if (!statusTarget) {
      return;
    }

    const nextStatus =
      statusTarget.status === "activo" ? "inactivo" : "activo";

    await onSetSupplierStatus(statusTarget.id, nextStatus);
  };

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
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier) => {
              const isActive = supplier.status === "activo";

              return (
                <tr
                  key={supplier.id}
                  className={
                    selectedSupplierId === supplier.id
                      ? "supplier-row-selected"
                      : ""
                  }
                >
                  <td>
                    <div className="supplier-name-cell">
                      <div className="supplier-name-heading">
                        <strong>{supplier.name}</strong>

                        {supplier.alertsCount > 0 && (
                          <button
                            type="button"
                            className="supplier-inline-alert-button"
                            onClick={() => onSelectSupplier(supplier.id)}
                            title={`${supplier.alertsCount} ${
                              supplier.alertsCount === 1
                                ? "alerta visible"
                                : "alertas visibles"
                            }. Abrir detalle de ${supplier.name}`}
                            aria-label={`Abrir las alertas de ${supplier.name}`}
                          >
                            {supplier.alertsCount}
                          </button>
                        )}
                      </div>

                      <span>
                        {supplier.businessName ||
                          supplier.rfc ||
                          "Sin razón social"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`supplier-status-pill supplier-status-${supplier.status}`}
                    >
                      {getStatusLabel(supplier.status)}
                    </span>
                  </td>

                  <td>
                    <div className="supplier-contact-cell">
                      <strong>
                        {supplier.mainContactName || "Sin contacto"}
                      </strong>

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
                    <div className="supplier-table-actions">
                      <button
                        type="button"
                        className="supplier-icon-action edit"
                        title={`Abrir edición de ${supplier.name}`}
                        aria-label={`Abrir edición de ${supplier.name}`}
                        onClick={() => onSelectSupplier(supplier.id)}
                        disabled={isSaving}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        className={`supplier-icon-action ${
                          isActive ? "danger" : "restore"
                        }`}
                        title={
                          isActive
                            ? `Dar de baja lógica ${supplier.name}`
                            : `Reactivar ${supplier.name}`
                        }
                        aria-label={
                          isActive
                            ? `Dar de baja lógica ${supplier.name}`
                            : `Reactivar ${supplier.name}`
                        }
                        onClick={() => setStatusTarget(supplier)}
                        disabled={isSaving}
                      >
                        {isActive ? (
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 12a9 9 0 1 0 3-6.7" />
                            <path d="M3 4v6h6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {statusTarget && (
        <SupplierStatusConfirmModal
          supplier={statusTarget}
          isSaving={isSaving}
          onClose={() => setStatusTarget(null)}
          onConfirm={handleConfirmStatus}
        />
      )}
    </section>
  );
}
