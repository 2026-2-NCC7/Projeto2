import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomNavigation } from "../components/BottomNavigation";
import { IndoorStoreMap } from "../components/IndoorStoreMap";
import { useAuth } from "../context/AuthContext";
import { calculateRoute, calculateStoreRouteByItems } from "../services/route-api";
import { updateListItem, updateShoppingList } from "../services/shopping-list-api";
import { clearActiveRouteSession, saveActiveRouteSession } from "../storage/route-session-storage";
import {
  computeIndoorRoutePolylines,
  mapStopsToIndoorGraphStops,
  orderStopsWithDijkstra,
} from "../shared/indoor-map-engine";

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

const DEFAULT_FIGMA_STOPS = [
  {
    productId: 9,
    name: "Pão de forma tradicional",
    quantity: 1,
    aisle: "Corredor 1",
    shelf: "Prateleira P1",
    nodeId: 1,
    centerX: 23,
    centerY: 159,
    corridorIndex: 0,
    initialCollected: false,
  },
  {
    productId: 7,
    name: "Café torrado e moído 500 g",
    quantity: 1,
    aisle: "Corredor 2",
    shelf: "Prateleira P1",
    nodeId: 1,
    centerX: 95,
    centerY: 79,
    corridorIndex: 1,
    initialCollected: false,
  },
  {
    productId: 3,
    name: "Arroz branco 5 kg",
    quantity: 1,
    aisle: "Corredor 3",
    shelf: "Prateleira P2",
    nodeId: 2,
    centerX: 175,
    centerY: 159,
    corridorIndex: 2,
    initialCollected: false,
  },
  {
    productId: 2,
    name: "Leite integral 1 L",
    quantity: 1,
    aisle: "Corredor 3",
    shelf: "Prateleira central",
    nodeId: 3,
    centerX: 255,
    centerY: 99,
    corridorIndex: 3,
    initialCollected: false,
  },
  {
    productId: 8,
    name: "Ovos brancos 12 unidades",
    quantity: 1,
    aisle: "Corredor 4",
    shelf: "Prateleira inferior",
    nodeId: 3,
    centerX: 255,
    centerY: 169,
    corridorIndex: 3,
    initialCollected: false,
  },
  {
    productId: 6,
    name: "Detergente neutro 500 ml",
    quantity: 1,
    aisle: "Corredor 5",
    shelf: "Prateleira inferior",
    nodeId: 2,
    centerX: 325,
    centerY: 194,
    corridorIndex: 4,
    initialCollected: false,
  },
  {
    productId: 13,
    name: "Queijo muçarela 200 g",
    quantity: 1,
    aisle: "Corredor 5",
    shelf: "Balcão refrigerado",
    nodeId: 3,
    centerX: 325,
    centerY: 149,
    corridorIndex: 4,
    initialCollected: false,
  },
  {
    productId: 1,
    name: "Banana prata 1 kg",
    quantity: 1,
    aisle: "Corredor 5",
    shelf: "Banca central",
    nodeId: 4,
    centerX: 325,
    centerY: 79,
    corridorIndex: 4,
    initialCollected: false,
  },
];

