import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { fetchShoppingListDetails } from "../services/shopping-list-api";
import { validateStore } from "../services/store-api";

const productImages = {
  banana: require("../assets/products/banana.png"),
  leite: require("../assets/products/leite.png"),
  arroz: require("../assets/products/arroz.png"),
  ovos: require("../assets/products/ovos.png"),
  cafe: require("../assets/products/cafe.png"),
  detergente: require("../assets/products/detergente.png"),
};

function getProductImage(item) {
  if (item?.image) return item.image;
  const lower = String(item?.displayName || item?.name || "").toLowerCase();
  if (lower.includes("banana") || lower.includes("tomate") || lower.includes("horti")) {
    return productImages.banana;
  }
  if (lower.includes("leite") || lower.includes("queijo")) {
    return productImages.leite;
  }
  if (lower.includes("café") || lower.includes("cafe")) {
    return productImages.cafe;
  }
  if (lower.includes("ovo")) {
    return productImages.ovos;
  }
  if (lower.includes("detergente") || lower.includes("sabão") || lower.includes("sabao") || lower.includes("carvão")) {
    return productImages.detergente;
  }
  return productImages.arroz;
}

function inferSummaryUnit(item) {
  if (item?.summaryUnit) return item.summaryUnit;
  if (item?.size) return item.size;
  const lower = String(item?.displayName || item?.name || "").toLowerCase();
  if (lower.includes("banana") || lower.includes("tomate")) return "1 kg";
  if (lower.includes("leite")) return "1 L";
  if (lower.includes("arroz")) return "5 kg";
  if (lower.includes("ovo")) return "12 unidades";
  if (lower.includes("café") || lower.includes("cafe")) return "500 g";
  if (lower.includes("detergente")) return "500 ml";
  return "";
}

