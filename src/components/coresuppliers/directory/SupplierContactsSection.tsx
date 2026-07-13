import type { SupplierContact } from "../../../interfaces/supplierDirectory";

interface SupplierContactsSectionProps {
  contacts: SupplierContact[];
  onAdd: () => void;
  onEdit: (contact: SupplierContact) => void;
}

export function SupplierContactsSection({
  contacts,
  onAdd,
  onEdit,
}: SupplierContactsSectionProps) {
  return (
    <section className="supplier-detail-section">
      <div className="supplier-section-heading">
        <div>
          <h4>Contactos</h4>
          <p>Ejecutivos, soporte técnico y contactos de escalamiento.</p>
        </div>

        <button type="button" className="supplier-section-button" onClick={onAdd}>
          Agregar contacto
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="supplier-inline-empty">
          Este proveedor todavía no tiene contactos registrados.
        </div>
      ) : (
        <div className="supplier-contact-list">
          {contacts.map((contact) => (
            <article key={contact.id} className="supplier-contact-card">
              <div>
                <div className="supplier-contact-title">
                  <strong>{contact.name}</strong>

                  {contact.isMain && (
                    <span className="supplier-main-contact-pill">Principal</span>
                  )}

                  {!contact.active && <span className="supplier-muted-pill">Inactivo</span>}
                </div>

                <p>{contact.role || contact.contactType || "Sin puesto registrado"}</p>
              </div>

              <div className="supplier-contact-data">
                <span>{contact.email || "Sin correo"}</span>
                <span>{contact.phone || "Sin teléfono"}</span>
              </div>

              <button
                type="button"
                className="supplier-small-action"
                onClick={() => onEdit(contact)}
              >
                Editar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}