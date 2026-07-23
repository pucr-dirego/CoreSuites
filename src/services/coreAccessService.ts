import { RetrieveAadUserSetOfPrivilegesByNamesService } from "../generated/services/RetrieveAadUserSetOfPrivilegesByNamesService";
import { WhoAmIService } from "../generated/services/WhoAmIService";
import type {
  CoreAccessSnapshot,
  CoreCapabilities,
  CoreDataverseIdentity,
  CoreGrantedPrivilege,
} from "../interfaces/coreAccess";

/**
 * Privilegio marcador del perfil de TI.
 *
 * Este nombre fue confirmado directamente por Dataverse en el error 403:
 * missing prvReadcr22e_RazonSocial.
 *
 * El rol Core - Usuario general NO debe contenerlo.
 * El rol Core - Administrador de TI SÍ debe contenerlo.
 */
export const CORE_IT_PROFILE_PRIVILEGE = "prvReadcr22e_RazonSocial";

const CORE_PROFILE_PRIVILEGES = [CORE_IT_PROFILE_PRIVILEGE] as const;

const GENERAL_CAPABILITIES: CoreCapabilities = {
  canUseGeneralForms: true,
  canUseITForms: false,
  canViewBilling: false,
  canManageInventory: false,
  canManageSuppliers: false,
  canUseDataQuality: false,
  canAccessAdministration: false,
};

const IT_CAPABILITIES: CoreCapabilities = {
  canUseGeneralForms: true,
  canUseITForms: true,
  canViewBilling: true,
  canManageInventory: true,
  canManageSuppliers: true,
  canUseDataQuality: true,
  canAccessAdministration: true,
};

let cachedAccessRequest: Promise<CoreAccessSnapshot> | null = null;
let cachedDirectoryObjectId = "";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const getCaseInsensitiveValue = (
  record: Record<string, unknown>,
  key: string,
): unknown => {
  if (key in record) {
    return record[key];
  }

  const normalizedKey = key.toLocaleLowerCase("en-US");
  const matchedKey = Object.keys(record).find(
    (candidate) => candidate.toLocaleLowerCase("en-US") === normalizedKey,
  );

  return matchedKey ? record[matchedKey] : undefined;
};

const getOperationPayload = (result: unknown): Record<string, unknown> => {
  if (!isRecord(result)) {
    throw new Error("Dataverse devolvió una respuesta no reconocida.");
  }

  const success = getCaseInsensitiveValue(result, "success");

  if (success === false) {
    const error = getCaseInsensitiveValue(result, "error");
    const message = isRecord(error)
      ? normalizeString(getCaseInsensitiveValue(error, "message"))
      : normalizeString(error);

    throw new Error(message || "Dataverse rechazó la operación de seguridad.");
  }

  const value = getCaseInsensitiveValue(result, "value");

  if (isRecord(value)) {
    return value;
  }

  const data = getCaseInsensitiveValue(result, "data");

  if (isRecord(data)) {
    return data;
  }

  return result;
};

const parseWhoAmI = (result: unknown): CoreDataverseIdentity => {
  const payload = getOperationPayload(result);

  const identity: CoreDataverseIdentity = {
    userId: normalizeString(getCaseInsensitiveValue(payload, "UserId")),
    businessUnitId: normalizeString(
      getCaseInsensitiveValue(payload, "BusinessUnitId"),
    ),
    organizationId: normalizeString(
      getCaseInsensitiveValue(payload, "OrganizationId"),
    ),
  };

  if (!identity.userId) {
    throw new Error("WhoAmI no devolvió el identificador del usuario.");
  }

  return identity;
};

const parseGrantedPrivileges = (result: unknown): CoreGrantedPrivilege[] => {
  const payload = getOperationPayload(result);
  const rolePrivileges = getCaseInsensitiveValue(payload, "RolePrivileges");

  if (!Array.isArray(rolePrivileges)) {
    return [];
  }

  return rolePrivileges
    .filter(isRecord)
    .map((privilege) => ({
      privilegeName: normalizeString(
        getCaseInsensitiveValue(privilege, "PrivilegeName"),
      ),
      privilegeId: normalizeString(
        getCaseInsensitiveValue(privilege, "PrivilegeId"),
      ),
      businessUnitId: normalizeString(
        getCaseInsensitiveValue(privilege, "BusinessUnitId"),
      ),
      depth: normalizeString(getCaseInsensitiveValue(privilege, "Depth")),
    }))
    .filter((privilege) => Boolean(privilege.privilegeName));
};

const createFallbackSnapshot = (): CoreAccessSnapshot => ({
  profile: "general",
  capabilities: GENERAL_CAPABILITIES,
  dataverseIdentity: null,
  grantedPrivileges: [],
  checkedAt: new Date().toISOString(),
  source: "fallback",
});

const requestAccessSnapshot = async (
  directoryObjectId: string,
): Promise<CoreAccessSnapshot> => {
  const normalizedDirectoryObjectId = directoryObjectId
    .trim()
    .replace(/[{}]/g, "");

  if (!normalizedDirectoryObjectId) {
    return createFallbackSnapshot();
  }

  const [whoAmIResult, privilegesResult] = await Promise.allSettled([
    WhoAmIService.WhoAmI(),
    RetrieveAadUserSetOfPrivilegesByNamesService.RetrieveAadUserSetOfPrivilegesByNames(
      normalizedDirectoryObjectId,
      [...CORE_PROFILE_PRIVILEGES],
    ),
  ]);

  let dataverseIdentity: CoreDataverseIdentity | null = null;

  if (whoAmIResult.status === "fulfilled") {
    try {
      dataverseIdentity = parseWhoAmI(whoAmIResult.value);
    } catch (error) {
      console.warn("CoreAccess: WhoAmI devolvió un formato inesperado.", error);
    }
  } else {
    console.warn("CoreAccess: WhoAmI no pudo completarse.", whoAmIResult.reason);
  }

  if (privilegesResult.status === "rejected") {
    throw privilegesResult.reason;
  }

  const grantedPrivileges = parseGrantedPrivileges(privilegesResult.value);
  const hasITProfilePrivilege = grantedPrivileges.some(
    (privilege) =>
      privilege.privilegeName.toLocaleLowerCase("en-US") ===
      CORE_IT_PROFILE_PRIVILEGE.toLocaleLowerCase("en-US"),
  );

  return {
    profile: hasITProfilePrivilege ? "it-admin" : "general",
    capabilities: hasITProfilePrivilege
      ? IT_CAPABILITIES
      : GENERAL_CAPABILITIES,
    dataverseIdentity,
    grantedPrivileges,
    checkedAt: new Date().toISOString(),
    source: "dataverse",
  };
};

export const getCoreAccessSnapshot = (
  directoryObjectId: string,
  forceRefresh = false,
): Promise<CoreAccessSnapshot> => {
  const normalizedDirectoryObjectId = directoryObjectId
    .trim()
    .replace(/[{}]/g, "");

  if (
    forceRefresh ||
    cachedDirectoryObjectId !== normalizedDirectoryObjectId
  ) {
    cachedAccessRequest = null;
    cachedDirectoryObjectId = normalizedDirectoryObjectId;
  }

  if (!cachedAccessRequest) {
    cachedAccessRequest = requestAccessSnapshot(
      normalizedDirectoryObjectId,
    ).catch((error) => {
      cachedAccessRequest = null;
      throw error;
    });
  }

  return cachedAccessRequest;
};

export const getGeneralAccessFallback = createFallbackSnapshot;
