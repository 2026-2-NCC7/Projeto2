import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import {
  deleteShoppingList,
  fetchShoppingListSummary,
  updateShoppingList,
} from "../services/shopping-list-api";
import { fetchStores, validateStore } from "../services/store-api";
import { clearActiveRouteSession, loadActiveRouteSession } from "../storage/route-session-storage";

const FALLBACK_STORES = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Mercado Liberdade",
    address: "Av. da Liberdade, 680 · Liberdade · São Paulo, SP",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Supermercado Sakura",
    address: "Rua São Joaquim, 120 · Liberdade · São Paulo, SP",
  },
];

const DEFAULT_ITEMS_BY_LIST = {
  "compra da semana": [
    { id: 9, name: "Pão de forma", subtitle: "Pacote · 500 g", quantity: 1, unit: "1 un.", aisle: "Corredor 1", shelf: "Prateleira P1", nodeId: 1 },
    { id: 7, name: "Café torrado e moído", subtitle: "Pacote · 500 g", quantity: 1, unit: "1 un.", aisle: "Corredor 2", shelf: "Prateleira P1", nodeId: 1 },
    { id: 3, name: "Arroz branco", subtitle: "Pacote · 5 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 3", shelf: "Prateleira P2", nodeId: 2 },
    { id: 6, name: "Detergente neutro", subtitle: "Frasco · 500 ml", quantity: 1, unit: "1 un.", aisle: "Corredor 2", shelf: "Prateleira central", nodeId: 2 },
    { id: 2, name: "Leite integral 1 L", subtitle: "Caixa · 1 L", quantity: 1, unit: "1 un.", aisle: "Corredor 4", shelf: "Prateleira central", nodeId: 3 },
    { id: 8, name: "Ovos brancos", subtitle: "Bandeja · 12 unidades", quantity: 1, unit: "1 un.", aisle: "Corredor 4", shelf: "Prateleira inferior", nodeId: 3 },
    { id: 13, name: "Queijo muçarela", subtitle: "Bandeja · 200 g", quantity: 1, unit: "1 un.", aisle: "Corredor 5", shelf: "Balcão refrigerado", nodeId: 3 },
    { id: 1, name: "Banana prata", subtitle: "Porção · 1 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 5", shelf: "Banca central", nodeId: 4 },
  ],
  churrasco: [
    { id: 9, name: "Pão de alho tradicional", subtitle: "Bandeja · 400 g", quantity: 1, unit: "1 un.", aisle: "Corredor 1", shelf: "Prateleira central", nodeId: 1 },
    { id: 11, name: "Carvão vegetal", subtitle: "Saco · 5 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 2", shelf: "Prateleira inferior", nodeId: 2 },
    { id: 6, name: "Sal grosso para churrasco", subtitle: "Pacote · 1 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 2", shelf: "Prateleira central", nodeId: 2 },
    { id: 2, name: "Refrigerante tradicional", subtitle: "Garrafa · 2 L", quantity: 1, unit: "1 un.", aisle: "Corredor 3", shelf: "Prateleira central", nodeId: 3 },
    { id: 12, name: "Tomate italiano", subtitle: "Porção · 1 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 5", shelf: "Banca central", nodeId: 4 },
  ],
  "café da manhã": [
    { id: 7, name: "Café torrado e moído", subtitle: "Pacote · 500 g", quantity: 1, unit: "1 un.", aisle: "Corredor 1", shelf: "Prateleira superior", nodeId: 1 },
    { id: 9, name: "Pão de forma", subtitle: "Pacote · 500 g", quantity: 1, unit: "1 un.", aisle: "Corredor 1", shelf: "Prateleira central", nodeId: 1 },
    { id: 2, name: "Leite integral 1 L", subtitle: "Caixa · 1 L", quantity: 1, unit: "1 un.", aisle: "Corredor 3", shelf: "Prateleira central", nodeId: 3 },
    { id: 13, name: "Queijo muçarela", subtitle: "Bandeja · 200 g", quantity: 1, unit: "1 un.", aisle: "Corredor 4", shelf: "Balcão refrigerado", nodeId: 3 },
    { id: 8, name: "Ovos brancos", subtitle: "Bandeja · 12 unidades", quantity: 1, unit: "1 un.", aisle: "Corredor 4", shelf: "Prateleira inferior", nodeId: 3 },
    { id: 1, name: "Banana prata", subtitle: "Porção · 1 kg", quantity: 1, unit: "1 un.", aisle: "Corredor 5", shelf: "Banca central", nodeId: 4 },
  ],
};

