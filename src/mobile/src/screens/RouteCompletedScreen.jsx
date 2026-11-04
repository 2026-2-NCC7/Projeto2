import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { clearActiveRouteSession } from "../storage/route-session-storage";

const productImages = {
  banana: require("../assets/products/banana.png"),
  leite: require("../assets/products/leite.png"),
  arroz: require("../assets/products/arroz.png"),
  ovos: require("../assets/products/ovos.png"),
  cafe: require("../assets/products/cafe.png"),
  detergente: require("../assets/products/detergente.png"),
};

function getProductImage(name = "") {
  const lower = String(name).toLowerCase();
  if (lower.includes("leite") || lower.includes("queijo")) return productImages.leite;
  if (lower.includes("banana") || lower.includes("tomate") || lower.includes("horti")) return productImages.banana;
  if (lower.includes("café") || lower.includes("cafe")) return productImages.cafe;
  if (lower.includes("ovo")) return productImages.ovos;
  if (lower.includes("detergente") || lower.includes("sabão") || lower.includes("sabao") || lower.includes("carvão")) {
    return productImages.detergente;
  }
  return productImages.arroz;
}

const RISING_BUBBLES = [
  { id: 1, left: "8%", size: 42, delay: 0, duration: 1550, drift: -16, type: "coin" },
  { id: 2, left: "21%", size: 34, delay: 140, duration: 1650, drift: 14, type: "check" },
  { id: 3, left: "34%", size: 48, delay: 60, duration: 1500, drift: -12, type: "bag" },
  { id: 4, left: "48%", size: 38, delay: 240, duration: 1700, drift: 18, type: "coin" },
  { id: 5, left: "63%", size: 44, delay: 90, duration: 1580, drift: -18, type: "sparkle" },
  { id: 6, left: "76%", size: 36, delay: 200, duration: 1620, drift: 12, type: "coin" },
  { id: 7, left: "86%", size: 40, delay: 110, duration: 1520, drift: -14, type: "bag" },
  { id: 8, left: "15%", size: 32, delay: 420, duration: 1600, drift: 10, type: "sparkle" },
  { id: 9, left: "55%", size: 46, delay: 380, duration: 1550, drift: -15, type: "coin" },
  { id: 10, left: "72%", size: 34, delay: 470, duration: 1650, drift: 15, type: "check" },
];

