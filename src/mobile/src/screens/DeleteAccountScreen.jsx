import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { requestAccountDeletion } from "../services/profile-api";

const stroke = {
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 15L7.5 10L12.5 5" stroke="#1F1F1F" {...stroke} />
    </Svg>
  );
}

function TriangleAlertIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10.0001 7.49919V10.8325M10.0001 14.1659H10.0084M18.1088 14.9994L11.4421 3.33271C11.2967 3.07621 11.0859 2.86286 10.8312 2.71443C10.5765 2.566 10.2869 2.48779 9.9921 2.48779C9.69727 2.48779 9.40773 2.566 9.15299 2.71443C8.89826 2.86286 8.68746 3.07621 8.5421 3.33271L1.87543 14.9994C1.7285 15.2538 1.65145 15.5426 1.6521 15.8365C1.65275 16.1303 1.73108 16.4187 1.87913 16.6726C2.02719 16.9264 2.23972 17.1365 2.49518 17.2817C2.75063 17.4269 3.03994 17.502 3.33376 17.4994H16.6671C16.9595 17.4991 17.2467 17.4218 17.4998 17.2754C17.753 17.129 17.9631 16.9186 18.1092 16.6653C18.2553 16.412 18.3321 16.1247 18.3321 15.8323C18.332 15.5399 18.255 15.2526 18.1088 14.9994Z"
        stroke="#B73832"
        {...stroke}
      />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M5.83333 8.33322V5.83302C5.83333 4.72786 6.27232 3.66797 7.05372 2.8865C7.83512 2.10504 8.89493 1.66602 10 1.66602C11.1051 1.66602 12.1649 2.10504 12.9463 2.8865C13.7277 3.66797 14.1667 4.72786 14.1667 5.83302V8.33322M5.83333 8.33322H4.16667C3.24619 8.33322 2.5 9.07947 2.5 10V16.6672C2.5 17.5878 3.24619 18.334 4.16667 18.334H15.8333C16.7538 18.334 17.5 17.5878 17.5 16.6672V10C17.5 9.07947 16.7538 8.33322 15.8333 8.33322H14.1667M5.83333 8.33322H14.1667M10.8333 13.3336C10.8333 13.7939 10.4602 14.167 10 14.167C9.53976 14.167 9.16667 13.7939 9.16667 13.3336C9.16667 12.8733 9.53976 12.5002 10 12.5002C10.4602 12.5002 10.8333 12.8733 10.8333 13.3336Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function EyeOffIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Defs>
        <ClipPath id="clip0_delete_account_eye">
          <Rect width={20} height={20} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_delete_account_eye)">
        <Path
          d="M8.94456 4.22995C10.8857 3.99861 12.8492 4.40898 14.5352 5.39842C16.2212 6.38786 17.5371 7.90198 18.2819 9.70956C18.3514 9.89667 18.3514 10.1025 18.2819 10.2896C17.9757 11.0322 17.5709 11.7301 17.0786 12.3648M11.7368 11.7985C11.2653 12.2539 10.6338 12.5059 9.97832 12.5002C9.32284 12.4945 8.69582 12.2316 8.2323 11.768C7.76879 11.3045 7.50587 10.6774 7.50018 10.0219C7.49448 9.36632 7.74646 8.73477 8.20185 8.26322M14.5654 14.5827C13.46 15.2376 12.2267 15.647 10.9491 15.7831C9.67154 15.9193 8.37964 15.779 7.16105 15.3718C5.94247 14.9647 4.82572 14.3001 3.88658 13.4232C2.94744 12.5464 2.20789 11.4778 1.7181 10.2899C1.64865 10.1028 1.64865 9.89693 1.7181 9.70982C2.45695 7.91789 3.75697 6.41393 5.42305 5.42364M1.66683 1.66602L18.3333 18.334"
          stroke="#555555"
          {...stroke}
        />
      </G>
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.7181 9.70982C2.45695 7.91789 3.75697 6.41393 5.42305 5.42364C7.08914 4.43334 9.03525 4.0085 10.9675 4.21359C12.8998 4.41868 14.7163 5.24277 16.1424 6.56125C17.5685 7.87974 18.5305 9.62272 18.882 11.5268M12.5 10C12.5 11.3807 11.3807 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

