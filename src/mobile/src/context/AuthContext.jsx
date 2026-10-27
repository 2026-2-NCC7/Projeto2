import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/auth-api";
import { saveAuth } from "../storage/auth-storage";
import { loadCurrentStore, saveCurrentStore } from "../storage/store-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [currentStore, setCurrentStoreState] = useState(null);

  useEffect(() => {
    loadCurrentStore().then(setCurrentStoreState).catch(() => setCurrentStoreState(null));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await loginRequest(email, password);
    await saveAuth(result);
    setAuth(result);
    return result;
  }, []);

  const setCurrentStore = useCallback(async (store) => {
    await saveCurrentStore(store);
    setCurrentStoreState(store);
  }, []);

  const value = useMemo(
    () => ({
      auth,
      currentStore,
      currentStoreId: currentStore?.id || null,
      setCurrentStore,
      signIn,
    }),
    [auth, currentStore, setCurrentStore, signIn],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }
  return context;
}
