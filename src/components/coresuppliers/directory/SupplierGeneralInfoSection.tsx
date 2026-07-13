import type { SupplierDetail } from "../../../interfaces/supplierDirectory";

interface SupplierGeneralInfoSectionProps {
  supplier: SupplierDetail;
  onEdit: () => void;
}

export function SupplierGeneralInfoSection({
  supplier,
  onEdit,
}: SupplierGeneralInfoSectionProps) {
  return (
    <section className="supplier-detail-section">
      <div className="supplier-section-heading">
        <div>
          <h4>Datos generales</h4>
          <p>Información principal del proveedor.</p>
        </div>

        <button type="button" className="supplier-section-button" onClick={onEdit}>
          Editar datos
        </button>
      </div>

      <div className="supplier-info-grid">
        <div>
          <span>Nombre comercial</span>
          <strong>{supplier.name}</strong>
        </div>

        <div>
          <span>Razón social</span>
          <strong>{supplier.businessName || "No registrada"}</strong>
        </div>

        <div>
          <span>RFC</span>
          <strong>{supplier.rfc || "No registrado"}</strong>
        </div>

        <div>
          <span>Categoría</span>
          <strong>{supplier.category || "Sin categoría"}</strong>
        </div>

        <div>
          <span>Teléfono general</span>
          <strong>{supplier.phone || "No registrado"}</strong>
        </div>

        <div>
          <span>Correo general</span>
          <strong>{supplier.email || "No registrado"}</strong>
        </div>

        <div>
          <span>Sitio web</span>
          <strong>{supplier.website || "No registrado"}</strong>
        </div>

        <div>
          <span>Última actualización</span>
          <strong>
            {supplier.modifiedOn
              ? new Date(supplier.modifiedOn).toLocaleString("es-MX")
              : "Sin dato"}
          </strong>
        </div>
      </div>

      <div className="supplier-notes-box">
        <span>Observaciones</span>
        <p>{supplier.notes || "Sin observaciones registradas."}</p>
      </div>
    </section>
  );
}