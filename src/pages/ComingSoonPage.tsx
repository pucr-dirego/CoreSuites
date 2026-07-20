import React from "react";
import logoCore from "../assets/Core-logo.png";
import "../styles/ComingSoonPage.css";

type ComingSoonPageProps = {
  moduleName: string;
  eyebrow: string;
  description: string;
  onBackToHub: () => void;
};

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  moduleName,
  eyebrow,
  description,
  onBackToHub,
}) => {
  return (
    <main className="coming-soon-page">
      <div className="coming-soon-background" aria-hidden="true">
        <span className="coming-soon-glow coming-soon-glow--top" />
        <span className="coming-soon-glow coming-soon-glow--bottom" />
        <span className="coming-soon-grid" />
        <span className="coming-soon-noise" />
      </div>

      <div className="coming-soon-shell">
        <header className="coming-soon-header">
          <div className="coming-soon-brand">
            <img
              src={logoCore}
              alt="Core"
              className="coming-soon-logo"
            />

            <span className="coming-soon-header-separator" aria-hidden="true" />

            <span className="coming-soon-header-title">
              Operations Hub
            </span>
          </div>

          <span className="coming-soon-status">
            Próximamente
          </span>
        </header>

        <section className="coming-soon-content">
          <article className="coming-soon-card">
            <span className="coming-soon-card-line" aria-hidden="true" />

            <div className="coming-soon-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 20h16" />
                <path d="M6 20V9l6-4 6 4v11" />
                <path d="M9 20v-6h6v6" />
                <path d="M8 10h8" />
                <path d="M12 5V2" />
              </svg>
            </div>

            <span className="coming-soon-eyebrow">
              {eyebrow}
            </span>

            <h1 className="coming-soon-heading">
              El futuro está en construcción
            </h1>

            <p className="coming-soon-module-name">
              {moduleName}
            </p>

            <p className="coming-soon-description">
              {description}
            </p>

            <div className="coming-soon-progress" aria-hidden="true">
              <span className="coming-soon-progress-segment coming-soon-progress-segment--active" />
              <span className="coming-soon-progress-segment coming-soon-progress-segment--medium" />
              <span className="coming-soon-progress-segment coming-soon-progress-segment--inactive" />
            </div>

            <p className="coming-soon-note">
              Mientras tanto, CoreForms continúa disponible para captura operativa.
            </p>

            <button
              type="button"
              className="coming-soon-back-button"
              onClick={onBackToHub}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>

              <span>Volver al Hub</span>
            </button>
          </article>
        </section>

        <footer className="coming-soon-footer">
          <span>Sistema interno Dirego</span>
          <span className="coming-soon-footer-dot" aria-hidden="true" />
          <span>Ecosistema Core</span>
        </footer>
      </div>
    </main>
  );
};

export default ComingSoonPage;