export function DeleteAccountScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth, signOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Privacy");
    }
  };

  const handleRequestDeletion = async () => {
    if (submitting) return;
    if (!currentPassword.trim()) {
      Alert.alert(
        "Campo obrigatório",
        "Para enviar a solicitação, informe sua senha atual.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await requestAccountDeletion(auth?.token, { currentPassword });
      await signOut();
      Alert.alert(
        "Solicitação enviada",
        "Recebemos sua solicitação de exclusão da conta. Seu acesso foi encerrado.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }],
      );
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert(
        "Não foi possível excluir",
        error.message || "Verifique sua senha atual e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho — h=64, pad 0/20 */}
        <View
          className="h-16 flex-row items-center justify-between px-5"
          style={{ marginTop: Math.max(insets.top, 44) }}
        >
          <Pressable
            accessibilityLabel="Voltar para privacidade e dados"
            className="h-11 flex-row items-center gap-1.5"
            onPress={handleGoBack}
          >
            <ChevronLeftIcon />
            <Text className="font-inter-medium text-[14px] leading-[17px] text-[#1F1F1F]">
              Privacidade e dados
            </Text>
          </Pressable>
          <Text className="font-brand text-[22px] leading-[26px] text-[#1F1F1F]">Ach.ai</Text>
        </View>

        {/* Revisão da solicitação — pad 8/20/28/20, gap 28 */}
        <View className="gap-7 px-5 pb-7 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-[#1F1F1F]">
              {"Solicitar exclusão\nda conta"}
            </Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Envie uma solicitação para excluir sua conta do Ach.ai e os dados associados.
            </Text>
          </View>

          {/* Consequências da exclusão — gap 14 */}
          <View className="gap-3.5">
            {/* Dados e acesso — r=14, border #E8E8E0, pad 16, gap 10 */}
            <View className="gap-2.5 rounded-[14px] border border-[#E8E8E0] bg-white p-4">
              <Text className="font-inter-bold text-[18px] leading-[22px] text-[#1F1F1F]">
                O que será excluído
              </Text>
              <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
                Seu perfil, suas listas de compras e suas preferências vinculadas à conta.
              </Text>
              <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
                Após a exclusão, você não poderá acessar essa conta nem recuperar suas listas e preferências.
              </Text>
            </View>

            {/* Ressalva sobre obrigações aplicáveis */}
            <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
              Algumas informações poderão ser mantidas para cumprir obrigações legais ou regulatórias aplicáveis.
            </Text>
          </View>

          {/* Aviso de irreversibilidade — r=14, fill #FFF9F8, border #EBCFCC, pad 16, gap 10 */}
          <View className="flex-row items-start gap-2.5 rounded-[14px] border border-[#EBCFCC] bg-[#FFF9F8] p-4">
            <View className="pt-0.5">
              <TriangleAlertIcon />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-inter-bold text-[14px] leading-[20px] text-[#B73832]">
                Após a conclusão, não há como desfazer
              </Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Quando a exclusão for concluída, sua conta e os dados excluídos não poderão ser recuperados.
              </Text>
            </View>
          </View>
        </View>

        {/* Identidade e envio — pad 0/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8">
          {/* Confirmar identidade — gap 14 */}
          <View className="gap-3.5">
            {/* Orientação de segurança — gap 6 */}
            <View className="gap-1.5">
              <Text className="font-inter-bold text-[18px] leading-[22px] text-[#1F1F1F]">
                Confirme sua identidade
              </Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Para enviar a solicitação, informe sua senha atual. Este campo é obrigatório.
              </Text>
            </View>

            {/* Senha e recuperação — gap 4 */}
            <View className="gap-1">
              {/* Campo de senha — gap 8 */}
              <View className="gap-2">
                <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]">
                  Senha atual *
                </Text>

                {/* Entrada mascarada — h=54, r=12, fill #FAFAF8, border #E8E8E0, pad 0/16, gap 12 */}
                <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
                  <LockIcon />
                  <TextInput
                    accessibilityLabel="Senha atual"
                    autoCapitalize="none"
                    className="flex-1 font-sans text-[15px] leading-[18px] text-[#1F1F1F]"
                    onChangeText={setCurrentPassword}
                    placeholder="••••••••••"
                    placeholderTextColor="#555555"
                    secureTextEntry={!showPassword}
                    style={{ outlineStyle: "none" }}
                    value={currentPassword}
                  />
                  <Pressable
                    accessibilityLabel={showPassword ? "Mostrar senha" : "Ocultar senha"}
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </Pressable>
                </View>
              </View>

              {/* Recuperar acesso — h=40 */}
              <Pressable
                accessibilityRole="button"
                className="h-10 justify-center self-start"
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text className="font-inter-semibold text-[13px] leading-[16px] text-[#F26900]">
                  Esqueci minha senha
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Ações da solicitação — gap 12 */}
          <View className="gap-3">
            {/* Manter minha conta — h=54, fill #F26900, r=12 */}
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] bg-[#F26900] active:opacity-90"
              onPress={handleGoBack}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                Manter minha conta
              </Text>
            </Pressable>

            {/* Solicitar exclusão — h=54, fill #FFF9F8, border #EBCFCC, r=12 */}
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] border border-[#EBCFCC] bg-[#FFF9F8] active:opacity-80"
              disabled={submitting}
              onPress={handleRequestDeletion}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-[#B73832]">
                {submitting ? "Enviando..." : "Solicitar exclusão"}
              </Text>
            </Pressable>

            {/* Distinção entre solicitação e conclusão */}
            <Text className="text-center font-sans text-[12px] leading-[18px] text-[#555555]">
              A solicitação não significa que a exclusão já foi concluída.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
