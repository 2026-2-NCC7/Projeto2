import * as Location from "expo-location";
import { useMemo, useState } from "react";
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

function ChevronDownSmallIcon() {
  return (
    <Svg width={13} height={13} viewBox="0 0 13 13" fill="none">
      <Path
        d="M3.25 4.875L6.5 8.125L9.75 4.875"
        stroke="#F26900"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SlidersHorizontalIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M5.83333 2.91667H1.75M7 11.0833H1.75M8.16667 1.75V2.91667M8.16667 2.91667V4.08333M8.16667 2.91667H12.25M9.33333 9.91667V11.0833M9.33333 11.0833V12.25M9.33333 11.0833H12.25M12.25 7H7M4.66667 5.83333V7M4.66667 7V8.16667M4.66667 7H1.75"
        stroke="#555555"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowDownWideNarrowIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
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
    hours: "Aberto · até 22h",
    isOpen: true,
    lat: -23.5562,
    lng: -46.6353,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    refNumber: 2,
    name: "Supermercado Sakura",
    distance: "800 m",
    distanceMeters: 800,
    address: "Rua São Joaquim, 120",
    hours: "Aberto · até 21h",
    isOpen: true,
    lat: -23.5594,
    lng: -46.6335,
  },
];

const RADIUS_OPTIONS = [
  { label: "Até 1 km", meters: 1000, zoom: 16, scale: "100 m" },
  { label: "Até 2 km", meters: 2000, zoom: 16, scale: "100 m" },
  { label: "Até 5 km", meters: 5000, zoom: 14, scale: "500 m" },
];

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