function getFallbackItemsForListName(name = "") {
  const lower = String(name).toLowerCase().trim();
  if (lower.includes("churras")) return DEFAULT_ITEMS_BY_LIST.churrasco;
  if (lower.includes("café") || lower.includes("cafe")) return DEFAULT_ITEMS_BY_LIST["café da manhã"];
  return DEFAULT_ITEMS_BY_LIST["compra da semana"];
}

function inferProductSubtitle(item) {
  if (item.subtitle) return item.subtitle;
  if (item.size) return item.size;
  const lower = String(item.name || "").toLowerCase();
  if (lower.includes("leite")) return "Caixa · 1 L";
  if (lower.includes("banana")) return "Porção · 1 kg";
  if (lower.includes("arroz")) return "Pacote · 5 kg";
  if (lower.includes("feijão") || lower.includes("feijao")) return "Pacote · 1 kg";
  if (lower.includes("ovo")) return "Bandeja · 12 unidades";
  if (lower.includes("café") || lower.includes("cafe")) return "Pacote · 500 g";
  if (lower.includes("pão") || lower.includes("pao")) return "Pacote · 500 g";
  if (lower.includes("detergente")) return "Frasco · 500 ml";
  return "Unidade · 1 un.";
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

function PlusSmallIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path d="M3.1245 7.5H7.5M7.5 7.5H11.8755M7.5 7.5V3.1245M7.5 7.5V11.8755" stroke="#F26900" {...strokeProps} />
    </Svg>
  );
}

function PencilSmallIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clipPencilSavedList">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clipPencilSavedList)">
        <Path
          d="M10.0002 3.33273L10.0048 3.33733M10.0048 3.33733L12.6627 5.9949M10.0048 3.33733L11.459 1.88301C11.8115 1.53063 12.2895 1.3327 12.788 1.33276C13.2864 1.33283 13.7644 1.53087 14.1169 1.88334C14.4693 2.23581 14.6672 2.71382 14.6672 3.21222C14.6671 3.71062 14.469 4.18858 14.1165 4.54096L12.6627 5.9949M10.0048 3.33733L2.56083 10.7822C2.40603 10.9365 2.29155 11.1265 2.22747 11.3355L1.34672 14.2368C1.32949 14.2945 1.32819 14.3557 1.34295 14.414C1.35772 14.4724 1.38801 14.5256 1.43059 14.5681C1.47318 14.6106 1.52648 14.6408 1.58485 14.6555C1.64321 14.6702 1.70446 14.6688 1.76209 14.6515L4.66435 13.7715C4.87315 13.708 5.06317 13.5942 5.21773 13.4401L12.6627 5.9949M12.6627 5.9949L12.6671 5.99935"
          stroke="#66645F"
          {...strokeProps}
        />
      </G>
    </Svg>
  );
}

