import { Pressable, Text, TextInput, View } from "react-native";

export function SearchBar({ value, onChangeText, onClear }) {
  return (
    <View className="mt-6 h-11 flex-row items-center rounded-[14px] border border-[#e8e8e0] px-3">
      <Text className="mr-2 text-base text-achai">⌕</Text>
      <TextInput
        accessibilityLabel="Buscar produtos"
        autoCapitalize="none"
        className="font-sans flex-1 text-sm text-ink"
        onChangeText={onChangeText}
        placeholder="Busque por produto ou categoria"
        placeholderTextColor="#777"
        returnKeyType="search"
        value={value}
      />
      {value ? (
        <Pressable accessibilityLabel="Limpar busca" className="px-1" onPress={onClear}>
          <Text className="font-inter-semibold text-sm text-[#777]">×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
