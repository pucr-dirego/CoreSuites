import { useState } from "react";
import type { FormEvent } from "react";
import type {
  SupplierDetail,
  SupplierGeneralUpdatePayload,
  SupplierStatus,
} from "../../../interfaces/supplierDirectory";

interface SupplierEditGeneralModalProps {
  supplier: SupplierDetail;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: SupplierGeneralUpdatePayload) => Promise<void> | void;
}

export function SupplierEditGeneralModal({
  supplier,
  isSaving,
  onClose,
  onSave,
}: SupplierEditGeneralModalProps) {
  const [form, setForm] = useState<SupplierGeneralUpdatePayload>({
    supplierId: supplier.id,
    name: supplier.name,
    businessName: supplier.businessName || "",
    rfc: supplier.rfc || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    website: supplier.website || "",
    status: supplier.status,
    category: supplier.category || "",
    notes: supplier.notes || "",
  });

  const updateField = <K extends keyof SupplierGeneralUpdatePayload>(
    field: K,
    value: SupplierGeneralUpdatePayload[K]
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
            <h3>Editar datos del proveedor</h3>
            <p>Actualiza la información general registrada en el directorio.</p>
          </div>

          <button type="button" className="supplier-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="supplier-modal-form" onSubmit={handleSubmit}>
          <label>
            Nombre comercial
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>

          <label>
            Razón social
            <input
              value={form.businessName}
              onChange={(event) => updateField("businessName", event.target.value)}
            />
          </label>

          <label>
            RFC
            <input value={form.rfc} onChange={(event) => updateField("rfc", event.target.value)} />
          </label>

          <label>
            Categoría
            <input
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
            />
          </label>

          <label>
            Teléfono general
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </label>

          <label>
            Correo general
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label>
            Sitio web
            <input
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
          </label>

          <label>
            Estado
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as SupplierStatus)}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="observacion">En observación</option>
              <option value="pendiente">Pendiente</option>
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
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}