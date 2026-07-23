export type CoreAccessProfile = "general" | "it-admin";

export type CoreCapability =
  | "canUseGeneralForms"
  | "canUseITForms"
  | "canViewBilling"
  | "canManageInventory"
  | "canManageSuppliers"
  | "canUseDataQuality"
  | "canAccessAdministration";

export type CoreCapabilities = Record<CoreCapability, boolean>;

export type CoreDataverseIdentity = {
  userId: string;
  businessUnitId: string;
  organizationId: string;
};

export type CoreGrantedPrivilege = {
  privilegeName: string;
  privilegeId: string;
  businessUnitId: string;
  depth: string;
};

export type CoreAccessSnapshot = {
  profile: CoreAccessProfile;
  capabilities: CoreCapabilities;
  dataverseIdentity: CoreDataverseIdentity | null;
  grantedPrivileges: CoreGrantedPrivilege[];
  checkedAt: string;
  source: "dataverse" | "fallback";
};

export type CoreAccessContextValue = CoreAccessSnapshot & {
  isLoading: boolean;
  error: string | null;
  reloadAccess: () => Promise<void>;
};
