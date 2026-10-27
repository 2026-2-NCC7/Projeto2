import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { calculateRoute } from "../services/route-api";

export function RouteScreen({ navigation, route }) {
  const { auth } = useAuth();
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    calculateRoute(auth?.token, route.params.listId)
      .then((result) => {
        if (active) setRouteData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, route.params.listId]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="font-inter-semibold text-center text-lg text-ink">Não foi possível calcular a rota</Text>
        <Text className="font-sans mt-2 text-center text-sm text-[#555]">{error}</Text>
        <Pressable className="mt-5 rounded-[10px] bg-achai px-5 py-3" onPress={() => navigation.goBack()}>
          <Text className="font-inter-semibold text-sm text-ink">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  if (!routeData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#F26900" />
        <Text className="font-sans mt-3 text-sm text-[#555]">Calculando sua rota...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pb-6 pt-12">
          <Pressable className="h-9 w-9 items-center justify-center" onPress={() => navigation.goBack()}>
            <Text className="text-[30px] text-ink">‹</Text>
          </Pressable>
          <Text className="font-brand mt-3 text-[22px] text-ink">Sua rota</Text>
          <Text className="font-sans mt-1 text-[12px] text-[#555]">
            {routeData.list.name} · {routeData.list.storeName}
          </Text>
          <View className="mt-5 rounded-[14px] bg-achai px-4 py-4">
            <Text className="font-inter-semibold text-[17px] text-ink">
              {routeData.stops.length} paradas na rota
            </Text>
            <Text className="font-sans mt-1 text-[11px] text-ink">
              Distância estimada: {Number(routeData.totalDistance || 0).toFixed(1)} m
            </Text>
          </View>

          <Text className="font-inter-semibold mt-7 text-[18px] text-achai">Produtos localizados</Text>
          {routeData.stops.length ? routeData.stops.map((stop, index) => (
            <View className="mt-2 flex-row items-center rounded-[12px] border border-[#e8e8e0] p-3" key={`${stop.productId}-${index}`}>
              <View className="h-8 w-8 items-center justify-center rounded-full bg-achai">
                <Text className="font-inter-semibold text-sm text-ink">{index + 1}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-inter-semibold text-sm text-ink">{stop.name}</Text>
                <Text className="font-sans mt-1 text-[10px] text-[#555]">
                  {stop.quantity} unidade(s) · {stop.aisle || "Corredor não informado"}
                  {stop.shelf ? ` · ${stop.shelf}` : ""}
                </Text>
              </View>
            </View>
          )) : (
            <Text className="font-sans mt-3 text-sm text-[#555]">Nenhum item com localização disponível.</Text>
          )}

          {routeData.unlocatedItems.length ? (
            <>
              <Text className="font-inter-semibold mt-7 text-[18px] text-[#b05b00]">Fora da rota</Text>
              <View className="mt-2 rounded-[12px] border border-[#f1d4a9] bg-[#fff8ed] p-3">
                <Text className="font-sans text-[11px] text-[#7a4b00]">{routeData.locationWarning}</Text>
                {routeData.unlocatedItems.map((item) => (
                  <Text className="mt-2 font-sans text-xs text-[#7a4b00]" key={String(item.productId)}>
                    • {item.name} ({item.reason || "sem localização"})
                  </Text>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
