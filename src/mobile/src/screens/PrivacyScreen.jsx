import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

const SHEET_DISMISS_OFFSET = 460;
const USE_NATIVE_DRIVER = Platform.OS !== "web";
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

function ExportDataSheetIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 15V3M17 10L12 15L7 10M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
        stroke="#F26900"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MailEnvelopeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M3.33282 3.33398H16.6672C17.5878 3.33398 18.334 4.0801 18.334 5.00048V14.9995C18.334 15.9199 17.5878 16.666 16.6672 16.666H3.33282C2.41227 16.666 1.66602 15.9199 1.66602 14.9995V5.00048C1.66602 4.0801 2.41227 3.33398 3.33282 3.33398Z"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.334 5.83373L10.8409 10.6058C10.5913 10.7532 10.3004 10.8312 10.0038 10.8312C9.70715 10.8312 9.41621 10.7532 9.16662 10.6058L1.66602 5.83373"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SuccessCheckCircleIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 44 44" fill="none">
      <Path
        d="M22 41C32.4934 41 41 32.4934 41 22C41 11.5066 32.4934 3 22 3C11.5066 3 3 11.5066 3 22C3 32.4934 11.5066 41 22 41Z"
        stroke="#F26900"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11 22L18.7 29.7L33 14.3"
        stroke="#F26900"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
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
  const { auth } = useAuth();
  const [useLocation, setUseLocation] = useState(false);
  const [shareUsageData, setShareUsageData] = useState(false);
  const [copySheetVisible, setCopySheetVisible] = useState(false);
  const [copySheetStep, setCopySheetStep] = useState("review");

  const sheetTranslateY = useRef(new Animated.Value(SHEET_DISMISS_OFFSET)).current;

  const backdropOpacity = sheetTranslateY.interpolate({
    inputRange: [0, SHEET_DISMISS_OFFSET],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const verifiedEmail = auth?.user?.email || "marina@email.com";

  const openCopySheet = () => {
    setCopySheetStep("review");
    sheetTranslateY.setValue(SHEET_DISMISS_OFFSET);
    setCopySheetVisible(true);
    requestAnimationFrame(() => {
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 24,
        stiffness: 220,
        mass: 0.9,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    });
  };

  const closeCopySheet = (onClosed) => {
    Animated.timing(sheetTranslateY, {
      toValue: SHEET_DISMISS_OFFSET,
      duration: 220,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      setCopySheetVisible(false);
      setCopySheetStep("review");
      if (typeof onClosed === "function") {
        onClosed();
      }
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        } else {
          sheetTranslateY.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.65) {
          closeCopySheet();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            damping: 24,
            stiffness: 240,
            mass: 0.9,
            useNativeDriver: USE_NATIVE_DRIVER,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 24,
          stiffness: 240,
          mass: 0.9,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      },
    }),
  ).current;

  const handleDragResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        } else {
          sheetTranslateY.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 75 || gestureState.vy > 0.55) {
          closeCopySheet();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            damping: 24,
            stiffness: 240,
            mass: 0.9,
            useNativeDriver: USE_NATIVE_DRIVER,
          }).start();
        }
      },
    }),
  ).current;

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

  const handleConfirmCopyRequest = () => {
    setCopySheetStep("received");
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
                className="min-h-[94px] flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white p-4 active:opacity-90"
                onPress={openCopySheet}
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
                className="min-h-[94px] flex-row items-center gap-3 rounded-[14px] border border-[#EBCFCC] bg-[#FFF9F8] p-4 active:opacity-90"
                onPress={() => navigation.navigate("DeleteAccount")}
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

      {/* Painel inferior: Solicitar cópia dos dados (Figma 2100:241 / 2100:297) */}
      <Modal
        animationType="none"
        onRequestClose={() => closeCopySheet()}
        transparent
        visible={copySheetVisible}
      >
        <View className="flex-1 justify-end">
          {/* Backdrop animado */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              opacity: backdropOpacity,
            }}
          >
            <Pressable
              accessibilityLabel="Fechar painel"
              className="flex-1"
              onPress={() => closeCopySheet()}
            />
          </Animated.View>

          {/* Painel deslizante com suporte a arrastar para baixo */}
          <Animated.View
            {...panResponder.panHandlers}
            style={{
              width: "100%",
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Math.max(insets.bottom, 28),
              transform: [{ translateY: sheetTranslateY }],
              shadowColor: "#000000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Indicador / alça arrastável do painel — pad 12/0/24/0 */}
            <View
              {...handleDragResponder.panHandlers}
              className="items-center pb-6 pt-3"
              style={{ cursor: "grab" }}
            >
              <View className="h-[5px] w-9 rounded-full bg-[#D9D9D3]" />
            </View>

            {/* Conteúdo do painel com altura fixa (325px) para manter o modal exatamente na mesma altura nas duas etapas */}
            <View className="px-5" style={{ height: 325, justifyContent: "space-between" }}>
              {copySheetStep === "review" ? (
                <>
                  {/* Apresentação — gap 12 */}
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-[#FFF4E8]">
                      <ExportDataSheetIcon />
                    </View>
                    <Text className="flex-1 font-inter-bold text-[22px] leading-[28px] text-[#1F1F1F]">
                      Solicitar cópia dos dados
                    </Text>
                  </View>

                  {/* Explicação */}
                  <View>
                    <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
                      Vamos solicitar uma cópia dos dados vinculados à sua conta. Ela será enviada ao seu e-mail verificado.
                    </Text>
                  </View>

                  {/* Destino da cópia — somente leitura — r=14, fill #FAFAF8, border #E8E8E0, pad 16, gap 12 */}
                  <View className="flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-[#FAFAF8] p-4">
                    <MailEnvelopeIcon />
                    <View className="flex-1 gap-1.5">
                      <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">
                        E-mail verificado
                      </Text>
                      <Text className="font-inter-semibold text-[16px] leading-[22px] text-[#1F1F1F]">
                        {verifiedEmail}
                      </Text>
                    </View>
                  </View>

                  {/* Orientação para alterar e-mail */}
                  <View>
                    <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                      {"Para usar outro e-mail, altere o endereço em "}
                      <Text
                        className="font-inter-semibold text-[#1F1F1F]"
                        onPress={() => {
                          closeCopySheet(() => navigation.navigate("PersonalData"));
                        }}
                      >
                        Dados pessoais
                      </Text>
                      {" e verifique o novo e-mail."}
                    </Text>
                  </View>

                  {/* Ações da solicitação — h=54, gap 12 */}
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      accessibilityRole="button"
                      className="h-[54px] w-[112px] items-center justify-center rounded-[12px] border border-[#E8E8E0] bg-white active:opacity-80"
                      onPress={() => closeCopySheet()}
                    >
                      <Text className="font-inter-semibold text-[15px] leading-[18px] text-[#1F1F1F]">
                        Cancelar
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      className="h-[54px] flex-1 items-center justify-center rounded-[12px] bg-[#F26900] active:opacity-90"
                      onPress={handleConfirmCopyRequest}
                    >
                      <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                        Solicitar cópia
                      </Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                /* Etapa 2: Solicitação recebida (Figma 2100:537 encaixada proporcionalmente em 325px) */
                <>
                  {/* Símbolo de sucesso proporcional */}
                  <View className="items-center">
                    <View
                      className="items-center justify-center rounded-full bg-[#FFF4E8]"
                      style={{ width: 66, height: 66 }}
                    >
                      <SuccessCheckCircleIcon />
                    </View>
                  </View>

                  {/* Mensagem de sucesso */}
                  <View className="items-center gap-1.5">
                    <Text className="text-center font-inter-extrabold text-[24px] leading-[28px] text-[#1F1F1F]">
                      Solicitação recebida
                    </Text>
                    <Text className="text-center font-sans text-[13px] leading-[19px] text-[#555555]">
                      Recebemos sua solicitação de cópia dos dados. A cópia será preparada e enviada ao seu e-mail verificado.
                    </Text>
                  </View>

                  {/* Destino da cópia — r=14, border #E8E8E0, bg #FFFFFF */}
                  <View className="flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white px-4 py-3">
                    <MailEnvelopeIcon />
                    <View className="flex-1 gap-1">
                      <Text className="font-sans text-[12px] leading-[16px] text-[#555555]">
                        E-mail verificado
                      </Text>
                      <Text className="font-inter-semibold text-[14px] leading-[18px] text-[#1F1F1F]">
                        {verifiedEmail}
                      </Text>
                    </View>
                  </View>

                  {/* Botão OK — h=54, fill #F26900 */}
                  <Pressable
                    accessibilityRole="button"
                    className="h-[54px] w-full items-center justify-center rounded-[12px] bg-[#F26900] active:opacity-90"
                    onPress={() => closeCopySheet()}
                  >
                    <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                      OK
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