function CoinIllustration({ size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <Circle cx="14" cy="14" r="12" fill="#FFD166" stroke="#FFFFFF" strokeWidth="2" />
      <Circle cx="14" cy="14" r="8.5" stroke="#F26900" strokeWidth="1.5" strokeDasharray="3 2" />
      <Path
        d="M14 9V19M11.5 11.5C11.5 10.4 12.6 9.8 14 9.8C15.4 9.8 16.3 10.5 16.3 11.6C16.3 12.7 15.3 13.2 14 13.6C12.7 14 11.5 14.5 11.5 15.8C11.5 17 12.6 17.8 14 17.8C15.5 17.8 16.5 17 16.5 15.9"
        stroke="#B85000"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function BagIllustration({ size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 7H18L19 20H5L6 7Z"
        fill="#FFFFFF"
        stroke="#FFF4E8"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <Path
        d="M9 7V5.5C9 3.84315 10.3431 2.5 12 2.5C13.6569 2.5 15 3.84315 15 5.5V7"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M9.5 13.5L11.2 15.2L14.8 11.5"
        stroke="#F26900"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SparkleIllustration({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
        fill="#FFE8C2"
      />
    </Svg>
  );
}

function CheckBadgeIllustration({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#FFFFFF" />
      <Path
        d="M8 12.3L10.8 15L16.2 9.5"
        stroke="#F26900"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeroCheckIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M11 22.5L18.5 30L33.5 14.5"
        stroke="#F26900"
        strokeWidth={4.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StoreMiniIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 22 22" fill="none">
      <Path
        d="M13.7501 19.2493V14.666C13.7501 14.4229 13.6535 14.1897 13.4816 14.0178C13.3097 13.8459 13.0765 13.7493 12.8334 13.7493H9.16675C8.92363 13.7493 8.69048 13.8459 8.51857 14.0178C8.34666 14.1897 8.25008 14.4229 8.25008 14.666V19.2493M16.2929 9.45014C16.1018 9.26721 15.8475 9.1651 15.5829 9.1651C15.3184 9.1651 15.064 9.26721 14.873 9.45014C14.4467 9.8567 13.8803 10.0835 13.2912 10.0835C12.7022 10.0835 12.1358 9.8567 11.7095 9.45014C11.5185 9.26748 11.2644 9.16554 11 9.16554C10.7357 9.16554 10.4816 9.26748 10.2905 9.45014C9.86425 9.85697 9.29763 10.084 8.70837 10.084C8.11911 10.084 7.55249 9.85697 7.1262 9.45014C6.93511 9.26721 6.68078 9.1651 6.41625 9.1651C6.15171 9.1651 5.89738 9.26721 5.70629 9.45014C5.29456 9.84304 4.75137 10.0687 4.18245 10.0831C4.00811 10.0876 3.83517 10.0721 3.66675 10.0378M3.66675 10.0378C3.28555 9.96011 2.92744 9.78604 2.6284 9.52841C2.19724 9.15694 1.91972 8.63834 1.84986 8.07353C1.78 7.50873 1.92279 6.93813 2.25045 6.47281L4.8987 2.63748C5.06674 2.38953 5.29296 2.18652 5.55758 2.04622C5.82221 1.90592 6.11718 1.83259 6.4167 1.83264H15.5834C15.882 1.83253 16.1762 1.90537 16.4402 2.04484C16.7043 2.18431 16.9303 2.38618 17.0986 2.63289L19.7524 6.47556C20.0801 6.94125 20.2227 7.51228 20.1524 8.07738C20.0821 8.64248 19.804 9.16116 19.3721 9.53236C19.0728 9.7896 18.7146 9.96325 18.3334 10.0405M3.66675 10.0378V10.037M3.66675 10.0378V17.4162C3.66675 17.9024 3.8599 18.3687 4.20372 18.7125C4.54754 19.0563 5.01385 19.2495 5.50008 19.2495H16.5001C16.9863 19.2495 17.4526 19.0563 17.7964 18.7125C18.1403 18.3687 18.3334 17.9024 18.3334 17.4162V10.0405M18.3334 10.0405C18.1646 10.0747 17.9912 10.09 17.8164 10.0853C17.2472 10.0699 16.7041 9.84318 16.2929 9.44922M18.3334 10.0405V10.037"
        stroke="#F26900"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RisingParticle({ item }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(item.delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: item.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [item.delay, item.duration, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [120, -480],
  });

  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, item.drift, item.drift * 0.4],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.2, 0.85, 1],
    outputRange: [0.4, 1.08, 1, 0.7],
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.15, 0.8, 1],
    outputRange: [0, 0.95, 0.85, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 40,
        left: item.left,
        width: item.size,
        height: item.size,
        borderRadius: item.size / 2,
        backgroundColor: "rgba(255, 255, 255, 0.18)",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    >
      {item.type === "coin" && <CoinIllustration size={Math.round(item.size * 0.68)} />}
      {item.type === "bag" && <BagIllustration size={Math.round(item.size * 0.62)} />}
      {item.type === "sparkle" && <SparkleIllustration size={Math.round(item.size * 0.6)} />}
      {item.type === "check" && <CheckBadgeIllustration size={Math.round(item.size * 0.62)} />}
    </Animated.View>
  );
}

export function RouteCompletedScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  const heroScale = useRef(new Animated.Value(0.5)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.65)).current;
  const summaryOpacity = useRef(new Animated.Value(0)).current;
  const summaryTranslateY = useRef(new Animated.Value(22)).current;

  const firstName = useMemo(() => {
    const rawName = auth?.user?.name || "Marina";
    return String(rawName).trim().split(/\s+/)[0] || "Marina";
  }, [auth?.user?.name]);

  const storeName = route?.params?.storeName || route?.params?.store?.name || "Mercado Liberdade";
  const listName = route?.params?.listName || route?.params?.list?.name || "Compra da semana";
  const stops = Array.isArray(route?.params?.stops) ? route.params.stops : [];
  const totalCount = route?.params?.totalCount || Math.max(stops.length, 1);
  const collectedCount =
    typeof route?.params?.collectedCount === "number"
      ? route.params.collectedCount
      : totalCount;
  const notFoundCount = route?.params?.notFoundCount || 0;

  useEffect(() => {
    // Limpa a rota em andamento para não mostrar mais o card "Compra em andamento" na Home
    clearActiveRouteSession();

    Animated.parallel([
      Animated.spring(heroScale, {
        toValue: 1,
        friction: 5,
        tension: 65,
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.45,
            duration: 1100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.85,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.65,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulseLoop.start();

    const timer = setTimeout(() => {
      setShowSplash(false);
      Animated.parallel([
        Animated.timing(summaryOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(summaryTranslateY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 2650);

    return () => {
      clearTimeout(timer);
      pulseLoop.stop();
    };
  }, [heroOpacity, heroScale, ringOpacity, ringScale, summaryOpacity, summaryTranslateY]);

  if (showSplash) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Lista concluída com sucesso! Toque para avançar."
        onPress={() => {
          setShowSplash(false);
          summaryOpacity.setValue(1);
          summaryTranslateY.setValue(0);
        }}
        className="flex-1 items-center justify-center overflow-hidden bg-[#F26900] px-6"
        style={{ paddingTop: Math.max(insets.top, 44), paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {/* Círculos decorativos de fundo no estilo Itaú / Ach.ai */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: 180,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            top: -80,
            right: -90,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: 140,
            backgroundColor: "rgba(255, 255, 255, 0.07)",
            bottom: -60,
            left: -70,
          }}
        />

        {/* Moedas, sacolas e brilhos subindo (estilo confirmação Pix Itaú) */}
        {RISING_BUBBLES.map((item) => (
          <RisingParticle key={item.id} item={item} />
        ))}

        {/* Conteúdo central da Splash */}
        <Animated.View
          className="items-center"
          style={{
            opacity: heroOpacity,
            transform: [{ scale: heroScale }],
          }}
        >
          <View className="mb-7 items-center justify-center">
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 112,
                height: 112,
                borderRadius: 56,
                borderWidth: 3,
                borderColor: "#FFFFFF",
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              }}
            />
            <View
              className="h-[96px] w-[96px] items-center justify-center rounded-full bg-white"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <HeroCheckIcon />
            </View>
          </View>

          <View className="rounded-full bg-white/20 px-4 py-1.5">
            <Text className="font-inter-bold text-[11px] uppercase tracking-wider text-white">
              Rota finalizada com sucesso
            </Text>
          </View>

          <Text
            className="mt-4 text-center font-inter-extrabold text-[32px] leading-[36px] text-white"
            style={{ letterSpacing: -0.8 }}
          >
            Tudo no carrinho!
          </Text>

          <Text className="mt-2.5 max-w-[280px] text-center font-sans text-[14px] leading-[20px] text-[#FFF4E8]">
            {`Boa, ${firstName}! Você coletou ${collectedCount} de ${totalCount} ${
              totalCount === 1 ? "item" : "itens"
            } em ${storeName} pelo caminho mais curto.`}
          </Text>

          {/* Pílula de economia de tempo e passos */}
          <View className="mt-7 flex-row items-center rounded-[16px] bg-white/15 px-4 py-3" style={{ gap: 10 }}>
            <CoinIllustration size={26} />
            <View>
              <Text className="font-inter-bold text-[13px] text-white">
                Compra inteligente concluída
              </Text>
              <Text className="font-sans text-[11px] text-[#FFF4E8]">
                Agora é só seguir direto para o caixa
              </Text>
            </View>
          </View>
        </Animated.View>

        <Text className="absolute bottom-8 font-sans text-[11px] text-white/80">
          Toque em qualquer lugar para continuar
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28, flexGrow: 1, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5"
          style={{ paddingTop: Math.max(insets.top, 44) + 20 }}
        >
          {/* Cabeçalho padronizado */}
          <View className="flex-row items-center justify-between">
            <Text className="font-brand text-[22px] leading-[26px] text-ink">
              Ach.ai
            </Text>
            <View className="rounded-full bg-[#FFF4E8] px-3 py-1">
              <Text className="font-inter-semibold text-[11px] text-[#F26900]">
                Compra concluída
              </Text>
            </View>
          </View>

          <Animated.View
            className="mt-6 w-full"
            style={{
              gap: 18,
              opacity: summaryOpacity,
              transform: [{ translateY: summaryTranslateY }],
            }}
          >
          {/* Banner Hero Laranja */}
          <View
            className="w-full overflow-hidden rounded-[18px] bg-[#F26900] p-[18px]"
            style={{ gap: 12 }}
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="font-inter-bold text-[10px] uppercase text-white">
                  100% da rota percorrida
                </Text>
              </View>
              <CoinIllustration size={28} />
            </View>

            <View style={{ gap: 4 }}>
              <Text
                className="font-inter-extrabold text-[24px] leading-[28px] text-white"
                style={{ letterSpacing: -0.6 }}
              >
                Hora de ir para o caixa!
              </Text>
              <Text className="font-sans text-[13px] leading-[18px] text-[#FFF4E8]">
                Sua lista continua salva em Minhas listas para quando você quiser repetir a compra.
              </Text>
            </View>
          </View>

          {/* Card do Supermercado e Lista */}
          <View
            className="w-full flex-row items-center rounded-[14px] bg-[#FFF4E8] p-[12px]"
            style={{ gap: 12 }}
          >
            <View className="h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white">
              <StoreMiniIcon />
            </View>
            <View className="flex-1" style={{ gap: 2 }}>
              <Text className="font-sans text-[11px] leading-[14px] text-[#66645F]">
                {storeName}
              </Text>
              <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]" numberOfLines={1}>
                {listName}
              </Text>
            </View>
            <View className="rounded-[8px] bg-white px-2.5 py-1">
              <Text className="font-inter-bold text-[12px] text-[#F26900]">
                {`${collectedCount}/${totalCount} itens`}
              </Text>
            </View>
          </View>

          {/* Métricas da jornada */}
          <View className="w-full flex-row" style={{ gap: 10 }}>
            <View className="flex-1 rounded-[14px] border border-[#E8E8E0] bg-[#F7F7F3] p-[12px]">
              <Text className="font-sans text-[11px] text-[#66645F]">Coletados</Text>
              <Text className="mt-1 font-inter-extrabold text-[20px] text-[#1F1F1F]">
                {collectedCount} {collectedCount === 1 ? "item" : "itens"}
              </Text>
            </View>

            <View className="flex-1 rounded-[14px] border border-[#E8E8E0] bg-[#F7F7F3] p-[12px]">
              <Text className="font-sans text-[11px] text-[#66645F]">
                {notFoundCount > 0 ? "Não encontrados" : "Caminho"}
              </Text>
              <Text className="mt-1 font-inter-extrabold text-[20px] text-[#F26900]">
                {notFoundCount > 0 ? `${notFoundCount}` : "Otimizado"}
              </Text>
            </View>
          </View>

          {/* Resumo dos produtos coletados */}
          {stops.length > 0 ? (
            <View
              className="w-full rounded-[14px] border border-[#E8E8E0] bg-white p-[14px]"
              style={{ gap: 10 }}
            >
              <Text className="font-inter-bold text-[14px] text-[#1F1F1F]">
                Itens da sua compra
              </Text>

              {stops.slice(0, 5).map((item, idx) => (
                <View
                  key={`${item.productId || idx}-${item.name}`}
                  className="flex-row items-center"
                  style={{ gap: 10 }}
                >
                  <View className="h-[36px] w-[36px] items-center justify-center overflow-hidden rounded-[8px] bg-[#F7F7F3]">
                    <Image
                      source={getProductImage(item.name)}
                      style={{ width: 36, height: 36 }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-[13px] text-[#1F1F1F]" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="font-sans text-[11px] text-[#66645F]" numberOfLines={1}>
                      {`${item.aisle || "Corredor"} · ${item.shelf || "Prateleira"}`}
                    </Text>
                  </View>
                  <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#FFF4E8]">
                    <Text className="font-inter-bold text-[11px] text-[#F26900]">✓</Text>
                  </View>
                </View>
              ))}

              {stops.length > 5 ? (
                <Text className="font-sans text-[11px] text-[#66645F]">
                  {`+ ${stops.length - 5} outros produtos coletados nesta rota`}
                </Text>
              ) : null}
            </View>
          ) : null}
          </Animated.View>
        </View>

        {/* Ações claras de pós-compra */}
        <View className="w-full px-5 pt-5" style={{ gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            className="h-[50px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
              Voltar para o início
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="h-[50px] w-full items-center justify-center rounded-[14px] border border-[#E8E8E0] bg-white active:opacity-85"
            onPress={() => navigation.navigate("MyLists")}
          >
            <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
              Ver minhas listas
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="w-full items-center py-1.5 active:opacity-80"
            onPress={() => setShowSplash(true)}
          >
            <Text className="font-inter-semibold text-[12px] text-[#F26900]">
              Rever animação de conclusão ✨
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Início" />
    </View>
  );
}
