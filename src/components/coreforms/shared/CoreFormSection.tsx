import type { ReactNode } from "react";

type CoreFormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function CoreFormSection({
  title,
  description,
  children,
}: CoreFormSectionProps) {
  return (
    <section className="coreforms-form-section">
      <header className="coreforms-form-section-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>

      <div className="coreforms-form-grid">{children}</div>
    </section>
  );
}