import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { InteractiveStoreMap } from "../components/InteractiveStoreMap";
import { useAuth } from "../context/AuthContext";

function MapPinSmallIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M13.3328 6.66663C13.3328 9.9956 9.64054 13.4626 8.40066 14.5334C8.28516 14.6202 8.14455 14.6672 8.00004 14.6672C7.85552 14.6672 7.71492 14.6202 7.59941 14.5334C6.35953 13.4626 2.66724 9.9956 2.66724 6.66663C2.66724 5.25201 3.22908 3.89533 4.22918 2.89504C5.22927 1.89476 6.58569 1.3328 8.00004 1.3328C9.41438 1.3328 10.7708 1.89476 11.7709 2.89504C12.771 3.89533 13.3328 5.25201 13.3328 6.66663ZM9.99984 6.66663C9.99984 7.7713 9.1045 8.66681 8.00004 8.66681C6.89558 8.66681 6.00024 7.7713 6.00024 6.66663C6.00024 5.56195 6.89558 4.66644 8.00004 4.66644C9.1045 4.66644 9.99984 5.56195 9.99984 6.66663Z"
        stroke="#F26900"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5001 17.5001L13.8835 13.8835M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
        stroke="#555555"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SortDirectionIcon({ descending }) {
  return (
    <Svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      style={{ transform: [{ rotate: descending ? "180deg" : "0deg" }] }}
    >
      <Path
        d="M5.5 7.9998L3.5 9.9996L1.5 7.9998M3.5 9.9996V2.0004M5.5 2.0004H10.5M5.5 4.0002H9M5.5 6H7.5"
        stroke="#555555"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightTinyIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="M4.5 9L7.5 6L4.5 3"
        stroke="#F26900"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const DEFAULT_USER_LOCATION = {
  lat: -23.5577,
  lng: -46.6356,
};

const DEFAULT_STORES = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    refNumber: 1,
    name: "Mercado Liberdade",
    distance: "350 m",
    distanceMeters: 350,
    address: "Av. da Liberdade, 680",
    openingTime: "08:00",
    closingTime: "22:00",
    hours: "Fecha às 22h",
    lat: -23.5562,
    lng: -46.6353,
    isAchaiStore: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    refNumber: 2,
    name: "Supermercado Sakura",
    distance: "800 m",
    distanceMeters: 800,
    address: "Rua São Joaquim, 120",
    openingTime: "08:00",
    closingTime: "21:00",
    hours: "Fecha às 21h",
    lat: -23.5594,
    lng: -46.6335,
    isAchaiStore: true,
  },
];

const RADIUS_OPTIONS = [
  { label: "Até 1 km", meters: 1000, zoom: 16, scale: "100 m" },
  { label: "Até 2 km", meters: 2000, zoom: 14, scale: "200 m" },
];
const MAX_MAP_RADIUS_METERS = 2000;
const MIN_MAP_ZOOM_FOR_STORES = 14;
const MAP_REQUEST_BUFFER_METERS = 300;
const MAP_REQUEST_DEBOUNCE_MS = 350;
const MAP_CACHE_CELL_METERS = 500;
const MAP_REQUEST_TIMEOUT_MS = 5000;

