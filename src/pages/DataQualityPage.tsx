import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useEquipos } from "../hooks/useEquipos";
import {
  evaluateDataQuality,
  type BranchQualitySummary,
  type DataQualityAlert,
} from "../services/dataQualityService";
import {
  dataQualityExceptionsService,
  type DataQualityException,
} from "../services/dataQualityExceptionsService";
import "../styles/DataQualityPage.css";

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
};

function getSeverityLabel(severity: string): string {
  if (severity === "critical") return "Crítica";
  if (severity === "high") return "Alta";
  if (severity === "medium") return "Media";
  return "Baja";
}

function getCategoryLabel(category: string): string {
  if (category === "duplicate") return "Duplicado";
  if (category === "missing") return "Dato faltante";
  if (category === "suspicious") return "Dato sospechoso";
  return "Alerta";
}

function formatDate(value?: string): string {
  if (!value) return "Sin fecha";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAffectedEquipmentLabel(alert: DataQualityAlert): string {
  const names = alert.affectedEquipmentHostnames?.filter(Boolean) ?? [];

  if (names.length === 0) {
    return alert.hostname;
  }

  if (names.length <= 2) {
    return names.join(" · ");
  }

  return `${names.slice(0, 2).join(" · ")} +${names.length - 2}`;
}

function buildExceptionName(alert: DataQualityAlert): string {
  const detectedValue = alert.detectedValue?.trim();
  const context = detectedValue || alert.hostname;

  return `${alert.title} · ${alert.sucursal} · ${context}`;
}

function DataQualityPage() {
  const { equipos, isLoading, error, recargarEquipos } = useEquipos();

  const [sucursalFiltro, setSucursalFiltro] = useState("todas");
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<BranchQualitySummary | null>(null);

  const [excepciones, setExcepciones] = useState<DataQualityException[]>([]);
  const [isLoadingExceptions, setIsLoadingExceptions] = useState(true);
  const [exceptionError, setExceptionError] = useState<string | null>(null);

  const [alertaParaIgnorar, setAlertaParaIgnorar] =
    useState<DataQualityAlert | null>(null);
  const [motivoIgnorado, setMotivoIgnorado] = useState("");
  const [isSavingException, setIsSavingException] = useState(false);
  const [reactivatingExceptionId, setReactivatingExceptionId] =
    useState<string | null>(null);

  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [mostrarTodasAlertas, setMostrarTodasAlertas] = useState(false);
  const [mostrarTodoHistorial, setMostrarTodoHistorial] = useState(false);

  const cargarExcepciones = useCallback(async () => {
    try {
      setIsLoadingExceptions(true);
      setExceptionError(null);

      const records =
        await dataQualityExceptionsService.getAllExceptions();

      setExcepciones(records);
    } catch (loadError) {
      console.error(
        "Error cargando excepciones de calidad de datos:",
        loadError
      );

      setExceptionError(
        "No se pudieron cargar las alertas ignoradas desde Dataverse."
      );
    } finally {
      setIsLoadingExceptions(false);
    }
  }, []);

  useEffect(() => {
    void cargarExcepciones();
  }, [cargarExcepciones]);

    useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 12000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);

  useEffect(() => {
    const manejarDatosActualizados = () => {
      void Promise.all([recargarEquipos(), cargarExcepciones()]);
    };

    window.addEventListener(
      "coreinventory:datos-actualizados",
      manejarDatosActualizados
    );

    return () => {
      window.removeEventListener(
        "coreinventory:datos-actualizados",
        manejarDatosActualizados
      );
    };
  }, [cargarExcepciones, recargarEquipos]);

  const excepcionesActivas = useMemo(
    () => excepciones.filter((exception) => exception.active),
    [excepciones]
  );

  const ignoredAlertKeys = useMemo(
    () =>
      new Set(
        excepcionesActivas
          .map((exception) => exception.alertKey)
          .filter(Boolean)
      ),
    [excepcionesActivas]
  );

  const reporte = useMemo(() => {
    return evaluateDataQuality(equipos, ignoredAlertKeys);
  }, [equipos, ignoredAlertKeys]);

  const sucursalesDisponibles = useMemo(
    () =>
      reporte.sucursales
        .map((sucursal) => sucursal.sucursal)
        .filter((sucursal) => sucursal && sucursal !== "Sin sucursal")
        .sort((a, b) => a.localeCompare(b, "es")),
    [reporte.sucursales]
  );

  const sucursalResumen = useMemo(() => {
    if (sucursalFiltro === "todas") {
      return null;
    }

    return (
      reporte.sucursales.find(
        (sucursal) => sucursal.sucursal === sucursalFiltro
      ) ?? null
    );
  }, [reporte.sucursales, sucursalFiltro]);

  const alertasFiltradas = useMemo(() => {
    if (sucursalFiltro === "todas") {
      return reporte.alertas;
    }

    return reporte.alertas.filter(
      (alerta) => alerta.sucursal === sucursalFiltro
    );
  }, [reporte.alertas, sucursalFiltro]);

  const alertasUnicas = useMemo(() => {
    const alertMap = new Map<string, DataQualityAlert>();

    alertasFiltradas.forEach((alerta) => {
      const key = alerta.alertKey || alerta.id;

      if (!alertMap.has(key)) {
        alertMap.set(key, alerta);
      }
    });

    return Array.from(alertMap.values());
  }, [alertasFiltradas]);

  useEffect(() => {
  setMostrarTodasAlertas(false);
  setMostrarTodoHistorial(false);
}, [sucursalFiltro]);

  const alertasVisibles = mostrarTodasAlertas
    ? alertasUnicas 
    : alertasUnicas.slice(0, 10);

  const hayMasAlertas = alertasUnicas.length > 10;
  const alertasRestantes = Math.max(alertasUnicas.length - 10, 0);

  const equiposPorSucursalId = useMemo(() => {
    const branchMap = new Map<string, string>();

    equipos.forEach((equipo) => {
      if (equipo.sucursalId && equipo.sucursal) {
        branchMap.set(equipo.sucursalId, equipo.sucursal);
      }
    });

    return branchMap;
  }, [equipos]);

  const getExceptionBranchName = useCallback(
    (exception: DataQualityException) => {
      if (exception.scope === "global") {
        return "Global";
      }

      return (
        exception.branchName ||
        (exception.branchId
          ? equiposPorSucursalId.get(exception.branchId)
          : undefined) ||
        "Sin sucursal"
      );
    },
    [equiposPorSucursalId]
  );

  const excepcionesFiltradas = useMemo(() => {
    if (sucursalFiltro === "todas") {
      return excepciones;
    }

    return excepciones.filter((exception) => {
      if (exception.scope === "global") {
        return true;
      }

      return getExceptionBranchName(exception) === sucursalFiltro;
    });
  }, [excepciones, getExceptionBranchName, sucursalFiltro]);

  const historialOrdenado = useMemo(() => {
  return [...excepcionesFiltradas].sort((a, b) => {
    const fechaA = new Date(
      a.reactivatedAt ??
        a.ignoredAt ??
        a.modifiedOn ??
        a.createdOn ??
        0
    ).getTime();

    const fechaB = new Date(
      b.reactivatedAt ??
        b.ignoredAt ??
        b.modifiedOn ??
        b.createdOn ??
        0
    ).getTime();

    return fechaB - fechaA;
  });
}, [excepcionesFiltradas]);

const historialVisible = mostrarTodoHistorial
  ? historialOrdenado
  : historialOrdenado.slice(0, 10);

const hayMasHistorial = historialOrdenado.length > 10;

const historialRestante = Math.max(
  historialOrdenado.length - 10,
  0
);

  const excepcionesActivasFiltradas = useMemo(
    () => excepcionesFiltradas.filter((exception) => exception.active),
    [excepcionesFiltradas]
  );

  const resumenVisible = useMemo(() => {
    return {
      duplicados: alertasUnicas.filter(
        (alerta) => alerta.category === "duplicate"
      ).length,
      datosFaltantes: alertasUnicas.filter(
        (alerta) => alerta.category === "missing"
      ).length,
      datosSospechosos: alertasUnicas.filter(
        (alerta) => alerta.category === "suspicious"
      ).length,
      alertasCriticas: alertasUnicas.filter(
        (alerta) => alerta.severity === "critical"
      ).length,
    };
  }, [alertasUnicas]);

  const scoreVisible =
    sucursalResumen?.score ?? reporte.overallScore;

  const statusVisible =
    sucursalResumen?.statusLabel ?? reporte.statusLabel;

  const diagnosticoVisible = sucursalResumen
    ? sucursalResumen.totalAlertas === 0
      ? `No se detectaron alertas activas para ${sucursalResumen.sucursal}.`
      : `${sucursalResumen.sucursal} tiene ${alertasUnicas.length} incidencia(s) activa(s) después de considerar las excepciones guardadas.`
    : reporte.diagnostico;

  const gaugeStyle = {
    "--needle-angle": `${scoreVisible * 1.8 - 90}deg`,
  } as CSSProperties;

  async function actualizarAnalisis() {
    setFeedback(null);

    await Promise.all([recargarEquipos(), cargarExcepciones()]);
  }

  function abrirModalIgnorar(alerta: DataQualityAlert) {
    setFeedback(null);
    setMotivoIgnorado("");
    setAlertaParaIgnorar(alerta);
  }

  function cerrarModalIgnorar() {
    if (isSavingException) return;

    setAlertaParaIgnorar(null);
    setMotivoIgnorado("");
  }

  async function confirmarIgnorarAlerta() {
    if (!alertaParaIgnorar) return;

    try {
      setIsSavingException(true);
      setFeedback(null);

      await dataQualityExceptionsService.ignoreIssue({
        name: buildExceptionName(alertaParaIgnorar),
        alertKey: alertaParaIgnorar.alertKey,
        scope: alertaParaIgnorar.scope,
        branchId:
          alertaParaIgnorar.scope === "sucursal"
            ? alertaParaIgnorar.sucursalId
            : undefined,
        problemType: alertaParaIgnorar.problemType,
        field: alertaParaIgnorar.field,
        detectedValue: alertaParaIgnorar.detectedValue,
        affectedEquipment:
          alertaParaIgnorar.affectedEquipmentHostnames?.join(" | ") ||
          alertaParaIgnorar.hostname,
        reason: motivoIgnorado.trim() || "Validado por el equipo de TI.",
      });

      await cargarExcepciones();

      setFeedback({
        type: "success",
        text: "La alerta fue ignorada y quedó registrada.",
        
      });

      setAlertaParaIgnorar(null);
      setMotivoIgnorado("");
    } catch (saveError) {
      console.error("Error ignorando alerta:", saveError);

      setFeedback({
        type: "error",
        text: "No se pudo guardar la excepción. Revisa la conexión e inténtalo nuevamente.",
      });
    } finally {
      setIsSavingException(false);
    }
  }

  async function noIgnorarAlerta(exceptionId: string) {
    try {
      setReactivatingExceptionId(exceptionId);
      setFeedback(null);

      await dataQualityExceptionsService.reactivateIssue(exceptionId);
      await cargarExcepciones();

      setFeedback({
        type: "success",
        text: "La alerta volvió al análisis activo de Calidad de Datos.",
      });
    } catch (reactivateError) {
      console.error("Error reactivando alerta:", reactivateError);

      setFeedback({
        type: "error",
        text: "No se pudo reactivar la alerta. Inténtalo nuevamente.",
      });
    } finally {
      setReactivatingExceptionId(null);
    }
  }

  if (isLoading || isLoadingExceptions) {
    return (
      <main className="data-quality-page">
        <section className="data-quality-empty">
          <div className="data-quality-empty-icon"></div>
          <h2>Cargando calidad de datos</h2>
          <p>
            Estamos analizando el inventario y consultando las excepciones
            guardadas.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="data-quality-page">
        <section className="data-quality-empty data-quality-empty-error">
          <div className="data-quality-empty-icon"></div>
          <h2>No se pudo analizar la calidad de datos</h2>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="data-quality-page">
      <section className="data-quality-hero">
        <div>
          <p className="data-quality-eyebrow">Centro de diagnóstico</p>
          <h1>Calidad de Datos</h1>
          <p>
            Analiza la confiabilidad del inventario por sucursal, detecta
            incidencias y administra excepciones validadas por el equipo de TI.
          </p>
        </div>

        <button
          type="button"
          className="data-quality-refresh"
          onClick={() => void actualizarAnalisis()}
        >
          Actualizar análisis
        </button>
      </section>

      <section className="data-quality-filter-card">
        <div>
          <span className="data-quality-filter-label">
            Alcance del análisis
          </span>
          <strong>
            {sucursalFiltro === "todas"
              ? "Todas las sucursales"
              : sucursalFiltro}
          </strong>
          <p>
            Los duplicados de IP, hostname y AnyDesk se comparan dentro de la
            misma sucursal. El número de serie se valida globalmente.
          </p>
        </div>

        <label className="data-quality-filter-control">
          <span>Filtrar por sucursal</span>
          <select
            value={sucursalFiltro}
            onChange={(event) => {
              setSucursalFiltro(event.target.value);
              setSucursalSeleccionada(null);
            }}
          >
            <option value="todas">Todas las sucursales</option>
            {sucursalesDisponibles.map((sucursal) => (
              <option key={sucursal} value={sucursal}>
                {sucursal}
              </option>
            ))}
          </select>
        </label>
      </section>

      {feedback && (
        <div
          className={`data-quality-feedback data-quality-feedback-${feedback.type}`}
          role="status"
        >
          {feedback.text}
        </div>
      )}

      {exceptionError && (
        <div className="data-quality-feedback data-quality-feedback-error">
          {exceptionError}
        </div>
      )}

      <section className="data-quality-main-grid">
        <article className="data-quality-gauge-card">
          <div className="data-quality-gauge" style={gaugeStyle}>
            <div className="data-quality-gauge-shell">
              <div className="data-quality-gauge-arc"></div>
              <div className="data-quality-gauge-inner"></div>
              <div className="data-quality-gauge-needle"></div>
              <div className="data-quality-gauge-center"></div>
            </div>

            <div className="data-quality-gauge-value">
              <strong>{scoreVisible}%</strong>
              <span>{statusVisible}</span>
            </div>
          </div>

          <div className="data-quality-gauge-copy">
            <h2>
              {sucursalFiltro === "todas"
                ? "Salud general de datos"
                : `Salud de datos · ${sucursalFiltro}`}
            </h2>
            <p>{diagnosticoVisible}</p>
          </div>
        </article>

        <article className="data-quality-summary-panel">
          <div className="data-quality-summary-heading">
            <div>
              <h2>Resumen de incidencias</h2>
              <p>Conteo de alertas únicas dentro del alcance seleccionado.</p>
            </div>

            <span className="data-quality-ignored-counter">
              {excepcionesActivasFiltradas.length} ignorada(s)
            </span>
          </div>

          <div className="data-quality-summary-list">
            <div>
              <span>Duplicados</span>
              <strong>{resumenVisible.duplicados}</strong>
            </div>

            <div>
              <span>Datos faltantes</span>
              <strong>{resumenVisible.datosFaltantes}</strong>
            </div>

            <div>
              <span>Datos sospechosos</span>
              <strong>{resumenVisible.datosSospechosos}</strong>
            </div>

            <div>
              <span>Alertas críticas</span>
              <strong>{resumenVisible.alertasCriticas}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="data-quality-branches-card">
        <div className="data-quality-section-header">
          <div>
            <h2>Calidad por sucursal</h2>
            <p>
              Sucursales ordenadas de mayor a menor calidad. El detalle ya
              considera las excepciones activas guardadas en Dataverse.
            </p>
          </div>
        </div>

        <div className="data-quality-branch-list">
          {reporte.sucursales.map((sucursal, index) => {
            const barStyle = {
              "--branch-score": `${sucursal.score}%`,
            } as CSSProperties;

            const isCurrentBranch =
              sucursalFiltro !== "todas" &&
              sucursalFiltro === sucursal.sucursal;

            return (
              <button
                type="button"
                key={sucursal.sucursal}
                className={`data-quality-branch-row ${
                  isCurrentBranch ? "data-quality-branch-row-active" : ""
                }`}
                onClick={() => setSucursalSeleccionada(sucursal)}
              >
                <div className="data-quality-branch-rank">#{index + 1}</div>

                <div className="data-quality-branch-main">
                  <div className="data-quality-branch-title">
                    <strong>{sucursal.sucursal}</strong>
                    <span>{sucursal.statusLabel}</span>
                  </div>

                  <div className="data-quality-branch-bar" style={barStyle}>
                    <span></span>
                  </div>
                </div>

                <div className="data-quality-branch-metrics">
                  <span>{sucursal.totalEquipos} equipos</span>
                  <span>{sucursal.totalAlertas} alertas</span>
                  <strong>{sucursal.score}%</strong>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="data-quality-alerts-card">
        <div className="data-quality-section-header">
          <div>
            <h2>Alertas activas</h2>
            <p>
              Incidencias únicas que requieren revisión dentro del alcance
              seleccionado.
            </p>
          </div>

          <span className="data-quality-section-count">
            {alertasUnicas.length} incidencia(s)
          </span>
        </div>

{alertasUnicas.length === 0 ? (
  <div className="data-quality-empty-inline">
    No se detectaron alertas activas con las reglas actuales.
  </div>
) : (
  <>
    <div className="data-quality-table-wrapper">
      <table className="data-quality-table">
        <thead>
          <tr>
            <th>Equipo(s)</th>
            <th>Sucursal</th>
            <th>Categoría</th>
            <th>Alerta</th>
            <th>Severidad</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {alertasVisibles.map((alerta) => (
            <tr key={alerta.alertKey || alerta.id}>
              <td>
                <strong>{getAffectedEquipmentLabel(alerta)}</strong>
              </td>

              <td>{alerta.sucursal}</td>

              <td>{getCategoryLabel(alerta.category)}</td>

              <td>
                <strong>{alerta.title}</strong>

                <span className="data-quality-table-description">
                  {alerta.description}
                </span>
              </td>

              <td>
                <span
                  className={`data-quality-severity data-quality-severity-${alerta.severity}`}
                >
                  {getSeverityLabel(alerta.severity)}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="data-quality-ignore-button"
                  onClick={() => abrirModalIgnorar(alerta)}
                >
                  Ignorar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {hayMasAlertas && (
      <div className="data-quality-expand-row">
        <button
          type="button"
          className="data-quality-expand-button"
          onClick={() =>
            setMostrarTodasAlertas((valorActual) => !valorActual)
          }
        >
          {mostrarTodasAlertas
            ? "Mostrar solo 10 alertas"
            : `Ver ${alertasRestantes} alerta(s) adicional(es)`}
        </button>
      </div>
    )}
  </>
)}
      </section>

      <section className="data-quality-history-card">
        <div className="data-quality-section-header">
          <div>
            <h2>Historial de excepciones</h2>
            <p>
              Alertas que fueron ignoradas o reactivadas. Los registros se
              conservan para mantener trazabilidad.
            </p>
          </div>

          <span className="data-quality-section-count">
            {historialOrdenado.length} registro(s)
          </span>
        </div>

        {historialOrdenado.length === 0 ? (
  <div className="data-quality-empty-inline">
    Todavía no existen excepciones para este alcance.
  </div>
) : (
  <>
    <div className="data-quality-history-list">
      {historialVisible.map((exception) => (
        <article
          key={exception.id}
          className={`data-quality-history-item ${
            exception.active
              ? "data-quality-history-item-active"
              : "data-quality-history-item-reactivated"
          }`}
        >
          <div className="data-quality-history-main">
            <div className="data-quality-history-title">
              <strong>{exception.name}</strong>

              <span
                className={`data-quality-history-status ${
                  exception.active
                    ? "data-quality-history-status-active"
                    : "data-quality-history-status-reactivated"
                }`}
              >
                {exception.active ? "Ignorada" : "Reactivada"}
              </span>
            </div>

            <div className="data-quality-history-meta">
              <span>{getExceptionBranchName(exception)}</span>

              <span>
                {exception.detectedValue || "Sin valor registrado"}
              </span>

              <span>
                {formatDate(
                  exception.active
                    ? exception.ignoredAt
                    : exception.reactivatedAt
                )}
              </span>
            </div>

            <p>
              {exception.reason ||
                "Sin motivo documentado para esta excepción."}
            </p>
          </div>

          {exception.active && (
            <button
              type="button"
              className="data-quality-reactivate-button"
              onClick={() => void noIgnorarAlerta(exception.id)}
              disabled={reactivatingExceptionId === exception.id}
            >
              {reactivatingExceptionId === exception.id
                ? "Reactivando..."
                : "No ignorar"}
            </button>
          )}
        </article>
      ))}
    </div>

    {hayMasHistorial && (
      <div className="data-quality-expand-row">
        <button
          type="button"
          className="data-quality-expand-button"
          onClick={() =>
            setMostrarTodoHistorial((valorActual) => !valorActual)
          }
        >
          {mostrarTodoHistorial
            ? "Mostrar solo 10 registros"
            : `Ver ${historialRestante} registro(s) adicional(es)`}
        </button>
      </div>
    )}
  </>
)}
      </section>

      {sucursalSeleccionada && (
        <div
          className="data-quality-modal-backdrop"
          onClick={() => setSucursalSeleccionada(null)}
        >
          <section
            className="data-quality-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="data-quality-modal-header">
              <div>
                <p>Detalle de sucursal</p>
                <h2>{sucursalSeleccionada.sucursal}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSucursalSeleccionada(null)}
                aria-label="Cerrar detalle"
              >
                ×
              </button>
            </header>

            <div className="data-quality-modal-score">
              <strong>{sucursalSeleccionada.score}%</strong>
              <span>{sucursalSeleccionada.statusLabel}</span>
            </div>

            <div className="data-quality-modal-grid">
              <article>
                <span>Total equipos</span>
                <strong>{sucursalSeleccionada.totalEquipos}</strong>
              </article>

              <article>
                <span>Total alertas</span>
                <strong>{sucursalSeleccionada.totalAlertas}</strong>
              </article>

              <article>
                <span>Duplicados</span>
                <strong>{sucursalSeleccionada.duplicados}</strong>
              </article>

              <article>
                <span>Datos faltantes</span>
                <strong>{sucursalSeleccionada.datosFaltantes}</strong>
              </article>

              <article>
                <span>Datos sospechosos</span>
                <strong>{sucursalSeleccionada.datosSospechosos}</strong>
              </article>

              <article>
                <span>Alertas críticas</span>
                <strong>{sucursalSeleccionada.alertasCriticas}</strong>
              </article>
            </div>

            <div className="data-quality-modal-alerts">
              <h3>Alertas detectadas</h3>

              {sucursalSeleccionada.alertasDetalle.length === 0 ? (
                <p>No se detectaron alertas para esta sucursal.</p>
              ) : (
                sucursalSeleccionada.alertasDetalle
                  .slice(0, 8)
                  .map((alerta) => (
                    <article
                      key={alerta.id}
                      className="data-quality-modal-alert"
                    >
                      <div>
                        <strong>{alerta.hostname}</strong>
                        <span>{getCategoryLabel(alerta.category)}</span>
                      </div>

                      <p>
                        <strong>{alerta.title}:</strong>{" "}
                        {alerta.recommendation}
                      </p>
                    </article>
                  ))
              )}
            </div>
          </section>
        </div>
      )}

      {alertaParaIgnorar && (
        <div
          className="data-quality-modal-backdrop"
          onClick={cerrarModalIgnorar}
        >
          <section
            className="data-quality-ignore-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ignore-data-quality-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="data-quality-modal-header">
              <div>
                <p>Excepción de calidad</p>
                <h2 id="ignore-data-quality-title">Ignorar alerta</h2>
              </div>

              <button
                type="button"
                onClick={cerrarModalIgnorar}
                aria-label="Cerrar modal"
                disabled={isSavingException}
              >
                ×
              </button>
            </header>

            <div className="data-quality-ignore-summary">
              <strong>{alertaParaIgnorar.title}</strong>
              <span>
                {alertaParaIgnorar.sucursal} ·{" "}
                {getAffectedEquipmentLabel(alertaParaIgnorar)}
              </span>
              <p>{alertaParaIgnorar.description}</p>
            </div>

            <label className="data-quality-reason-field">
              <span>Motivo de la excepción</span>
              <textarea
                value={motivoIgnorado}
                onChange={(event) => setMotivoIgnorado(event.target.value)}
                placeholder="Ejemplo: Duplicado validado por TI; corresponde a una configuración autorizada."
                rows={4}
                disabled={isSavingException}
              />
              <small>
                El motivo quedará registrado en Dataverse para todos los
                usuarios.
              </small>
            </label>

            <div className="data-quality-modal-actions">
              <button
                type="button"
                className="data-quality-secondary-button"
                onClick={cerrarModalIgnorar}
                disabled={isSavingException}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="data-quality-primary-button"
                onClick={() => void confirmarIgnorarAlerta()}
                disabled={isSavingException}
              >
                {isSavingException
                  ? "Guardando excepción..."
                  : "Confirmar e ignorar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default DataQualityPage;
