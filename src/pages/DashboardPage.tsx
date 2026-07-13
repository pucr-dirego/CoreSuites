import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEquipos } from "../hooks/useEquipos";
import { useDashboardStats } from "../hooks/useDashboardStats";
import "../styles/DashboardPage.css";

const COLORES_ESTADO: Record<string, string> = {
  Excelente: "var(--app-primary)",
  Bueno: "#22c55e",
  Regular: "var(--app-warning)",
  Malo: "#ef4444",
  Disfuncional: "var(--app-danger)",
};

const TOOLTIP_CONTENT_STYLE: CSSProperties = {
  background: "var(--app-surface)",
  border: "1px solid var(--app-border)",
  borderRadius: "14px",
  color: "var(--app-text)",
  boxShadow: "var(--app-shadow)",
};

const TOOLTIP_LABEL_STYLE: CSSProperties = {
  color: "var(--app-text)",
  fontWeight: 800,
};

const TOOLTIP_ITEM_STYLE: CSSProperties = {
  color: "var(--app-text-muted)",
  fontWeight: 700,
};

type AnalisisDashboard = "total" | "activos" | "criticos" | "regulares";

function DashboardPage() {
  const [analisisActivo, setAnalisisActivo] =
    useState<AnalisisDashboard | null>(null);

  const { equipos, isLoading, error, recargarEquipos } = useEquipos();
  const stats = useDashboardStats(equipos);

  useEffect(() => {
    const manejarDatosActualizados = () => {
      void recargarEquipos();
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
  }, [recargarEquipos]);

  const equiposCriticosRecientes = useMemo(() => {
    return [...equipos]
      .filter(
        (equipo) =>
          equipo.activo &&
          (equipo.estadoFuncionamiento === "Malo" ||
            equipo.estadoFuncionamiento === "Disfuncional")
      )
      .sort((a, b) => {
        const fechaA = new Date(a.modifiedon ?? a.createdon ?? 0).getTime();
        const fechaB = new Date(b.modifiedon ?? b.createdon ?? 0).getTime();

        return fechaB - fechaA;
      })
      .slice(0, 10);
  }, [equipos]);

  const analisisSeleccionado = useMemo(() => {
    if (!analisisActivo) {
      return null;
    }

    if (analisisActivo === "activos") {
      return {
        titulo: "Equipos activos por sucursal",
        descripcion:
          "Distribución de equipos activos para identificar dónde se concentra la operación actual.",
        total: stats.totalActivos,
        etiquetaTotal: "equipos activos",
        color: "var(--app-primary)",
        data: stats.activosPorSucursal,
      };
    }

    if (analisisActivo === "criticos") {
      return {
        titulo: "Equipos críticos por sucursal",
        descripcion:
          "Sucursales con mayor cantidad de equipos en estado Malo o Disfuncional. Esta vista ayuda a priorizar atención técnica.",
        total: stats.totalCriticos,
        etiquetaTotal: "equipos críticos",
        color: "var(--app-danger)",
        data: stats.criticosPorSucursal,
      };
    }

    if (analisisActivo === "regulares") {
      return {
        titulo: "Equipos regulares por sucursal",
        descripcion:
          "Equipos que conviene revisar preventivamente antes de que se vuelvan críticos.",
        total: stats.totalRegulares,
        etiquetaTotal: "equipos regulares",
        color: "var(--app-warning)",
        data: stats.regularesPorSucursal,
      };
    }

    return {
      titulo: "Total de equipos por sucursal",
      descripcion:
        "Distribución general del inventario para identificar las sucursales con mayor carga de activos.",
      total: stats.totalEquipos,
      etiquetaTotal: "equipos registrados",
      color: "var(--app-primary)",
      data: stats.equiposPorSucursal,
    };
  }, [analisisActivo, stats]);

  useEffect(() => {
    if (!analisisActivo) {
      return;
    }

    const scrollOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function cerrarConEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAnalisisActivo(null);
      }
    }

    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = scrollOriginal;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [analisisActivo]);

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">Dashboard TI</p>
          <h1>Cargando indicadores...</h1>
          <p>Estamos consultando la información del inventario.</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">Dashboard TI</p>
          <h1>No se pudo cargar el dashboard</h1>
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-eyebrow">Dashboard TI</p>
          <h1>Visibilidad operativa del inventario</h1>
          <p>
            Resumen ejecutivo del estado actual de equipos, sucursales,
            condiciones operativas y activos que requieren seguimiento.
          </p>
        </div>
      </section>

      <section className="dashboard-summary-card">
        <div>
          <span>Resumen operativo</span>
          <h2>Estado general del inventario TI</h2>
          <p>
            El inventario cuenta con <strong>{stats.totalEquipos}</strong>{" "}
            equipos registrados. Hay{" "}
            <strong className="summary-critical">{stats.totalCriticos}</strong>{" "}
            equipos críticos que requieren atención inmediata y{" "}
            <strong className="summary-regular">{stats.totalRegulares}</strong>{" "}
            equipos en estado regular que conviene revisar de forma preventiva.
            También se registran <strong>{stats.totalInactivos}</strong> equipos
            inactivos.
          </p>
        </div>
      </section>

      <section className="dashboard-kpi-grid">
        <button
          type="button"
          className="dashboard-kpi-card dashboard-kpi-button"
          onClick={() => setAnalisisActivo("total")}
        >
          <span>Total de equipos</span>
          <strong>{stats.totalEquipos}</strong>
          <p>Click para desplegar gráfica.</p>
        </button>

        <button
          type="button"
          className="dashboard-kpi-card dashboard-kpi-button dashboard-kpi-card-success"
          onClick={() => setAnalisisActivo("activos")}
        >
          <span>Equipos activos</span>
          <strong>{stats.totalActivos}</strong>
          <p>Click para desplegar gráfica.</p>
        </button>

        <button
          type="button"
          className="dashboard-kpi-card dashboard-kpi-button dashboard-kpi-card-warning"
          onClick={() => setAnalisisActivo("criticos")}
        >
          <span>Equipos críticos</span>
          <strong>{stats.totalCriticos}</strong>
          <p>Click para desplegar gráfica.</p>
        </button>

        <button
          type="button"
          className="dashboard-kpi-card dashboard-kpi-button dashboard-kpi-card-regular"
          onClick={() => setAnalisisActivo("regulares")}
        >
          <span>Equipos regulares</span>
          <strong>{stats.totalRegulares}</strong>
          <p>Click para desplegar gráfica.</p>
        </button>
      </section>

      <section className="dashboard-main-chart">
        <article className="dashboard-chart-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Estado de funcionamiento</h2>
              <p>Distribución general por condición operativa.</p>
            </div>
          </div>

          <div className="dashboard-chart-body dashboard-chart-body-main">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.equiposPorEstado}
                margin={{ top: 8, right: 12, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="var(--app-border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "var(--app-surface-soft)" }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {stats.equiposPorEstado.map((item) => (
                    <Cell
                      key={item.name}
                      fill={COLORES_ESTADO[item.name] ?? "var(--app-primary)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-secondary-grid">
        <article className="dashboard-chart-card dashboard-chart-card-compact">
          <div className="dashboard-card-header">
            <div>
              <h2>Equipos por sucursal</h2>
              <p>Top 7 con mayor carga de equipos.</p>
            </div>
          </div>

          <div className="dashboard-chart-body dashboard-chart-body-compact">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.equiposPorSucursal}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 26, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="var(--app-border)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={105}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "var(--app-surface-soft)" }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--app-primary)"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-chart-card dashboard-chart-card-compact">
          <div className="dashboard-card-header">
            <div>
              <h2>Críticos por sucursal</h2>
              <p>Sucursales con más equipos en riesgo.</p>
            </div>
          </div>

          <div className="dashboard-chart-body dashboard-chart-body-compact">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.criticosPorSucursal}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 26, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="var(--app-border)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={105}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "var(--app-surface-soft)" }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--app-danger)"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-chart-card dashboard-chart-card-compact">
          <div className="dashboard-card-header">
            <div>
              <h2>Tipo de equipo</h2>
              <p>Distribución por categoría tecnológica.</p>
            </div>
          </div>

          <div className="dashboard-chart-body dashboard-chart-body-compact">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.equiposPorTipo}
                layout="vertical"
                margin={{ top: 4, right: 8, left: 26, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="var(--app-border)"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={TOOLTIP_CONTENT_STYLE}
                  labelStyle={TOOLTIP_LABEL_STYLE}
                  itemStyle={TOOLTIP_ITEM_STYLE}
                  cursor={{ fill: "var(--app-surface-soft)" }}
                />
                <Bar
                  dataKey="value"
                  fill="var(--app-primary)"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="dashboard-table-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Top 10 equipos críticos recientes</h2>
            <p>
              Máximo 10 equipos activos en estado Malo o Disfuncional, ordenados
              por actividad reciente.
            </p>
          </div>
        </div>

        {equiposCriticosRecientes.length === 0 ? (
          <p className="dashboard-empty-state">
            No hay equipos críticos registrados actualmente.
          </p>
        ) : (
          <div className="dashboard-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Hostname</th>
                  <th>Sucursal</th>
                  <th>Ubicación</th>
                  <th>Departamento</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {equiposCriticosRecientes.map((equipo) => (
                  <tr key={equipo.id}>
                    <td>{equipo.hostname}</td>
                    <td>{equipo.sucursal}</td>
                    <td>{equipo.ubicacion}</td>
                    <td>{equipo.departamento}</td>
                    <td>{equipo.responsable}</td>
                    <td>
                      <span className="dashboard-status-critical">
                        {equipo.estadoFuncionamiento}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {analisisSeleccionado && (
        <div
          className="dashboard-modal-overlay"
          role="presentation"
          onClick={() => setAnalisisActivo(null)}
        >
          <section
            className="dashboard-analysis-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-analysis-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="dashboard-modal-close"
              onClick={() => setAnalisisActivo(null)}
              aria-label="Cerrar análisis"
            >
              ×
            </button>

            <div className="dashboard-analysis-modal-header">
              <div>
                <span>Análisis del KPI</span>
                <h2 id="dashboard-analysis-title">
                  {analisisSeleccionado.titulo}
                </h2>
                <p>{analisisSeleccionado.descripcion}</p>
              </div>

              <div className="dashboard-analysis-modal-total">
                <strong>{analisisSeleccionado.total}</strong>
                <small>{analisisSeleccionado.etiquetaTotal}</small>
              </div>
            </div>

            <div className="dashboard-analysis-modal-chart">
              {analisisSeleccionado.data.length === 0 ? (
                <p className="dashboard-empty-state">
                  No hay datos suficientes para mostrar este análisis.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analisisSeleccionado.data}
                    layout="vertical"
                    margin={{ top: 8, right: 18, left: 34, bottom: 8 }}
                  >
                    <CartesianGrid
                      stroke="var(--app-border)"
                      strokeDasharray="3 3"
                      horizontal={false}
                    />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "var(--app-text-muted)", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_CONTENT_STYLE}
                      labelStyle={TOOLTIP_LABEL_STYLE}
                      itemStyle={TOOLTIP_ITEM_STYLE}
                      cursor={{ fill: "var(--app-surface-soft)" }}
                    />
                    <Bar
                      dataKey="value"
                      fill={analisisSeleccionado.color}
                      radius={[0, 9, 9, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default DashboardPage;