import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";

export function ForgotPasswordConfirmationScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <View className="flex-1 items-center px-[35px] pt-[180px]">
        <Brand />
        <Text className="mt-7 text-center text-[22px] leading-7 text-ink">
          Esqueci minha senha
        </Text>
        <Text className="mt-3 max-w-[320px] text-center text-base leading-6 text-ink">
          Se o e-mail digitado corresponder a um comprador cadastrado, um link de redefinição de senha será enviado ao e-mail
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-7 h-[22px] flex-row items-center justify-center gap-1"
          onPress={() => navigation.navigate("Login")}
        >
          <Text className="text-base font-semibold text-ink">Voltar ao login</Text>
          <Text className="text-[22px] leading-5 text-ink">→</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
