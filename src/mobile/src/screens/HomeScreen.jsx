import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { fetchShoppingLists } from "../services/shopping-list-api";
import { fetchSuggestions } from "../services/suggestions-api";
import { loadActiveRouteSession } from "../storage/route-session-storage";

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
];

const DEFAULT_SUGGESTIONS = [
  {
    id: 2,
    name: "Leite integral 1 L",
    category: "Laticínios",
    location: { aisle: "Corredor 3" },
  },
  {
    id: 1,
    name: "Banana prata",
    category: "Hortifruti",
    location: { aisle: "Setor A" },
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
  const count = Number(list.itemCount ?? list.productCount ?? (Array.isArray(list.items) ? list.items.length : 0));
  const countLabel = `${count} ${count === 1 ? "item" : "itens"}`;
  const dateLabel = list.updatedLabel || formatRelativeDate(list.updatedAt || list.createdAt);
  return `${countLabel} · ${dateLabel}`;
}

function formatSuggestionSubtitle(suggestion) {
  const category = suggestion?.category || "Sugestão";
  const aisle = suggestion?.location?.aisle || suggestion?.aisle || "";
  if (aisle) {
    return `${category} · ${aisle}`;
  }
  const lower = String(suggestion?.name || "").toLowerCase();
  if (lower.includes("leite")) return "Laticínios · Corredor 3";
  if (lower.includes("banana")) return "Hortifruti · Setor A";
  return `${category} · Corredor 2`;
}

function QrCodeIcon() {
  return (
    <Svg height={28} width={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M9.91667 3.5H4.08333C3.76117 3.5 3.5 3.76117 3.5 4.08333V9.91667C3.5 10.2388 3.76117 10.5 4.08333 10.5H9.91667C10.2388 10.5 10.5 10.2388 10.5 9.91667V4.08333C10.5 3.76117 10.2388 3.5 9.91667 3.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M23.9167 3.5H18.0833C17.7612 3.5 17.5 3.76117 17.5 4.08333V9.91667C17.5 10.2388 17.7612 10.5 18.0833 10.5H23.9167C24.2388 10.5 24.5 10.2388 24.5 9.91667V4.08333C24.5 3.76117 24.2388 3.5 23.9167 3.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M9.91667 17.5H4.08333C3.76117 17.5 3.5 17.7612 3.5 18.0833V23.9167C3.5 24.2388 3.76117 3.5 4.08333 24.5H9.91667C10.2388 24.5 10.5 24.2388 10.5 23.9167V18.0833C10.5 17.7612 10.2388 17.5 9.91667 17.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 17.5H21V21H24.5M17.5 24.5H21M24.5 17.5V14M14 3.5V7M14 14H10.5M3.5 14H7M14 17.5V24.5"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M7 7H7.01167M21 7H21.0117M7 21H7.01167"
        stroke="#F26900"
        strokeWidth={2.68333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightSmallIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 15L12.5 10L7.5 5"
        stroke="#F26900"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HomeSavedListCard({ item, onPress }) {
  const title = item.name || item.title || "Minha lista";
  const meta = formatListMeta(item);
  const emoji = typeof item.emoji === "string" && item.emoji.trim() ? item.emoji.trim() : null;
  const icon = item.icon || pickListIcon(title);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir lista ${title}`}
      className="h-[74px] w-full flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-[11px] active:opacity-90"
      onPress={onPress}
    >
      <View className="h-[48px] w-[48px] items-center justify-center rounded-[12px] bg-[#F26900]">
        {emoji ? (
          <Text className="text-[22px] leading-[26px]">{emoji}</Text>
        ) : (
          <View style={{ width: 24, height: 24, overflow: "hidden" }}>
            <Image source={icon} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
          </View>
        )}
      </View>

      <View className="ml-[13px] flex-1" style={{ gap: 6 }}>
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans text-[11px] leading-[13px] text-[#555555]" numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <View className="ml-2 h-8 w-5 items-center justify-center">
        <ChevronRightSmallIcon />
      </View>
    </Pressable>
  );
}

function SuggestionCard({ suggestion, onPressAdd }) {
  return (
    <View className="h-[76px] w-full flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-[10px]">
      <View className="h-[56px] w-[56px] items-center justify-center rounded-[10px] bg-[#F26900]">
        <Text className="font-inter-semibold text-[20px] text-[#1F1F1F]">✦</Text>
      </View>

      <View className="ml-[12px] flex-1" style={{ gap: 5 }}>
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-[#1F1F1F]" numberOfLines={1}>
          {suggestion.name}
        </Text>
        <Text className="font-sans text-[11px] leading-[14px] text-[#555555]" numberOfLines={1}>
          {formatSuggestionSubtitle(suggestion)}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Adicionar ${suggestion.name} a uma lista`}
        className="h-[32px] w-[36px] items-center justify-center rounded-[10px] bg-[#F26900] active:opacity-85"
        onPress={onPressAdd}
      >
        <Text className="font-inter-semibold text-[18px] leading-[20px] text-[#1F1F1F]">+</Text>
      </Pressable>
    </View>
  );
}

export function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore, setCurrentStore } = useAuth();
  const [lists, setLists] = useState(DEFAULT_SAVED_LISTS);
  const [loadingLists, setLoadingLists] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [activeRouteSession, setActiveRouteSession] = useState(null);

  const firstName = useMemo(() => {
    const rawName = auth?.user?.name || "Marina";
    const first = String(rawName).trim().split(/\s+/)[0];
    return first || "Marina";
  }, [auth?.user?.name]);

  const loadHomeData = useCallback(async () => {
    // 1. Carrega sessão de rota ativa (salva em RouteScreen)
    const storedSession = await loadActiveRouteSession();
    if (
      storedSession &&
      !storedSession.completed &&
      Number(storedSession.totalCount || 0) > 0 &&
      Number(storedSession.remainingCount ?? storedSession.totalCount - (storedSession.collectedCount || 0)) > 0
    ) {
      setActiveRouteSession(storedSession);
    } else {
      setActiveRouteSession(null);
    }

    // 2. Carrega as listas reais do usuário no backend
    if (auth?.token) {
      try {
        setLoadingLists(true);
        const remoteLists = await fetchShoppingLists(auth.token);
        if (Array.isArray(remoteLists) && remoteLists.length > 0) {
          setLists(remoteLists);
        } else {
          setLists(DEFAULT_SAVED_LISTS);
        }
      } catch {
        setLists(DEFAULT_SAVED_LISTS);
      } finally {
        setLoadingLists(false);
      }
    } else {
      setLists(DEFAULT_SAVED_LISTS);
      setLoadingLists(false);
    }

    // 3. Carrega sugestões do backend
    try {
      setLoadingSuggestions(true);
      const remoteSuggestions = await fetchSuggestions(auth?.token, currentStore?.id);
      if (Array.isArray(remoteSuggestions) && remoteSuggestions.length > 0) {
        setSuggestions(remoteSuggestions.slice(0, 2));
      } else {
        setSuggestions(DEFAULT_SUGGESTIONS);
      }
    } catch {
      setSuggestions(DEFAULT_SUGGESTIONS);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [auth?.token, currentStore?.id]);

  useEffect(() => {
    loadHomeData();
    const unsubscribe = navigation.addListener("focus", loadHomeData);
    return unsubscribe;
  }, [loadHomeData, navigation]);

  // Dados da seção "Compra em andamento" (2245:2201) — sincronizado com o backend e sessão local
  const ongoingPurchase = useMemo(() => {
    const backendActiveList = Array.isArray(lists)
      ? lists.find((item) => {
          const total = Number(item?.productCount ?? item?.itemCount ?? item?.items?.length ?? 0);
          const done = Number(item?.collectedCount ?? 0) + Number(item?.notFoundCount ?? 0);
          return Boolean(item?.routeInProgress) && total > 0 && done < total;
        })
      : null;

    if (backendActiveList) {
      const total = Math.max(
        1,
        Number(
          backendActiveList.productCount ??
            backendActiveList.itemCount ??
            backendActiveList.items?.length ??
            1,
        ),
      );
      const collected = Math.min(total, Math.max(0, Number(backendActiveList.collectedCount ?? 0)));
      const notFound = Math.max(0, Number(backendActiveList.notFoundCount ?? 0));
      const remaining = Math.max(0, total - collected - notFound);

      const matchingLocal =
        activeRouteSession &&
        !activeRouteSession.completed &&
        String(activeRouteSession.listId) === String(backendActiveList.id)
          ? activeRouteSession
          : null;

      return {
        storeName: backendActiveList.storeName || currentStore?.name || "Mercado Liberdade",
        listName: backendActiveList.name || "Compra da semana",
        listId: backendActiveList.id,
        storeId: backendActiveList.storeId || currentStore?.id || "00000000-0000-0000-0000-000000000001",
        collectedCount: matchingLocal
          ? Math.max(collected, Number(matchingLocal.collectedCount ?? 0))
          : collected,
        totalCount: total,
        remainingCount: matchingLocal
          ? Math.min(remaining, Number(matchingLocal.remainingCount ?? remaining))
          : remaining,
        progressRatio: Math.min(
          1,
          Math.max(
            0,
            (matchingLocal
              ? Math.max(collected, Number(matchingLocal.collectedCount ?? 0))
              : collected) / total,
          ),
        ),
        session: matchingLocal,
      };
    }

    if (!activeRouteSession || !(Number(activeRouteSession.totalCount) > 0)) {
      return null;
    }
    const total = Math.max(1, Number(activeRouteSession.totalCount));
    const collected = Math.min(total, Math.max(0, Number(activeRouteSession.collectedCount ?? 0)));
    const remaining = Math.max(0, Number(activeRouteSession.remainingCount ?? total - collected));
    if (remaining <= 0 || activeRouteSession.completed) {
      return null;
    }
    return {
      storeName: activeRouteSession.storeName || currentStore?.name || "Mercado Liberdade",
      listName: activeRouteSession.listName || lists[0]?.name || "Compra da semana",
      listId: activeRouteSession.listId || lists[0]?.id || "fallback-compra-semana",
      storeId: activeRouteSession.storeId || currentStore?.id || "00000000-0000-0000-0000-000000000001",
      collectedCount: collected,
      totalCount: total,
      remainingCount: remaining,
      progressRatio: Math.min(1, Math.max(0, collected / total)),
      session: activeRouteSession,
    };
  }, [activeRouteSession, currentStore?.id, currentStore?.name, lists]);

  const displayedLists = useMemo(() => lists.slice(0, 2), [lists]);

  const handleContinueRoute = () => {
    if (!ongoingPurchase) return;
    const primaryList =
      lists.find((item) => String(item.id) === String(ongoingPurchase.listId)) ||
      lists[0] ||
      DEFAULT_SAVED_LISTS[0];

    navigation.navigate("Route", {
      listId: ongoingPurchase.listId,
      list: primaryList,
      store: {
        id: ongoingPurchase.storeId || activeRouteSession?.storeId || currentStore?.id || "00000000-0000-0000-0000-000000000001",
        name: ongoingPurchase.storeName,
      },
      resumeSession: ongoingPurchase.session || undefined,
    });
  };

  const handleOpenSavedList = async (item) => {
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
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5"
          style={{ paddingTop: Math.max(insets.top, 44) + 20 }}
        >
          {/* Cabeçalho padronizado com Buscar, Listas e Perfil */}
          <View className="gap-3">
            <Text className="font-brand text-[22px] leading-[26px] text-ink">
              Ach.ai
            </Text>

            <Text className="font-inter-extrabold text-[25px] leading-[30px] text-achai">
              {`Olá, ${firstName}!`}
            </Text>
          </View>

          <Text className="mt-[4px] font-sans text-[13px] leading-[16px] text-[#555555]">
            Vamos facilitar sua próxima compra?
          </Text>

          {/* Botão Escanear QR Code (2063:179) */}
          <Pressable
            accessibilityRole="button"
            className="mt-[24px] h-[92px] w-full flex-row items-center rounded-[18px] bg-[#F26900] px-[14px] active:opacity-90"
            onPress={() => navigation.navigate("QrScanner")}
          >
            <View className="h-[54px] w-[54px] items-center justify-center rounded-[14px] bg-white">
              <QrCodeIcon />
            </View>
            <View className="ml-[14px] flex-1" style={{ gap: 5 }}>
              <Text className="font-inter-semibold text-[17px] leading-[21px] text-[#1F1F1F]">
                Escanear QR Code
              </Text>
              <Text className="font-sans text-[12px] leading-[15px] text-[#1F1F1F]">
                Entre na loja e gere sua rota
              </Text>
            </View>
          </Pressable>

          {/* Compra em andamento — Retornar à rota da loja (2245:2201) */}
          {ongoingPurchase ? (
            <View className="mt-[32px] w-full" style={{ gap: 12 }}>
              {/* Apresentação (2245:2202) */}
              <View className="w-full" style={{ gap: 4 }}>
                <Text className="font-inter-extrabold text-[18px] leading-[22px] text-[#F26900]">
                  {`Sua compra no ${ongoingPurchase.storeName}`}
                </Text>
                <Text className="font-sans text-[13px] leading-[16px] text-[#66645F]">
                  {ongoingPurchase.listName}
                </Text>
              </View>

              {/* Progresso da compra (2245:2205) */}
              <View className="w-full" style={{ gap: 8 }}>
                <View className="w-full flex-row items-center justify-between">
                  <Text className="font-inter-semibold text-[13px] leading-[16px] text-[#1F1F1F]">
                    {`${ongoingPurchase.collectedCount} de ${ongoingPurchase.totalCount} ${
                      ongoingPurchase.totalCount === 1 ? "item coletado" : "itens coletados"
                    }`}
                  </Text>
                  <Text className="font-sans text-[12px] leading-[15px] text-[#66645F]">
                    {`${ongoingPurchase.remainingCount} ${
                      ongoingPurchase.remainingCount === 1 ? "restante" : "restantes"
                    }`}
                  </Text>
                </View>

                <View className="h-[6px] w-full overflow-hidden rounded-full bg-[#EDEDE7]">
                  <View
                    className="h-[6px] rounded-full bg-[#F26900]"
                    style={{ width: `${Math.round(ongoingPurchase.progressRatio * 100)}%` }}
                  />
                </View>
              </View>

              {/* Ação principal — Continuar rota (2245:2211) */}
              <Pressable
                accessibilityRole="button"
                className="h-[50px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
                onPress={handleContinueRoute}
              >
                <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
                  Continuar rota
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Seção Minhas listas integrada ao backend (2063:184, 2063:185) */}
          <View className="mt-[32px] w-full">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-extrabold text-[19px] leading-[23px] text-[#F26900]">
                Minhas listas
              </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => navigation.navigate("MyLists")}
              >
                <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#F26900]">
                  Ver todas
                </Text>
              </Pressable>
            </View>

            <View className="mt-[14px]" style={{ gap: 14 }}>
              {loadingLists ? (
                <View className="items-center py-6">
                  <ActivityIndicator color="#F26900" size="small" />
                </View>
              ) : (
                displayedLists.map((item) => (
                  <HomeSavedListCard
                    key={String(item.id)}
                    item={item}
                    onPress={() => handleOpenSavedList(item)}
                  />
                ))
              )}
            </View>
          </View>

          {/* Seção Sugestões para você (2063:198) */}
          <View className="mt-[32px] w-full">
            <Text className="font-inter-extrabold text-[18px] leading-[22px] text-[#F26900]">
              Sugestões para você
            </Text>

            <View className="mt-[14px]" style={{ gap: 10 }}>
              {loadingSuggestions ? (
                <View className="items-center py-6">
                  <ActivityIndicator color="#F26900" size="small" />
                </View>
              ) : (
                suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={String(suggestion.id)}
                    suggestion={suggestion}
                    onPressAdd={() => navigation.navigate("CreateList")}
                  />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Início" />
    </View>
  );
}
