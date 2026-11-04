import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";
import { fetchShoppingLists } from "../services/shopping-list-api";
import { validateStore } from "../services/store-api";

const listIcons = {
  carrinho: require("../assets/lists/carrinho.png"),
  churrasco: require("../assets/lists/churrasco.png"),
  cafe: require("../assets/lists/cafe.png"),
};

const DEFAULT_FALLBACK_LISTS = [
  {
    id: "fallback-compra-semana",
    name: "Compra da semana",
    itemCount: 8,
    icon: listIcons.carrinho,
  },
  {
    id: "fallback-churrasco",
    name: "Churrasco",
    itemCount: 5,
    icon: listIcons.churrasco,
  },
];

function pickListIcon(name = "") {
  const lower = String(name).toLowerCase();
  if (lower.includes("churras") || lower.includes("carne") || lower.includes("festa")) {
    return listIcons.churrasco;
  }
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("manhã") || lower.includes("manha")) {
    return listIcons.cafe;
  }
  return listIcons.carrinho;
}

function getItemCount(list) {
  if (typeof list?.itemCount === "number") return list.itemCount;
  if (typeof list?.productCount === "number") return list.productCount;
  if (Array.isArray(list?.items)) return list.items.length;
  return 0;
}

function formatItemCount(count) {
  return `${count} ${count === 1 ? "item" : "itens"}`;
}

function buildFallbackRouteForList(list, storeName) {
  const listTitle = list?.name || list?.title || "Compra da semana";
  const isChurrasco = listTitle.toLowerCase().includes("churras");

  const stops =
    Array.isArray(list?.items) && list.items.length > 0
      ? list.items.map((item, idx) => ({
          productId: item.productId ?? item.id ?? idx + 1,
          name: item.name,
          quantity: item.quantity || 1,
          aisle: item.aisle || item.location?.aisle || "Corredor 2",
          shelf: item.shelf || item.location?.shelf || "Prateleira central",
          nodeId: item.nodeId ?? item.location?.nodeId ?? null,
          initialCollected: false,
        }))
      : isChurrasco
        ? [
            { productId: 9, name: "Pão de alho tradicional", quantity: 2, aisle: "Corredor 1", shelf: "Prateleira central", nodeId: 1, initialCollected: false },
            { productId: 11, name: "Carvão vegetal 5 kg", quantity: 1, aisle: "Corredor 2", shelf: "Prateleira inferior", nodeId: 2, initialCollected: false },
            { productId: 6, name: "Sal grosso para churrasco", quantity: 1, aisle: "Corredor 2", shelf: "Prateleira central", nodeId: 2, initialCollected: false },
            { productId: 2, name: "Refrigerante 2 L", quantity: 2, aisle: "Corredor 3", shelf: "Prateleira central", nodeId: 3, initialCollected: false },
            { productId: 12, name: "Tomate italiano 1 kg", quantity: 1, aisle: "Corredor 5", shelf: "Banca central", nodeId: 4, initialCollected: false },
          ]
        : [
            { productId: 9, name: "Pão de forma tradicional", quantity: 1, aisle: "Corredor 1", shelf: "Prateleira P1", nodeId: 1, initialCollected: false },
            { productId: 7, name: "Café torrado e moído 500 g", quantity: 1, aisle: "Corredor 2", shelf: "Prateleira P1", nodeId: 1, initialCollected: false },
            { productId: 3, name: "Arroz branco 5 kg", quantity: 1, aisle: "Corredor 3", shelf: "Prateleira P2", nodeId: 2, initialCollected: false },
            { productId: 6, name: "Detergente neutro 500 ml", quantity: 1, aisle: "Corredor 2", shelf: "Prateleira central", nodeId: 2, initialCollected: false },
            { productId: 2, name: "Leite integral 1 L", quantity: 1, aisle: "Corredor 4", shelf: "Prateleira central", nodeId: 3, initialCollected: false },
            { productId: 8, name: "Ovos brancos 12 unidades", quantity: 1, aisle: "Corredor 4", shelf: "Prateleira inferior", nodeId: 3, initialCollected: false },
            { productId: 13, name: "Queijo muçarela 200 g", quantity: 1, aisle: "Corredor 5", shelf: "Balcão refrigerado", nodeId: 3, initialCollected: false },
            { productId: 1, name: "Banana prata 1 kg", quantity: 1, aisle: "Corredor 5", shelf: "Banca central", nodeId: 4, initialCollected: false },
          ];

  return {
    list: {
      id: list?.id || "fallback-compra-semana",
      name: listTitle,
      storeName: storeName || "Mercado Aurora",
    },
    stops,
    unlocatedItems: [],
    totalDistance: isChurrasco ? 42 : 68,
    locationWarning: "",
  };
}

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

function StoreIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M13.7501 19.2493V14.666C13.7501 14.4229 13.6535 14.1897 13.4816 14.0178C13.3097 13.8459 13.0765 13.7493 12.8334 13.7493H9.16675C8.92363 13.7493 8.69048 13.8459 8.51857 14.0178C8.34666 14.1897 8.25008 14.4229 8.25008 14.666V19.2493M16.2929 9.45014C16.1018 9.26721 15.8475 9.1651 15.5829 9.1651C15.3184 9.1651 15.064 9.26721 14.873 9.45014C14.4467 9.8567 13.8803 10.0835 13.2912 10.0835C12.7022 10.0835 12.1358 9.8567 11.7095 9.45014C11.5185 9.26748 11.2644 9.16554 11 9.16554C10.7357 9.16554 10.4816 9.26748 10.2905 9.45014C9.86425 9.85697 9.29763 10.084 8.70837 10.084C8.11911 10.084 7.55249 9.85697 7.1262 9.45014C6.93511 9.26721 6.68078 9.1651 6.41625 9.1651C6.15171 9.1651 5.89738 9.26721 5.70629 9.45014C5.29456 9.84304 4.75137 10.0687 4.18245 10.0831C4.00811 10.0876 3.83517 10.0721 3.66675 10.0378M3.66675 10.0378C3.28555 9.96011 2.92744 9.78604 2.6284 9.52841C2.19724 9.15694 1.91972 8.63834 1.84986 8.07353C1.78 7.50873 1.92279 6.93813 2.25045 6.47281L4.8987 2.63748C5.06674 2.38953 5.29296 2.18652 5.55758 2.04622C5.82221 1.90592 6.11718 1.83259 6.4167 1.83264H15.5834C15.882 1.83253 16.1762 1.90537 16.4402 2.04484C16.7043 2.18431 16.9303 2.38618 17.0986 2.63289L19.7524 6.47556C20.0801 6.94125 20.2227 7.51228 20.1524 8.07738C20.0821 8.64248 19.804 9.16116 19.3721 9.53236C19.0728 9.7896 18.7146 9.96325 18.3334 10.0405M3.66675 10.0378V10.037M3.66675 10.0378V17.4162C3.66675 17.9024 3.8599 18.3687 4.20372 18.7125C4.54754 19.0563 5.01385 19.2495 5.50008 19.2495H16.5001C16.9863 19.2495 17.4526 19.0563 17.7964 18.7125C18.1403 18.3687 18.3334 17.9024 18.3334 17.4162V10.0405M18.3334 10.0405C18.1646 10.0747 17.9912 10.09 17.8164 10.0853C17.2472 10.0699 16.7041 9.84318 16.2929 9.44922M18.3334 10.0405V10.037"
        stroke="#F26900"
        {...strokeProps}
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M16.666 5L7.50025 14.166L3.334 9.99964" stroke="#F26900" {...strokeProps} />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M3.3328 8H8M8 8H12.6672M8 8V3.3328M8 8V12.6672" stroke="#F26900" {...strokeProps} />
    </Svg>
  );
}

function RouteIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M8.25 17.4172C8.25 18.9361 7.01878 20.1674 5.5 20.1674C3.98122 20.1674 2.75 18.9361 2.75 17.4172C2.75 15.8983 3.98122 14.667 5.5 14.667C7.01878 14.667 8.25 15.8983 8.25 17.4172ZM8.25 17.4172H16.0417C16.8926 17.4172 17.7086 17.0791 18.3103 16.4774C18.912 15.8757 19.25 15.0596 19.25 14.2086C19.25 13.3576 18.912 12.5415 18.3103 11.9398C17.7086 11.338 16.8926 11 16.0417 11H5.95833C5.10743 11 4.29138 10.662 3.6897 10.0602C3.08802 9.4585 2.75 8.64238 2.75 7.79141C2.75 6.94044 3.08802 6.12432 3.6897 5.52259C4.29138 4.92087 5.10743 4.58282 5.95833 4.58282H13.75M13.75 4.58282C13.75 6.10172 14.9812 7.33304 16.5 7.33304C18.0188 7.33304 19.25 6.10172 19.25 4.58282C19.25 3.06392 18.0188 1.8326 16.5 1.8326C14.9812 1.8326 13.75 3.06392 13.75 4.58282Z"
        stroke="#F26900"
        {...strokeProps}
      />
    </Svg>
  );
}

