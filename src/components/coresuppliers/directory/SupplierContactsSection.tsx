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
  const contactsSorted = [...contacts].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <section className="supplier-detail-section">
      <div className="supplier-section-heading">
        <div>
          <h4>Contactos</h4>

          <p>
            Ejecutivos, soporte técnico y contactos de escalamiento.
          </p>
        </div>

        <button
          type="button"
          className="supplier-section-button"
          onClick={onAdd}
        >
          Agregar contacto
        </button>
      </div>

      {contactsSorted.length === 0 ? (
        <div className="supplier-inline-empty">
          Este proveedor todavía no tiene contactos registrados.
        </div>
      ) : (
        <div className="supplier-contact-list">
          {contactsSorted.map((contact) => (
            <article
              key={contact.id}
              className={`supplier-contact-card ${
                contact.active ? "" : "supplier-contact-card-inactive"
              }`}
            >
              <div>
                <div className="supplier-contact-title">
                  <strong>{contact.name}</strong>

                  <span
                    className={
                      contact.active
                        ? "supplier-contact-status supplier-contact-status-active"
                        : "supplier-contact-status supplier-contact-status-inactive"
                    }
                  >
                    {contact.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <p>
                  {contact.role ||
                    contact.contactType ||
                    "Sin puesto registrado"}
                </p>
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
                {contact.active ? "Editar" : "Administrar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}