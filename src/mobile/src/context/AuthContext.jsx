import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { loginRequest } from "../services/auth-api";
import { saveAuth } from "../storage/auth-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  const signIn = useCallback(async (email, password) => {
    const result = await loginRequest(email, password);
    await saveAuth(result);
    setAuth(result);
    return result;
  }, []);

  const value = useMemo(() => ({ auth, signIn }), [auth, signIn]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de AuthProvider.");
  }
  return context;
}
