import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type {
  SupplierAssignment,
  SupplierAssignmentPayload,
} from "../../../interfaces/supplierDirectory";
import type { SucursalOption } from "../../../interfaces/altaProveedor";
import { getSucursalesProveedor } from "../../../services/proveedoresFormService";

interface SupplierAssignmentModalProps {
  supplierId: string;
  assignment: SupplierAssignment | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: SupplierAssignmentPayload) => Promise<void> | void;
}

export function SupplierAssignmentModal({
  supplierId,
  assignment,
  isSaving,
  onClose,
  onSave,
}: SupplierAssignmentModalProps) {
  const [sucursales, setSucursales] = useState<SucursalOption[]>([]);
  const [isLoadingSucursales, setIsLoadingSucursales] = useState(true);
  const [sucursalesError, setSucursalesError] = useState<string | null>(null);

  const [form, setForm] = useState<SupplierAssignmentPayload>({
    id: assignment?.id,
    supplierId,
    serviceId: assignment?.serviceId || "Internet",
    branchId: assignment?.branchId || "",

    /*
     * Aunque las interfaces todavía permiten otros estados,
     * este formulario solo administrará Activo/Inactivo.
     */
    status: assignment?.status === "inactivo" ? "inactivo" : "activo",

    notes: assignment?.notes || "",
  });

  useEffect(() => {
    let isMounted = true;

    const cargarSucursales = async () => {
      try {
        setIsLoadingSucursales(true);
        setSucursalesError(null);

        const data = await getSucursalesProveedor();

        if (isMounted) {
          setSucursales(data);
        }
      } catch (error) {
        console.error("No se pudieron cargar las sucursales:", error);

        if (isMounted) {
          setSucursales([]);
          setSucursalesError(
            "No se pudo cargar el catálogo de sucursales."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSucursales(false);
        }
      }
    };

    void cargarSucursales();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const currentBranchIsMissing =
    Boolean(assignment?.branchId) &&
    !sucursales.some(
      (sucursal) => sucursal.id === assignment?.branchId
    );

  return (
    <div className="supplier-modal-backdrop">
      <div className="supplier-modal">
        <div className="supplier-modal-header">
          <div>
            <h3>
              {assignment ? "Editar asignación" : "Agregar asignación"}
            </h3>

            <p>
              Relaciona al proveedor con un servicio y una sucursal.
            </p>
          </div>

          <button
            type="button"
            className="supplier-modal-close"
            onClick={onClose}
            aria-label="Cerrar formulario de asignación"
            title="Cerrar"
          >
            ×
          </button>
        </div>

        <form className="supplier-modal-form" onSubmit={handleSubmit}>
          <label>
            Servicio
            <select
              value={form.serviceId}
              onChange={(event) =>
                updateField("serviceId", event.target.value)
              }
              required
            >
              <option value="Internet">Internet</option>
              <option value="CCTV">CCTV</option>
              <option value="Computadoras">Computadoras</option>
            </select>
          </label>

          <label>
            Sucursal
            <select
              value={form.branchId}
              onChange={(event) =>
                updateField("branchId", event.target.value)
              }
              disabled={isLoadingSucursales || Boolean(sucursalesError)}
              required
            >
              <option value="">
                {isLoadingSucursales
                  ? "Cargando sucursales..."
                  : sucursalesError
                    ? "No se pudieron cargar las sucursales"
                    : "Selecciona una sucursal"}
              </option>

              {currentBranchIsMissing && assignment && (
                <option value={assignment.branchId}>
                  {assignment.branchName}
                </option>
              )}

              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            Estado
            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as "activo" | "inactivo"
                )
              }
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </label>

          <label className="supplier-modal-full">
            Observaciones
            <textarea
              rows={4}
              value={form.notes || ""}
              onChange={(event) =>
                updateField("notes", event.target.value)
              }
            />
          </label>

          {sucursalesError && (
            <div className="supplier-directory-error supplier-modal-full">
              {sucursalesError}
            </div>
          )}

          <div className="supplier-modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="supplier-primary-button"
              disabled={
                isSaving ||
                isLoadingSucursales ||
                Boolean(sucursalesError)
              }
            >
              {isSaving
                ? "Guardando..."
                : assignment
                  ? "Guardar cambios"
                  : "Agregar asignación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}