import { memo, useMemo } from "react";
import { useCoreUser } from "../hooks/useCoreUser";
import "../styles/CoreUserPanel.css";

type CoreUserPanelProps = {
  variant?: "inline" | "floating";
};

const getInitials = (fullName: string): string => {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CU";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const CoreUserPanel = ({
  variant = "floating",
}: CoreUserPanelProps) => {
  const {
    user,
    isLoading,
    error,
    isPowerAppsContextAvailable,
  } = useCoreUser();

  const initials = useMemo(
    () => getInitials(user?.fullName ?? "Core User"),
    [user?.fullName]
  );

  const rootClassName = [
    "core-user-panel",
    `core-user-panel--${variant}`,
  ].join(" ");

  if (isLoading) {
    return (
      <div
        className={`${rootClassName} core-user-panel--loading`}
        aria-live="polite"
        aria-label="Identificando usuario"
      >
        <span className="core-user-panel__avatar core-user-panel__avatar--loading" />
        <span className="core-user-panel__identity">
          <strong>Identificando usuario</strong>
          <span>Power Apps</span>
        </span>
      </div>
    );
  }

  if (!user || error) {
    return (
      <div
        className={`${rootClassName} core-user-panel--error`}
        aria-live="polite"
        title={error ?? "No fue posible obtener el contexto del usuario."}
      >
        <span className="core-user-panel__avatar core-user-panel__avatar--error">
          !
        </span>
        <span className="core-user-panel__identity">
          <strong>Usuario no disponible</strong>
          <span>Contexto no detectado</span>
        </span>
      </div>
    );
  }

  const supportTitle = [
    `Usuario: ${user.fullName}`,
    `Correo: ${user.userPrincipalName || "No disponible"}`,
    `Entra Object ID: ${user.objectId || "No disponible"}`,
    `Environment ID: ${user.environmentId || "No disponible"}`,
    `Session ID: ${user.sessionId || "No disponible"}`,
  ].join("\n");

  return (
    <div
      className={rootClassName}
      title={supportTitle}
      aria-label={`Usuario conectado: ${user.fullName}`}
    >
      <span className="core-user-panel__avatar" aria-hidden="true">
        {initials}
      </span>

      <span className="core-user-panel__identity">
        <strong>Hola, {user.firstName}</strong>
        <span>
          {user.userPrincipalName || "Sesión de Power Apps"}
        </span>
      </span>

      <span
        className={[
          "core-user-panel__status",
          isPowerAppsContextAvailable
            ? "core-user-panel__status--online"
            : "core-user-panel__status--offline",
        ].join(" ")}
        aria-hidden="true"
      />
    </div>
  );
};

export default memo(CoreUserPanel);
