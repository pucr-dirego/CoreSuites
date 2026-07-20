import React from "react";
import HubModuleCard, {
  type HubModuleVariant,
} from "../components/HubModuleCard";
import logoCore from "../assets/Core-logo.png";
import "../styles/hub-tailwind.css";

type HubPageProps = {
  onEnterInventory: () => void;
  onEnterSuppliers: () => void;
  onEnterForms: () => void;
};

type HubModule = {
  variant: HubModuleVariant;
  title: string;
  eyebrow: string;
  status: string;
  description: string;
  buttonText: string;
  isAvailable: boolean;
  onClick: () => void;
};

const HubPage: React.FC<HubPageProps> = ({
  onEnterInventory,
  onEnterSuppliers,
  onEnterForms,
}) => {
  const modules: HubModule[] = [
    {
      variant: "inventory",
      title: "CoreInventory",
      eyebrow: "Inventario tecnológico",
      status: "En construcción",
      description:
        "Estamos preparando la próxima experiencia para consulta, control y seguimiento del inventario TI.",
      buttonText: "Ver avance",
      isAvailable: false,
      onClick: onEnterInventory,
    },
    {
      variant: "suppliers",
      title: "CoreSuppliers",
      eyebrow: "Red de proveedores",
      status: "En construcción",
      description:
        "Próximamente: directorio operativo de proveedores, servicios, contactos y sucursales.",
      buttonText: "Ver avance",
      isAvailable: false,
      onClick: onEnterSuppliers,
    },
    {
      variant: "forms",
      title: "CoreForms",
      eyebrow: "Captura operativa",
      status: "Disponible",
      description:
        "Formularios internos para registrar información clave directamente en Core.",
      buttonText: "Acceder",
      isAvailable: true,
      onClick: onEnterForms,
    },
  ];

  const availableModuleCount = modules.filter(
    (module) => module.isAvailable
  ).length;

  return (
    <main className="tw-relative tw-isolate tw-min-h-screen tw-overflow-hidden tw-bg-core-bg tw-text-core-text">
      <div
        className="tw-absolute tw-inset-0 -tw-z-20"
        style={{
          background:
            "radial-gradient(circle at 50% -10%, rgba(53, 212, 111, 0.18), transparent 34%), radial-gradient(circle at 12% 90%, rgba(53, 212, 111, 0.12), transparent 32%), radial-gradient(circle at 86% 22%, rgba(156, 232, 181, 0.10), transparent 28%), linear-gradient(135deg, #020806 0%, #071510 52%, #020806 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="tw-absolute tw-inset-0 -tw-z-10 tw-opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 78%)",
        }}
        aria-hidden="true"
      />

      <div
        className="tw-absolute -tw-left-48 tw-bottom-[-14rem] -tw-z-10 tw-h-[34rem] tw-w-[34rem] tw-rounded-full tw-bg-core-green/20 tw-blur-[120px]"
        aria-hidden="true"
      />

      <div
        className="tw-absolute -tw-right-48 -tw-top-40 -tw-z-10 tw-h-[34rem] tw-w-[34rem] tw-rounded-full tw-bg-core-green/15 tw-blur-[130px]"
        aria-hidden="true"
      />

      <div
        className="tw-pointer-events-none tw-absolute tw-inset-x-[-10%] tw-bottom-[-17rem] -tw-z-10 tw-h-[28rem] tw-rounded-[50%] tw-border tw-border-core-green/10"
        aria-hidden="true"
      />

      <div className="hub-aurora-layer hub-aurora-layer--one" aria-hidden="true" />
      <div className="hub-aurora-layer hub-aurora-layer--two" aria-hidden="true" />
      <div className="hub-aurora-layer hub-aurora-layer--three" aria-hidden="true" />

      <div className="hub-energy-line hub-energy-line--one" aria-hidden="true" />
      <div className="hub-energy-line hub-energy-line--two" aria-hidden="true" />

      <div className="hub-ecosystem-pattern" aria-hidden="true">
        <span className="hub-ecosystem-node hub-ecosystem-node--core" />
        <span className="hub-ecosystem-node hub-ecosystem-node--one" />
        <span className="hub-ecosystem-node hub-ecosystem-node--two" />
        <span className="hub-ecosystem-node hub-ecosystem-node--three" />
      </div>

      <div className="hub-noise-layer" aria-hidden="true" />

      <section className="tw-relative tw-z-10 tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-7xl tw-flex-col tw-px-4 tw-py-4 sm:tw-px-6 lg:tw-px-8">
        <header
          className="hub-enter tw-flex tw-items-center tw-justify-between tw-gap-4 tw-rounded-full tw-border tw-border-core-border tw-bg-white/[0.045] tw-px-4 tw-py-3 tw-shadow-[0_18px_60px_rgba(0,0,0,0.22)] tw-backdrop-blur-xl"
          style={{ "--hub-delay": "0ms" } as React.CSSProperties}
        >
          <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
            <img
              src={logoCore}
              alt="Core"
              className="tw-h-8 tw-w-auto tw-shrink-0 tw-object-contain"
            />

            <div className="tw-hidden tw-h-5 tw-w-px tw-bg-white/10 sm:tw-block" />

            <span className="tw-hidden tw-text-xs tw-font-bold tw-uppercase tw-tracking-[0.16em] tw-text-white/70 sm:tw-inline">
              Operations Hub
            </span>
          </div>

          <div className="tw-flex tw-items-center tw-gap-2">
            <span className="tw-hidden tw-rounded-full tw-border tw-border-core-green/20 tw-bg-core-green/10 tw-px-3 tw-py-1.5 tw-text-[0.72rem] tw-font-bold tw-text-core-green-muted sm:tw-inline-flex">
              Acceso interno
            </span>

            <span className="tw-rounded-full tw-border tw-border-white/10 tw-bg-white/[0.045] tw-px-3 tw-py-1.5 tw-text-[0.72rem] tw-font-bold tw-text-white/65">
              {availableModuleCount} módulo activo
            </span>
          </div>
        </header>

        <div className="tw-flex tw-flex-1 tw-flex-col tw-justify-center tw-py-8 lg:tw-py-10">
          <section
            className="hub-enter tw-mx-auto tw-mb-8 tw-max-w-3xl tw-text-center"
            style={{ "--hub-delay": "90ms" } as React.CSSProperties}
          >
            <span className="tw-mb-4 tw-inline-flex tw-rounded-full tw-border tw-border-core-green/20 tw-bg-core-green/10 tw-px-3 tw-py-1.5 tw-text-[0.72rem] tw-font-extrabold tw-uppercase tw-tracking-[0.14em] tw-text-core-green-muted">
              Plataforma operativa
            </span>

            <h1 className="tw-m-0 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-x-3 tw-gap-y-1 tw-text-[clamp(2.4rem,5vw,4.7rem)] tw-font-black tw-leading-none tw-tracking-[-0.055em]">
              <span className="tw-text-core-green">Bienvenido a</span>
              <img
                src={logoCore}
                alt="Core"
                className="tw-h-[clamp(2.15rem,4.2vw,4.15rem)] tw-w-auto tw-object-contain tw-drop-shadow-[0_0_18px_rgba(53,212,111,0.18)]"
              />
            </h1>

            <p className="tw-mx-auto tw-mt-4 tw-max-w-2xl tw-text-sm tw-leading-6 tw-text-white/70 sm:tw-text-base">
              Centro de acceso para operación tecnológica, proveedores y captura
              interna. Diseñado para operación multi-sucursal.
            </p>

            <div className="tw-mt-5 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2">
              <span className="hub-context-pill">Inventario TI</span>
              <span className="hub-context-pill">Proveedores</span>
              <span className="hub-context-pill">Formularios</span>
              <span className="hub-context-pill">31 sucursales</span>
            </div>
          </section>

          <section
            className="hub-module-grid tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3 xl:tw-gap-5"
            aria-label="Módulos de Core"
          >
            {modules.map((module, index) => (
              <HubModuleCard
                key={module.variant}
                index={index}
                variant={module.variant}
                title={module.title}
                eyebrow={module.eyebrow}
                status={module.status}
                description={module.description}
                buttonText={module.buttonText}
                onClick={module.onClick}
              />
            ))}
          </section>
        </div>

        <footer
          className="hub-enter tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-x-4 tw-gap-y-2 tw-pb-1 tw-text-xs tw-font-semibold tw-text-white/42"
          style={{ "--hub-delay": "420ms" } as React.CSSProperties}
        >
          <span>Sistema interno Dirego</span>
          <span className="tw-hidden tw-h-1 tw-w-1 tw-rounded-full tw-bg-core-green/70 sm:tw-inline-block" />
          <span>Operación TI</span>
          <span className="tw-hidden tw-h-1 tw-w-1 tw-rounded-full tw-bg-core-green/70 sm:tw-inline-block" />
          <span>Ecosistema Core</span>
        </footer>
      </section>
    </main>
  );
};

export default HubPage;
