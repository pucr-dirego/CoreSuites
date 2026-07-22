import { getContext } from "@microsoft/power-apps/app";
import type { CoreUserIdentity } from "../interfaces/coreUser";

const CONTEXT_TIMEOUT_MS = 15000;

let cachedContextRequest: Promise<CoreUserIdentity> | null = null;

const normalizeValue = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const getFirstName = (
  fullName: string,
  userPrincipalName: string
): string => {
  const normalizedFullName = fullName.trim();

  if (normalizedFullName) {
    return normalizedFullName.split(/\s+/)[0];
  }

  const normalizedUserPrincipalName = userPrincipalName.trim();

  if (normalizedUserPrincipalName) {
    return normalizedUserPrincipalName.split("@")[0];
  }

  return "usuario";
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: number | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "Power Apps no respondió a tiempo al solicitar el contexto del usuario."
        )
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

const requestPowerAppsContext = async (): Promise<CoreUserIdentity> => {
  const context = await withTimeout(getContext(), CONTEXT_TIMEOUT_MS);

  const fullName = normalizeValue(context.user.fullName);
  const userPrincipalName = normalizeValue(
    context.user.userPrincipalName
  );

  return {
    fullName: fullName || userPrincipalName || "Usuario de Core",
    firstName: getFirstName(fullName, userPrincipalName),
    userPrincipalName,
    objectId: normalizeValue(context.user.objectId),
    tenantId: normalizeValue(context.user.tenantId),
    appId: normalizeValue(context.app.appId),
    environmentId: normalizeValue(context.app.environmentId),
    sessionId: normalizeValue(context.host.sessionId),
    loadedAt: new Date().toISOString(),
  };
};

export const getCoreUserIdentity = (
  forceRefresh = false
): Promise<CoreUserIdentity> => {
  if (forceRefresh) {
    cachedContextRequest = null;
  }

  if (!cachedContextRequest) {
    cachedContextRequest = requestPowerAppsContext().catch((error) => {
      cachedContextRequest = null;
      throw error;
    });
  }

  return cachedContextRequest;
};