export function RouteScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore } = useAuth();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState(() =>
    orderStopsWithDijkstra(
      mapStopsToIndoorGraphStops(DEFAULT_FIGMA_STOPS, DEFAULT_FIGMA_STOPS),
      "entrance",
      null,
    ),
  );
  const [collectedIds, setCollectedIds] = useState(() => new Set());
  const [notFoundIds, setNotFoundIds] = useState(() => new Set());
  const [userAnchor, setUserAnchor] = useState(null);
  const [mapHint, setMapHint] = useState(
    "Toque em qualquer corredor ou canto livre do mapa para recalcular a rota (Dijkstra) a partir de você.",
  );

  const storeId =
    route?.params?.store?.id ||
    currentStore?.id ||
    "00000000-0000-0000-0000-000000000001";
  const storeName =
    route?.params?.store?.name ||
    routeData?.list?.storeName ||
    routeData?.store?.name ||
    currentStore?.name ||
    "Mercado Aurora";
  const listName =
    route?.params?.list?.name ||
    routeData?.list?.name ||
    "Compra da semana";

  useEffect(() => {
    let active = true;
    const listId = route?.params?.listId;
    const fallbackRoute = route?.params?.fallbackRoute;
    const resumeSession = route?.params?.resumeSession;
    const candidateItems =
      resumeSession?.stops ||
      route?.params?.list?.items ||
      fallbackRoute?.stops ||
      DEFAULT_FIGMA_STOPS;

    const applyResolvedRoute = (resolvedRoute) => {
      if (!active) return;
      setRouteData(resolvedRoute);
      const mapped = mapStopsToIndoorGraphStops(resolvedRoute?.stops, DEFAULT_FIGMA_STOPS);
      const orderedByDijkstra =
        Array.isArray(resumeSession?.stops) && resumeSession.stops.length > 0
          ? mapped
          : orderStopsWithDijkstra(mapped, "entrance", null);
      setStops(orderedByDijkstra);

      if (resumeSession && Array.isArray(resumeSession.collectedIds)) {
        setCollectedIds(new Set(resumeSession.collectedIds));
        setNotFoundIds(new Set(resumeSession.notFoundIds || []));
        setUserAnchor(resumeSession.userAnchor || null);
      } else {
        const initialSet = new Set(
          orderedByDijkstra
            .filter((s) => s.initialCollected === true || s.collected === true)
            .map((s) => s.productId),
        );
        const initialNotFoundSet = new Set(
          orderedByDijkstra
            .filter((s) => s.notFound === true)
            .map((s) => s.productId),
        );
        setCollectedIds(initialSet);
        setNotFoundIds(initialNotFoundSet);
        setUserAnchor(null);
      }
      setLoading(false);
    };

    if (resumeSession && Array.isArray(resumeSession.stops) && resumeSession.stops.length > 0) {
      applyResolvedRoute({
        list: {
          id: resumeSession.listId || listId || "fallback-compra-semana",
          name: resumeSession.listName || listName,
          storeName: resumeSession.storeName || storeName,
        },
        stops: resumeSession.stops,
      });
      return () => {
        active = false;
      };
    }

    async function loadRouteFromBackend() {
      try {
        setLoading(true);
        if (auth?.token && listId && !String(listId).startsWith("fallback-")) {
          const result = await calculateRoute(auth.token, listId);
          if (result?.stops?.length) {
            applyResolvedRoute(result);
            return;
          }
        }

        const storeRoute = await calculateStoreRouteByItems(storeId, candidateItems);
        if (storeRoute?.stops?.length) {
          applyResolvedRoute({
            ...storeRoute,
            list: { id: listId || "fallback-compra-semana", name: listName, storeName },
          });
          return;
        }
      } catch {
        // Fallback local se o backend estiver offline
      }

      applyResolvedRoute(
        fallbackRoute || {
          list: { name: listName, storeName },
          stops: DEFAULT_FIGMA_STOPS,
        },
      );
    }

    loadRouteFromBackend();

    return () => {
      active = false;
    };
  }, [
    auth?.token,
    route?.params?.listId,
    route?.params?.list?.items,
    route?.params?.fallbackRoute,
    storeId,
    listName,
    storeName,
  ]);

  const totalCount = Math.max(stops.length, 1);
  const collectedCount = collectedIds.size;
  const remainingCount = Math.max(0, totalCount - collectedCount - notFoundIds.size);
  const progressRatio = Math.min(1, Math.max(0, collectedCount / totalCount));

  useEffect(() => {
    if (loading || !stops.length) return;
    const rem = Math.max(0, stops.length - collectedIds.size - notFoundIds.size);
    if (rem === 0) {
      clearActiveRouteSession();
      return;
    }
    saveActiveRouteSession({
      listId: route?.params?.listId || routeData?.list?.id || "fallback-compra-semana",
      listName,
      storeId,
      storeName,
      totalCount: stops.length,
      collectedCount: collectedIds.size,
      remainingCount: rem,
      collectedIds: [...collectedIds],
      notFoundIds: [...notFoundIds],
      userAnchor,
      stops,
      completed: false,
    });
  }, [
    loading,
    stops,
    collectedIds,
    notFoundIds,
    userAnchor,
    route?.params?.listId,
    routeData?.list?.id,
    listName,
    storeId,
    storeName,
  ]);

  const activeIndex = useMemo(() => {
    const idx = stops.findIndex(
      (s) => !collectedIds.has(s.productId) && !notFoundIds.has(s.productId),
    );
    return idx >= 0 ? idx : Math.max(0, stops.length - 1);
  }, [stops, collectedIds, notFoundIds]);

  const activeStop = stops[activeIndex] || stops[0] || DEFAULT_FIGMA_STOPS[0];

  const { collectedPointsAttr, upcomingPointsAttr } = useMemo(
    () => computeIndoorRoutePolylines(stops, collectedIds, notFoundIds, userAnchor),
    [stops, collectedIds, notFoundIds, userAnchor],
  );

  const handleSelectUserAnchor = (nextAnchor, nearestCorridor) => {
    setUserAnchor(nextAnchor);
    setMapHint(
      `Grafo recalculado (Dijkstra) a partir da sua posição em (${nextAnchor.x}, ${nextAnchor.y}) · ${nearestCorridor.name}`,
    );

    setStops((prevStops) => {
      const done = prevStops.filter(
        (s) => collectedIds.has(s.productId) || notFoundIds.has(s.productId),
      );
      const pending = prevStops.filter(
        (s) => !collectedIds.has(s.productId) && !notFoundIds.has(s.productId),
      );
      const reorderedPending = orderStopsWithDijkstra(pending, "user", nextAnchor);
      return [...done, ...reorderedPending];
    });

    const excludedProductIds = [...collectedIds, ...notFoundIds];
    const listId = route?.params?.listId;
    if (auth?.token && listId && !String(listId).startsWith("fallback-")) {
      calculateRoute(auth.token, listId, {
        startAisle: nearestCorridor.name,
        excludedProductIds,
      }).catch(() => {});
    } else {
      calculateStoreRouteByItems(storeId, stops, {
        startAisle: nearestCorridor.name,
        excludedProductIds,
      }).catch(() => {});
    }
  };

  const navigateToCompleted = (finalCollectedSet, finalNotFoundSet) => {
    clearActiveRouteSession();
    const listId = route?.params?.listId || routeData?.list?.id;
    if (auth?.token && listId && !String(listId).startsWith("fallback-")) {
      updateShoppingList(auth.token, listId, { routeInProgress: false }).catch(() => {});
    }
    navigation.navigate("RouteCompleted", {
      listId: listId || "fallback-compra-semana",
      listName,
      storeId,
      storeName,
      stops,
      totalCount: stops.length,
      collectedCount: finalCollectedSet.size,
      notFoundCount: finalNotFoundSet.size,
    });
  };

  const handleMarkCollected = () => {
    if (!activeStop) return;
    const targetId = activeStop.productId;
    const nextCollected = new Set(collectedIds);
    nextCollected.add(targetId);
    setCollectedIds(nextCollected);
    setUserAnchor(null);

    const listId = route?.params?.listId || routeData?.list?.id;
    if (auth?.token && listId && !String(listId).startsWith("fallback-") && targetId) {
      updateListItem(auth.token, listId, targetId, {
        collected: true,
        notFound: false,
      }).catch(() => {});
    }

    const remainingAfterThis = stops.filter(
      (s) => !nextCollected.has(s.productId) && !notFoundIds.has(s.productId),
    );
    if (remainingAfterThis.length === 0) {
      navigateToCompleted(nextCollected, notFoundIds);
      return;
    }

    setStops((prevStops) => {
      const done = prevStops.filter(
        (s) => nextCollected.has(s.productId) || notFoundIds.has(s.productId),
      );
      const pending = prevStops.filter(
        (s) => !nextCollected.has(s.productId) && !notFoundIds.has(s.productId),
      );
      if (pending.length <= 1) return [...done, ...pending];
      const anchorFromCollected = {
        x: activeStop.centerX,
        y: activeStop.centerY,
      };
      const reordered = orderStopsWithDijkstra(pending, "user", anchorFromCollected);
      return [...done, ...reordered];
    });
  };

  const handleNotFound = () => {
    if (!activeStop) return;
    const targetId = activeStop.productId;
    const nextNotFound = new Set(notFoundIds);
    nextNotFound.add(targetId);
    setNotFoundIds(nextNotFound);
    setUserAnchor(null);

    const listId = route?.params?.listId || routeData?.list?.id;
    if (auth?.token && listId && !String(listId).startsWith("fallback-") && targetId) {
      updateListItem(auth.token, listId, targetId, {
        collected: false,
        notFound: true,
      }).catch(() => {});
    }

    const remainingAfterThis = stops.filter(
      (s) => !collectedIds.has(s.productId) && !nextNotFound.has(s.productId),
    );
    if (remainingAfterThis.length === 0) {
      navigateToCompleted(collectedIds, nextNotFound);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#F26900" />
        <Text className="font-sans mt-3 text-sm text-[#66645F]">Calculando sua rota...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: Math.max(insets.top, 44) }}>
      <View className="h-[56px] w-full flex-row items-center justify-between px-[20px]">
        <Text className="font-brand text-[20px] text-[#1F1F1F]">Ach.ai</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full px-[20px] pt-[10px]" style={{ gap: 16 }}>
          <View className="w-full" style={{ gap: 6 }}>
            <Text
              className="font-inter-extrabold text-[28px] leading-[32px] text-[#F26900]"
              style={{ letterSpacing: -0.7 }}
            >
              Rota na loja
            </Text>
            <Text className="font-sans text-[13px] leading-[19.5px] text-[#66645F]">
              {storeName} · {listName}
            </Text>
          </View>

          <View className="w-full" style={{ gap: 9 }}>
            <View className="w-full flex-row items-center justify-between">
              <Text className="font-inter-semibold text-[13px] text-[#1F1F1F]">
                {collectedCount} de {totalCount} itens coletados
              </Text>
              <Text className="font-sans text-[12px] text-[#66645F]">
                {remainingCount} {remainingCount === 1 ? "restante" : "restantes"}
              </Text>
            </View>

            <View className="h-[6px] w-full overflow-hidden rounded-full bg-[#EDEDE7]">
              <View
                className="h-[6px] rounded-full bg-[#F26900]"
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </View>
          </View>

          <View className="w-full" style={{ gap: 10 }}>
            <View className="w-full flex-row items-center justify-between">
              <Text className="font-inter-bold text-[14px] text-[#1F1F1F]">
                Seu caminho pelos corredores
              </Text>
              <Text className="font-sans text-[11px] text-[#66645F]">
                {totalCount} {totalCount === 1 ? "parada" : "paradas"}
              </Text>
            </View>

            <IndoorStoreMap
              variant="mobile"
              stops={stops}
              activeIndex={activeIndex}
              collectedIds={collectedIds}
              notFoundIds={notFoundIds}
              userAnchor={userAnchor}
              collectedPointsAttr={collectedPointsAttr}
              upcomingPointsAttr={upcomingPointsAttr}
              onSelectUserAnchor={handleSelectUserAnchor}
              onInvalidShelfTap={() =>
                setMapHint("Você clicou sobre uma prateleira. Toque em um corredor ou passagem livre.")
              }
            />

            <View className="w-full flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 18 }}>
                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <View className="h-[8px] w-[8px] rounded-full bg-[#85857B]" />
                  <Text className="font-sans text-[10px] text-[#66645F]">Coletado</Text>
                </View>

                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <View className="h-[8px] w-[8px] rounded-full bg-[#F26900]" />
                  <Text className="font-sans text-[10px] text-[#66645F]">Parada atual</Text>
                </View>

                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <View className="h-[8px] w-[8px] rounded-full border border-[#F26900] bg-white" />
                  <Text className="font-sans text-[10px] text-[#66645F]">A coletar</Text>
                </View>
              </View>
            </View>

            {mapHint ? (
              <Text className="font-sans text-[10px] text-[#F26900]">{mapHint}</Text>
            ) : null}
          </View>

          <View
            className="w-full rounded-[14px] border border-[#E8E8E0] bg-white p-[14px]"
            style={{ gap: 12 }}
          >
            <View className="w-full flex-row items-center justify-between">
              <Text className="font-inter-bold text-[10px] text-[#F26900]">
                {`PARADA ATUAL · ${activeIndex + 1} DE ${totalCount}`}
              </Text>
              <Text className="font-sans text-[10px] text-[#66645F]">
                {collectedIds.has(activeStop?.productId) ? "Coletado" : "A coletar"}
              </Text>
            </View>

            <View className="w-full flex-row items-center" style={{ gap: 12 }}>
              <View className="h-[52px] w-[48px] items-center justify-center overflow-hidden rounded-[8px] bg-[#F7F7F3]">
                <Image
                  source={getProductImage(activeStop?.name)}
                  style={{ width: 48, height: 52 }}
                  resizeMode="cover"
                />
              </View>

              <View className="flex-1" style={{ gap: 5 }}>
                <Text
                  className="font-inter-bold text-[16px] leading-[19px] text-[#1F1F1F]"
                  numberOfLines={1}
                >
                  {activeStop?.name || "Leite integral 1 L"}
                </Text>
                <Text
                  className="font-sans text-[11px] leading-[14px] text-[#66645F]"
                  numberOfLines={1}
                >
                  {`${activeStop?.aisle || "Corredor 3"} · ${activeStop?.shelf || "Prateleira central"}`}
                </Text>
                <Text
                  className="font-inter-semibold text-[11px] leading-[14px] text-[#1F1F1F]"
                  numberOfLines={1}
                >
                  {`Coletar ${activeStop?.quantity || 1} ${
                    (activeStop?.quantity || 1) === 1 ? "unidade" : "unidades"
                  }`}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-[50px] w-full items-center justify-center rounded-[14px] bg-[#F26900] active:opacity-90"
              onPress={handleMarkCollected}
            >
              <Text className="font-inter-bold text-[15px] leading-[18px] text-[#1F1F1F]">
                Marcar como coletado
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="w-full items-center py-1 active:opacity-80"
              onPress={handleNotFound}
            >
              <Text className="font-inter-semibold text-[12px] text-[#F26900]">
                Não encontrei
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
