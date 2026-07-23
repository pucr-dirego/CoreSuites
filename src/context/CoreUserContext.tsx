import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  CoreUserContextValue,
  CoreUserIdentity,
} from "../interfaces/coreUser";
import { getCoreUserIdentity } from "../services/coreUserContextService"

type CoreUserProviderProps = {
  children: ReactNode;
};

export const CoreUserContext =
  createContext<CoreUserContextValue | null>(null);

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "No fue posible obtener el contexto del usuario.";
};

export const CoreUserProvider = ({
  children,
}: CoreUserProviderProps) => {
  const [user, setUser] = useState<CoreUserIdentity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserContext = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const identity = await getCoreUserIdentity(forceRefresh);
      setUser(identity);
    } catch (loadError) {
      setUser(null);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialContext = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const identity = await getCoreUserIdentity();

        if (isMounted) {
          setUser(identity);
        }
      } catch (loadError) {
        if (isMounted) {
          setUser(null);
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialContext();

    return () => {
      isMounted = false;
    };
  }, []);

  const reloadUserContext = useCallback(async () => {
    await loadUserContext(true);
  }, [loadUserContext]);

  const value = useMemo<CoreUserContextValue>(
    () => ({
      user,
      isLoading,
      error,
      isPowerAppsContextAvailable: Boolean(user && !error),
      reloadUserContext,
    }),
    [error, isLoading, reloadUserContext, user]
  );

  return (
    <CoreUserContext.Provider value={value}>
      {children}
    </CoreUserContext.Provider>
  );
};