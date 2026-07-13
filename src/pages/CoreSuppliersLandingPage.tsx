import CoreSuppliersKPISection from "../components/coresuppliers/CoreSuppliersKPISection";
import { useCoreSuppliers } from "../hooks/useCoreSuppliers";
import type { ServicioProveedorVista } from "../interfaces/coreSuppliers";
import "../styles/LandingPage.css";
import "../styles/TriagePanel.css";
import "../styles/CoreSuppliersLandingPage.css";

function obtenerEtiquetaPendiente(servicio: ServicioProveedorVista) {
  const pendientes: string[] = [];

  const tieneTelefono =
    Boolean(servicio.telefonoSoporte) ||
    Boolean(servicio.contactoPrincipal?.telefono);

  const tieneCorreo =
    Boolean(servicio.correoSoporte) ||
    Boolean(servicio.contactoPrincipal?.correo);

  if (!tieneTelefono) {
    pendientes.push("teléfono");
  }

  if (!tieneCorreo) {
    pendientes.push("correo");
  }

  if (servicio.estadoServicio !== "Activo") {
    pendientes.push("estado");
  }

  if (pendientes.length === 0) {
    return "Por revisar";
  }

  return `Falta ${pendientes.join(" / ")}`;
}

function CoreSuppliersLandingPage() {
  const {
    servicios,
    isLoading,
    error,
    totalProveedores,
    serviciosActivos,
    sucursalesCubiertas,
    serviciosSinContacto,
  } = useCoreSuppliers();

  const serviciosPrioritarios = servicios.slice(0, 5);

  const serviciosPendientes = servicios.filter(
    (servicio) =>
      servicio.estadoServicio !== "Activo" ||
      !servicio.telefonoSoporte ||
      !servicio.correoSoporte
  );

  const contarPorTipo = (tipoServicio: string) =>
    servicios.filter((servicio) => servicio.tipoServicio === tipoServicio)
      .length;

  return (
    <main className="landing-page coresuppliers-landing">
      <section className="landing-content">
        <div className="landing-title-block">
          <p className="landing-eyebrow">Catálogo de Proveedores TI</p>

          <h1>CoreSuppliers</h1>

          <p>
            Consulta proveedores por sucursal para servicios de internet,
            CCTV/cámaras y computadoras. Diseñado para que cualquier integrante
            de TI pueda atender sucursales con información clara y confiable.
          </p>

          <div className="landing-total-assets">
            <span>Servicios proveedor-sucursal registrados:</span>
            <strong>{isLoading ? "..." : servicios.length}</strong>
          </div>
        </div>

        {error && <div className="data-error">{error}</div>}

        <CoreSuppliersKPISection
          totalProveedores={totalProveedores}
          serviciosActivos={serviciosActivos}
          sucursalesCubiertas={sucursalesCubiertas}
          serviciosSinContacto={serviciosSinContacto}
          isLoading={isLoading}
        />

        <section className="dashboard-grid">
          <section className="triage-panel">
            <div className="panel-header">
              <h3>Servicios por sucursal</h3>
              <span>Consulta operativa</span>
            </div>

            {isLoading && <div className="empty-state">Cargando servicios...</div>}

            {!isLoading && serviciosPrioritarios.length === 0 && (
              <div className="empty-state">
                No hay servicios proveedor-sucursal registrados.
              </div>
            )}

            {!isLoading && serviciosPrioritarios.length > 0 && (
              <div className="triage-list">
                {serviciosPrioritarios.map((servicio) => (
                  <article className="triage-item" key={servicio.id}>
                    <div>
                      <strong>{servicio.proveedor}</strong>
                      <p>
                        {servicio.tipoServicio} · {servicio.sucursal}
                        {servicio.ubicacion ? ` · ${servicio.ubicacion}` : ""}
                      </p>
                    </div>

                   <div className="triage-tags">
                        <span>{servicio.estadoServicio}</span>
                        <span>{servicio.tipoServicio}</span>

                        {servicio.telefonoSoporte && <span>{servicio.telefonoSoporte}</span>}

                        {!servicio.telefonoSoporte && servicio.correoSoporte && (
                            <span>{servicio.correoSoporte}</span>
                        )}

                        {!servicio.telefonoSoporte &&
                            !servicio.correoSoporte &&
                            servicio.contactoPrincipal?.telefono && (
                            <span>{servicio.contactoPrincipal.telefono}</span>
                            )}

                        {!servicio.telefonoSoporte &&
                            !servicio.correoSoporte &&
                            !servicio.contactoPrincipal?.telefono &&
                            servicio.contactoPrincipal?.correo && (
                            <span>{servicio.contactoPrincipal.correo}</span>
                            )}

                        {servicio.contactoPrincipal && (
                            <span>{servicio.contactoPrincipal.nombre}</span>
                        )}
                        </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="triage-panel">
            <div className="panel-header">
              <h3>Información pendiente</h3>
              <span>Calidad del catálogo</span>
            </div>

            {isLoading && <div className="empty-state">Validando datos...</div>}

            {!isLoading && serviciosPendientes.length === 0 && (
              <div className="empty-state">
                No hay datos pendientes por completar.
              </div>
            )}

            {!isLoading && serviciosPendientes.length > 0 && (
              <div className="supplier-pending-list">
                {serviciosPendientes.slice(0, 5).map((servicio) => (
                  <article
                    className="supplier-pending-item"
                    key={`pending-${servicio.id}`}
                  >
                    <div>
                      <strong>{servicio.sucursal}</strong>
                      <p>
                        {servicio.tipoServicio} · {servicio.proveedor}
                      </p>
                    </div>

                    <span>{obtenerEtiquetaPendiente(servicio)}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="supplier-access-panel">
          <div>
            <p className="landing-eyebrow">Accesos rápidos</p>
            <h2>Consulta rápida por tipo de proveedor</h2>
            <p>
              Este módulo concentra proveedores de internet, cámaras/CCTV y
              computadoras, con filtros por sucursal, ubicación interna y estado
              del servicio.
            </p>
          </div>

          <div className="supplier-category-grid">
            <article>
              <span>INT</span>
              <strong>Internet</strong>
              <p>{isLoading ? "..." : contarPorTipo("Internet")} servicios registrados.</p>
            </article>

            <article>
              <span>CCTV</span>
              <strong>Cámaras</strong>
              <p>{isLoading ? "..." : contarPorTipo("CCTV")} servicios registrados.</p>
            </article>

            <article>
              <span>PC</span>
              <strong>Computadoras</strong>
              <p>
                {isLoading ? "..." : contarPorTipo("Computadoras")} servicios
                registrados.
              </p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}

export default CoreSuppliersLandingPage;