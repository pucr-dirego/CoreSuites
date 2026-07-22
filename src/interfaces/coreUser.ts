export type CoreUserIdentity = {
  fullName: string;
  firstName: string;
  userPrincipalName: string;
  objectId: string;
  tenantId: string;
  appId: string;
  environmentId: string;
  sessionId: string;
  loadedAt: string;
};

export type CoreUserContextValue = {
  user: CoreUserIdentity | null;
  isLoading: boolean;
  error: string | null;
  isPowerAppsContextAvailable: boolean;
  reloadUserContext: () => Promise<void>;
};

