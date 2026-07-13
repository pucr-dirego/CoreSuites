import { useState } from "react";
import type { FormEvent } from "react";
import type {
  SupplierAssignment,
  SupplierAssignmentPayload,
  SupplierContact,
} from "../../../interfaces/supplierDirectory";

interface SupplierAssignmentModalProps {
  supplierId: string;
  assignment: SupplierAssignment | null;
  contacts: SupplierContact[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: SupplierAssignmentPayload) => Promise<void> | void;
}

export function SupplierAssignmentModal({
  supplierId,
  assignment,
  contacts,
  isSaving,
  onClose,
  onSave,
}: SupplierAssignmentModalProps) {
  const [form, setForm] = useState<SupplierAssignmentPayload>({
    id: assignment?.id,
    supplierId,
    serviceId: assignment?.serviceId || "",
    branchId: assignment?.branchId || "",
    internalLocationId: assignment?.internalLocationId || "",
    contactId: assignment?.contactId || "",
    status: assignment?.status || "activo",
    notes: assignment?.notes || "",
  });

  const updateField = <K extends keyof SupplierAssignmentPayload>(
    field: K,
    value: SupplierAssignmentPayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave(form);
    onClose();
  };

  return (
    <div className="supplier-modal-backdrop">
      <div className="supplier-modal">
        <div className="supplier-modal-header">
          <div>
            <h3>{assignment ? "Editar asignación" : "Agregar asignación"}</h3>
            <p>Relaciona proveedor, servicio, sucursal y ubicación interna.</p>
          </div>

          <button type="button" className="supplier-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="supplier-modal-form" onSubmit={handleSubmit}>
          <label>
            Servicio
            <input
              value={form.serviceId}
              placeholder="Ej. Internet, CCTV, Impresoras"
              onChange={(event) => updateField("serviceId", event.target.value)}
              required
            />
          </label>

          <label>
            Sucursal
            <input
              value={form.branchId}
              placeholder="Ej. Tampico, Saltillo, Monterrey"
              onChange={(event) => updateField("branchId", event.target.value)}
              required
            />
          </label>

          <label>
            Ubicación dentro de sucursal
            <input
              value={form.internalLocationId}
              placeholder="Ej. Dragón, CEDIS, Fábrica"
              onChange={(event) => updateField("internalLocationId", event.target.value)}
            />
          </label>

          <label>
            Contacto asignado
            <select
              value={form.contactId}
              onChange={(event) => updateField("contactId", event.target.value)}
            >
              <option value="">Sin contacto asignado</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado
            <select
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as SupplierAssignmentPayload["status"])
              }
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="revision">En revisión</option>
              <option value="implementacion">En implementación</option>
            </select>
          </label>

          <label className="supplier-modal-full">
            Observaciones
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>

          <div className="supplier-modal-actions">
            <button type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>

            <button type="submit" className="supplier-primary-button" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar asignación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}