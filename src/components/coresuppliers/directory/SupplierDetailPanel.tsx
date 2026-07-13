import { useState } from "react";
import type {
  SupplierAssignment,
  SupplierAssignmentPayload,
  SupplierContact,
  SupplierContactPayload,
  SupplierDetail,
  SupplierGeneralUpdatePayload,
} from "../../../interfaces/supplierDirectory";
import { SupplierAlertsPanel } from "./SupplierAlertsPanel";
import { SupplierAssignmentModal } from "./SupplierAssignmentModal";
import { SupplierAssignmentsSection } from "./SupplierAssignmentsSection";
import { SupplierContactModal } from "./SupplierContactModal";
import { SupplierContactsSection } from "./SupplierContactsSection";
import { SupplierEditGeneralModal } from "./SupplierEditGeneralModal";
import { SupplierGeneralInfoSection } from "./SupplierGeneralInfoSection";
import { SupplierStatusConfirmModal } from "./SupplierStatusConfirmModal";

interface SupplierDetailPanelProps {
  supplier: SupplierDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateGeneralInfo: (payload: SupplierGeneralUpdatePayload) => Promise<void> | void;
  onSaveContact: (payload: SupplierContactPayload) => Promise<void> | void;
  onSaveAssignment: (payload: SupplierAssignmentPayload) => Promise<void> | void;
  onSetSupplierStatus: (supplierId: string, status: "activo" | "inactivo") => Promise<void> | void;
}

function getStatusText(status: SupplierDetail["status"]) {
  const labels: Record<SupplierDetail["status"], string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    observacion: "En observación",
    pendiente: "Pendiente",
  };

  return labels[status];
}

export function SupplierDetailPanel({
  supplier,
  isLoading,
  isSaving,
  onUpdateGeneralInfo,
  onSaveContact,
  onSaveAssignment,
  onSetSupplierStatus,
}: SupplierDetailPanelProps) {
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [contactModalValue, setContactModalValue] = useState<SupplierContact | null | undefined>(
    undefined
  );
  const [assignmentModalValue, setAssignmentModalValue] = useState<
    SupplierAssignment | null | undefined
  >(undefined);

  if (isLoading) {
    return (
      <aside className="supplier-detail-panel">
        <div className="supplier-detail-loading">
          <span />
          <span />
          <span />
        </div>
      </aside>
    );
  }

  if (!supplier) {
    return (
      <aside className="supplier-detail-panel supplier-detail-placeholder">
        <div>
          <span className="supplier-placeholder-icon">◆</span>
          <h3>Selecciona un proveedor</h3>
          <p>
            El detalle mostrará datos generales, contactos, servicios, sucursales
            asignadas y alertas operativas.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="supplier-detail-panel">
      <div className="supplier-detail-header">
        <div>
          <span className={`supplier-status-pill supplier-status-${supplier.status}`}>
            {getStatusText(supplier.status)}
          </span>
          <h3>{supplier.name}</h3>
          <p>{supplier.businessName || supplier.category || "Proveedor registrado"}</p>
        </div>

        <button
          type="button"
          className={supplier.status === "activo" ? "supplier-danger-button" : "supplier-primary-button"}
          onClick={() => setShowStatusConfirm(true)}
        >
          {supplier.status === "activo" ? "Desactivar" : "Reactivar"}
        </button>
      </div>

      <SupplierAlertsPanel alerts={supplier.alerts} />

      <SupplierGeneralInfoSection supplier={supplier} onEdit={() => setIsEditingGeneral(true)} />

      <SupplierContactsSection
        contacts={supplier.contacts}
        onAdd={() => setContactModalValue(null)}
        onEdit={(contact) => setContactModalValue(contact)}
      />

      <SupplierAssignmentsSection
        assignments={supplier.assignments}
        onAdd={() => setAssignmentModalValue(null)}
        onEdit={(assignment) => setAssignmentModalValue(assignment)}
      />

      {isEditingGeneral && (
        <SupplierEditGeneralModal
          supplier={supplier}
          isSaving={isSaving}
          onClose={() => setIsEditingGeneral(false)}
          onSave={onUpdateGeneralInfo}
        />
      )}

      {contactModalValue !== undefined && (
        <SupplierContactModal
          supplierId={supplier.id}
          contact={contactModalValue}
          isSaving={isSaving}
          onClose={() => setContactModalValue(undefined)}
          onSave={onSaveContact}
        />
      )}

      {assignmentModalValue !== undefined && (
        <SupplierAssignmentModal
          supplierId={supplier.id}
          assignment={assignmentModalValue}
          contacts={supplier.contacts}
          isSaving={isSaving}
          onClose={() => setAssignmentModalValue(undefined)}
          onSave={onSaveAssignment}
        />
      )}

      {showStatusConfirm && (
        <SupplierStatusConfirmModal
          supplier={supplier}
          isSaving={isSaving}
          onClose={() => setShowStatusConfirm(false)}
          onConfirm={() =>
            onSetSupplierStatus(supplier.id, supplier.status === "activo" ? "inactivo" : "activo")
          }
        />
      )}
    </aside>
  );
}