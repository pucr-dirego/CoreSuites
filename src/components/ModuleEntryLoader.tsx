import "../styles/ModuleEntryLoader.css";

type ModuleEntryLoaderProps = {
  isVisible: boolean;
  title: string;
  message: string;
};

function ModuleEntryLoader({
  isVisible,
  title,
  message,
}: ModuleEntryLoaderProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="module-entry-loader" role="status" aria-live="polite">
      <div className="module-entry-loader__panel">
        <div className="module-entry-loader__mark">
          <span />
          <span />
          <span />
        </div>

        <div className="module-entry-loader__content">
          <p>Inicializando módulo</p>
          <h2>{title}</h2>
          <span>{message}</span>
        </div>

        <div className="module-entry-loader__bar">
          <div />
        </div>
      </div>
    </div>
  );
}

export default ModuleEntryLoader