import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { requestPasswordReset } from "../services/password-reset-api";

export function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Informe um e-mail válido.");
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      navigation.replace("ForgotPasswordConfirmation");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível solicitar a redefinição.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center px-[35px] pt-[180px]">
          <Brand />
          <Text className="mt-7 text-center text-[22px] leading-7 text-ink">Esqueci minha senha</Text>
          <Text className="mt-3 max-w-[320px] text-center text-base leading-5 text-ink">
            Digite seu e-mail para receber um link de redefinição.
          </Text>
          <Text className="mt-7 text-center text-base text-ink">Recuperar acesso</Text>

          <View className="mt-6 w-[218px] gap-[37px]">
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="E-mail"
              onChangeText={setEmail}
              value={email}
            />
            <Text className={`-mt-5 min-h-4 text-center text-xs ${error ? "text-red-700" : "text-transparent"}`}>
              {error || " "}
            </Text>
            <PrimaryButton disabled={submitting} onPress={handleSubmit}>Solicitar redefinição</PrimaryButton>
          </View>

          <Pressable className="mt-[208px]" onPress={() => navigation.navigate("Login")}>
            <Text className="text-center text-base font-semibold text-ink underline">Voltar ao login</Text>
          </Pressable>
          <Text className="mt-7 max-w-[300px] text-center text-[10px] leading-3 text-ink">
            Ao continuar, você concorda com os <Text className="underline">Termos e a Política de Privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