function SelectableListCard({ item, selected, onPress }) {
  const title = item.name || item.title || "Minha lista";
  const count = getItemCount(item);
  const emoji = typeof item.emoji === "string" && item.emoji.trim() ? item.emoji.trim() : null;
  const icon = item.icon || pickListIcon(title);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className="h-[88px] w-full flex-row items-center rounded-[14px] bg-white p-[12px] active:opacity-90"
      style={{
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? "#F26900" : "#E8E8E0",
        gap: 14,
      }}
      onPress={onPress}
    >
      <View className="h-[54px] w-[54px] items-center justify-center rounded-[12px] bg-[#FFF4E8]">
        {emoji ? (
          <Text className="text-[24px] leading-[28px]">{emoji}</Text>
        ) : (
          <View style={{ width: 24, height: 24, overflow: "hidden" }}>
            <Image source={icon} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </View>
        )}
      </View>

      <View className="flex-1" style={{ gap: 7 }}>
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans text-[11px] leading-[14px] text-[#66645F]" numberOfLines={1}>
          {formatItemCount(count)}
        </Text>
      </View>

      <View
        className="h-[22px] w-[22px] rounded-full bg-white"
        style={{
          borderWidth: selected ? 6 : 1.5,
          borderColor: selected ? "#F26900" : "#E8E8E0",
        }}
      />
    </Pressable>
  );
}

