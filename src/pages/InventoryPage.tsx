import { useEffect, useMemo, useState } from "react";
import type { EquipoDashboard } from "../interfaces/equipos";
import type { InventoryQuickFilter } from "../interfaces/inventoryFilters";
import EditEquipoModal from "../components/EditEquipoModal";
import ActionFeedbackModal from "../components/ActionFeedbackModal";
import { useEquipos } from "../hooks/useEquipos";
import "../styles/InventoryPage.css";

const LIMITE_VISTA_INICIAL = 20;

interface InventoryPageProps {
  quickFilter?: InventoryQuickFilter;
  onQuickFilterApplied?: () => void;
}

function obtenerClaseEstado(estado: string) {
  if (estado === "Excelente" || estado === "Bueno") {
    return "status-good";
  }

  if (estado === "Regular") {
    return "status-warning";
  }

  if (estado === "Malo" || estado === "Disfuncional") {
    return "status-danger";
  }

  return "status-neutral";
}

function InventoryPage({
  quickFilter,
  onQuickFilterApplied,
}: InventoryPageProps) {
  const {
    equipos,
    sucursales,
    departamentos,
    ubicacionesSucursal,
    actualizarEquipo,
    recargarEquipos,
    isLoading,
    error,
  } = useEquipos();

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroSucursal, setFiltroSucursal] = useState("todas");
  const [filtroDepartamento, setFiltroDepartamento] = useState("todos");
  const [filtroActivo, setFiltroActivo] = useState<
    "activos" | "inactivos" | "todos"
  >("activos");

  const [equipoEnEdicion, setEquipoEnEdicion] =
    useState<EquipoDashboard | null>(null);

  const [equipoBajaId, setEquipoBajaId] = useState<string | null>(null);

  const [equipoPendienteBaja, setEquipoPendienteBaja] =
    useState<EquipoDashboard | null>(null);

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

  useEffect(() => {
    if (!quickFilter) {
      return;
    }

    setBusqueda("");
    setFiltroTipo("todos");
    setFiltroSucursal("todas");
    setFiltroDepartamento("todos");

    if (quickFilter === "buen_estado") {
      setFiltroEstado("buen_estado");
      setFiltroActivo("activos");
    }

    if (quickFilter === "revision_preventiva") {
      setFiltroEstado("Regular");
      setFiltroActivo("activos");
    }

    if (quickFilter === "criticos") {
      setFiltroEstado("criticos");
      setFiltroActivo("activos");
    }

    if (quickFilter === "inactivos") {
      setFiltroEstado("todos");
      setFiltroActivo("inactivos");
    }

    onQuickFilterApplied?.();
  }, [quickFilter, onQuickFilterApplied]);

  const equiposPorEstadoRegistro = useMemo(() => {
    if (filtroActivo === "activos") {
      return equipos.filter((equipo) => equipo.activo);
    }

    if (filtroActivo === "inactivos") {
      return equipos.filter((equipo) => !equipo.activo);
    }

    return equipos;
  }, [equipos, filtroActivo]);

  const sucursalesDisponibles = useMemo(() => {
    return Array.from(
      new Set(equiposPorEstadoRegistro.map((equipo) => equipo.sucursal))
    )
      .filter((sucursal) => sucursal && sucursal !== "Sin sucursal")
      .sort();
  }, [equiposPorEstadoRegistro]);

  const departamentosDisponibles = useMemo(() => {
    return Array.from(
      new Set(equiposPorEstadoRegistro.map((equipo) => equipo.departamento))
    )
      .filter(
        (departamento) => departamento && departamento !== "Sin departamento"
      )
      .sort();
  }, [equiposPorEstadoRegistro]);

  const hayFiltroEspecifico =
    busqueda.trim() !== "" ||
    filtroEstado !== "todos" ||
    filtroTipo !== "todos" ||
    filtroSucursal !== "todas" ||
    filtroDepartamento !== "todos" ||
    filtroActivo !== "activos";

  const equiposOrdenados = useMemo(() => {
    return [...equiposPorEstadoRegistro].sort((a, b) => {
      const fechaA = new Date(a.createdon ?? a.modifiedon ?? 0).getTime();
      const fechaB = new Date(b.createdon ?? b.modifiedon ?? 0).getTime();

      return fechaB - fechaA;
    });
  }, [equiposPorEstadoRegistro]);

  const equiposFiltrados = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();

    return equiposOrdenados.filter((equipo) => {
      const coincideBusqueda =
        textoBusqueda === "" ||
        equipo.hostname.toLowerCase().includes(textoBusqueda) ||
        equipo.idequipo.toLowerCase().includes(textoBusqueda) ||
        equipo.numeroSerie.toLowerCase().includes(textoBusqueda) ||
        equipo.responsable.toLowerCase().includes(textoBusqueda) ||
        equipo.marca.toLowerCase().includes(textoBusqueda) ||
        equipo.modelo.toLowerCase().includes(textoBusqueda) ||
        equipo.direccionIP.toLowerCase().includes(textoBusqueda);

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "buen_estado" &&
          ["Excelente", "Bueno"].includes(equipo.estadoFuncionamiento)) ||
        (filtroEstado === "criticos" &&
          ["Malo", "Disfuncional"].includes(equipo.estadoFuncionamiento)) ||
        equipo.estadoFuncionamiento === filtroEstado;

      const coincideTipo =
        filtroTipo === "todos" || equipo.tipoEquipo === filtroTipo;

      const coincideSucursal =
        filtroSucursal === "todas" || equipo.sucursal === filtroSucursal;

      const coincideDepartamento =
        filtroDepartamento === "todos" ||
        equipo.departamento === filtroDepartamento;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideTipo &&
        coincideSucursal &&
        coincideDepartamento
      );
    });
  }, [
    equiposOrdenados,
    busqueda,
    filtroEstado,
    filtroTipo,
    filtroSucursal,
    filtroDepartamento,
  ]);

  const equiposVisibles = hayFiltroEspecifico
    ? equiposFiltrados
    : equiposFiltrados.slice(0, LIMITE_VISTA_INICIAL);

  const equiposRestantes = Math.max(
    equiposFiltrados.length - equiposVisibles.length,
    0
  );

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroTipo("todos");
    setFiltroSucursal("todas");
    setFiltroDepartamento("todos");
    setFiltroActivo("activos");
  }

  function solicitarBajaLogica(equipo: EquipoDashboard) {
    if (!equipo.activo) {
      return;
    }

    setEquipoPendienteBaja(equipo);
  }

  async function confirmarBajaLogica() {
    if (!equipoPendienteBaja) {
      return;
    }

    try {
      setEquipoBajaId(equipoPendienteBaja.id);

      await actualizarEquipo({
        id: equipoPendienteBaja.id,
        hostname: equipoPendienteBaja.hostname,
        tipoEquipo: equipoPendienteBaja.tipoEquipo,
        marca: equipoPendienteBaja.marca,
        modelo: equipoPendienteBaja.modelo,
        numeroSerie: equipoPendienteBaja.numeroSerie,
        direccionIP: equipoPendienteBaja.direccionIP,
        sistemaOperativo: equipoPendienteBaja.sistemaOperativo,
        claveAnyDesk: equipoPendienteBaja.claveAnyDesk,
        responsable: equipoPendienteBaja.responsable,
        estadoFuncionamiento: equipoPendienteBaja.estadoFuncionamiento,
        condicionFisica: equipoPendienteBaja.condicionFisica,
        observaciones: equipoPendienteBaja.observaciones,
        sucursalId: equipoPendienteBaja.sucursalId,
        departamentoId: equipoPendienteBaja.departamentoId,
        ubicacionSucursalId: equipoPendienteBaja.ubicacionSucursalId,
        ubicacionExacta: equipoPendienteBaja.ubicacionExacta,
        activo: false,
      });

      await recargarEquipos();

      window.dispatchEvent(new Event("coreinventory:datos-actualizados"));

      setFeedbackModal({
        open: true,
        type: "success",
        title: "Equipo dado de baja",
        message: `El equipo "${equipoPendienteBaja.hostname}" fue dado de baja lógica correctamente. Podrás restaurarlo desde el panel Admin.`,
      });

      setEquipoPendienteBaja(null);
    } catch (error) {
      console.error("Error al dar de baja lógica:", error);

      setFeedbackModal({
        open: true,
        type: "error",
        title: "No se pudo dar de baja",
        message:
          "Ocurrió un problema al marcar el equipo como inactivo. Revisa la consola o inténtalo nuevamente.",
      });
    } finally {
      setEquipoBajaId(null);
    }
  }

  return (
    <main className="inventory-page">
      <EditEquipoModal
        equipo={equipoEnEdicion}
        onClose={() => setEquipoEnEdicion(null)}
        onSave={async (datos) => {
          try {
            await actualizarEquipo(datos);
            await recargarEquipos();

            window.dispatchEvent(new Event("coreinventory:datos-actualizados"));

            setEquipoEnEdicion(null);

            setFeedbackModal({
              open: true,
              type: "success",
              title: "Equipo actualizado",
              message:
                "Los cambios del equipo se guardaron correctamente en Dataverse.",
            });
          } catch (error) {
            console.error("Error al actualizar equipo:", error);

            setFeedbackModal({
              open: true,
              type: "error",
              title: "No se pudo actualizar",
              message:
                "Ocurrió un problema al guardar los cambios. Revisa los datos e inténtalo nuevamente.",
            });
          }
        }}
        sucursales={sucursales}
        departamentos={departamentos}
        ubicacionesSucursal={ubicacionesSucursal}
      />

      <ActionFeedbackModal
        open={equipoPendienteBaja !== null}
        type="warning"
        title="Confirmar baja lógica"
        message={
          equipoPendienteBaja
            ? `¿Deseas dar de baja el equipo "${equipoPendienteBaja.hostname}"? El equipo no será eliminado, solo se marcará como inactivo y podrá restaurarse desde la pestaña Admin.`
            : ""
        }
        confirmText="Dar de baja"
        cancelText="Cancelar"
        isLoading={equipoBajaId !== null}
        onClose={() => {
          if (equipoBajaId === null) {
            setEquipoPendienteBaja(null);
          }
        }}
        onConfirm={confirmarBajaLogica}
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

      <section className="inventory-content">
        <div className="inventory-title-block">
          <p className="inventory-eyebrow">Inventario general</p>
          <h1>Inventario de equipos</h1>
          <p>
            Consulta los equipos registrados, filtra por estado, sucursal,
            departamento, tipo de equipo y estado de registro. Las bajas lógicas
            se administran desde el panel Admin.
          </p>
        </div>

        {error && <div className="inventory-error">{error}</div>}

        <section className="inventory-toolbar">
          <div className="inventory-search">
            <label>Buscar equipo</label>
            <input
              type="text"
              placeholder="Buscar por hostname, serie, responsable, marca o modelo..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>

          <div className="inventory-filter">
            <label>Estado de equipo</label>
            <select
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="buen_estado">Excelente + Bueno</option>
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="criticos">Malo + Disfuncional</option>
              <option value="Malo">Malo</option>
              <option value="Disfuncional">Disfuncional</option>
            </select>
          </div>

          <div className="inventory-filter">
            <label>Estado de registro</label>
            <select
              value={filtroActivo}
              onChange={(event) =>
                setFiltroActivo(
                  event.target.value as "activos" | "inactivos" | "todos"
                )
              }
            >
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div className="inventory-filter">
            <label>Tipo de equipo</label>
            <select
              value={filtroTipo}
              onChange={(event) => setFiltroTipo(event.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="Laptop">Laptop</option>
              <option value="PC de Escritorio">PC de Escritorio</option>
            </select>
          </div>

          <div className="inventory-filter">
            <label>Sucursal</label>
            <select
              value={filtroSucursal}
              onChange={(event) => setFiltroSucursal(event.target.value)}
            >
              <option value="todas">Todas las sucursales</option>
              {sucursalesDisponibles.map((sucursal) => (
                <option key={sucursal} value={sucursal}>
                  {sucursal}
                </option>
              ))}
            </select>
          </div>

          <div className="inventory-filter">
            <label>Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(event) => setFiltroDepartamento(event.target.value)}
            >
              <option value="todos">Todos los departamentos</option>
              {departamentosDisponibles.map((departamento) => (
                <option key={departamento} value={departamento}>
                  {departamento}
                </option>
              ))}
            </select>
          </div>

          <div className="inventory-clear-filters">
            <button
              type="button"
              className="clear-filters-button"
              onClick={limpiarFiltros}
              disabled={!hayFiltroEspecifico}
              aria-label="Limpiar filtros del inventario"
              title={
                hayFiltroEspecifico
                  ? "Limpiar filtros activos"
                  : "No hay filtros activos"
              }
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        <section className="inventory-table-card">
          <div className="inventory-table-header">
            <div>
              <h2>
                {filtroActivo === "inactivos"
                  ? "Equipos inactivos registrados"
                  : filtroActivo === "todos"
                    ? "Equipos registrados"
                    : "Equipos activos registrados"}
              </h2>
              <p>
                {hayFiltroEspecifico
                  ? `Mostrando ${equiposVisibles.length} resultado(s) filtrado(s).`
                  : `Mostrando los ${equiposVisibles.length} equipos más recientes.`}
              </p>
            </div>

            <button
              type="button"
              className="inventory-primary-action"
              onClick={recargarEquipos}
              disabled={isLoading || equipoBajaId !== null}
            >
              Actualizar datos
            </button>
          </div>

          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>Tipo</th>
                  <th>Sucursal</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Activo</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="inventory-empty-row">
                      Cargando equipos desde Dataverse...
                    </td>
                  </tr>
                )}

                {!isLoading && equiposVisibles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="inventory-empty-row">
                      No se encontraron equipos con los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  equiposVisibles.map((equipo) => (
                    <tr key={equipo.id}>
                      <td>
                        <strong>{equipo.hostname}</strong>
                        <span className="inventory-subtext">
                          {equipo.idequipo}
                        </span>
                      </td>

                      <td>{equipo.tipoEquipo}</td>
                      <td>{equipo.sucursal}</td>
                      <td>{equipo.departamento}</td>

                      <td>
                        <span
                          className={`status-pill ${obtenerClaseEstado(
                            equipo.estadoFuncionamiento
                          )}`}
                        >
                          {equipo.estadoFuncionamiento}
                        </span>
                      </td>

                      <td className="inventory-active-cell">
                        <span
                          className={
                            equipo.activo
                              ? "active-dot active"
                              : "active-dot inactive"
                          }
                          title={
                            equipo.activo ? "Equipo activo" : "Equipo inactivo"
                          }
                          aria-label={
                            equipo.activo ? "Equipo activo" : "Equipo inactivo"
                          }
                        >
                          {equipo.activo ? "✓" : "×"}
                        </span>
                      </td>

                      <td>
                        <div className="inventory-actions">
                          <button
                            type="button"
                            className="icon-action edit"
                            title={`Editar ${equipo.hostname}`}
                            aria-label={`Editar ${equipo.hostname}`}
                            onClick={() => setEquipoEnEdicion(equipo)}
                            disabled={equipoBajaId === equipo.id}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="icon-action danger"
                            title={
                              equipo.activo
                                ? `Dar de baja lógica ${equipo.hostname}`
                                : `${equipo.hostname} ya está inactivo`
                            }
                            aria-label={
                              equipo.activo
                                ? `Dar de baja lógica ${equipo.hostname}`
                                : `${equipo.hostname} ya está inactivo`
                            }
                            onClick={() => solicitarBajaLogica(equipo)}
                            disabled={equipoBajaId === equipo.id || !equipo.activo}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 6V4h8v2" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {!hayFiltroEspecifico && equiposRestantes > 0 && (
            <div className="inventory-limit-note">
              Aún quedan <strong>{equiposRestantes}</strong> equipos por
              consultar. Si deseas ver los demás, utiliza un filtro específico.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default InventoryPage;