export function SavedListDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore, setCurrentStore } = useAuth();
  const initialList = route?.params?.list || {
    id: "fallback-compra-semana",
    name: "Compra da semana",
    updatedLabel: "Atualizada hoje",
    storeId: currentStore?.id || "00000000-0000-0000-0000-000000000001",
    storeName: currentStore?.name || "Mercado Aurora",
  };

  const [listDetails, setListDetails] = useState(initialList);
  const [availableStores, setAvailableStores] = useState(FALLBACK_STORES);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [updatingStore, setUpdatingStore] = useState(false);
  const [deletingList, setDeletingList] = useState(false);
  const [items, setItems] = useState(() =>
    Array.isArray(initialList.items) && initialList.items.length > 0
      ? initialList.items
      : getFallbackItemsForListName(initialList.name || initialList.title),
  );
  const [loading, setLoading] = useState(false);

  const loadListSummary = useCallback(async () => {
    const listId = initialList?.id;
    if (!auth?.token || !listId || String(listId).startsWith("fallback-")) {
      setItems(
        Array.isArray(initialList.items) && initialList.items.length > 0
          ? initialList.items
          : getFallbackItemsForListName(initialList.name || initialList.title),
      );
      return;
    }

    try {
      setLoading(true);
      const summary = await fetchShoppingListSummary(auth.token, listId);
      if (summary) {
        setListDetails((prev) => ({ ...prev, ...summary }));
        if (Array.isArray(summary.items) && summary.items.length > 0) {
          setItems(
            summary.items.map((item) => ({
              id: item.productId || item.id,
              productId: item.productId || item.id,
              name: item.name,
              subtitle: inferProductSubtitle(item),
              quantity: item.quantity || 1,
              unit: `${item.quantity || 1} un.`,
              aisle: item.aisle || item.location?.aisle || "Corredor 2",
              shelf: item.shelf || item.location?.shelf || "Prateleira central",
              nodeId: item.nodeId ?? item.location?.nodeId ?? null,
            })),
          );
        } else {
          setItems(getFallbackItemsForListName(summary.name || initialList.name));
        }
      }
    } catch {
      setItems(getFallbackItemsForListName(initialList.name || initialList.title));
    } finally {
      setLoading(false);
    }
  }, [auth?.token, initialList]);

  useEffect(() => {
    loadListSummary();
  }, [loadListSummary]);

  const activeStoreId =
    listDetails?.storeId ||
    currentStore?.id ||
    "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    let active = true;
    setStoresLoading(true);
    fetchStores(auth?.token)
      .then(async (remoteStores) => {
        if (!active) return;
        const listToUse = remoteStores.length > 0 ? remoteStores : FALLBACK_STORES;
        setAvailableStores(listToUse);
        const match = listToUse.find((s) => String(s.id) === String(activeStoreId));
        if (match) {
          setListDetails((prev) => ({
            ...prev,
            storeId: match.id,
            storeName: match.name,
          }));
        } else {
          try {
            const storeFromApi = await validateStore(auth?.token, activeStoreId);
            if (active && storeFromApi) {
              setListDetails((prev) => ({
                ...prev,
                storeId: storeFromApi.id,
                storeName: storeFromApi.name,
              }));
            }
          } catch {
            // Mantém os dados locais caso a API não responda
          }
        }
      })
      .catch(() => {
        if (active) setAvailableStores(FALLBACK_STORES);
      })
      .finally(() => {
        if (active) setStoresLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, activeStoreId]);

  const handleSelectStoreForList = async (selectedStore) => {
    if (updatingStore) return;
    setStorePickerOpen(false);
    const listId = listDetails?.id;
    const isRealList = auth?.token && listId && !String(listId).startsWith("fallback-");

    setListDetails((prev) => ({
      ...prev,
      storeId: selectedStore.id,
      storeName: selectedStore.name,
    }));
    if (setCurrentStore) {
      await setCurrentStore(selectedStore);
    }

    if (!isRealList) return;

    try {
      setUpdatingStore(true);
      const { list: updatedList } = await updateShoppingList(auth.token, listId, {
        storeId: selectedStore.id,
      });
      if (updatedList) {
        setListDetails((prev) => ({
          ...prev,
          ...updatedList,
          storeId: updatedList.storeId || selectedStore.id,
          storeName: updatedList.storeName || selectedStore.name,
        }));
      }
    } catch (error) {
      Alert.alert("Não foi possível atualizar o supermercado", error.message);
    } finally {
      setUpdatingStore(false);
    }
  };

  const listTitle = listDetails?.name || listDetails?.title || "Compra da semana";
  const storeName =
    listDetails?.storeName ||
    currentStore?.name ||
    "Mercado Aurora";
  const updatedLabel = listDetails?.updatedLabel || "Atualizada hoje";

  const totalProducts = items.length;
  const totalUnits = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [items],
  );

  const subtitleText = `${totalUnits} ${totalUnits === 1 ? "item" : "itens"} · ${totalProducts} ${
    totalProducts === 1 ? "produto" : "produtos"
  } · ${updatedLabel}`;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MyLists");
    }
  };

  const handleEditOrAddProducts = () => {
    navigation.navigate("CreateList", {
      list: {
        ...listDetails,
        name: listTitle,
        storeName,
        items,
      },
      isEditing: true,
    });
  };

  const handleStartRoute = () => {
    const fallbackRoute = {
      list: {
        id: listDetails?.id || "fallback-compra-semana",
        name: listTitle,
        storeName,
      },
      stops: items.map((item, idx) => ({
        productId: item.productId ?? item.id ?? idx + 1,
        name: item.name,
        quantity: item.quantity || 1,
        aisle: item.aisle || "Corredor 2",
        shelf: item.shelf || "Prateleira central",
        nodeId: item.nodeId ?? null,
        initialCollected: false,
      })),
      unlocatedItems: [],
      totalDistance: items.length * 8.5,
      locationWarning: "",
    };

    navigation.navigate("Route", {
      listId: listDetails?.id,
      list: { ...listDetails, name: listTitle, items },
      store: {
        id: listDetails?.storeId || currentStore?.id || "00000000-0000-0000-0000-000000000001",
        name: storeName,
      },
      fallbackRoute,
    });
  };

  const handleDeleteList = async () => {
    if (deletingList) return;
    const listId = listDetails?.id;
    const isRealList = auth?.token && listId && !String(listId).startsWith("fallback-");

    try {
      setDeletingList(true);
      if (isRealList) {
        await deleteShoppingList(auth.token, listId);
      }
      const activeSession = await loadActiveRouteSession();
      if (activeSession && String(activeSession.listId) === String(listId)) {
        await clearActiveRouteSession();
      }
      navigation.navigate("MyLists", { deletedListId: listId });
    } catch (error) {
      Alert.alert("Não foi possível excluir", error.message || "Tente novamente em instantes.");
    } finally {
      setDeletingList(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 44) }}>
      {/* Cabeçalho (2245:1802) */}
      <View className="h-[56px] w-full flex-row items-center justify-between px-[20px]">
        <Pressable
          accessibilityLabel="Voltar para Minhas listas"
          accessibilityRole="button"
          className="flex-row items-center gap-[4px] py-1 active:opacity-80"
          onPress={handleGoBack}
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
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Revisão da lista (2245:1808) */}
        <View className="w-full px-[20px] pt-[10px]" style={{ gap: 14 }}>
          {/* Apresentação (2245:1809) */}
          <View className="w-full" style={{ gap: 6 }}>
            <Text
              className="font-inter-extrabold text-[28px] leading-[32px] text-[#F26900]"
              style={{ letterSpacing: -0.7 }}
            >
              {listTitle}
            </Text>
            <Text className="font-sans text-[13px] leading-[19.5px] text-[#66645F]">
              {subtitleText}
            </Text>
          </View>

          {/* Supermercado da lista (2245:1812) */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Supermercado da lista: ${storeName}. Toque para trocar de supermercado.`}
            className="w-full flex-row items-center rounded-[14px] bg-[#FFF4E8] p-[12px] active:opacity-90"
            style={{ gap: 12 }}
            onPress={() => setStorePickerOpen(true)}
          >
            <View className="h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-white">
              <StoreIcon />
            </View>

            <View className="flex-1" style={{ gap: 3 }}>
              <Text className="font-sans text-[11px] leading-[14px] text-[#66645F]" numberOfLines={1}>
                Supermercado da lista
              </Text>
              <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]" numberOfLines={1}>
                {updatingStore ? "Atualizando..." : storeName}
              </Text>
            </View>

            <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#F26900]">
              Trocar
            </Text>
            <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
              <Path d="M4 6L8 10L12 6" stroke="#F26900" {...strokeProps} />
            </Svg>
          </Pressable>

          {/* Gerenciar produtos (2245:1819) */}
          <View className="w-full flex-row items-center justify-between">
            <Text className="font-inter-bold text-[16px] leading-[20px] text-[#1F1F1F]">
              Produtos da lista
            </Text>

            <Pressable
              accessibilityRole="button"
              className="flex-row items-center py-1 active:opacity-80"
              style={{ gap: 4 }}
              onPress={handleEditOrAddProducts}
            >
              <PlusSmallIcon />
              <Text className="font-inter-semibold text-[12px] text-[#F26900]">
                Adicionar
              </Text>
            </Pressable>
          </View>

          {/* Produtos (2245:1824) */}
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#F26900" size="small" />
            </View>
          ) : (
            <View className="w-full" style={{ gap: 5 }}>
              {items.map((item, idx) => (
                <View
                  key={`${item.id || idx}-${item.name}`}
                  className="h-[44px] w-full flex-row items-center rounded-[10px] border border-[#E8E8E0] bg-white px-[12px]"
                  style={{ gap: 10 }}
                >
                  <View className="flex-1" style={{ gap: 3 }}>
                    <Text
                      className="font-inter-semibold text-[13px] leading-[16px] text-[#1F1F1F]"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="font-sans text-[10px] leading-[12px] text-[#66645F]"
                      numberOfLines={1}
                    >
                      {inferProductSubtitle(item)}
                    </Text>
                  </View>

                  <View className="h-[28px] items-center justify-center rounded-[8px] bg-[#F7F7F3] px-[9px]">
                    <Text className="font-inter-semibold text-[11px] text-[#1F1F1F]">
                      {item.unit || `${item.quantity || 1} un.`}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${item.name}`}
                    className="h-[28px] w-[24px] items-center justify-center active:opacity-75"
                    onPress={handleEditOrAddProducts}
                  >
                    <PencilSmallIcon />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Iniciar compra e excluir lista/rota (2245:1889) */}
      <View className="w-full items-center border-t border-[#E8E8E0] bg-white px-[20px] pb-[14px] pt-[12px]" style={{ gap: 10 }}>
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
          accessibilityLabel="Excluir lista"
          className="py-1 active:opacity-75"
          disabled={deletingList}
          onPress={handleDeleteList}
        >
          <Text
            className="font-inter-semibold text-[13px] text-[#D92D20] underline"
            style={{ textDecorationLine: "underline", textDecorationColor: "#D92D20" }}
          >
            {deletingList ? "Excluindo..." : "Excluir lista"}
          </Text>
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={storePickerOpen}
        onRequestClose={() => setStorePickerOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/45"
          onPress={() => setStorePickerOpen(false)}
        >
          <Pressable
            className="w-full rounded-t-[24px] bg-white px-5 pb-8 pt-5"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="font-inter-bold text-[18px] text-[#1F1F1F]">
                  Supermercado da lista
                </Text>
                <Text className="font-sans text-[12px] text-[#66645F]">
                  Selecione o supermercado vinculado a esta lista
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Fechar seletor de supermercado"
                className="rounded-[10px] bg-[#F7F7F3] px-3 py-1.5"
                onPress={() => setStorePickerOpen(false)}
              >
                <Text className="font-inter-semibold text-[12px] text-[#66645F]">Fechar</Text>
              </Pressable>
            </View>

            {storesLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator color="#F26900" size="small" />
              </View>
            ) : (
              <View className="gap-2.5">
                {availableStores.map((storeItem) => {
                  const isCurrent = String(storeItem.id) === String(activeStoreId);
                  return (
                    <Pressable
                      key={storeItem.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isCurrent }}
                      className="flex-row items-center rounded-[14px] p-3"
                      style={{
                        backgroundColor: isCurrent ? "#FFF4E8" : "#FFFFFF",
                        borderWidth: isCurrent ? 1.5 : 1,
                        borderColor: isCurrent ? "#F26900" : "#E8E8E0",
                        gap: 12,
                      }}
                      onPress={() => handleSelectStoreForList(storeItem)}
                    >
                      <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-white">
                        <StoreIcon />
                      </View>
                      <View className="flex-1 gap-0.5">
                        <Text className="font-inter-bold text-[14px] text-[#1F1F1F]" numberOfLines={1}>
                          {storeItem.name}
                        </Text>
                        {storeItem.address ? (
                          <Text className="font-sans text-[11px] text-[#66645F]" numberOfLines={1}>
                            {storeItem.address}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        className="h-5 w-5 rounded-full bg-white"
                        style={{
                          borderWidth: isCurrent ? 5 : 1.5,
                          borderColor: isCurrent ? "#F26900" : "#E8E8E0",
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="h-[44px] flex-1 items-center justify-center rounded-[12px] border border-[#E8E8E0] bg-[#F7F7F3]"
                onPress={() => {
                  setStorePickerOpen(false);
                  navigation.navigate("QrScanner");
                }}
              >
                <Text className="font-inter-semibold text-[12px] text-[#1F1F1F]">
                  Escanear QR Code
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className="h-[44px] flex-1 items-center justify-center rounded-[12px] border border-[#E8E8E0] bg-[#F7F7F3]"
                onPress={() => {
                  setStorePickerOpen(false);
                  navigation.navigate("Catalog");
                }}
              >
                <Text className="font-inter-semibold text-[12px] text-[#F26900]">
                  Buscar no mapa
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
