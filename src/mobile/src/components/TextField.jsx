import { Pressable, Text, TextInput, View } from "react-native";

export function TextField({ label, onChangeText, secureTextEntry, value, onToggleSecure, ...props }) {
  return (
    <View className="relative">
      <TextInput
        accessibilityLabel={label}
        className="h-11 rounded-[17px] bg-achai px-[21px] text-[11px] font-semibold text-ink"
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#1F1F1F"
        secureTextEntry={secureTextEntry}
        value={value}
        {...props}
      />
      {onToggleSecure ? (
        <Pressable className="absolute right-3 top-0 h-11 justify-center" onPress={onToggleSecure}>
          <Text className="text-[10px] text-ink">{secureTextEntry ? "Mostrar" : "Ocultar"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
