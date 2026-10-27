import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brand } from "../components/Brand";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextField } from "../components/TextField";
import { registerRequest } from "../services/registration-api";

function getRegistrationErrorMessage(requestError) {
  const message = requestError instanceof Error ? requestError.message : "";
  if (/already exists/i.test(message)) {
    return "Este e-mail já está cadastrado.";
  }
  if (/valid administrator email/i.test(message)) {
    return "Informe um e-mail válido.";
  }
  if (/name must be between/i.test(message)) {
    return "O nome deve ter entre 2 e 120 caracteres.";
  }
  return message || "Não foi possível criar sua conta.";
}

export function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securePassword, setSecurePassword] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError("");
    if (!name.trim() || !email.trim() || !password) {
      setError("Preencha seu nome, e-mail e senha.");
      return;
    }
    if (password.length < 12) {
      setError("A senha deve ter pelo menos 12 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await registerRequest(name.trim(), email.trim(), password);
      navigation.replace("Login", { registrationCompleted: true });
    } catch (requestError) {
      setError(getRegistrationErrorMessage(requestError));
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
        <View className="flex-1 items-center px-[35px] pt-[180px]">
          <Brand />
          <Text className="font-sans mt-7 text-center text-[22px] leading-7 text-ink">Crie sua conta</Text>
          <Text className="font-sans mt-3 max-w-[320px] text-center text-xs leading-4 text-ink">
            Cadastre-se para salvar listas de compras e personalizar sua jornada.
          </Text>
          <Text className="font-sans mt-7 text-center text-base text-ink">Crie sua conta</Text>

          <View className="mt-6 w-[218px] gap-[37px]">
            <TextField
              autoCapitalize="words"
              autoComplete="name"
              label="Nome"
              onChangeText={setName}
              value={name}
            />
            <TextField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="E-mail"
              onChangeText={setEmail}
              value={email}
            />
            <TextField
              label="Senha"
              onChangeText={setPassword}
              onToggleSecure={() => setSecurePassword((current) => !current)}
              secureTextEntry={securePassword}
              value={password}
            />
            <Text className={`-mt-5 min-h-4 text-center text-xs ${error ? "text-red-700" : "text-transparent"}`}>
              {error || " "}
            </Text>
            <PrimaryButton disabled={submitting} onPress={handleSubmit}>Cadastrar</PrimaryButton>
          </View>

          <Pressable className="mt-[65px]" onPress={() => navigation.navigate("Login")}>
            <Text className="text-center text-base font-semibold text-ink underline">
              Já possui cadastro? Entrar
            </Text>
          </Pressable>
          <Text className="mt-7 max-w-[300px] text-center text-[10px] leading-3 text-ink">
            Ao continuar, você concorda com os <Text className="underline">Termos e a Política de Privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
