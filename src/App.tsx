import { useEffect, useRef, useState } from "react";
import HubPage from "./pages/HubPage";
import CoreInventoryModule from "./CoreInventoryModule";
import CoreSuppliersModule from "./CoreSuppliersModule";
import CoreFormsModule from "./CoreFormsModule";
import ModuleEntryLoader from "./components/ModuleEntryLoader";

import "./App.css";

type MainModule = "hub" | "coreinventory" | "coresuppliers" | "coreforms";

type LoaderState = {
  isVisible: boolean;
  title: string;
  message: string;
};

const MODULE_ENTRY_DELAY_MS = 1800;

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

  const entrarAModulo = (
    module: Exclude<MainModule, "hub">,
    title: string,
    message: string
  ) => {
    if (loaderTimeoutRef.current) {
      window.clearTimeout(loaderTimeoutRef.current);
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
    }, MODULE_ENTRY_DELAY_MS);
  };

  const volverAlHub = () => {
    if (loaderTimeoutRef.current) {
      window.clearTimeout(loaderTimeoutRef.current);
    }

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

      {activeModule === "coreinventory" && (
        <CoreInventoryModule onBackToHub={volverAlHub} />
      )}

      {activeModule === "coresuppliers" && (
        <CoreSuppliersModule onBackToHub={volverAlHub} />
      )}

      {activeModule === "coreforms" && (
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