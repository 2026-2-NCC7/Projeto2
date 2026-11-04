import { Pressable, Text, TextInput, View } from "react-native";

export function TextField({ label, onChangeText, secureTextEntry, value, onToggleSecure, ...props }) {
  return (
    <View className="relative w-full">
      <TextInput
        accessibilityLabel={label}
        className={`h-[54px] w-full rounded-[12px] bg-achai px-[16px] font-sans text-[15px] text-ink ${
          onToggleSecure ? "pr-[64px]" : ""
        }`}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#1F1F1F"
        secureTextEntry={secureTextEntry}
        value={value}
        {...props}
      />
      {onToggleSecure ? (
        <Pressable className="absolute right-4 top-0 h-[54px] justify-center" onPress={onToggleSecure}>
          <Text className="font-sans text-xs text-ink">{secureTextEntry ? "Mostrar" : "Ocultar"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
