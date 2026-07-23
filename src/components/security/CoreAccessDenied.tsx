import "../../styles/CoreAccessDenied.css";

type CoreAccessDeniedProps = {
  title?: string;
  description?: string;
  onBack?: () => void;
};

const CoreAccessDenied = ({
  title = "Acceso restringido",
  description = "Tu usuario no tiene los privilegios necesarios para abrir este módulo.",
  onBack,
}: CoreAccessDeniedProps) => {
  return (
    <main className="core-access-denied-page">
      <section className="core-access-denied-card">
        <span className="core-access-denied-card__eyebrow">
          Seguridad de Core
        </span>
        <div className="core-access-denied-card__icon" aria-hidden="true">
          !
        </div>
        <h1>{title}</h1>
        <p>{description}</p>

        {onBack && (
          <button type="button" onClick={onBack}>
            Volver al Hub
          </button>
        )}
      </section>
    </main>
  );
};

export default CoreAccessDenied;
