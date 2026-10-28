import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

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

function VerifiedBadgeIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5Z"
        fill="#F26900"
        stroke="#FFFFFF"
        strokeWidth={3}
      />
      <Path
        d="M7.80005 12.1L10.5 14.8L16.2 9.09998"
        stroke="#FFFFFF"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function UserRoundIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9.99998 10.8333C12.3009 10.8333 14.1662 8.96785 14.1662 6.66667C14.1662 4.36548 12.3009 2.5 9.99998 2.5C7.69903 2.5 5.83373 4.36548 5.83373 6.66667C5.83373 8.96785 7.69903 10.8333 9.99998 10.8333ZM9.99998 10.8333C11.7679 10.8333 13.4634 11.5357 14.7136 12.786C15.9637 14.0362 16.666 15.7319 16.666 17.5M9.99998 10.8333C8.23205 10.8333 6.53653 11.5357 5.28641 12.786C4.03629 14.0362 3.33398 15.7319 3.33398 17.5"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckSmallIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <Path
        d="M10.8328 3.25L4.87505 9.2079L2.16699 6.49976"
        stroke="#F26900"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.334 5.83373L10.8409 10.6058C10.5866 10.7534 10.2978 10.8312 10.0038 10.8312C9.70971 10.8312 9.42089 10.7534 9.16662 10.6058L1.66602 5.83373M18.334 5.83373V5.00048C18.334 4.0801 17.5878 3.33398 16.6672 3.33398H3.33282C2.41227 3.33398 1.66602 4.0801 1.66602 5.00048V5.83373M18.334 5.83373V14.9995C18.334 15.9199 17.5878 16.666 16.6672 16.666H3.33282C2.41227 16.666 1.66602 15.9199 1.66602 14.9995V5.83373"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PhoneIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M11.5268 13.807C11.6989 13.886 11.8928 13.9041 12.0766 13.8582C12.2603 13.8123 12.423 13.7052 12.5377 13.5545L12.8336 13.1669C12.9888 12.9599 13.1902 12.7919 13.4216 12.6762C13.653 12.5605 13.9083 12.5002 14.167 12.5002H16.6672C17.1093 12.5002 17.5332 12.6758 17.8458 12.9884C18.1584 13.301 18.334 13.725 18.334 14.167V16.6672C18.334 17.1093 18.1584 17.5332 17.8458 17.8458C17.5332 18.1584 17.1093 18.334 16.6672 18.334C12.6886 18.334 8.87304 16.7535 6.05977 13.9403C3.24649 11.127 1.66602 7.31138 1.66602 3.33282C1.66602 2.89075 1.84162 2.4668 2.15421 2.15421C2.4668 1.84162 2.89075 1.66602 3.33282 1.66602H5.83302C6.27508 1.66602 6.69904 1.84162 7.01162 2.15421C7.32421 2.4668 7.49982 2.89075 7.49982 3.33282V5.83302C7.49982 6.09178 7.43957 6.34699 7.32385 6.57843C7.20812 6.80988 7.04011 7.0112 6.8331 7.16646L6.44306 7.45898C6.29007 7.5758 6.18223 7.74199 6.13787 7.92931C6.0935 8.11663 6.11536 8.31353 6.19971 8.48656C7.3387 10.8 9.21197 12.6709 11.5268 13.807Z"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PersonalDataScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const emailInputRef = useRef(null);

  const [fullName, setFullName] = useState(auth?.user?.name || "Marina Ferreira");
  const [email, setEmail] = useState(auth?.user?.email || "marina@email.com");
  const [phone, setPhone] = useState("(11) 99999-4820");

  const initials =
    fullName
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

  const handleSave = () => {
    Alert.alert("Dados atualizados", "Suas informações de cadastro foram salvas com sucesso.");
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

        {/* Informações pessoais — pad 8/20/32/20, gap 24 */}
        <View className="gap-6 px-5 pb-8 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-achai">Dados pessoais</Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Confira e atualize suas informações de cadastro.
            </Text>
          </View>

          {/* Conta — h=90, r=14, pad 16, gap 16, border #E8E8E0 */}
          <View className="h-[90px] flex-row items-center gap-4 rounded-[14px] border border-[#E8E8E0] bg-white p-4">
            <View className="relative h-[58px] w-[58px] items-center justify-center rounded-full bg-[#FFF4E8]">
              <Text className="font-inter-semibold text-[22px] leading-[27px] text-achai">{initials}</Text>
              <View style={{ position: "absolute", right: -6, bottom: -6 }}>
                <VerifiedBadgeIcon />
              </View>
            </View>

            <View className="flex-1 gap-[7px]">
              <Text className="font-inter-semibold text-[16px] leading-[19px] text-ink" numberOfLines={1}>
                {fullName || "Marina Ferreira"}
              </Text>
              <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">
                Conta verificada
              </Text>
            </View>
          </View>

          {/* Formulário de dados pessoais — gap 24 */}
          <View className="gap-6">
            {/* Nome completo — gap 8 */}
            <View className="gap-2">
              <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">Nome completo</Text>
              <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
                <UserRoundIcon />
                <TextInput
                  className="flex-1 p-0 font-sans text-[15px] leading-[18px] text-ink"
                  onChangeText={setFullName}
                  placeholder="Seu nome completo"
                  placeholderTextColor="#8B8983"
                  value={fullName}
                />
              </View>
            </View>

            {/* E-mail da conta — gap 8 */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">E-mail</Text>
                <View className="flex-row items-center gap-1 rounded-full bg-[#FFF4E8] px-2 py-1">
                  <CheckSmallIcon />
                  <Text className="font-inter-semibold text-[11px] leading-[13px] text-achai">Verificado</Text>
                </View>
              </View>

              <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
                <MailIcon />
                <TextInput
                  ref={emailInputRef}
                  autoCapitalize="none"
                  className="flex-1 p-0 font-sans text-[15px] leading-[18px] text-ink"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="seu@email.com"
                  placeholderTextColor="#8B8983"
                  value={email}
                />
                <Pressable hitSlop={8} onPress={() => emailInputRef.current?.focus()}>
                  <Text className="font-inter-semibold text-[13px] leading-[16px] text-achai">Alterar</Text>
                </Pressable>
              </View>

              <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                Ao alterar o e-mail, será necessário verificar o novo endereço.
              </Text>
            </View>

            {/* Telefone — gap 8 */}
            <View className="gap-2">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">Telefone</Text>
                <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">(opcional)</Text>
              </View>

              <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
                <PhoneIcon />
                <TextInput
                  className="flex-1 p-0 font-sans text-[15px] leading-[18px] text-ink"
                  keyboardType="phone-pad"
                  onChangeText={setPhone}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor="#8B8983"
                  value={phone}
                />
              </View>

              <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                Você pode deixar este campo em branco.
              </Text>
            </View>
          </View>

          {/* Ações — padTop 4, gap 12 */}
          <View className="gap-3 pt-1">
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
              onPress={handleSave}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">Salvar alterações</Text>
            </Pressable>
            <Text className="text-center font-sans text-[12px] leading-[18px] text-[#555555]">
              As alterações só serão aplicadas ao salvar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
