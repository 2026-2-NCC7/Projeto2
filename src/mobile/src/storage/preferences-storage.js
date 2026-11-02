import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFERENCES_KEY = "achai.preferences";

export async function loadPreferences() {
  const value = await AsyncStorage.getItem(PREFERENCES_KEY);
  return value ? JSON.parse(value) : null;
}

export async function savePreferences(preferences) {
  await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
