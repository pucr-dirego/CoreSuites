import { SupplierDetailPanel } from "../components/coresuppliers/directory/SupplierDetailPanel";
import { SupplierDirectoryTable } from "../components/coresuppliers/directory/SupplierDirectoryTable";
import { SupplierDirectoryToolbar } from "../components/coresuppliers/directory/SupplierDirectoryToolbar";
import { useSupplierDirectory } from "../hooks/useSupplierDirectory";
import "../styles/SupplierDirectory.css";

export function SupplierDirectoryPage() {
  const directory = useSupplierDirectory();

  return (
    <main className="supplier-directory-page">
      <section className="supplier-directory-hero">
        <div>
          <p className="supplier-directory-eyebrow">CoreSuppliers</p>
          <h1>Directorio de Proveedores</h1>
          <p>
            Consulta, valida y administra proveedores, contactos, servicios y asignaciones
            operativas desde un solo módulo.
          </p>
        </div>

      <div className="supplier-directory-summary">
        <div>
          <span>
            {directory.suppliers.reduce(
              (total, supplier) => total + supplier.alertsCount,
              0
            )}
          </span>

          <small>Alertas visibles</small>
        </div>
      </div>
      </section>

      {directory.errorMessage && (
        <div className="supplier-directory-error">{directory.errorMessage}</div>
      )}

      <SupplierDirectoryToolbar
        filters={directory.filters}
        onChangeFilters={directory.setFilters}
        onClearFilters={directory.clearFilters}
        hasActiveFilters={directory.hasActiveFilters}
      />

      <section className="supplier-directory-layout">
    <SupplierDirectoryTable
      suppliers={directory.suppliers}
      isLoading={directory.isLoadingList}
      isSaving={directory.isSaving}
      selectedSupplierId={directory.selectedSupplierId}
      onSelectSupplier={directory.loadSupplierDetail}
      onSetSupplierStatus={directory.setSupplierStatus}
    />
    </section>

        {directory.selectedSupplierId && (
          <div
            className="supplier-detail-modal-backdrop"
            onMouseDown={directory.closeSupplierDetail}
            role="presentation"
          >
            <div
              className="supplier-detail-modal-shell"
              onMouseDown={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Detalle del proveedor"
            >
              <SupplierDetailPanel
                supplier={directory.selectedSupplierDetail}
                isLoading={directory.isLoadingDetail}
                isSaving={directory.isSaving}
                onClose={directory.closeSupplierDetail}
                onUpdateGeneralInfo={directory.updateGeneralInfo}
                onSaveContact={directory.saveContact}
                onSaveAssignment={directory.saveAssignment}
                onSetSupplierStatus={directory.setSupplierStatus}
              />
            </div>
          </div>
        )}
    </main>
  );
}