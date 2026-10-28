import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/auth-api";
import { fetchProfile, updateProfile } from "../services/profile-api";
import { clearAuth, loadAuth, saveAuth } from "../storage/auth-storage";
import { loadCurrentStore, saveCurrentStore } from "../storage/store-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [currentStore, setCurrentStoreState] = useState(null);

  useEffect(() => {
    loadAuth()
      .then(async (storedAuth) => {
        if (!storedAuth) return;
        setAuth(storedAuth);
        if (storedAuth.token) {
          try {
            const user = await fetchProfile(storedAuth.token);
            const merged = {
              ...storedAuth,
              user: { ...(storedAuth.user || {}), ...user },
            };
            await saveAuth(merged);
            setAuth(merged);
          } catch {
            // mantém os dados armazenados se a API não responder
          }
        }
      })
      .catch(() => {});
    loadCurrentStore().then(setCurrentStoreState).catch(() => setCurrentStoreState(null));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await loginRequest(email, password);
    let user = result.user || null;
    if (!user && result.token) {
      try {
        user = await fetchProfile(result.token);
      } catch {
        // fallback
      }
    }
    const nextAuth = user ? { ...result, user } : result;
    await saveAuth(nextAuth);
    setAuth(nextAuth);
    return nextAuth;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth?.token) return null;
    try {
      const user = await fetchProfile(auth.token);
      const nextAuth = {
        ...auth,
        user: { ...(auth.user || {}), ...user },
      };
      await saveAuth(nextAuth);
      setAuth(nextAuth);
      return nextAuth.user;
    } catch {
      return auth?.user || null;
    }
  }, [auth]);

  const updateUserProfile = useCallback(
    async ({ name, email, phone }) => {
      if (!auth?.token) {
        const localUser = {
          ...(auth?.user || {}),
          name,
          email,
          phone,
        };
        const nextAuth = { ...(auth || {}), user: localUser };
        await saveAuth(nextAuth);
        setAuth(nextAuth);
        return localUser;
      }

      const updatedUser = await updateProfile(auth.token, { name, email });
      const mergedUser = {
        ...(auth.user || {}),
        ...updatedUser,
        phone: typeof phone === "string" ? phone : auth.user?.phone,
      };
      const nextAuth = { ...auth, user: mergedUser };
      await saveAuth(nextAuth);
      setAuth(nextAuth);
      return mergedUser;
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    await clearAuth();
    setAuth(null);
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
      refreshProfile,
      setCurrentStore,
      signIn,
      signOut,
      updateUserProfile,
    }),
    [auth, currentStore, refreshProfile, setCurrentStore, signIn, signOut, updateUserProfile],
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
