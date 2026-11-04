import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACTIVE_ROUTE_KEY = "achai.activeRouteSession";

function isWeb() {
  return Platform.OS === "web";
}

export async function saveActiveRouteSession(session) {
  if (!session) {
    return clearActiveRouteSession();
  }
  const value = JSON.stringify({
    ...session,
    updatedAt: session.updatedAt || new Date().toISOString(),
  });
  try {
    if (isWeb()) {
      window.localStorage.setItem(ACTIVE_ROUTE_KEY, value);
      return;
    }
    await SecureStore.setItemAsync(ACTIVE_ROUTE_KEY, value);
  } catch {
    // ignore storage errors
  }
}

export async function loadActiveRouteSession() {
  try {
    const value = isWeb()
      ? window.localStorage.getItem(ACTIVE_ROUTE_KEY)
      : await SecureStore.getItemAsync(ACTIVE_ROUTE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function clearActiveRouteSession() {
  try {
    if (isWeb()) {
      window.localStorage.removeItem(ACTIVE_ROUTE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(ACTIVE_ROUTE_KEY);
  } catch {
    // ignore storage errors
  }
}
