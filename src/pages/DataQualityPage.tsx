import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useEquipos } from "../hooks/useEquipos";
import {
  evaluateDataQuality,
  type BranchQualitySummary,
} from "../services/dataQualityService";
import "../styles/DataQualityPage.css";

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

function DataQualityPage() {
  const { equipos, isLoading, error, recargarEquipos } = useEquipos();
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<BranchQualitySummary | null>(null);

  const reporte = useMemo(() => {
    return evaluateDataQuality(equipos);
  }, [equipos]);

  const gaugeStyle = {
    "--needle-angle": `${reporte.overallScore * 1.8 - 90}deg`,
  } as CSSProperties;

  if (isLoading) {
    return (
      <main className="data-quality-page">
        <section className="data-quality-empty">
          <div className="data-quality-empty-icon"></div>
          <h2>Cargando calidad de datos</h2>
          <p>Estamos analizando los registros del inventario.</p>
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
            Analiza la confiabilidad del inventario detectando duplicados,
            datos faltantes y valores sospechosos dentro de los registros.
          </p>
        </div>

        <button
          type="button"
          className="data-quality-refresh"
          onClick={recargarEquipos}
        >
          Actualizar análisis
        </button>
      </section>

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
              <strong>{reporte.overallScore}%</strong>
              <span>{reporte.statusLabel}</span>
            </div>
          </div>

          <div className="data-quality-gauge-copy">
            <h2>Salud general de datos</h2>
            <p>{reporte.diagnostico}</p>
          </div>
        </article>

        <article className="data-quality-summary-panel">
          <h2>Resumen de alertas</h2>

          <div className="data-quality-summary-list">
            <div>
              <span>Duplicados</span>
              <strong>{reporte.resumen.duplicados}</strong>
            </div>

            <div>
              <span>Datos faltantes</span>
              <strong>{reporte.resumen.datosFaltantes}</strong>
            </div>

            <div>
              <span>Datos sospechosos</span>
              <strong>{reporte.resumen.datosSospechosos}</strong>
            </div>

            <div>
              <span>Alertas críticas</span>
              <strong>{reporte.resumen.alertasCriticas}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="data-quality-branches-card">
        <div className="data-quality-section-header">
          <div>
            <h2>Calidad por sucursal</h2>
            <p>
              Sucursales ordenadas de mayor a menor calidad de datos. Da click
              en una sucursal para revisar su diagnóstico.
            </p>
          </div>
        </div>

        <div className="data-quality-branch-list">
          {reporte.sucursales.map((sucursal, index) => {
            const barStyle = {
              "--branch-score": `${sucursal.score}%`,
            } as CSSProperties;

            return (
              <button
                type="button"
                key={sucursal.sucursal}
                className="data-quality-branch-row"
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
            <h2>Alertas principales de calidad</h2>
            <p>
              Primeros registros que requieren revisión por duplicados, datos
              faltantes o valores sospechosos.
            </p>
          </div>
        </div>

        {reporte.alertas.length === 0 ? (
          <div className="data-quality-empty-inline">
            No se detectaron alertas con las reglas actuales.
          </div>
        ) : (
          <div className="data-quality-table-wrapper">
            <table className="data-quality-table">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Sucursal</th>
                  <th>Departamento</th>
                  <th>Categoría</th>
                  <th>Alerta</th>
                  <th>Severidad</th>
                </tr>
              </thead>

              <tbody>
                {reporte.alertas.slice(0, 12).map((alerta) => (
                  <tr key={alerta.id}>
                    <td>
                      <strong>{alerta.hostname}</strong>
                    </td>
                    <td>{alerta.sucursal}</td>
                    <td>{alerta.departamento}</td>
                    <td>{getCategoryLabel(alerta.category)}</td>
                    <td>{alerta.title}</td>
                    <td>
                      <span
                        className={`data-quality-severity data-quality-severity-${alerta.severity}`}
                      >
                        {getSeverityLabel(alerta.severity)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </main>
  );
}

export default DataQualityPage;