import { useState } from "react";
import CoreSuppliersHeader from "./components/coresuppliers/CoreSuppliersHeader";
import CoreSuppliersLandingPage from "./pages/CoreSuppliersLandingPage";
import { SupplierDirectoryPage } from "./pages/SupplierDirectoryPage";
import type { VistaCoreSuppliers } from "./interfaces/coreSuppliersNavigation";
import "./styles/ModuleHomeButton.css";

type CoreSuppliersModuleProps = {
  onBackToHub: () => void;
};

type CoreSuppliersPlaceholderProps = {
  title: string;
  description: string;
};

function CoreSuppliersPlaceholder({
  title,
  description,
}: CoreSuppliersPlaceholderProps) {
  return (
    <main className="landing-page">
      <section className="landing-content">
        <div className="landing-title-block">
          <p className="landing-eyebrow">CoreSuppliers</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
    </main>
  );
}

function CoreSuppliersModule({ onBackToHub }: CoreSuppliersModuleProps) {
  const [vistaActiva, setVistaActiva] =
    useState<VistaCoreSuppliers>("inicio");

  const renderizarVista = () => {
    switch (vistaActiva) {
      case "proveedores":
        return <SupplierDirectoryPage />;

      case "servicios":
        return (
          <CoreSuppliersPlaceholder
            title="Servicios por sucursal"
            description="Próximamente: consulta de servicios proveedor-sucursal con filtros por sucursal, tipo de servicio y estado."
          />
        );

      case "contactos":
        return (
          <CoreSuppliersPlaceholder
            title="Contactos"
            description="Próximamente: contactos principales, soporte, técnicos, emergencias y administrativos por proveedor."
          />
        );

      case "sucursales":
        return (
          <CoreSuppliersPlaceholder
            title="Sucursales"
            description="Próximamente: cobertura de proveedores por sucursal y ubicación interna."
          />
        );

      case "inicio":
      default:
        return <CoreSuppliersLandingPage />;
    }
  };

  return (
    <>
      <button
        type="button"
        className="module-home-button"
        onClick={onBackToHub}
        aria-label="Volver al Hub"
        title="Volver al Hub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10.5V20h13v-9.5" />
          <path d="M9.5 20v-6h5v6" />
        </svg>
      </button>

      <CoreSuppliersHeader
        vistaActiva={vistaActiva}
        onNavigate={setVistaActiva}
        onBackToHub={onBackToHub}
      />

      {renderizarVista()}
    </>
  );
}

export default CoreSuppliersModule;