import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

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

function ChevronRightIcon({ color = "#F26900" }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M6.75 13.5L11.25 9L6.75 4.5" stroke={color} {...stroke} />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.00011 12.0004V9.00011M9.00011 5.99987H9.00761M16.5007 9.00011C16.5007 13.1426 13.1426 16.5007 9.00011 16.5007C4.85764 16.5007 1.49951 13.1426 1.49951 9.00011C1.49951 4.85764 4.85764 1.49951 9.00011 1.49951C13.1426 1.49951 16.5007 4.85764 16.5007 9.00011Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function DownloadIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 12.5V2.5M14.1667 8.33333L10 12.5L5.83333 8.33333M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function TrashIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M8.33333 9.16662V14.167M11.6667 9.16662V14.167M15.8333 4.99962V16.6672C15.8333 17.1093 15.6577 17.5332 15.3452 17.8458C15.0326 18.1584 14.6087 18.334 14.1667 18.334H5.83333C5.39131 18.334 4.96738 18.1584 4.65482 17.8458C4.34226 17.5332 4.16667 17.1093 4.16667 16.6672V4.99962M15.8333 4.99962H13.3333M15.8333 4.99962H17.5M4.16667 4.99962H2.5M4.16667 4.99962H6.66667M6.66667 4.99962H13.3333M6.66667 4.99962V3.33282C6.66667 2.89075 6.84226 2.4668 7.15482 2.15421C7.46738 1.84162 7.89131 1.66602 8.33333 1.66602H11.6667C12.1087 1.66602 12.5326 1.84162 12.8452 2.15421C13.1577 2.4668 13.3333 2.89075 13.3333 3.33282V4.99962"
        stroke="#B73832"
        {...stroke}
      />
    </Svg>
  );
}

function FileTextIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M11.6665 1.66602H5.00048C4.5585 1.66602 4.13462 1.84163 3.82209 2.15421C3.50956 2.4668 3.33398 2.89076 3.33398 3.33282V16.6672C3.33398 17.1093 3.50956 17.5332 3.82209 17.8458C4.13462 18.1584 4.5585 18.334 5.00048 18.334H14.9995C15.4415 18.334 15.8653 18.1584 16.1779 17.8458C16.4904 17.5332 16.666 17.1093 16.666 16.6672V6.66642M11.6665 1.66602C11.9303 1.66559 12.1915 1.71736 12.4352 1.81834C12.6789 1.91932 12.9002 2.06752 13.0863 2.2544L16.076 5.24464C16.2634 5.43091 16.412 5.65246 16.5132 5.89649C16.6145 6.14052 16.6664 6.4022 16.666 6.66642M11.6665 1.66602V5.83301C11.6665 6.05405 11.7543 6.26602 11.9105 6.42232C12.0668 6.57861 12.2787 6.66641 12.4997 6.66641L16.666 6.66642M8.33348 7.49981H6.66698M13.333 10.8334H6.66698M13.333 14.167H6.66698"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function PrivacyToggle({ value, onToggle, label }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className={`h-7 w-[46px] justify-center rounded-full p-[3px] ${
        value ? "items-end bg-achai" : "items-start bg-[#D9D9D3]"
      }`}
      onPress={onToggle}
    >
      <View className="h-[22px] w-[22px] rounded-full bg-white" />
    </Pressable>
  );
}

export function PrivacyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [useLocation, setUseLocation] = useState(false);
  const [shareUsageData, setShareUsageData] = useState(false);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Profile");
    }
  };

  const handleSave = () => {
    Alert.alert("Escolhas salvas", "Suas preferências de privacidade foram atualizadas.");
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

        {/* Controle de dados — pad 8/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">
              Privacidade e dados
            </Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Escolha o que compartilhar e gerencie as solicitações sobre seus dados.
            </Text>
          </View>

          {/* Controles de privacidade — gap 14 */}
          <View className="gap-3.5">
            {/* Orientação da seção — gap 6 */}
            <View className="gap-1.5">
              <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">Suas escolhas</Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Os usos abaixo são opcionais. Você pode recusar ou mudar de ideia depois.
              </Text>
            </View>

            {/* Opções de uso de dados — r=14, border #E8E8E0 */}
            <View className="overflow-hidden rounded-[14px] border border-[#E8E8E0] bg-white">
              {/* Preferência 1: Usar minha localização */}
              <View className="gap-2.5 p-4">
                <View className="flex-row items-center gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                      Usar minha localização
                    </Text>
                    <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">
                      {useLocation ? "Ativado · Opcional" : "Desativado · Opcional"}
                    </Text>
                  </View>
                  <PrivacyToggle
                    label="Usar minha localização"
                    onToggle={() => setUseLocation((v) => !v)}
                    value={useLocation}
                  />
                </View>

                <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                  Encontre supermercados próximos. Se preferir, busque por bairro ou endereço.
                </Text>

                {/* Permissão do celular — r=8, fill #FAFAF8, pad 12, gap 4 */}
                <View className="gap-1 rounded-[8px] bg-[#FAFAF8] p-3">
                  <Text className="font-inter-semibold text-[12px] leading-[15px] text-ink">
                    Permissão do celular: não verificada
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Ativar esta preferência não concede acesso. A localização também depende da permissão nos ajustes do celular.
                  </Text>
                </View>
              </View>

              {/* Preferência 2: Compartilhar dados de uso */}
              <View className="gap-2.5 border-t border-[#E8E8E0] p-4">
                <View className="flex-row items-center gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                      Compartilhar dados de uso
                    </Text>
                    <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">
                      {shareUsageData ? "Ativado · Opcional" : "Desativado · Opcional"}
                    </Text>
                  </View>
                  <PrivacyToggle
                    label="Compartilhar dados de uso"
                    onToggle={() => setShareUsageData((v) => !v)}
                    value={shareUsageData}
                  />
                </View>

                <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                  Compartilhe informações sobre como você usa o app para ajudar a melhorar o Ach.ai.
                </Text>
              </View>
            </View>

            {/* Salvar escolhas — gap 10 */}
            <View className="gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
                onPress={handleSave}
              >
                <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                  Salvar escolhas
                </Text>
              </Pressable>
              <Text className="text-center font-sans text-[12px] leading-[18px] text-[#555555]">
                As alterações só serão aplicadas ao salvar.
              </Text>
            </View>

            {/* Dados necessários ao funcionamento — r=12, fill #FAFAF8, pad 14, gap 10 */}
            <View className="flex-row gap-2.5 rounded-[12px] bg-[#FAFAF8] p-3.5">
              <View className="pt-0.5">
                <InfoIcon />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-inter-semibold text-[13px] leading-[16px] text-ink">
                  Para o app funcionar
                </Text>
                <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                  Dados de cadastro e das suas listas são necessários para usar a conta e salvar compras. Eles não fazem parte das escolhas opcionais acima.
                </Text>
              </View>
            </View>
          </View>

          {/* Direitos e solicitações — gap 14 */}
          <View className="gap-3.5">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
              Seus dados, seus direitos
            </Text>

            <View className="gap-3">
              {/* Solicitar cópia dos dados */}
              <Pressable
                accessibilityRole="button"
                className="min-h-[94px] flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white p-4"
                onPress={() =>
                  Alert.alert(
                    "Solicitar cópia dos dados",
                    "Sua solicitação de cópia dos dados vinculados à conta foi registrada.",
                  )
                }
              >
                <DownloadIcon />
                <View className="flex-1 gap-1.5">
                  <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                    Solicitar cópia dos dados
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Peça uma cópia dos dados vinculados à sua conta.
                  </Text>
                </View>
                <ChevronRightIcon color="#F26900" />
              </Pressable>

              {/* Solicitar exclusão da conta */}
              <Pressable
                accessibilityRole="button"
                className="min-h-[94px] flex-row items-center gap-3 rounded-[14px] border border-[#EBCFCC] bg-[#FFF9F8] p-4"
                onPress={() =>
                  Alert.alert(
                    "Solicitar exclusão da conta",
                    "Tem certeza de que deseja iniciar a solicitação de exclusão da sua conta?",
                  )
                }
              >
                <TrashIcon />
                <View className="flex-1 gap-1.5">
                  <Text className="font-inter-semibold text-[14px] leading-[20px] text-[#B73832]">
                    Solicitar exclusão da conta
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Peça a exclusão da sua conta e dos dados associados.
                  </Text>
                </View>
                <ChevronRightIcon color="#B73832" />
              </Pressable>
            </View>

            <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
              Você revisará e confirmará cada solicitação na próxima etapa. Nada é enviado ou excluído agora.
            </Text>
          </View>

          {/* Informações de privacidade — gap 14 */}
          <View className="gap-3.5">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">Saiba mais</Text>

            <Pressable
              accessibilityRole="button"
              className="min-h-[76px] flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white p-4"
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <FileTextIcon />
              <View className="flex-1 gap-1.5">
                <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                  Política de privacidade
                </Text>
                <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                  Entenda o uso dos dados e seus direitos.
                </Text>
              </View>
              <ChevronRightIcon color="#F26900" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
