import { useState } from "react";

import CoreFormsHome from "./components/coreforms/CoreFormsHome";
import AltaEquipoPage from "./components/coreforms/forms/AltaEquipoPage";
import AltaProveedorPage from "./components/coreforms/forms/AltaProveedorPage";

import type { CoreFormsView } from "./interfaces/coreFormsNavigation";

import "./styles/CoreForms.css";

type CoreFormsModuleProps = {
  onBackToHub?: () => void;
};

function CoreFormsModule({ onBackToHub }: CoreFormsModuleProps) {
  const [currentView, setCurrentView] = useState<CoreFormsView>("home");

  function goHome() {
    setCurrentView("home");
  }

  function renderCurrentView() {
    if (currentView === "alta-proveedor") {
      return <AltaProveedorPage onBack={goHome} />;
    }

    if (currentView === "alta-equipo") {
      return <AltaEquipoPage onBack={goHome} />;
    }

    return (
      <CoreFormsHome
        onSelectForm={setCurrentView}
        onBackToHub={onBackToHub}
      />
    );
  }

  return (
    <>
      {onBackToHub && (
        <button
          type="button"
          className="coreforms-floating-home-button"
          onClick={onBackToHub}
          aria-label="Volver al Hub"
          title="Volver al Hub"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 10.75L12 3l9 7.75V21a1 1 0 0 1-1 1h-5.5a1 1 0 0 1-1-1v-5.25h-3V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10.75Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      {renderCurrentView()}
    </>
  );
}

export default CoreFormsModule;