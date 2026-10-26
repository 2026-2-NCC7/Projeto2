import { ActivityIndicator, Pressable, Text } from "react-native";

export function PrimaryButton({ children, disabled, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[44px] flex-row items-center justify-center rounded-[17px] bg-achai ${disabled ? "opacity-60" : ""}`}
      disabled={disabled}
      onPress={onPress}
    >
      {disabled ? <ActivityIndicator color="#1F1F1F" /> : <Text className="font-inter-semibold text-base text-ink">{children}  →</Text>}
    </Pressable>
  );
}
