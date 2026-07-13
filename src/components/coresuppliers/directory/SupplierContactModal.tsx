import { useState } from "react";
import type { FormEvent } from "react";
import type {
  SupplierContact,
  SupplierContactPayload,
} from "../../../interfaces/supplierDirectory";

interface SupplierContactModalProps {
  supplierId: string;
  contact: SupplierContact | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: SupplierContactPayload) => Promise<void> | void;
}

export function SupplierContactModal({
  supplierId,
  contact,
  isSaving,
  onClose,
  onSave,
}: SupplierContactModalProps) {
  const [form, setForm] = useState<SupplierContactPayload>({
    id: contact?.id,
    supplierId,
    name: contact?.name || "",
    role: contact?.role || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    contactType: contact?.contactType || "",
    isMain: contact?.isMain || false,
    active: contact?.active ?? true,
  });

  const updateField = <K extends keyof SupplierContactPayload>(
    field: K,
    value: SupplierContactPayload[K]
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
      <div className="supplier-modal supplier-modal-narrow">
        <div className="supplier-modal-header">
          <div>
            <h3>{contact ? "Editar contacto" : "Agregar contacto"}</h3>
            <p>Administra contactos comerciales, técnicos o de soporte.</p>
          </div>

          <button type="button" className="supplier-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="supplier-modal-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>

          <label>
            Puesto
            <input value={form.role} onChange={(event) => updateField("role", event.target.value)} />
          </label>

          <label>
            Tipo de contacto
            <select
              value={form.contactType}
              onChange={(event) => updateField("contactType", event.target.value)}
            >
              <option value="">Sin clasificar</option>
              <option value="Comercial">Comercial</option>
              <option value="Técnico">Técnico</option>
              <option value="Soporte">Soporte</option>
              <option value="Emergencia">Emergencia</option>
              <option value="Facturación">Facturación</option>
            </select>
          </label>

          <label>
            Correo
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </label>

          <label>
            Teléfono
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </label>

          <div className="supplier-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={form.isMain}
                onChange={(event) => updateField("isMain", event.target.checked)}
              />
              Contacto principal
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => updateField("active", event.target.checked)}
              />
              Activo
            </label>
          </div>

          <div className="supplier-modal-actions">
            <button type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </button>

            <button type="submit" className="supplier-primary-button" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar contacto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}