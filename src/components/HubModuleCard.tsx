import React, { useId } from "react";

export type HubModuleVariant = "inventory" | "suppliers" | "forms";

type HubModuleCardProps = {
  index: number;
  variant: HubModuleVariant;
  title: string;
  eyebrow: string;
  status: string;
  description: string;
  buttonText: string;
  onClick: () => void;
};

const moduleAccent: Record<HubModuleVariant, string> = {
  inventory: "tw-from-core-green/20 tw-via-white/[0.045] tw-to-white/[0.025]",
  suppliers: "tw-from-emerald-300/16 tw-via-white/[0.045] tw-to-white/[0.025]",
  forms: "tw-from-teal-300/16 tw-via-white/[0.045] tw-to-white/[0.025]",
};

const ModuleIcon = ({ variant }: { variant: HubModuleVariant }) => {
  if (variant === "inventory") {
    return (
      <svg viewBox="0 0 24 24" className="tw-h-6 tw-w-6" aria-hidden="true">
        <rect x="4" y="5" width="16" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 19h6M12 16v3M8 9h8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "suppliers") {
    return (
      <svg viewBox="0 0 24 24" className="tw-h-6 tw-w-6" aria-hidden="true">
        <circle cx="12" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="6" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="18" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 10v3.5M8.2 15.7 12 13.5l3.8 2.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="tw-h-6 tw-w-6" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8h6M9 12h6M9 16h3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 15.5 18 17l2.4-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const InventoryVisual = () => {
  const id = useId();
  const fillId = `${id}-inventory-fill`;
  const glowId = `${id}-inventory-glow`;

  return (
    <svg viewBox="0 0 420 250" className="tw-h-full tw-w-full" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16281d" />
          <stop offset="100%" stopColor="#07110d" />
        </linearGradient>
        <linearGradient id={glowId} x1="0" x2="1">
          <stop offset="0%" stopColor="#5cef92" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#239f55" stopOpacity="0.62" />
        </linearGradient>
      </defs>

      <path d="M67 194 C135 144, 193 144, 255 171 C306 193, 350 181, 388 145" fill="none" stroke="rgba(112,255,174,0.18)" strokeWidth="2" />

      <rect x="78" y="52" width="190" height="126" rx="20" fill={`url(#${fillId})`} stroke="rgba(118,255,179,0.22)" />
      <rect x="98" y="72" width="148" height="10" rx="5" fill="rgba(118,255,179,0.18)" />

      <circle cx="128" cy="121" r="31" fill="rgba(0,0,0,0.18)" />
      <circle cx="128" cy="121" r="22" fill="none" stroke={`url(#${glowId})`} strokeWidth="10" strokeDasharray="90 42" strokeLinecap="round" transform="rotate(-90 128 121)" />

      <g fill="#39d86f">
        <rect x="177" y="127" width="12" height="32" rx="6" />
        <rect x="200" y="105" width="12" height="54" rx="6" />
        <rect x="223" y="86" width="12" height="73" rx="6" />
      </g>

      <path d="M292 90h72c8 0 14 6 13 14l-8 60c-1 7-7 12-14 12h-75c-8 0-14-7-13-15l9-58c1-8 7-13 16-13Z" fill={`url(#${fillId})`} stroke="rgba(118,255,179,0.22)" />
      <path d="M294 111h55" stroke="rgba(118,255,179,0.26)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

const SuppliersVisual = () => {
  const id = useId();
  const fillId = `${id}-suppliers-fill`;

  return (
    <svg viewBox="0 0 420 250" className="tw-h-full tw-w-full" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16281d" />
          <stop offset="100%" stopColor="#07110d" />
        </linearGradient>
      </defs>

      <g stroke="rgba(92,239,146,0.36)" strokeWidth="2" fill="none">
        <path d="M210 118V56" />
        <path d="M210 118H118" />
        <path d="M210 118h92" />
        <path d="M210 118l-66 64" />
        <path d="M210 118l66 64" />
      </g>

      <circle cx="210" cy="118" r="42" fill={`url(#${fillId})`} stroke="rgba(92,239,146,0.82)" />
      <rect x="192" y="97" width="36" height="34" rx="6" fill="#39d86f" />
      <rect x="200" y="105" width="6" height="6" fill="#0b1710" />
      <rect x="211" y="105" width="6" height="6" fill="#0b1710" />
      <rect x="200" y="117" width="6" height="6" fill="#0b1710" />
      <rect x="211" y="117" width="6" height="6" fill="#0b1710" />

      {[
        [210, 47],
        [107, 118],
        [313, 118],
        [137, 188],
        [283, 188],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="24" fill={`url(#${fillId})`} stroke="rgba(92,239,146,0.76)" />
      ))}

      <g fill="none" stroke="#39d86f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="210" cy="42" r="5" fill="#39d86f" stroke="none" />
        <path d="M201 56c3-6 15-6 18 0" />
        <circle cx="107" cy="118" r="8" />
        <path d="M98 118h18M107 109c4 5 4 13 0 18M107 109c-4 5-4 13 0 18" />
        <rect x="304" y="111" width="18" height="12" rx="2.5" fill="#39d86f" stroke="none" />
        <path d="M302 128h22" />
        <circle cx="137" cy="183" r="5" fill="#39d86f" stroke="none" />
        <path d="M128 197c3-6 15-6 18 0" />
        <rect x="274" y="180" width="18" height="13" rx="2.5" />
        <path d="M279 198h8" />
      </g>
    </svg>
  );
};

const FormsVisual = () => {
  const id = useId();
  const fillId = `${id}-forms-fill`;

  return (
    <svg viewBox="0 0 420 250" className="tw-h-full tw-w-full" aria-hidden="true">
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#16281d" />
          <stop offset="100%" stopColor="#07110d" />
        </linearGradient>
      </defs>

      <path d="M105 70h170c11 0 20 9 20 20v104c0 11-9 20-20 20H105c-11 0-20-9-20-20V90c0-11 9-20 20-20Z" fill={`url(#${fillId})`} stroke="rgba(118,255,179,0.22)" />
      <path d="M125 99h120M125 126h90M125 153h116" stroke="rgba(118,255,179,0.28)" strokeWidth="8" strokeLinecap="round" />
      <rect x="125" y="177" width="74" height="16" rx="8" fill="#39d86f" opacity="0.9" />

      <path d="M250 51h65c10 0 18 8 18 18v92c0 10-8 18-18 18h-65c-10 0-18-8-18-18V69c0-10 8-18 18-18Z" fill="rgba(10,24,16,0.82)" stroke="rgba(118,255,179,0.24)" />
      <path d="M252 80h45M252 106h58M252 132h38" stroke="rgba(118,255,179,0.30)" strokeWidth="6" strokeLinecap="round" />
      <path d="M302 166 318 181 345 146" fill="none" stroke="#39d86f" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M82 209 C142 174, 217 177, 289 211" fill="none" stroke="rgba(112,255,174,0.16)" strokeWidth="2" />
    </svg>
  );
};

const ModuleVisual = ({ variant }: { variant: HubModuleVariant }) => {
  if (variant === "inventory") return <InventoryVisual />;
  if (variant === "suppliers") return <SuppliersVisual />;
  return <FormsVisual />;
};

const HubModuleCard: React.FC<HubModuleCardProps> = ({
  index,
  variant,
  title,
  eyebrow,
  status,
  description,
  buttonText,
  onClick,
}) => {
  return (
    <article
      className={[
        "hub-enter hub-module-card tw-group tw-relative tw-flex tw-min-h-[410px] tw-cursor-pointer tw-flex-col tw-overflow-hidden tw-rounded-core-xl tw-border tw-border-core-border tw-bg-gradient-to-br tw-p-4 tw-shadow-core-card tw-backdrop-blur-xl tw-transition tw-duration-300 hover:-tw-translate-y-1 hover:tw-border-core-green/30 hover:tw-shadow-core-card-hover",
        moduleAccent[variant],
      ].join(" ")}
      style={
        {
          "--hub-delay": `${170 + index * 90}ms`,
        } as React.CSSProperties
      }
    >
      <button
        type="button"
        className="hub-card-hitarea"
        onClick={onClick}
        aria-label={`Acceder a ${title}`}
      />

      <div className="hub-card-border-flow" aria-hidden="true" />
      <div className="hub-card-data-grid" aria-hidden="true" />

      <div
        className="tw-pointer-events-none tw-absolute tw-inset-0 tw-bg-[radial-gradient(circle_at_50%_0%,rgba(53,212,111,0.13),transparent_44%)] tw-opacity-80"
        aria-hidden="true"
      />

      <div
        className="tw-pointer-events-none tw-absolute -tw-bottom-24 tw-left-1/2 tw-h-48 tw-w-72 -tw-translate-x-1/2 tw-rounded-full tw-bg-core-green/10 tw-blur-3xl tw-transition tw-duration-300 group-hover:tw-bg-core-green/16"
        aria-hidden="true"
      />

      <div className="tw-pointer-events-none tw-relative tw-z-20 tw-flex tw-min-h-[176px] tw-items-center tw-justify-center">
        <ModuleVisual variant={variant} />
      </div>

      <div className="tw-pointer-events-none tw-relative tw-z-20 tw-flex tw-flex-1 tw-flex-col">
        <div className="tw-mb-4 tw-flex tw-items-center tw-justify-between tw-gap-3">
          <div className="tw-min-w-0">
            <span className="tw-block tw-text-[0.68rem] tw-font-black tw-uppercase tw-tracking-[0.14em] tw-text-core-green-muted/85">
              {eyebrow}
            </span>

            <span className="tw-mt-2 tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-border tw-border-core-green/18 tw-bg-core-green/8 tw-px-2.5 tw-py-1 tw-text-[0.68rem] tw-font-extrabold tw-text-core-green-muted/85">
              <span className="tw-h-1.5 tw-w-1.5 tw-rounded-full tw-bg-core-green tw-shadow-[0_0_12px_rgba(53,212,111,0.55)]" />
              {status}
            </span>
          </div>

          <span className="tw-grid tw-h-10 tw-w-10 tw-shrink-0 tw-place-items-center tw-rounded-2xl tw-border tw-border-core-green/20 tw-bg-core-green/10 tw-text-core-green">
            <ModuleIcon variant={variant} />
          </span>
        </div>

        <h3 className="tw-m-0 tw-text-2xl tw-font-black tw-leading-none tw-tracking-[-0.04em] tw-text-white">
          {title}
        </h3>

        <p className="tw-m-0 tw-mt-3 tw-max-w-[92%] tw-text-sm tw-leading-6 tw-text-white/66">
          {description}
        </p>

        <div className="hub-access-button tw-mt-auto tw-inline-flex tw-w-full tw-items-center tw-justify-center tw-gap-2 tw-rounded-2xl tw-px-4 tw-py-3 tw-text-sm tw-font-black tw-transition tw-duration-200">
          <span>{buttonText}</span>
          <span className="hub-access-button__arrow" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </article>
  );
};

export default HubModuleCard;