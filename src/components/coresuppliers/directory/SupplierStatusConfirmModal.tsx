import type { SupplierDetail } from "../../../interfaces/supplierDirectory";

interface SupplierStatusConfirmModalProps {
  supplier: SupplierDetail;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function SupplierStatusConfirmModal({
  supplier,
  isSaving,
  onClose,
  onConfirm,
}: SupplierStatusConfirmModalProps) {
  const willDeactivate = supplier.status === "activo";

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="supplier-modal-backdrop">
      <div className="supplier-modal supplier-modal-narrow">
        <div className="supplier-modal-header">
          <div>
            <h3>{willDeactivate ? "Desactivar proveedor" : "Reactivar proveedor"}</h3>
            <p>
              {willDeactivate
                ? "El proveedor dejará de aparecer como activo en el directorio."
                : "El proveedor volverá a estar disponible como activo."}
            </p>
          </div>

          <button type="button" className="supplier-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="supplier-confirm-content">
          <p>
            ¿Confirmas esta acción para <strong>{supplier.name}</strong>?
          </p>
        </div>

        <div className="supplier-modal-actions">
          <button type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>

          <button
            type="button"
            className={willDeactivate ? "supplier-danger-button" : "supplier-primary-button"}
            onClick={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? "Procesando..." : willDeactivate ? "Desactivar" : "Reactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}