function computeDistanceMeters(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.max(50, Math.round(meters / 10) * 10)} m`;
  }
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function isStoreOpen(store, now = new Date()) {
  if (!store.isAchaiStore || !store.openingTime || !store.closingTime) {
    return false;
  }

  const [openingHour, openingMinute] = store.openingTime.split(":").map(Number);
  const [closingHour, closingMinute] = store.closingTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openingMinutes = openingHour * 60 + openingMinute;
  const closingMinutes = closingHour * 60 + closingMinute;

  if (closingMinutes < openingMinutes) {
    return currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
  }

  return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
}

function withCurrentStoreStatus(store) {
  const isOpen = isStoreOpen(store);
  return {
    ...store,
    isOpen,
    hours: isOpen
      ? `Aberto · até ${store.closingTime.replace(":00", "h")}`
      : `Fechado · abre às ${store.openingTime.replace(":00", "h")}`,
  };
}

async function fetchNearbyOsmSupermarkets(
  lat,
  lng,
  radiusMeters = MAX_MAP_RADIUS_METERS,
  signal,
) {
  const query = `[out:json][timeout:5];(node["shop"="supermarket"](around:${Math.round(radiusMeters)},${lat},${lng});way["shop"="supermarket"](around:${Math.round(radiusMeters)},${lat},${lng}););out center 12;`;
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), MAP_REQUEST_TIMEOUT_MS);
  const requestSignal = signal || timeoutController.signal;
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
      signal: requestSignal,
    });
    if (!response.ok) return [];
    const data = await response.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    return elements
      .map((element, index) => {
        const storeLat = element.lat ?? element.center?.lat;
        const storeLng = element.lon ?? element.center?.lon;
        if (typeof storeLat !== "number" || typeof storeLng !== "number") return null;
        const tags = element.tags || {};
        const distanceMeters = computeDistanceMeters(lat, lng, storeLat, storeLng);
        return {
          id: `osm-${element.type}-${element.id}`,
          refNumber: index + 1,
          name: tags.name || tags.brand || `Supermercado #${index + 1}`,
          address: `${tags["addr:street"] || "Endereço próximo"}${
            tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : ""
          }`,
          hours: "Horário não informado",
          isOpen: null,
          isAchaiStore: false,
          lat: storeLat,
          lng: storeLng,
          distanceMeters,
          distance: formatDistance(distanceMeters),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .map((store, index) => ({ ...store, refNumber: index + 1 }));
  } finally {
    clearTimeout(timeoutId);
  }
}

function getMapCacheKey(lat, lng) {
  const latitudeScale = MAP_CACHE_CELL_METERS / 111_000;
  const longitudeScale = latitudeScale / Math.max(Math.cos((lat * Math.PI) / 180), 0.1);
  return `${Math.round(lat / latitudeScale)}:${Math.round(lng / longitudeScale)}`;
}

function getOfficialStoresForMap(lat, lng) {
  return DEFAULT_STORES
    .map((store) => {
      const distanceMeters = computeDistanceMeters(lat, lng, store.lat, store.lng);
      return {
        ...withCurrentStoreStatus(store),
        distanceMeters,
        distance: formatDistance(distanceMeters),
      };
    })
    .filter((store) => store.distanceMeters <= MAX_MAP_RADIUS_METERS);
}

