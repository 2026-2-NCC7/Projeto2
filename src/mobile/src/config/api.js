import { Platform } from "react-native";

const PRODUCTION_API_URL = "https://achai-api-production.up.railway.app";
const developmentHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web" && typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (!isLocalhost) {
      return PRODUCTION_API_URL;
    }
  }

  return `http://${developmentHost}:3000`;
}

export const API_BASE_URL = resolveApiBaseUrl();
