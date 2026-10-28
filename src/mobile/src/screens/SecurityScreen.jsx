import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

const stroke = { strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="#1F1F1F"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color = "#B73832" }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M6.75 13.5L11.25 9L6.75 4.5" stroke={color} {...stroke} />
    </Svg>
  );
}

function LockKeyholeIcon() {
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
      <Path
        d="M8.94456 4.22995C10.8857 3.99861 12.8492 4.40898 14.5352 5.39842C16.2212 6.38786 17.5371 7.90198 18.2819 9.70956C18.3514 9.89667 18.3514 10.1025 18.2819 10.2896C17.9757 11.0322 17.5709 11.7301 17.0786 12.3648M11.7368 11.7985C11.2653 12.2539 10.6338 12.5059 9.97832 12.5002C9.32284 12.4945 8.69582 12.2316 8.2323 11.768C7.76879 11.3045 7.50587 10.6774 7.50018 10.0219C7.49448 9.36632 7.74646 8.73477 8.20185 8.26322M14.5654 14.5827C13.46 15.2376 12.2267 15.647 10.9491 15.7831C9.67154 15.9193 8.37964 15.779 7.16105 15.3718C5.94247 14.9647 4.82572 14.3001 3.88658 13.4232C2.94744 12.5464 2.20789 11.4778 1.7181 10.2899C1.64865 10.1028 1.64865 9.89693 1.7181 9.70982C2.45695 7.91789 3.75697 6.41393 5.42305 5.42364M1.66683 1.66602L18.3333 18.334"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function ShieldCheckIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M6.75011 8.99975L8.24996 10.4998L11.2497 7.49971M14.9993 9.75012C14.9993 13.5002 12.3746 15.3753 9.25486 16.4628C9.0915 16.5182 8.91405 16.5156 8.75241 16.4553C5.62523 15.3753 3.00049 13.5002 3.00049 9.75012V4.49995C3.00049 4.30103 3.0795 4.11026 3.22014 3.9696C3.36077 3.82894 3.55152 3.74992 3.75041 3.74992C5.25026 3.74992 7.12508 2.84989 8.42995 1.70986C8.58882 1.5741 8.79092 1.49951 8.99989 1.49951C9.20885 1.49951 9.41096 1.5741 9.56983 1.70986C10.8822 2.85739 12.7495 3.74992 14.2494 3.74992C14.4483 3.74992 14.639 3.82894 14.7796 3.9696C14.9203 4.11026 14.9993 4.30103 14.9993 4.49995V9.75012Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function SmartphoneIcon({ color = "#555555" }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 15.0004H10.0083M5.83287 1.66602H14.1672C15.0877 1.66602 15.834 2.41227 15.834 3.33282V16.6672C15.834 17.5878 15.0877 18.334 14.1672 18.334H5.83287C4.91229 18.334 4.16602 17.5878 4.16602 16.6672V3.33282C4.16602 2.41227 4.91229 1.66602 5.83287 1.66602Z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function MonitorIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M6.66642 17.5H10M10 17.5H13.3336M10 17.5V14.1667M10 14.1667H16.6672C17.5878 14.1667 18.334 13.4205 18.334 12.5V4.16667C18.334 3.24619 17.5878 2.5 16.6672 2.5H3.33282C2.41227 2.5 1.66602 3.24619 1.66602 4.16667V12.5C1.66602 13.4205 2.41227 14.1667 3.33282 14.1667H10Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function LogOutIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.3333 5.83333L17.5 10L13.3333 14.1667M17.5 10H7.5M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5"
        stroke="#B73832"
        {...stroke}
      />
    </Svg>
  );
}