async function fetchNearbyOsmSupermarkets(lat, lng, radiusMeters = 2500) {
  try {
    const query = `[out:json][timeout:10];(node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});way["shop"="supermarket"](around:${radiusMeters},${lat},${lng}););out center 8;`;
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!response.ok) return [];
    const data = await response.json();
    const elements = Array.isArray(data?.elements) ? data.elements : [];

    return elements
      .map((el, idx) => {
        const sLat = el.lat ?? el.center?.lat;
        const sLng = el.lon ?? el.center?.lon;
        if (typeof sLat !== "number" || typeof sLng !== "number") return null;
        const tags = el.tags || {};
        const name = tags.name || tags.brand || `Supermercado #${idx + 1}`;
        const street = tags["addr:street"] || "Endereço próximo";
        const number = tags["addr:housenumber"] ? `, ${tags["addr:housenumber"]}` : "";
        const distanceMeters = computeDistanceMeters(lat, lng, sLat, sLng);
        return {
          id: `osm-${el.id}`,
          name,
          address: `${street}${number}`,
          hours: "Aberto · até 22h",
          isOpen: true,
          lat: sLat,
          lng: sLng,
          distanceMeters,
          distance: formatDistance(distanceMeters),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 6)
      .map((store, index) => ({
        ...store,
        refNumber: index + 1,
      }));
  } catch {
    return [];
  }
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
          <Text className="font-sans text-[10px] leading-[12px] text-[#42734A]">{store.hours}</Text>
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
  const [stores, setStores] = useState(DEFAULT_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState(DEFAULT_STORES[0].id);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [radiusIndex, setRadiusIndex] = useState(1);
  const [locating, setLocating] = useState(false);

  const currentRadius = RADIUS_OPTIONS[radiusIndex];

  const updateLocationAndStores = async (lat, lng, newAddressLabel) => {
    setUserLocation({ lat, lng });
    if (newAddressLabel) {
      setAddress(newAddressLabel);
      setAddressDraft(newAddressLabel);
    }

    const distanceFromDefault = computeDistanceMeters(
      DEFAULT_USER_LOCATION.lat,
      DEFAULT_USER_LOCATION.lng,
      lat,
      lng,
    );

    if (distanceFromDefault <= 1200) {
      const updatedDefault = DEFAULT_STORES.map((s) => {
        const dist = computeDistanceMeters(lat, lng, s.lat, s.lng);
        return {
          ...s,
          distanceMeters: dist,
          distance: s.id === DEFAULT_STORES[0].id && distanceFromDefault < 50 ? "350 m" : formatDistance(dist),
        };
      })
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .map((s, idx) => ({ ...s, refNumber: idx + 1 }));

      setStores(updatedDefault);
      setSelectedStoreId(updatedDefault[0]?.id || "");
      return;
    }

    const osmStores = await fetchNearbyOsmSupermarkets(lat, lng, 3000);
    if (osmStores.length > 0) {
      setStores(osmStores);
      setSelectedStoreId(osmStores[0].id);
    } else {
      const recalculated = DEFAULT_STORES.map((s, idx) => {
        const dist = computeDistanceMeters(lat, lng, s.lat, s.lng);
        return {
          ...s,
          refNumber: idx + 1,
          distanceMeters: dist,
          distance: formatDistance(dist),
        };
      });
      setStores(recalculated);
      setSelectedStoreId(recalculated[0].id);
    }
  };

  const handleUseMyLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão de localização",
          "Ative a permissão de localização para encontrarmos os supermercados mais próximos de você.",
        );
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
      Alert.alert(
        "Não foi possível obter o GPS",
        "Verifique se o serviço de localização está ativo no seu dispositivo ou navegador.",
      );
    } finally {
      setLocating(false);
    }
  };

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
    return stores.filter((store) => {
      if (openNowOnly && !store.isOpen) return false;
      if (store.distanceMeters && store.distanceMeters > currentRadius.meters) return false;
      if (!query) return true;
      return (
        store.name.toLowerCase().includes(query) ||
        store.address.toLowerCase().includes(query)
      );
    });
  }, [stores, search, openNowOnly, currentRadius.meters]);

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
          {editingAddress ? (
            <View className="flex-row items-center gap-2">
              <View className="h-9 flex-1 flex-row items-center gap-2 rounded-[10px] border border-achai bg-[#FFF4E8] px-2.5">
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
              </View>
              <Pressable
                className="h-9 items-center justify-center rounded-[10px] bg-achai px-3"
                onPress={handleGeocodeAddress}
              >
                <Text className="font-inter-semibold text-[12px] text-white">Ir</Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-[7px]">
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
            </View>
          )}

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
              className="h-8 flex-row items-center gap-[5px] rounded-full border border-achai bg-[#FFF4E8] px-3"
              onPress={() => setRadiusIndex((prev) => (prev + 1) % RADIUS_OPTIONS.length)}
            >
              <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">
                {currentRadius.label}
              </Text>
              <ChevronDownSmallIcon />
            </Pressable>

            <Pressable
              className={`h-8 items-center justify-center rounded-full border px-3 ${
                openNowOnly ? "border-achai bg-[#FFF4E8]" : "border-[#E8E8E0] bg-white"
              }`}
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

            <Pressable
              className="h-8 flex-row items-center gap-[5px] rounded-full border border-[#E8E8E0] bg-white px-3"
              onPress={handleUseMyLocation}
            >
              <SlidersHorizontalIcon />
              <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">Filtros</Text>
            </Pressable>
          </View>
        </View>

        {/* Mapa interativo real (OpenStreetMap + Leaflet + expo-location) — h=236 */}
        <InteractiveStoreMap
          locating={locating}
          onLocatePress={handleUseMyLocation}
          onSelectStore={setSelectedStoreId}
          scaleLabel={currentRadius.scale}
          selectedStoreId={selectedStoreId}
          stores={filteredStores}
          userLocation={userLocation}
          zoom={currentRadius.zoom}
        />

        {/* Supermercados encontrados — pad 16/20/16/20, gap 10 */}
        <View className="gap-2.5 px-5 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-extrabold text-[17px] leading-[21px] text-ink">
              {filteredStores.length} supermercados perto
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="font-inter-semibold text-[10px] leading-[12px] text-[#555555]">
                Distância
              </Text>
              <ArrowDownWideNarrowIcon />
            </View>
          </View>

          {filteredStores.map((store) => (
            <StoreResultCard
              key={store.id}
              onOpenStore={() => handleOpenStore(store)}
              onSelect={() => setSelectedStoreId(store.id)}
              selected={store.id === selectedStoreId}
              store={store}
            />
          ))}
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Buscar" />
    </View>
  );
}
