import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { useAuth } from "../context/AuthContext";

function getLoginErrorMessage(requestError) {
  const message = requestError instanceof Error ? requestError.message : "";
  if (/invalid (?:email|name) or password/i.test(message)) {
    return "E-mail ou senha inválidos.";
  }
  return message || "Não foi possível entrar.";
}

export function LoginScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (route.params?.registrationCompleted) {
      setError("Conta criada com sucesso. Faça login para continuar.");
      navigation.setParams({ registrationCompleted: undefined });
    }
  }, [navigation, route.params?.registrationCompleted]);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }
    if (password.length < 12) {
      setError("A senha deve ter pelo menos 12 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      setPassword("");
      navigation.replace("Home");
    } catch (requestError) {
      setError(getLoginErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center px-[35px] pt-[136px]">
          <Brand />
          <Text className="font-sans mt-7 text-center text-[22px] leading-7 text-ink">Sua compra, no seu ritmo.</Text>
          <Text className="font-sans mt-3 max-w-[320px] text-center text-xs leading-4 text-ink">
            Entre para salvar listas de compras e personalizar sua jornada.
          </Text>
          <Text className="font-sans mt-7 text-center text-base text-ink">Acesse sua conta</Text>

          <View className="mt-6 w-[218px] gap-[37px]">
            <TextField autoCapitalize="none" autoComplete="email" keyboardType="email-address" label="E-mail" onChangeText={setEmail} value={email} />
            <TextField label="Senha" onChangeText={setPassword} onToggleSecure={() => setSecurePassword((current) => !current)} secureTextEntry={securePassword} value={password} />
            <Text className={`-mt-5 min-h-4 text-center text-xs ${error ? "text-red-700" : "text-transparent"}`}>
              {error || " "}
            </Text>
            <PrimaryButton disabled={submitting} onPress={handleSubmit}>Entrar</PrimaryButton>
          </View>

          <Pressable className="mt-7" onPress={() => navigation.navigate("ForgotPassword")}>
            <Text className="text-base font-semibold text-ink underline">Esqueci minha senha</Text>
          </Pressable>
          <Pressable className="mt-[108px]" onPress={() => navigation.navigate("Register")}>
            <Text className="text-center text-base font-semibold text-ink underline">Ainda não tem conta? Criar conta</Text>
          </Pressable>
          <Text className="mt-7 max-w-[300px] text-center text-[10px] leading-3 text-ink">
            Ao continuar, você concorda com os <Text className="underline">Termos e a Política de Privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