function PasswordInput({ label, value, onChangeText, visible, onToggleVisible }) {
  return (
    <View className="gap-2">
      <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">{label}</Text>
      <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
        <LockKeyholeIcon />
        <TextInput
          autoCapitalize="none"
          className="flex-1 p-0 font-sans text-[15px] leading-[18px] text-ink"
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          value={value}
        />
        <Pressable
          accessibilityLabel={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
          hitSlop={8}
          onPress={onToggleVisible}
        >
          <EyeOffIcon />
        </Pressable>
      </View>
    </View>
  );
}

export function SecurityScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("••••••••••");
  const [newPassword, setNewPassword] = useState("••••••••••");
  const [confirmPassword, setConfirmPassword] = useState("••••••••••");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const userName = auth?.user?.name || "Marina Ferreira";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "MF";

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Profile");
    }
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Senhas diferentes", "A confirmação da nova senha não coincide.");
      return;
    }
    Alert.alert("Senha atualizada", "Sua senha foi alterada com sucesso.");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho — h=64, pad 0/20 */}
        <View
          className="h-16 flex-row items-center justify-between px-5"
          style={{ marginTop: Math.max(insets.top, 44) }}
        >
          <Pressable
            accessibilityLabel="Voltar ao perfil"
            className="h-11 flex-row items-center gap-1.5"
            onPress={handleGoBack}
          >
            <ChevronLeftIcon />
            <Text className="font-inter-medium text-[14px] leading-[17px] text-ink">Meu perfil</Text>
          </Pressable>
          <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
        </View>

        {/* Senha e acesso — pad 8/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">Segurança</Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Gerencie sua senha e os acessos à sua conta.
            </Text>

            {/* Conta — padTop 4, gap 8 */}
            <View className="flex-row items-center gap-2 pt-1">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#FFF4E8]">
                <Text className="font-inter-semibold text-[11px] leading-[13px] text-achai">{initials}</Text>
              </View>
              <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">{userName}</Text>
            </View>
          </View>

          {/* Trocar senha — gap 20 */}
          <View className="gap-5">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">Trocar senha</Text>

            {/* Senha atual e recuperação — gap 4 */}
            <View className="gap-1">
              <PasswordInput
                label="Senha atual"
                onChangeText={setCurrentPassword}
                onToggleVisible={() => setShowCurrent((v) => !v)}
                value={currentPassword}
                visible={showCurrent}
              />
              <Pressable
                accessibilityRole="button"
                className="h-10 justify-center self-start"
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text className="font-inter-semibold text-[13px] leading-[16px] text-achai">
                  Esqueci minha senha atual
                </Text>
              </Pressable>
            </View>

            {/* Nova senha */}
            <PasswordInput
              label="Nova senha"
              onChangeText={setNewPassword}
              onToggleVisible={() => setShowNew((v) => !v)}
              value={newPassword}
              visible={showNew}
            />

            {/* Confirmar nova senha */}
            <PasswordInput
              label="Confirmar nova senha"
              onChangeText={setConfirmPassword}
              onToggleVisible={() => setShowConfirm((v) => !v)}
              value={confirmPassword}
              visible={showConfirm}
            />

            {/* Orientação de segurança — r=12, fill #FAFAF8, pad 14, gap 10 */}
            <View className="flex-row gap-2.5 rounded-[12px] bg-[#FAFAF8] p-3.5">
              <View className="pt-0.5">
                <ShieldCheckIcon />
              </View>
              <Text className="flex-1 font-sans text-[12px] leading-[18px] text-[#555555]">
                Prefira uma senha que você não use em outros serviços. Evite nomes e datas fáceis de adivinhar.
              </Text>
            </View>

            {/* Atualizar senha */}
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
              onPress={handleUpdatePassword}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">Atualizar senha</Text>
            </Pressable>
          </View>

          {/* Divisor de seções */}
          <View className="h-[1px] bg-[#E8E8E0]" />

          {/* Sessões de acesso — gap 14 */}
          <View className="gap-3.5">
            {/* Orientação da seção — gap 6 */}
            <View className="gap-1.5">
              <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">Acessos à conta</Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Exemplos ilustrativos abaixo. Não representam acessos reais à sua conta.
              </Text>
            </View>

            {/* Exemplos de sessões — r=14, border #E8E8E0 */}
            <View className="overflow-hidden rounded-[14px] border border-[#E8E8E0] bg-white">
              {/* Sessão 1: Este aparelho */}
              <View className="min-h-[75px] flex-row items-center gap-3 p-4">
                <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF4E8]">
                  <SmartphoneIcon color="#F26900" />
                </View>
                <View className="flex-1 gap-[5px]">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
                      Este aparelho
                    </Text>
                    <View className="rounded-full bg-[#FFF4E8] px-2 py-1">
                      <Text className="font-inter-semibold text-[10px] leading-[12px] text-achai">
                        Atual
                      </Text>
                    </View>
                  </View>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    App Ach.ai · Sessão atual de exemplo
                  </Text>
                </View>
              </View>

              {/* Sessão 2: Outro celular */}
              <View className="min-h-[72px] flex-row items-center gap-3 border-t border-[#E8E8E0] p-4">
                <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-[#FAFAF8]">
                  <SmartphoneIcon color="#555555" />
                </View>
                <View className="flex-1 gap-[5px]">
                  <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
                    Outro celular
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    App Ach.ai · Exemplo de outro acesso
                  </Text>
                </View>
              </View>

              {/* Sessão 3: Computador */}
              <View className="min-h-[72px] flex-row items-center gap-3 border-t border-[#E8E8E0] p-4">
                <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-[#FAFAF8]">
                  <MonitorIcon />
                </View>
                <View className="flex-1 gap-[5px]">
                  <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
                    Computador
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Navegador · Exemplo de outro acesso
                  </Text>
                </View>
              </View>
            </View>

            {/* Encerrar outras sessões */}
            <Pressable
              accessibilityRole="button"
              className="min-h-[94px] flex-row items-center gap-3 rounded-[14px] border border-[#EBCFCC] bg-[#FFF9F8] p-4"
              onPress={() =>
                Alert.alert(
                  "Encerrar outras sessões",
                  "Deseja desconectar os outros aparelhos e manter o acesso apenas neste aparelho?",
                )
              }
            >
              <LogOutIcon />
              <View className="flex-1 gap-1.5">
                <Text className="font-inter-semibold text-[14px] leading-[20px] text-[#B73832]">
                  Encerrar outras sessões
                </Text>
                <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                  Sair dos outros aparelhos e manter o acesso neste aparelho.
                </Text>
              </View>
              <ChevronRightIcon color="#B73832" />
            </Pressable>

            <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
              Você revisará e confirmará na próxima etapa. Nenhuma sessão será encerrada agora.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
