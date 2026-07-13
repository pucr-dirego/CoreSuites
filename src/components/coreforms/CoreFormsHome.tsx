import type {
  CoreFormCard,
  CoreFormsView,
} from "../../interfaces/coreFormsNavigation";

type CoreFormsHomeProps = {
  onSelectForm: (view: CoreFormsView) => void;
  onBackToHub?: () => void;
};

const forms: CoreFormCard[] = [
  {
    id: "alta-equipo",
    title: "Alta de activo TI",
    description:
      "Registrar nuevos equipos de cómputo, asignarlos a sucursal, departamento y ubicación operativa.",
    area: "Activos de TI",
    status: "available",
  },
  {
    id: "alta-proveedor",
    title: "Alta de proveedor",
    description:
      "Registrar un proveedor, su contacto principal y el primer servicio asociado a una sucursal.",
    area: "Proveedores",
    status: "available",
  },
];

export default function CoreFormsHome({
  onSelectForm,
  onBackToHub,
}: CoreFormsHomeProps) {
  return (
    <main className="coreforms-page">
      <section className="coreforms-shell">
        <header className="coreforms-header">
          <div>
            <p className="coreforms-eyebrow">CoreForms</p>
            <h1>Captura operativa</h1>
            <p>
              Módulo nativo para registrar información que alimenta las tablas
              principales de Dataverse.
            </p>
          </div>

          {onBackToHub && (
            <button
              type="button"
              className="coreforms-secondary-button"
              onClick={onBackToHub}
            >
              Volver al Hub
            </button>
          )}
        </header>

        <section className="coreforms-home-grid">
          {forms.map((form) => (
            <article key={form.id} className="coreforms-home-card">
              <div>
                <span className="coreforms-card-area">{form.area}</span>
                <h2>{form.title}</h2>
                <p>{form.description}</p>
              </div>

              <div className="coreforms-card-footer">
                <span
                  className={`coreforms-status coreforms-status-${form.status}`}
                >
                  {form.status === "available" ? "Disponible" : "Preparado"}
                </span>

                <button
                  type="button"
                  className="coreforms-primary-button"
                  onClick={() => onSelectForm(form.id)}
                >
                  Abrir formulario
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}