const formatMoney = (value) => `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;

const strokeProps = {
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function BackChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M10 12L6 8L10 4" stroke="#F26900" {...strokeProps} />
    </Svg>
  );
}

function SuccessCheckIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Path
        d="M21.6663 6.5L9.74967 18.4167L4.33301 13"
        stroke="#F26900"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StoreSmallIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 22 22" fill="none">
      <Path
        d="M13.7501 19.2493V14.666C13.7501 14.4229 13.6535 14.1897 13.4816 14.0178C13.3097 13.8459 13.0765 13.7493 12.8334 13.7493H9.16675C8.92363 13.7493 8.69048 13.8459 8.51857 14.0178C8.34666 14.1897 8.25008 14.4229 8.25008 14.666V19.2493M16.2929 9.45014C16.1018 9.26721 15.8475 9.1651 15.5829 9.1651C15.3184 9.1651 15.064 9.26721 14.873 9.45014C14.4467 9.8567 13.8803 10.0835 13.2912 10.0835C12.7022 10.0835 12.1358 9.8567 11.7095 9.45014C11.5185 9.26748 11.2644 9.16554 11 9.16554C10.7357 9.16554 10.4816 9.26748 10.2905 9.45014C9.86425 9.85697 9.29763 10.084 8.70837 10.084C8.11911 10.084 7.55249 9.85697 7.1262 9.45014C6.93511 9.26721 6.68078 9.1651 6.41625 9.1651C6.15171 9.1651 5.89738 9.26721 5.70629 9.45014C5.29456 9.84304 4.75137 10.0687 4.18245 10.0831C4.00811 10.0876 3.83517 10.0721 3.66675 10.0378M3.66675 10.0378C3.28555 9.96011 2.92744 9.78604 2.6284 9.52841C2.19724 9.15694 1.91972 8.63834 1.84986 8.07353C1.78 7.50873 1.92279 6.93813 2.25045 6.47281L4.8987 2.63748C5.06674 2.38953 5.29296 2.18652 5.55758 2.04622C5.82221 1.90592 6.11718 1.83259 6.4167 1.83264H15.5834C15.882 1.83253 16.1762 1.90537 16.4402 2.04484C16.7043 2.18431 16.9303 2.38618 17.0986 2.63289L19.7524 6.47556C20.0801 6.94125 20.2227 7.51228 20.1524 8.07738C20.0821 8.64248 19.804 9.16116 19.3721 9.53236C19.0728 9.7896 18.7146 9.96325 18.3334 10.0405M3.66675 10.0378V10.037M3.66675 10.0378V17.4162C3.66675 17.9024 3.8599 18.3687 4.20372 18.7125C4.54754 19.0563 5.01385 19.2495 5.50008 19.2495H16.5001C16.9863 19.2495 17.4526 19.0563 17.7964 18.7125C18.1403 18.3687 18.3334 17.9024 18.3334 17.4162V10.0405M18.3334 10.0405C18.1646 10.0747 17.9912 10.09 17.8164 10.0853C17.2472 10.0699 16.7041 9.84318 16.2929 9.44922M18.3334 10.0405V10.037"
        stroke="#F26900"
        {...strokeProps}
      />
    </Svg>
  );
}

const DEFAULT_CREATED_ITEMS = [
  {
    id: 1,
    productId: 1,
    name: "Banana prata",
    displayName: "Banana prata",
    summaryUnit: "1 kg",
    quantity: 1,
    price: 6.99,
    aisle: "Corredor 5",
    shelf: "Banca central",
    nodeId: 4,
  },
  {
    id: 2,
    productId: 2,
    name: "Leite integral",
    displayName: "Leite integral",
    summaryUnit: "1 L",
    quantity: 2,
    price: 4.79,
    aisle: "Corredor 3",
    shelf: "Prateleira central",
    nodeId: 3,
  },
];

export function ListCreatedScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore } = useAuth();

  const firstName = useMemo(() => {
    const rawName = auth?.user?.name || "Marina";
    const first = String(rawName).trim().split(/\s+/)[0];
    return first || "Marina";
  }, [auth?.user?.name]);

  const listData = route?.params?.list || {
    id: route?.params?.listId || "fallback-compra-semana",
    name: "Compra da semana",
  };
  const listId = route?.params?.listId || listData?.id || "fallback-compra-semana";
  const [remoteList, setRemoteList] = useState(null);
  const [remoteStore, setRemoteStore] = useState(null);

  const listTitle = remoteList?.name || listData?.name || "Compra da semana";
  const storeId =
    remoteList?.storeId ||
    route?.params?.store?.id ||
    listData?.storeId ||
    currentStore?.id ||
    "00000000-0000-0000-0000-000000000001";
  const storeName =
    remoteStore?.name ||
    remoteList?.storeName ||
    route?.params?.store?.name ||
    listData?.storeName ||
    currentStore?.name ||
    "Mercado Aurora";

  useEffect(() => {
    let active = true;
    const isFallbackId = String(listId).startsWith("fallback-");
    if (auth?.token && listId && !isFallbackId) {
      fetchShoppingListDetails(auth.token, listId)
        .then((details) => {
          if (active && details) {
            setRemoteList(details);
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [auth?.token, listId]);

  useEffect(() => {
    let active = true;
    if (storeId) {
      validateStore(storeId, auth?.token)
        .then((store) => {
          if (active && store?.name) {
            setRemoteStore(store);
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [auth?.token, storeId]);

  const items = useMemo(() => {
    if (Array.isArray(route?.params?.items) && route.params.items.length > 0) {
      return route.params.items;
    }
    if (Array.isArray(listData?.items) && listData.items.length > 0) {
      return listData.items;
    }
    return DEFAULT_CREATED_ITEMS;
  }, [route?.params?.items, listData?.items]);

  const totalProducts = items.length;
  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [items],
  );
  const totalEstimated = useMemo(() => {
    if (typeof route?.params?.total === "number") {
      return route.params.total;
    }
    return items.reduce(
      (sum, item) => sum + Number(item.price ?? item.unitPrice ?? 0) * Number(item.quantity || 1),
      0,
    );
  }, [route?.params?.total, items]);

  const countSubtitle = `${totalUnits} ${totalUnits === 1 ? "item" : "itens"} · ${totalProducts} ${
    totalProducts === 1 ? "produto" : "produtos"
  }`;

  const handleGoToMyLists = () => {
    navigation.navigate("MyLists");
  };

  const handleStartRoute = () => {
    const fallbackRoute = {
      list: {
        id: listId,
        name: listTitle,
        storeName,
      },
      stops: items.map((item, idx) => ({
        productId: item.productId ?? item.id ?? idx + 1,
        name: item.displayName || item.name,
        quantity: item.quantity || 1,
        aisle: item.aisle || item.location?.aisle || "Corredor 2",
        shelf: item.shelf || item.location?.shelf || "Prateleira central",
        nodeId: item.nodeId ?? item.location?.nodeId ?? null,
        initialCollected: false,
      })),
      unlocatedItems: [],
      totalDistance: items.length * 8.5,
      locationWarning: "",
    };

    navigation.navigate("Route", {
      listId,
      list: { ...listData, id: listId, name: listTitle, items },
      store: { id: storeId, name: storeName },
      fallbackRoute,
      hasLocationWarning: Boolean(route?.params?.hasLocationWarning),
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 44) }}>
      {/* Cabeçalho (2245:1920) */}
      <View className="h-[56px] w-full flex-row items-center justify-between px-[20px]">
        <Pressable
          accessibilityLabel="Voltar para Minhas listas"
          accessibilityRole="button"
          className="flex-row items-center gap-[4px] py-1 active:opacity-80"
          onPress={handleGoToMyLists}
        >
          <BackChevronIcon />
          <Text className="font-inter-semibold text-[13px] text-[#F26900]">
            Minhas listas
          </Text>
        </Pressable>

        <Text className="font-brand text-[20px] text-[#1F1F1F]">Ach.ai</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28, flexGrow: 1, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
      >
        {/* Confirmação de criação (2245:1926) */}
        <View className="w-full px-[20px] pt-[18px]" style={{ gap: 20 }}>
          {/* Confirmação (2245:1927) */}
          <View className="w-full" style={{ gap: 14 }}>
            <View className="h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#FFF4E8]">
              <SuccessCheckIcon />
            </View>

            <View className="w-full" style={{ gap: 6 }}>
              <Text
                className="font-inter-extrabold text-[28px] leading-[32px] text-[#F26900]"
                style={{ letterSpacing: -0.7 }}
              >
                Lista criada!
              </Text>
              <Text className="font-sans text-[13px] leading-[19.5px] text-[#66645F]">
                {`Tudo salvo, ${firstName}. Vamos encontrar os produtos dentro do supermercado?`}
              </Text>
            </View>
          </View>

          {/* Resumo da lista (2245:1934) */}
          <View
            className="w-full rounded-[14px] border border-[#E8E8E0] bg-white p-[16px]"
            style={{ gap: 16 }}
          >
            {/* Identificação (2245:1935) */}
            <View className="w-full" style={{ gap: 6 }}>
              <Text className="font-inter-bold text-[18px] leading-[22px] text-[#1F1F1F]">
                {listTitle}
              </Text>
              <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#F26900]">
                {countSubtitle}
              </Text>
            </View>

            {/* Supermercado (2245:1938) */}
            <View className="w-full flex-row items-center" style={{ gap: 8 }}>
              <StoreSmallIcon />
              <Text className="font-inter-semibold text-[13px] leading-[16px] text-[#1F1F1F]">
                {storeName}
              </Text>
            </View>

            {/* Produtos selecionados (2245:1942) */}
            <View className="w-full" style={{ gap: 12 }}>
              {items.map((item, idx) => {
                const title = item.displayName || item.name;
                const unit = inferSummaryUnit(item);
                const qty = Number(item.quantity || 1);
                const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
                const lineTotal = unitPrice * qty;
                const labelText = unit ? `${qty} × ${title} · ${unit}` : `${qty} × ${title}`;

                return (
                  <View
                    key={`${item.productId || item.id || idx}-${title}`}
                    className="w-full flex-row items-center"
                    style={{ gap: 10 }}
                  >
                    <View className="h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-[8px] bg-[#F7F7F3]">
                      <Image
                        source={getProductImage(item)}
                        style={{ width: 44, height: 44 }}
                        resizeMode="cover"
                      />
                    </View>

                    <Text
                      className="flex-1 font-sans text-[12px] leading-[18px] text-[#66645F]"
                      numberOfLines={1}
                    >
                      {labelText}
                    </Text>

                    <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#1F1F1F]">
                      {formatMoney(lineTotal)}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Estimativa (2245:1951) */}
            <View className="w-full flex-row items-center justify-between border-t border-[#E8E8E0] pt-[14px]">
              <Text className="font-sans text-[13px] leading-[16px] text-[#66645F]">
                Total estimado
              </Text>
              <Text className="font-inter-extrabold text-[21px] leading-[25px] text-[#1F1F1F]">
                {formatMoney(totalEstimated)}
              </Text>
            </View>

            <Text className="font-sans text-[10px] leading-[14px] text-[#66645F]">
              Preços demonstrativos. Os valores podem variar na loja.
            </Text>
          </View>
        </View>

        {/* Próximos passos (2245:1955) */}
        <View className="w-full px-[20px] pt-[24px]" style={{ gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            className="h-[50px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
            onPress={handleStartRoute}
          >
            <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
              Iniciar rota na loja
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className="h-[50px] w-full items-center justify-center rounded-[14px] border border-[#E8E8E0] bg-white active:opacity-85"
            onPress={handleGoToMyLists}
          >
            <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
              Continuar depois
            </Text>
          </Pressable>

          <Text className="w-full text-center font-sans text-[11px] leading-[14px] text-[#66645F]">
            Sua lista está salva em Minhas listas.
          </Text>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
