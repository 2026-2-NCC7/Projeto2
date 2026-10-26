import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORE_KEY = "achai.currentStore";
const STORE_ID_KEY = "achai.currentStoreId";

function isWeb() {
  return Platform.OS === "web";
}

export async function saveCurrentStore(store) {
  const value = JSON.stringify(store);
  if (isWeb()) {
    window.localStorage.setItem(STORE_KEY, value);
    window.localStorage.setItem(STORE_ID_KEY, store.id);
    return;
  }
  await SecureStore.setItemAsync(STORE_KEY, value);
  await SecureStore.setItemAsync(STORE_ID_KEY, store.id);
}

export async function loadCurrentStore() {
  const value = isWeb()
    ? window.localStorage.getItem(STORE_KEY)
    : await SecureStore.getItemAsync(STORE_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearCurrentStore() {
  if (isWeb()) {
    window.localStorage.removeItem(STORE_KEY);
    window.localStorage.removeItem(STORE_ID_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(STORE_KEY);
  await SecureStore.deleteItemAsync(STORE_ID_KEY);
}
