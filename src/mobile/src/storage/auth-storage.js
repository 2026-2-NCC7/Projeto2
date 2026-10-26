import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_KEY = "achai.auth";

function isWeb() {
  return Platform.OS === "web";
}

export async function saveAuth(auth) {
  const value = JSON.stringify(auth);
  if (isWeb()) {
    window.localStorage.setItem(AUTH_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(AUTH_KEY, value);
}

export async function loadAuth() {
  const value = isWeb()
    ? window.localStorage.getItem(AUTH_KEY)
    : await SecureStore.getItemAsync(AUTH_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearAuth() {
  if (isWeb()) {
    window.localStorage.removeItem(AUTH_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(AUTH_KEY);
}
