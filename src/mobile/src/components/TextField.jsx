import { Pressable, Text, TextInput, View } from "react-native";

export function TextField({ label, onChangeText, secureTextEntry, value, onToggleSecure, ...props }) {
  return (
    <View className="relative">
      <TextInput
        accessibilityLabel={label}
        className="h-[44px] rounded-[17px] bg-achai px-[21px] font-inter-semibold text-[10.93px] text-ink"
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor="#1F1F1F"
        secureTextEntry={secureTextEntry}
        value={value}
        {...props}
      />
      {onToggleSecure ? (
        <Pressable className="absolute right-3 top-0 h-11 justify-center" onPress={onToggleSecure}>
          <Text className="font-sans text-[10px] text-ink">{secureTextEntry ? "Mostrar" : "Ocultar"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
