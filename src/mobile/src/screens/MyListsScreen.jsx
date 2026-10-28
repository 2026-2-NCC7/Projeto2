import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { deleteShoppingList, fetchShoppingLists } from "../services/shopping-list-api";

const listIcons = {
  carrinho: require("../assets/lists/carrinho.png"),
  churrasco: require("../assets/lists/churrasco.png"),
  cafe: require("../assets/lists/cafe.png"),
};

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

function formatRelativeDate(dateValue) {
  if (!dateValue) return "Atualizada hoje";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Atualizada hoje";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfTarget) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Atualizada hoje";
  if (diffDays === 1) return "Atualizada ontem";
  return `Há ${diffDays} dias`;
}

function formatListMeta(list) {
  if (list.meta) return list.meta;
  const count = Number(list.itemCount ?? list.productCount ?? 0);
  const countLabel = `${count} ${count === 1 ? "item" : "itens"}`;
  const dateLabel = formatRelativeDate(list.updatedAt || list.createdAt);
  return `${countLabel} · ${dateLabel}`;
}

function ChevronRightIcon({ size = 18, color = "#F26900" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 15L12.5 10L7.5 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon({ size = 18, color = "#C53030" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2.5 5H4.16667M4.16667 5H17.5M4.16667 5V16.6667C4.16667 17.1087 4.34226 17.5326 4.65482 17.8452C4.96738 18.1577 5.39131 18.3333 5.83333 18.3333H14.1667C14.6087 18.3333 15.0326 18.1577 15.3452 17.8452C15.6577 17.5326 15.8333 17.1087 15.8333 16.6667V5M6.66667 5V3.33333C6.66667 2.89131 6.84226 2.46738 7.15482 2.15482C7.46738 1.84226 7.89131 1.66667 8.33333 1.66667H11.6667C12.1087 1.66667 12.5326 1.84226 12.8452 2.15482C13.1577 2.46738 13.3333 2.89131 13.3333 3.33333V5M8.33333 9.16667V14.1667M11.6667 9.16667V14.1667"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SavedListCard({ item, onPress, onDelete }) {
  const title = item.name || item.title || "Minha lista";
  const meta = formatListMeta(item);
  const icon = item.icon || pickListIcon(title);

  return (
    <Pressable
      accessibilityRole="button"
      className="h-[88px] flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-3 active:opacity-90"
      onPress={onPress}
    >
      <View className="h-[54px] w-[54px] items-center justify-center rounded-[12px] bg-[#FFF4E8]">
        <View style={{ width: 24, height: 24, overflow: "hidden" }}>
          <Image source={icon} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
        </View>
      </View>

      <View className="ml-3.5 flex-1">
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-[9px] font-sans text-[11px] leading-[13px] text-[#555555]" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <View className="ml-2 flex-row items-center gap-1.5">
        <Pressable
          accessibilityLabel={`Remover lista ${title}`}
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFF5F5] active:opacity-80"
          hitSlop={8}
          onPress={(event) => {
            event?.stopPropagation?.();
            onDelete();
          }}
        >
          <TrashIcon />
        </Pressable>

        <View className="h-7 w-5 items-center justify-center">
          <ChevronRightIcon />
        </View>
      </View>
    </Pressable>
  );
}

export function MyListsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth, setCurrentStore } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listToDelete, setListToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadLists = useCallback(async () => {
    if (!auth?.token) {
      setLists([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await fetchShoppingLists(auth.token);
      setLists(data);
    } catch (err) {
      setError(err.message || "Não foi possível carregar suas listas.");
    } finally {
      setLoading(false);
    }
  }, [auth?.token]);

  useEffect(() => {
    loadLists();
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [loadLists, navigation]);

  const handleOpenList = async (item) => {
    if (item.storeId) {
      await setCurrentStore({
        id: item.storeId,
        name: item.storeName || "Mercado Liberdade",
      });
    }
    navigation.navigate("CreateList", { list: item });
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete || deleting) return;
    try {
      setDeleting(true);
      await deleteShoppingList(auth?.token, listToDelete.id);
      setLists((prev) => prev.filter((item) => item.id !== listToDelete.id));
      setListToDelete(null);
    } catch (err) {
      setError(err.message || "Não foi possível remover a lista.");
      setListToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5"
          style={{ paddingTop: Math.max(insets.top, 44) + 20 }}
        >
          {/* Cabeçalho no mesmo padrão de Buscar supermercados */}
          <View className="gap-3">
            <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
            <Text className="font-inter-extrabold text-[25px] leading-[30px] text-achai">
              Minhas listas
            </Text>

            {/* Botão Criar nova lista */}
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-[14px] bg-achai active:opacity-90"
              onPress={() => navigation.navigate("CreateList")}
            >
              <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
                +  Criar nova lista
              </Text>
            </Pressable>
          </View>

          {/* Listas salvas vindas do backend */}
          <View className="mt-[22px] gap-4">
            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#F26900" size="small" />
              </View>
            ) : error ? (
              <View className="items-center rounded-[14px] border border-[#E8E8E0] px-5 py-6">
                <Text className="text-center font-sans text-[12px] text-[#555555]">
                  {error}
                </Text>
                <Pressable
                  className="mt-3 rounded-[10px] bg-[#FFF4E8] px-4 py-2"
                  onPress={loadLists}
                >
                  <Text className="font-inter-semibold text-[12px] text-achai">
                    Tentar novamente
                  </Text>
                </Pressable>
              </View>
            ) : lists.length === 0 ? (
              <View className="items-center rounded-[14px] border border-[#E8E8E0] px-5 py-6">
                <Text className="font-inter-semibold text-[14px] text-ink">
                  Nenhuma lista encontrada
                </Text>
                <Text className="mt-1.5 text-center font-sans text-[12px] leading-[17px] text-[#555555]">
                  Crie sua primeira lista de compras tocando no botão acima.
                </Text>
              </View>
            ) : (
              lists.map((item) => (
                <SavedListCard
                  key={item.id}
                  item={item}
                  onDelete={() => setListToDelete(item)}
                  onPress={() => handleOpenList(item)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de confirmação para excluir lista */}
      <Modal
        animationType="fade"
        onRequestClose={() => !deleting && setListToDelete(null)}
        transparent
        visible={Boolean(listToDelete)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-[350px] gap-3 rounded-[18px] bg-white p-5">
            <Text className="font-inter-bold text-[17px] leading-[21px] text-ink">
              Remover lista?
            </Text>
            <Text className="font-sans text-[13px] leading-[18px] text-[#555555]">
              {`Tem certeza que deseja remover "${listToDelete?.name || listToDelete?.title || "esta lista"}"? Essa ação não pode ser desfeita.`}
            </Text>

            <View className="mt-2 flex-row items-center gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="h-11 flex-1 items-center justify-center rounded-[12px] border border-[#E8E8E0] bg-white"
                disabled={deleting}
                onPress={() => setListToDelete(null)}
              >
                <Text className="font-inter-semibold text-[13px] text-ink">Cancelar</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="h-11 flex-1 items-center justify-center rounded-[12px] bg-[#C53030] active:opacity-90"
                disabled={deleting}
                onPress={handleConfirmDelete}
              >
                {deleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="font-inter-semibold text-[13px] text-white">Remover</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
