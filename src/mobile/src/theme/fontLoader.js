import { useFonts } from "expo-font";
import { appFonts } from "./fonts";

export function useAppFonts() {
  return useFonts(appFonts);
}
