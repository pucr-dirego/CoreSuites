import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CoreAccessContextValue,
  CoreAccessSnapshot,
} from "../interfaces/coreAccess";
import {
  getCoreAccessSnapshot,
  getGeneralAccessFallback,
} from "../services/coreAccessService";
import { useCoreUser } from "../hooks/useCoreUser";

export const CoreAccessContext =
  createContext<CoreAccessContextValue | null>(null);

type CoreAccessProviderProps = {
  children: ReactNode;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No fue posible validar los privilegios del usuario.";
};

export const CoreAccessProvider = ({
  children,
}: CoreAccessProviderProps) => {
  const {
    user,
    isLoading: isUserLoading,
    error: userError,
  } = useCoreUser();

  const [snapshot, setSnapshot] = useState<CoreAccessSnapshot>(
    getGeneralAccessFallback,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccess = useCallback(
    async (forceRefresh = false) => {
      if (isUserLoading) {
        return;
      }

      if (!user?.objectId || userError) {
        setSnapshot(getGeneralAccessFallback());
        setError(
          userError ||
            "No se obtuvo el identificador de Microsoft Entra. Core usará el perfil general.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextSnapshot = await getCoreAccessSnapshot(
          user.objectId,
          forceRefresh,
        );
        setSnapshot(nextSnapshot);
      } catch (loadError) {
        console.error("CoreAccess: error validando privilegios.", loadError);
        setSnapshot(getGeneralAccessFallback());
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    }, [isUserLoading, user?.objectId, userError]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  const reloadAccess = useCallback(async () => {
    await loadAccess(true);
  }, [loadAccess]);

  const value = useMemo<CoreAccessContextValue>(
    () => ({
      ...snapshot,
      isLoading,
      error,
      reloadAccess,
    }),
    [error, isLoading, reloadAccess, snapshot],
  );

  return (
    <CoreAccessContext.Provider value={value}>
      {children}
    </CoreAccessContext.Provider>
  );
};
