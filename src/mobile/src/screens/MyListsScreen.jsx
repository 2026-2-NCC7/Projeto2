import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { fetchShoppingLists } from "../services/shopping-list-api";

const listIcons = {
  carrinho: require("../assets/lists/carrinho.png"),
  churrasco: require("../assets/lists/churrasco.png"),
  cafe: require("../assets/lists/cafe.png"),
};

const DEFAULT_SAVED_LISTS = [
  {
    id: "fallback-compra-semana",
    name: "Compra da semana",
    itemCount: 8,
    updatedLabel: "Atualizada hoje",
    meta: "8 itens · Atualizada hoje",
    storeName: "Mercado Aurora",
    icon: listIcons.carrinho,
  },
  {
    id: "fallback-churrasco",
    name: "Churrasco",
    itemCount: 5,
    updatedLabel: "Atualizada ontem",
    meta: "5 itens · Atualizada ontem",
    storeName: "Mercado Aurora",
    icon: listIcons.churrasco,
  },
  {
    id: "fallback-cafe-manha",
    name: "Café da manhã",
    itemCount: 6,
    updatedLabel: "Há 4 dias",
    meta: "6 itens · Há 4 dias",
    storeName: "Mercado Aurora",
    icon: listIcons.cafe,
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
  const dateLabel = list.updatedLabel || formatRelativeDate(list.updatedAt || list.createdAt);
  return `${countLabel} · ${dateLabel}`;
}

function ChevronLeftHeaderIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M14 17L8 11L14 5"
        stroke="#F26900"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
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

function SavedListCard({ item, onPress }) {
  const title = item.name || item.title || "Minha lista";
  const meta = formatListMeta(item);
  const emoji = typeof item.emoji === "string" && item.emoji.trim() ? item.emoji.trim() : null;
  const icon = item.icon || pickListIcon(title);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir lista ${title}`}
      className="h-[88px] flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-[12px] active:opacity-90"
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

      <View className="ml-[14px] flex-1">
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-[9px] font-sans text-[11px] leading-[13px] text-[#555555]" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <View className="ml-2 h-8 w-6 items-center justify-center">
        <ChevronRightIcon />
      </View>
    </Pressable>
  );
}

export function MyListsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, setCurrentStore } = useAuth();
  const [lists, setLists] = useState(DEFAULT_SAVED_LISTS);
  const [deletedFallbackIds, setDeletedFallbackIds] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const deletedId = route?.params?.deletedListId;
    if (!deletedId) return;
    setDeletedFallbackIds((prev) => {
      const next = new Set(prev);
      next.add(String(deletedId));
      return next;
    });
    setLists((prev) => prev.filter((item) => String(item.id) !== String(deletedId)));
  }, [route?.params?.deletedListId]);

  const loadLists = useCallback(async () => {
    const filterDeleted = (arr) =>
      arr.filter((item) => !deletedFallbackIds.has(String(item.id)));

    if (!auth?.token) {
      setLists(filterDeleted(DEFAULT_SAVED_LISTS));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await fetchShoppingLists(auth.token);
      if (Array.isArray(data) && data.length > 0) {
        setLists(filterDeleted(data));
      } else {
        setLists([]);
      }
    } catch {
      setLists(filterDeleted(DEFAULT_SAVED_LISTS));
    } finally {
      setLoading(false);
    }
  }, [auth?.token, deletedFallbackIds]);

  useEffect(() => {
    loadLists();
    const unsubscribe = navigation.addListener("focus", loadLists);
    return unsubscribe;
  }, [loadLists, navigation]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  const handleOpenList = async (item) => {
    if (item.storeId) {
      await setCurrentStore({
        id: item.storeId,
        name: item.storeName || "Mercado Aurora",
      });
    }
    navigation.navigate("SavedListDetails", { list: item });
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
          {/* Cabeçalho padronizado */}
          <View className="gap-3">
            <Text className="font-brand text-[22px] leading-[26px] text-ink">
              Ach.ai
            </Text>
            <Text className="font-inter-extrabold text-[25px] leading-[30px] text-achai">
              Minhas listas
            </Text>
          </View>

          {/* Botão Criar nova lista (2063:225) */}
          <Pressable
            accessibilityRole="button"
            className="mt-[14px] h-[48px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
            onPress={() => navigation.navigate("CreateList")}
          >
            <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]">
              +  Criar nova lista
            </Text>
          </Pressable>

          {/* Cards de listas salvas (2063:227, 2063:233, 2063:239) */}
          <View className="mt-[22px]" style={{ gap: 16 }}>
            {loading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#F26900" size="small" />
              </View>
            ) : (
              lists.map((item) => (
                <SavedListCard
                  key={String(item.id)}
                  item={item}
                  onPress={() => handleOpenList(item)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