function StoreResultCard({ store, selected, onSelect, onOpenStore }) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[86px] flex-row items-center gap-2.5 rounded-[14px] border bg-white p-3 ${
        selected ? "border-achai" : "border-[#E8E8E0]"
      }`}
      onPress={onSelect}
    >
      <View className="h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#FFF4E8]">
        <Text className="font-inter-bold text-[16px] leading-[19px] text-achai">
          {store.refNumber}
        </Text>
      </View>

      <View className="flex-1 gap-[5px]">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-bold text-[13px] leading-[16px] text-ink" numberOfLines={1}>
            {store.name}
          </Text>
          <Text className="font-inter-semibold text-[11px] leading-[13px] text-achai">
            {store.distance}
          </Text>
        </View>

        <Text className="font-sans text-[10px] leading-[12px] text-[#555555]" numberOfLines={1}>
          {store.address}
        </Text>

        <View className="flex-row items-center justify-between">
          <Text
            className={`font-sans text-[10px] leading-[12px] ${
              store.isOpen ? "text-[#42734A]" : "text-[#D64545]"
            }`}
          >
            {store.hours}
          </Text>
          <Pressable
            accessibilityLabel={`Ver loja ${store.name}`}
            className="flex-row items-center gap-[3px]"
            hitSlop={8}
            onPress={onOpenStore}
          >
            <Text className="font-inter-semibold text-[10px] leading-[12px] text-achai">
              Ver loja
            </Text>
            <ChevronRightTinyIcon />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function CatalogScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { setCurrentStore } = useAuth();
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("Avenida da Liberdade, 542");
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState("Avenida da Liberdade, 542");
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [radiusIndex, setRadiusIndex] = useState(1);
  const [sortDescending, setSortDescending] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState(RADIUS_OPTIONS[1].zoom);
  const [mapStores, setMapStores] = useState(() => DEFAULT_STORES.map(withCurrentStoreStatus));
  const [mapStoresLoading, setMapStoresLoading] = useState(false);
  const mapRequestTimerRef = useRef(null);
  const lastMapRequestRef = useRef(null);
  const mapRequestIdRef = useRef(0);
  const mapRequestControllerRef = useRef(null);
  const mapCacheRef = useRef(new Map());

  const currentRadius = RADIUS_OPTIONS[radiusIndex];

  useEffect(() => {
    const refreshStoreStatus = () => {
      setMapStores((stores) =>
        stores.map((store) => (store.isAchaiStore ? withCurrentStoreStatus(store) : store)),
      );
    };

    refreshStoreStatus();
    const intervalId = setInterval(refreshStoreStatus, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const updateLocationAndStores = async (lat, lng, newAddressLabel) => {
    setUserLocation({ lat, lng });
    setMapStores(DEFAULT_STORES.map(withCurrentStoreStatus));
    lastMapRequestRef.current = null;
    mapRequestIdRef.current += 1;
    if (newAddressLabel) {
      setAddress(newAddressLabel);
      setAddressDraft(newAddressLabel);
    }

    setSelectedStoreId("");
  };

  const handleMapMove = ({ lat, lng, zoom }) => {
    const nextZoom = Number.isFinite(zoom) ? zoom : MIN_MAP_ZOOM_FOR_STORES;
    setMapZoom(nextZoom);
    if (mapRequestTimerRef.current) clearTimeout(mapRequestTimerRef.current);
    mapRequestControllerRef.current?.abort();
    const requestId = ++mapRequestIdRef.current;

    if (nextZoom < MIN_MAP_ZOOM_FOR_STORES) {
      lastMapRequestRef.current = null;
      setMapStores([]);
      setMapStoresLoading(false);
      return;
    }

    const previous = lastMapRequestRef.current;
    const movedEnough =
      !previous ||
      computeDistanceMeters(previous.lat, previous.lng, lat, lng) >= MAP_REQUEST_BUFFER_METERS;
    if (!movedEnough) return;

    mapRequestTimerRef.current = setTimeout(async () => {
      lastMapRequestRef.current = { lat, lng };
      const officialStores = getOfficialStoresForMap(lat, lng);
      if (requestId === mapRequestIdRef.current) {
        setMapStores(officialStores);
      }
      setMapStoresLoading(true);
      const cacheKey = getMapCacheKey(lat, lng);
      const cachedStores = mapCacheRef.current.get(cacheKey);
      if (cachedStores) {
        setMapStores(cachedStores);
        setMapStoresLoading(false);
        return;
      }

      const controller = new AbortController();
      mapRequestControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), MAP_REQUEST_TIMEOUT_MS);
      try {
        const stores = await fetchNearbyOsmSupermarkets(lat, lng, MAX_MAP_RADIUS_METERS, controller.signal);
        const nextStores = [...officialStores, ...stores].map((store, index) => ({
            ...store,
            refNumber: index + 1,
        }));
        mapCacheRef.current.set(cacheKey, nextStores);
        if (requestId === mapRequestIdRef.current) {
          setMapStores(nextStores);
        }
      } catch {
        if (requestId === mapRequestIdRef.current) {
          setMapStores(officialStores);
        }
      } finally {
        clearTimeout(timeoutId);
        if (mapRequestControllerRef.current === controller) {
          mapRequestControllerRef.current = null;
        }
        if (requestId === mapRequestIdRef.current) {
          setMapStoresLoading(false);
        }
      }
    }, MAP_REQUEST_DEBOUNCE_MS);
  };

  const handleUseMyLocation = async ({ showPermissionAlert = true } = {}) => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (showPermissionAlert) {
          Alert.alert(
            "Permissão de localização",
            "Ative a permissão de localização para encontrarmos os supermercados mais próximos de você.",
          );
        }
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;

      let formattedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      try {
        const revRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          const road =
            revData?.address?.road ||
            revData?.address?.pedestrian ||
            revData?.address?.suburb ||
            revData?.name;
          const houseNumber = revData?.address?.house_number;
          if (road) {
            formattedAddress = houseNumber ? `${road}, ${houseNumber}` : road;
          }
        }
      } catch {
        // fallback to coordinates if Nominatim fails
      }

      await updateLocationAndStores(latitude, longitude, formattedAddress);
    } catch {
      if (showPermissionAlert) {
        Alert.alert(
          "Não foi possível obter o GPS",
          "Verifique se o serviço de localização está ativo no seu dispositivo ou navegador.",
        );
      }
    } finally {
      setLocating(false);
    }
  };

  const autoLocationRequestedRef = useRef(false);
  useEffect(() => {
    if (autoLocationRequestedRef.current) return;
    autoLocationRequestedRef.current = true;
    handleUseMyLocation({ showPermissionAlert: false });
  }, []);

  const handleGeocodeAddress = async () => {
    const query = addressDraft.trim();
    if (!query) {
      setEditingAddress(false);
      return;
    }

    try {
      setLocating(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query,
        )}&countrycodes=br&limit=1&accept-language=pt-BR`,
      );
      if (res.ok) {
        const results = await res.json();
        if (Array.isArray(results) && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            await updateLocationAndStores(lat, lng, query);
            setEditingAddress(false);
            return;
          }
        }
      }
      setAddress(query);
      setEditingAddress(false);
    } catch {
      setAddress(query);
      setEditingAddress(false);
    } finally {
      setLocating(false);
    }
  };

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();
    const stores = mapStores.filter((store) => {
      if (openNowOnly && (!store.isAchaiStore || !store.isOpen)) return false;
      if (store.distanceMeters && store.distanceMeters > currentRadius.meters) return false;
      if (!query) return true;
      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      );
    });

    return stores.sort((first, second) =>
      sortDescending
        ? second.distanceMeters - first.distanceMeters
        : first.distanceMeters - second.distanceMeters,
    );
  }, [mapStores, search, openNowOnly, currentRadius.meters, sortDescending]);

  const handleOpenStore = async (store) => {
    await setCurrentStore({ id: store.id, name: store.name });
    navigation.navigate("StoreDetails", { store });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho — pad 20/20/16/20, gap 12 */}
        <View
          className="gap-3 px-5 pb-4"
          style={{ paddingTop: Math.max(insets.top, 44) + 20 }}
        >
          <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
          <Text className="font-inter-extrabold text-[25px] leading-[30px] text-achai">
            Buscar supermercados
          </Text>

          {/* Localização atual — gap 7 */}
          <View
            className={`h-9 flex-row items-center gap-2 rounded-[10px] border px-2.5 ${
              editingAddress ? "border-achai bg-[#FFF4E8]" : "border-transparent bg-transparent"
            }`}
          >
            {editingAddress ? (
              <>
                <MapPinSmallIcon />
                <TextInput
                  autoFocus
                  className="flex-1 p-0 font-inter-medium text-[12px] leading-[15px] text-ink"
                  onChangeText={setAddressDraft}
                  onSubmitEditing={handleGeocodeAddress}
                  placeholder="Digite rua, número ou CEP..."
                  placeholderTextColor="#898A7F"
                  returnKeyType="search"
                  value={addressDraft}
                />
                <Pressable
                  className="my-1 h-7 items-center justify-center rounded-[10px] bg-achai px-3"
                  onPress={handleGeocodeAddress}
                >
                  <Text className="font-inter-semibold text-[12px] text-white">Ir</Text>
                </Pressable>
              </>
            ) : (
              <>
              <MapPinSmallIcon />
              <Text
                className="flex-1 font-inter-medium text-[12px] leading-[15px] text-[#555555]"
                numberOfLines={1}
              >
                {address}
              </Text>
              <Pressable
                hitSlop={8}
                onPress={() => {
                  setAddressDraft(address);
                  setEditingAddress(true);
                }}
              >
                <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">
                  Alterar
                </Text>
              </Pressable>
              </>
            )}
          </View>

          {/* Campo de busca — h=48, r=14, fill #F8F8F5, border #E8E8E0 */}
          <View className="h-12 flex-row items-center gap-2.5 rounded-[14px] border border-[#E8E8E0] bg-[#F8F8F5] px-3.5">
            <SearchIcon />
            <TextInput
              className="flex-1 p-0 font-sans text-[13px] leading-[16px] text-ink"
              onChangeText={setSearch}
              placeholder="Supermercado ou endereço"
              placeholderTextColor="#555555"
              value={search}
            />
          </View>

          {/* Filtros de descoberta — h=32, gap 8 */}
          <View className="flex-row items-center gap-2">
            <Pressable
              className="h-8 items-center justify-center rounded-full border border-achai bg-[#FFF4E8] px-3"
              onPress={() => setRadiusIndex((prev) => (prev + 1) % RADIUS_OPTIONS.length)}
            >
              <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">
                {currentRadius.label}
              </Text>
            </Pressable>

            <Pressable
              className={`h-8 items-center justify-center rounded-full border px-3 ${
                openNowOnly ? "border-achai bg-[#FFF4E8]" : "border-[#E8E8E0] bg-white"
              }`}
              accessibilityLabel="Filtrar supermercados abertos agora"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: openNowOnly }}
              onPress={() => setOpenNowOnly((v) => !v)}
            >
              <Text
                className={`text-[12px] leading-[15px] ${
                  openNowOnly ? "font-inter-semibold text-achai" : "font-sans text-[#555555]"
                }`}
              >
                Abertos agora
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Mapa interativo real (OpenStreetMap + Leaflet + expo-location) — h=236 */}
        <InteractiveStoreMap
          locating={locating}
          onMapMove={handleMapMove}
          onLocatePress={handleUseMyLocation}
          onSelectStore={setSelectedStoreId}
          scaleLabel={currentRadius.scale}
          selectedStoreId={selectedStoreId}
          stores={filteredStores}
          userLocation={userLocation}
          zoom={currentRadius.zoom}
        />

        {mapZoom < MIN_MAP_ZOOM_FOR_STORES ? (
          <View className="mx-5 mt-4 rounded-[14px] border border-[#F5B780] bg-[#FFF4E8] p-4">
            <Text className="font-inter-semibold text-[13px] leading-[16px] text-ink">
              Aproxime o mapa para até 2 km para ver os supermercados da região.
            </Text>
            <Text className="mt-1 font-sans text-[12px] leading-[15px] text-[#66645F]">
              As lojas são atualizadas quando você termina de mover o mapa.
            </Text>
          </View>
        ) : null}

        {/* Supermercados encontrados — pad 16/20/16/20, gap 10 */}
        <View className="gap-2.5 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-extrabold text-[17px] leading-[21px] text-ink">
              {filteredStores.length} supermercados perto
            </Text>
            <Pressable
              accessibilityLabel={`Ordenar por distância: ${
                sortDescending ? "maior para menor" : "menor para maior"
              }`}
              accessibilityRole="button"
              className="flex-row items-center gap-1"
              hitSlop={8}
              onPress={() => setSortDescending((current) => !current)}
            >
              <Text className="font-inter-semibold text-[10px] leading-[12px] text-[#555555]">
                Distância
              </Text>
              <SortDirectionIcon descending={sortDescending} />
            </Pressable>
          </View>

          {mapStoresLoading ? (
            <Text className="font-sans text-[12px] leading-[15px] text-[#66645F]">
              Atualizando resultados da região...
            </Text>
          ) : null}

          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreResultCard
                key={store.id}
                onOpenStore={() => handleOpenStore(store)}
                onSelect={() => setSelectedStoreId(store.id)}
                selected={store.id === selectedStoreId}
                store={store}
              />
            ))
          ) : (
            <View className="rounded-[14px] border border-[#E8E8E0] bg-[#F8F8F5] p-4">
              <Text className="font-inter-semibold text-[13px] leading-[16px] text-ink">
                Nenhum supermercado encontrado nessa região.
              </Text>
              <Text className="mt-1 font-sans text-[12px] leading-[15px] text-[#66645F]">
                Mova o mapa ou altere o endereço para procurar novamente.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Buscar" />
    </View>
  );
}
