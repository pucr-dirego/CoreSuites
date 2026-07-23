import { useEffect, useRef, useState } from "react";
import HubPage from "./pages/HubPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import CoreInventoryModule from "./CoreInventoryModule";
import CoreSuppliersModule from "./CoreSuppliersModule";
import CoreFormsModule from "./CoreFormsModule";
import ModuleEntryLoader from "./components/ModuleEntryLoader";
import CoreUserPanel from "./components/CoreUserPanel";
import CoreAccessGuard from "./components/security/CoreAccessGuard";

import "./App.css";

type MainModule = "hub" | "coreinventory" | "coresuppliers" | "coreforms";

type OperationalModule = Exclude<MainModule, "hub">;

type LoaderState = {
  isVisible: boolean;
  title: string;
  message: string;
};

const MODULE_ENTRY_DELAY_MS = 1800;

/**
 * Control de publicación técnica de módulos.
 *
 * Esta configuración únicamente indica si el módulo ya puede renderizarse.
 * La autorización del usuario se valida por separado con CoreAccessGuard.
 *
 * - CoreForms está publicado para usuarios generales y Personal de TI.
 * - CoreInventory y CoreSuppliers están publicados únicamente para Personal de
 *   TI mediante las capacidades canManageInventory y canManageSuppliers.
 */
const MODULE_AVAILABILITY: Record<OperationalModule, boolean> = {
  coreinventory: true,
  coresuppliers: true,
  coreforms: true,
};

function App() {
  const [activeModule, setActiveModule] = useState<MainModule>("hub");
  const [loader, setLoader] = useState<LoaderState>({
    isVisible: false,
    title: "",
    message: "",
  });

  const loaderTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loaderTimeoutRef.current) {
        window.clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, []);

  const limpiarLoaderPendiente = () => {
    if (loaderTimeoutRef.current) {
      window.clearTimeout(loaderTimeoutRef.current);
      loaderTimeoutRef.current = null;
    }
  };

  const entrarAModulo = (
    module: OperationalModule,
    title: string,
    message: string
  ) => {
    limpiarLoaderPendiente();

    /**
     * Si un módulo se deshabilita técnicamente en el futuro, App.tsx conserva
     * su pantalla ComingSoon sin eliminar su implementación del proyecto.
     */
    if (!MODULE_AVAILABILITY[module]) {
      setLoader({
        isVisible: false,
        title: "",
        message: "",
      });

      setActiveModule(module);
      return;
    }

    setLoader({
      isVisible: true,
      title,
      message,
    });

    loaderTimeoutRef.current = window.setTimeout(() => {
      setActiveModule(module);
      setLoader((currentLoader) => ({
        ...currentLoader,
        isVisible: false,
      }));
      loaderTimeoutRef.current = null;
    }, MODULE_ENTRY_DELAY_MS);
  };

  const volverAlHub = () => {
    limpiarLoaderPendiente();

    setLoader({
      isVisible: false,
      title: "",
      message: "",
    });

    setActiveModule("hub");
  };

  return (
    <>
      <ModuleEntryLoader
        isVisible={loader.isVisible}
        title={loader.title}
        message={loader.message}
      />

      {activeModule !== "hub" && (
        <CoreUserPanel variant="floating" />
      )}

      {activeModule === "coreinventory" && (
        <CoreAccessGuard
          capability="canManageInventory"
          onBack={volverAlHub}
        >
          {MODULE_AVAILABILITY.coreinventory ? (
            <CoreInventoryModule onBackToHub={volverAlHub} />
          ) : (
            <ComingSoonPage
              moduleName="CoreInventory"
              eyebrow="Inventario tecnológico"
              description="Estamos preparando una experiencia renovada para consultar, controlar y dar seguimiento al inventario tecnológico de cada sucursal."
              onBackToHub={volverAlHub}
            />
          )}
        </CoreAccessGuard>
      )}

      {activeModule === "coresuppliers" && (
        <CoreAccessGuard
          capability="canManageSuppliers"
          onBack={volverAlHub}
        >
          {MODULE_AVAILABILITY.coresuppliers ? (
            <CoreSuppliersModule onBackToHub={volverAlHub} />
          ) : (
            <ComingSoonPage
              moduleName="CoreSuppliers"
              eyebrow="Red de proveedores"
              description="Estamos construyendo un espacio central para consultar proveedores, servicios, contactos y cobertura operativa por sucursal."
              onBackToHub={volverAlHub}
            />
          )}
        </CoreAccessGuard>
      )}

      {activeModule === "coreforms" && MODULE_AVAILABILITY.coreforms && (
        <CoreFormsModule onBackToHub={volverAlHub} />
      )}

      {activeModule === "hub" && (
        <HubPage
          onEnterInventory={() =>
            entrarAModulo(
              "coreinventory",
              "CoreInventory",
              "Preparando inventario, métricas y operación TI."
            )
          }
          onEnterSuppliers={() =>
            entrarAModulo(
              "coresuppliers",
              "CoreSuppliers",
              "Preparando catálogo de proveedores por sucursal."
            )
          }
          onEnterForms={() =>
            entrarAModulo(
              "coreforms",
              "CoreForms",
              "Preparando formularios de captura operativa."
            )
          }
        />
      )}
    </>
  );
}

export default App;