export function StoreConfirmedScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore } = useAuth();
  const [lists, setLists] = useState(DEFAULT_FALLBACK_LISTS);
  const [selectedListId, setSelectedListId] = useState(DEFAULT_FALLBACK_LISTS[0].id);
  const [loading, setLoading] = useState(false);
  const [remoteStore, setRemoteStore] = useState(null);

  const confirmedStore = useMemo(() => {
    const paramStore = route?.params?.store;
    if (remoteStore && remoteStore.name) return remoteStore;
    if (paramStore && paramStore.name) return paramStore;
    if (currentStore && currentStore.name) return currentStore;
    return {
      id: paramStore?.id || currentStore?.id || "00000000-0000-0000-0000-000000000001",
      name: "Mercado Aurora",
    };
  }, [remoteStore, route?.params?.store, currentStore]);

  useEffect(() => {
    let active = true;
    const targetId =
      route?.params?.store?.id ||
      currentStore?.id ||
      "00000000-0000-0000-0000-000000000001";
    validateStore(targetId, auth?.token)
      .then((store) => {
        if (active && store?.name) {
          setRemoteStore(store);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [auth?.token, currentStore?.id, route?.params?.store?.id]);

  const loadLists = useCallback(async () => {
    if (!auth?.token) {
      setLists(DEFAULT_FALLBACK_LISTS);
      setSelectedListId((prev) => prev || DEFAULT_FALLBACK_LISTS[0].id);
      return;
    }

    try {
      setLoading(true);
      const remoteLists = await fetchShoppingLists(auth.token);
      if (Array.isArray(remoteLists) && remoteLists.length > 0) {
        setLists(remoteLists);
        setSelectedListId((prev) =>
          remoteLists.some((item) => String(item.id) === String(prev))
            ? prev
            : remoteLists[0].id,
        );
      } else {
        setLists(DEFAULT_FALLBACK_LISTS);
        setSelectedListId(DEFAULT_FALLBACK_LISTS[0].id);
      }
    } catch {
      setLists(DEFAULT_FALLBACK_LISTS);
      setSelectedListId((prev) => prev || DEFAULT_FALLBACK_LISTS[0].id);
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    loadLists();
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [loadLists, navigation]);

  const selectedList = useMemo(() => {
    return (
      lists.find((item) => String(item.id) === String(selectedListId)) ||
      lists[0] ||
      DEFAULT_FALLBACK_LISTS[0]
    );
  }, [lists, selectedListId]);

  const selectedTitle = selectedList?.name || selectedList?.title || "Compra da semana";
  const selectedCount = getItemCount(selectedList);
  const selectedCaption = `${selectedTitle} · ${selectedCount} ${
    selectedCount === 1 ? "item selecionado" : "itens selecionados"
  }`;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("QrScanner");
    }
  };

  const handleCreateNewList = () => {
    navigation.navigate("CreateList", { store: confirmedStore });
  };

  const handleStartRoute = () => {
    if (!selectedList) return;
    navigation.navigate("Route", {
      listId: selectedList.id,
      list: selectedList,
      store: confirmedStore,
      fallbackRoute: buildFallbackRouteForList(selectedList, confirmedStore.name),
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 44) }}>
      {/* Cabeçalho (2245:1989) */}
      <View className="h-[56px] w-full flex-row items-center justify-between px-[20px]">
        <Pressable
          accessibilityLabel="Voltar para o leitor de QR Code"
          accessibilityRole="button"
          className="flex-row items-center gap-[4px] py-1 active:opacity-80"
          onPress={handleGoBack}
        >
          <BackChevronIcon />
          <Text className="font-inter-semibold text-[13px] text-[#F26900]">QR Code</Text>
        </Pressable>

        <Text className="font-brand text-[20px] text-[#1F1F1F]">Ach.ai</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Preparar rota na loja (2245:1995) */}
        <View className="w-full px-[20px] pt-[16px]" style={{ gap: 24 }}>
          {/* Apresentação (2245:1996) */}
          <View className="w-full" style={{ gap: 6 }}>
            <Text
              className="font-inter-extrabold text-[28px] leading-[32px] text-[#F26900]"
              style={{ letterSpacing: -0.7 }}
            >
              Você está na loja!
            </Text>
            <Text className="font-sans text-[13px] leading-[19.5px] text-[#66645F]">
              QR Code lido. Agora escolha a lista que vai usar nesta compra.
            </Text>
          </View>

          {/* Supermercado da lista (2245:1999) */}
          <View
            className="w-full flex-row items-center rounded-[14px] bg-[#FFF4E8] p-[12px]"
            style={{ gap: 12 }}
          >
            <View className="h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white">
              <StoreIcon />
            </View>

            <View className="flex-1" style={{ gap: 3 }}>
              <Text className="font-sans text-[11px] leading-[14px] text-[#66645F]" numberOfLines={1}>
                Loja confirmada pelo QR Code
              </Text>
              <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]" numberOfLines={1}>
                {confirmedStore.name}
              </Text>
            </View>

            <View className="h-[20px] w-[20px] items-center justify-center">
              <CheckIcon />
            </View>
          </View>

          {/* Escolha de lista (2245:2008) */}
          <View className="w-full" style={{ gap: 14 }}>
            <Text className="font-inter-bold text-[18px] leading-[22px] text-[#1F1F1F]">
              Qual lista vamos usar?
            </Text>

            {loading ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#F26900" size="small" />
              </View>
            ) : (
              lists.map((item) => (
                <SelectableListCard
                  key={String(item.id)}
                  item={item}
                  selected={String(item.id) === String(selectedList?.id)}
                  onPress={() => setSelectedListId(item.id)}
                />
              ))
            )}

            {/* Criar outra lista (2245:2024) */}
            <Pressable
              accessibilityRole="button"
              className="h-[32px] w-full flex-row items-center justify-center active:opacity-80"
              style={{ gap: 6 }}
              onPress={handleCreateNewList}
            >
              <PlusIcon />
              <Text className="font-inter-semibold text-[13px] leading-[16px] text-[#F26900]">
                Criar nova lista
              </Text>
            </Pressable>
          </View>

          {/* Orientação dentro da loja (2245:2027) */}
          <View
            className="w-full flex-row items-center rounded-[14px] bg-[#F7F7F3] p-[14px]"
            style={{ gap: 12 }}
          >
            <View className="h-[22px] w-[22px] items-center justify-center">
              <RouteIcon />
            </View>
            <Text className="flex-1 font-sans text-[12px] leading-[18px] text-[#66645F]">
              A rota orienta você pelos corredores desta loja até os produtos da lista.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Iniciar compra (2245:2030) */}
      <View
        className="w-full px-[20px] pt-[12px]"
        style={{
          gap: 10,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <Pressable
          accessibilityRole="button"
          className="h-[50px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
          onPress={handleStartRoute}
        >
          <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
            Iniciar rota na loja
          </Text>
        </Pressable>

        <Text className="w-full text-center font-sans text-[11px] leading-[14px] text-[#66645F]" numberOfLines={1}>
          {selectedCaption}
        </Text>
      </View>
    </View>
  );
}
