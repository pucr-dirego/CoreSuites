import { useMemo, useState } from "react";
import { useEquipos } from "../hooks/useEquipos";
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import "../styles/AdminPages.css";

function AdminPage() {
  const { equipos, isLoading, error, recargarEquipos, actualizarEquipo } =
    useEquipos();

  const [busqueda, setBusqueda] = useState("");
  const [equipoRestaurandoId, setEquipoRestaurandoId] = useState<string | null>(
    null
  );

  const [equipoPendienteRestauracion, setEquipoPendienteRestauracion] =
    useState<(typeof equipos)[number] | null>(null);

  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const equiposInactivos = useMemo(() => {
    return equipos.filter((equipo) => !equipo.activo);
  }, [equipos]);

  const equiposActivos = useMemo(() => {
    return equipos.filter((equipo) => equipo.activo);
  }, [equipos]);

  const equiposInactivosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return equiposInactivos;
    }

    return equiposInactivos.filter((equipo) => {
      return [
        equipo.hostname,
        equipo.tipoEquipo,
        equipo.sucursal,
        equipo.departamento,
        equipo.responsable,
        equipo.estadoFuncionamiento,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termino);
    });
  }, [busqueda, equiposInactivos]);

  function solicitarRestauracion(equipo: (typeof equipos)[number]) {
    setEquipoPendienteRestauracion(equipo);
  }

  async function confirmarRestauracion() {
    if (!equipoPendienteRestauracion) {
      return;
    }

    const equipo = equipoPendienteRestauracion;

    try {
      setEquipoRestaurandoId(equipo.id);

      await actualizarEquipo({
        id: equipo.id,
        hostname: equipo.hostname,
        tipoEquipo: equipo.tipoEquipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        numeroSerie: equipo.numeroSerie,
        direccionIP: equipo.direccionIP,
        sistemaOperativo: equipo.sistemaOperativo,
        claveAnyDesk: equipo.claveAnyDesk,
        responsable: equipo.responsable,
        estadoFuncionamiento: equipo.estadoFuncionamiento,
        condicionFisica: equipo.condicionFisica,
        observaciones: equipo.observaciones,
        sucursalId: equipo.sucursalId,
        departamentoId: equipo.departamentoId,
        ubicacionSucursalId: equipo.ubicacionSucursalId,
        ubicacionExacta: equipo.ubicacionExacta,
        activo: true,
      });

      await recargarEquipos();
      window.dispatchEvent(new Event("coreinventory:datos-actualizados"));
      setEquipoPendienteRestauracion(null);

      setFeedbackModal({
        open: true,
        type: "success",
        title: "Equipo restaurado",
        message: `El equipo "${equipo.hostname}" fue restaurado correctamente y volverá a aparecer en Inventario.`,
      });
    } catch (error) {
      console.error("Error al restaurar equipo:", error);

      setEquipoPendienteRestauracion(null);

      setFeedbackModal({
        open: true,
        type: "error",
        title: "No se pudo restaurar",
        message:
          "Ocurrió un problema al restaurar el equipo. Revisa la consola o intenta nuevamente.",
      });
    } finally {
      setEquipoRestaurandoId(null);
    }
  }

  return (
    <main className="admin-page">
      <ActionFeedbackModal
        open={equipoPendienteRestauracion !== null}
        type="info"
        title="Confirmar restauración"
        message={
          equipoPendienteRestauracion
            ? `¿Deseas restaurar el equipo "${equipoPendienteRestauracion.hostname}"? El equipo volverá a marcarse como activo y aparecerá nuevamente en Inventario.`
            : ""
        }
        confirmText="Restaurar equipo"
        cancelText="Cancelar"
        isLoading={equipoRestaurandoId !== null}
        onClose={() => {
          if (equipoRestaurandoId === null) {
            setEquipoPendienteRestauracion(null);
          }
        }}
        onConfirm={confirmarRestauracion}
      />

      <ActionFeedbackModal
        open={feedbackModal.open}
        type={feedbackModal.type}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onClose={() =>
          setFeedbackModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />

      <section className="admin-hero">
        <div>
          <p className="admin-eyebrow">Administración TI</p>
          <h1>Panel de administración</h1>
          <p>
            Gestión operativa para bajas lógicas, restauración de equipos y
            control de activos inactivos dentro del inventario TI.
          </p>
        </div>
      </section>

      <section className="admin-policy-card">
        <div>
          <span>Regla operativa</span>
          <h2>Baja lógica, no eliminación física</h2>
          <p>
            En este sistema los equipos no se eliminan de Dataverse. Cuando un
            equipo deja de operar, se marca como inactivo para conservar su
            historial y permitir su restauración si es necesario.
          </p>
        </div>

        <div className="admin-policy-badge">
          <strong>0</strong>
          <small>eliminaciones físicas</small>
        </div>
      </section>

      <section className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <span>Equipos inactivos</span>
          <strong>{equiposInactivos.length}</strong>
          <p>Equipos dados de baja lógica.</p>
        </article>

        <article className="admin-kpi-card">
          <span>Equipos activos</span>
          <strong>{equiposActivos.length}</strong>
          <p>Equipos actualmente operativos.</p>
        </article>

        <article className="admin-kpi-card">
          <span>Total inventario</span>
          <strong>{equipos.length}</strong>
          <p>Registros totales conservados.</p>
        </article>
      </section>

      <section className="admin-panel-card">
        <div className="admin-card-header admin-card-header-actions">
          <div>
            <h2>Equipos inactivos</h2>
            <p>
              Equipos marcados como inactivos. Estos registros se conservan en
              Dataverse y pueden restaurarse sin eliminar información histórica.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={recargarEquipos}
            disabled={isLoading || equipoRestaurandoId !== null}
          >
            Actualizar datos
          </button>
        </div>

        <div className="admin-toolbar">
          <label>
            Buscar equipo
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por hostname, sucursal, departamento o responsable..."
            />
          </label>
        </div>

        {isLoading ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon"></div>
            <h3>Cargando equipos</h3>
            <p>Estamos consultando los registros del inventario.</p>
          </div>
        ) : error ? (
          <div className="admin-empty-state admin-empty-state-error">
            <div className="admin-empty-icon"></div>
            <h3>No se pudieron cargar los equipos</h3>
            <p>{error}</p>
          </div>
        ) : equiposInactivosFiltrados.length === 0 ? (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">✓</div>
            <h3>No hay equipos inactivos para mostrar</h3>
            <p>
              No se encontraron equipos dados de baja lógica con los filtros
              actuales.
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>Tipo</th>
                  <th>Sucursal</th>
                  <th>Departamento</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {equiposInactivosFiltrados.map((equipo) => (
                  <tr key={equipo.id}>
                    <td>
                      <strong>{equipo.hostname}</strong>
                    </td>
                    <td>{equipo.tipoEquipo}</td>
                    <td>{equipo.sucursal}</td>
                    <td>{equipo.departamento}</td>
                    <td>{equipo.responsable}</td>
                    <td>{equipo.estadoFuncionamiento}</td>
                    <td>
                      <span className="admin-status-inactive">Inactivo</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-restore-button"
                        onClick={() => solicitarRestauracion(equipo)}
                        disabled={equipoRestaurandoId === equipo.id}
                      >
                        {equipoRestaurandoId === equipo.id
                          ? "Restaurando..."
                          : "Restaurar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPage;