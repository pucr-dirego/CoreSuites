import "../../styles/OperationalCoverage.css";

type FloatingCoverageCard = {
  id: "mexico" | "colombia";
  title: string;
  label: string;
  metric: string;
  icon: string;
  cardClass: string;
};

type CoverageSummaryCard = {
  id: "mexico" | "colombia" | "consolidated";
  title: string;
  metric: string;
  description: string;
};

const TOTAL_LOCATIONS = 30;

const floatingCoverageData: FloatingCoverageCard[] = [
  {
    id: "mexico",
    title: "México",
    label: "Operación principal",
    metric: "28 ubicaciones",
    icon: "MX",
    cardClass: "coverage-card-mexico",
  },
  {
    id: "colombia",
    title: "Colombia",
    label: "Cobertura internacional",
    metric: "2 ubicaciones",
    icon: "CO",
    cardClass: "coverage-card-colombia",
  },
];

const coverageSummaryData: CoverageSummaryCard[] = [
  {
    id: "mexico",
    title: "México",
    metric: "28 ubicaciones",
    description:
      "Sucursales y puntos operativos monitoreados dentro de la cobertura nacional.",
  },
  {
    id: "colombia",
    title: "Colombia",
    metric: "2 ubicaciones",
    description: "Presencia internacional activa en Barranquilla y Cali.",
  },
  {
    id: "consolidated",
    title: "Cobertura consolidada",
    metric: "30 ubicaciones",
    description: "2 países integrados al monitoreo operativo de TI.",
  },
];

function OperationalCoverage() {
  return (
    <section className="operational-coverage">
      <div className="coverage-header">
        <div>
          <p className="coverage-eyebrow">Cobertura regional</p>
          <h2>Cobertura Operativa TI</h2>
          <p>
            Vista general de ubicaciones monitoreadas por CoreInventory en
            México y Colombia.
          </p>
        </div>

        <div className="coverage-global-summary">
          <strong>{TOTAL_LOCATIONS}</strong>
          <span>ubicaciones monitoreadas</span>
        </div>
      </div>

      <div className="coverage-map-panel">
        <div className="coverage-map-layer" aria-hidden="true">
          <div className="coverage-continent coverage-north-america"></div>
          <div className="coverage-continent coverage-central-america"></div>
          <div className="coverage-continent coverage-south-america"></div>
          <div className="coverage-continent coverage-caribbean"></div>

          <span className="coverage-pin coverage-pin-mexico"></span>
          <span className="coverage-pin coverage-pin-colombia"></span>

          <span className="coverage-route coverage-route-mexico-colombia"></span>
        </div>

        <div className="coverage-card-zone">
          {floatingCoverageData.map((item) => (
            <article
              key={item.id}
              className={`coverage-floating-card ${item.cardClass}`}
            >
              <div
                className={`coverage-card-icon coverage-card-icon-${item.id}`}
              >
                {item.icon}
              </div>

              <div>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.metric}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="coverage-country-grid">
        {coverageSummaryData.map((item) => (
          <article key={item.id} className="coverage-country-card">
            <span>{item.title}</span>
            <strong>{item.metric}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OperationalCoverage;