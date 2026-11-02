import AsyncStorage from "@react-native-async-storage/async-storage";

const PRIVACY_CHOICES_KEY = "achai.privacy-choices";

export async function loadPrivacyChoices() {
  const value = await AsyncStorage.getItem(PRIVACY_CHOICES_KEY);
  return value ? JSON.parse(value) : null;
}

export async function savePrivacyChoices(choices) {
  await AsyncStorage.setItem(PRIVACY_CHOICES_KEY, JSON.stringify(choices));
}
