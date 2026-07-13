import type { SupplierAlert } from "../../../interfaces/supplierDirectory";

interface SupplierAlertsPanelProps {
  alerts: SupplierAlert[];
}

export function SupplierAlertsPanel({ alerts }: SupplierAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <section className="supplier-detail-section supplier-alerts-clean">
        <h4>Alertas</h4>
        <p>Este proveedor no tiene alertas visibles de datos u operación.</p>
      </section>
    );
  }

  return (
    <section className="supplier-detail-section">
      <div className="supplier-section-heading">
        <div>
          <h4>Alertas</h4>
          <p>Validaciones rápidas sobre datos incompletos o posibles riesgos.</p>
        </div>
        <span className="supplier-section-count">{alerts.length}</span>
      </div>

      <div className="supplier-alerts-list">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`supplier-alert-card supplier-alert-${alert.severity}`}
          >
            <strong>{alert.title}</strong>
            <p>{alert.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}