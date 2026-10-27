import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { resetPassword } from "../services/password-reset-api";

export function ResetPasswordScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const token = route.params?.token || (Platform.OS === "web" ? new URLSearchParams(window.location.search).get("token") : "");

  async function handleSubmit() {
    setError("");
    if (!token) {
      setError("O link de redefinição é inválido ou expirou.");
      return;
    }
    if (password.length < 12) {
      setError("A senha deve ter pelo menos 12 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigation.replace("Login", { passwordResetCompleted: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Não foi possível redefinir a senha.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}>
        <View className="flex-1 items-center px-[35px] pt-[180px]">
          <Text className="text-center text-[22px] text-ink">Redefina sua senha</Text>
          <Text className="mt-3 max-w-[320px] text-center text-base leading-5 text-ink">
            Crie uma nova senha para acessar sua conta.
          </Text>
          <View className="mt-10 w-[218px] gap-[37px]">
            <TextField label="Nova senha" onChangeText={setPassword} onToggleSecure={() => setSecurePassword((current) => !current)} secureTextEntry={securePassword} value={password} />
            <TextField label="Confirmar senha" onChangeText={setConfirmation} secureTextEntry={securePassword} value={confirmation} />
            <Text className={`-mt-5 min-h-4 text-center text-xs ${error ? "text-red-700" : "text-transparent"}`}>{error || " "}</Text>
            <PrimaryButton disabled={submitting} onPress={handleSubmit}>Redefinir senha</PrimaryButton>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
