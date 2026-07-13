import type { ReactNode } from "react";

type CoreFormFieldProps = {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
};

export default function CoreFormField({
  label,
  required = false,
  fullWidth = false,
  children,
}: CoreFormFieldProps) {
  return (
    <label
      className={`coreforms-field ${fullWidth ? "coreforms-field-full" : ""}`}
    >
      <span>
        {label}
        {required && <strong> *</strong>}
      </span>

      {children}
    </label>
  );
}