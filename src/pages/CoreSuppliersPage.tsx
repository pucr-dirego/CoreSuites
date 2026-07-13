import { useState } from "react";
import CoreSuppliersHeader from "../components/coresuppliers/CoreSuppliersHeader";
import type { VistaCoreSuppliers } from "../interfaces/coreSuppliersNavigation";
import CoreSuppliersLandingPage from "./CoreSuppliersLandingPage";
import { SupplierDirectoryPage } from "./SupplierDirectoryPage";
import "../styles/CoreSuppliersModule.css";

type CoreSuppliersPageProps = {
  onBack: () => void;
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
    <main className="core-suppliers-placeholder">
      <section className="core-suppliers-placeholder-card">
        <p className="core-suppliers-placeholder-eyebrow">CoreSuppliers</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </main>
  );
}

function CoreSuppliersPage({ onBack }: CoreSuppliersPageProps) {
  const [vistaActiva, setVistaActiva] =
    useState<VistaCoreSuppliers>("inicio");

  const renderVista = () => {
    switch (vistaActiva) {
      case "inicio":
        return <CoreSuppliersLandingPage />;

      case "proveedores":
        return <SupplierDirectoryPage />;

      case "servicios":
        return (
          <CoreSuppliersPlaceholder
            title="Servicios"
            description="Próximamente podrás consultar y administrar los servicios asociados a proveedores, sucursales y ubicaciones internas."
          />
        );

      case "contactos":
        return (
          <CoreSuppliersPlaceholder
            title="Contactos"
            description="Próximamente podrás consultar contactos técnicos, comerciales, soporte y escalamiento por proveedor."
          />
        );

      case "sucursales":
        return (
          <CoreSuppliersPlaceholder
            title="Sucursales"
            description="Próximamente podrás revisar la cobertura de proveedores por sucursal, CEDIS, Dragón, Fábrica u otras ubicaciones internas."
          />
        );

      default:
        return <CoreSuppliersLandingPage />;
    }
  };

  return (
    <section className="core-suppliers-module">
      <CoreSuppliersHeader
        vistaActiva={vistaActiva}
        onNavigate={setVistaActiva}
        onBackToHub={onBack}
      />

      {renderVista()}
    </section>
  );
}

export default CoreSuppliersPage;