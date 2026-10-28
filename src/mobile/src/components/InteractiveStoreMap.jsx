import { useEffect, useMemo, useRef } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const LEAFLET_CSS_ID = "achai-leaflet-css";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

function LocateFixedIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M1.66602 9.99998H4.16622M4.16622 9.99998C4.16622 13.2219 6.7781 15.8338 10 15.8338M4.16622 9.99998C4.16622 6.77807 6.7781 4.16618 10 4.16618M10 15.8338C13.2219 15.8338 15.8338 13.2219 15.8338 9.99998M10 15.8338V18.334M10 4.16618C13.2219 4.16618 15.8338 6.77807 15.8338 9.99998M10 4.16618V1.66599M15.8338 9.99998H18.334M12.5002 9.99998C12.5002 11.3808 11.3808 12.5002 10 12.5002C8.61919 12.5002 7.49982 11.3808 7.49982 9.99998C7.49982 8.61916 8.61919 7.49978 10 7.49978C11.3808 7.49978 12.5002 8.61916 12.5002 9.99998Z"
        stroke="#F26900"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildUserMarkerHtml() {
  return `
    <div style="position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;pointer-events:none;">
      <div style="position:absolute;inset:0;border-radius:26px;background:rgba(242,105,0,0.22);"></div>
      <div style="position:relative;width:16px;height:16px;border-radius:8px;background:#F26900;border:3px solid #FFFFFF;box-sizing:border-box;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>
      <span style="position:absolute;left:54px;top:18px;font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:10px;line-height:12px;color:#555555;white-space:nowrap;text-shadow:0 0 3px #FFFFFF,0 0 3px #FFFFFF;">Você</span>
    </div>
  `;
}

function buildStoreMarkerHtml(store, isSelected) {
  const bg = isSelected ? "#F26900" : "#FFFFFF";
  const border = isSelected ? "#FFFFFF" : "#F26900";
  const textColor = isSelected ? "#FFFFFF" : "#F26900";
  const labelHtml = isSelected
    ? `<div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);height:26px;padding:0 10px;border-radius:8px;background:#FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;white-space:nowrap;pointer-events:none;">
         <span style="font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:10px;line-height:12px;color:#111111;">${escapeHtml(store.name)}</span>
       </div>`
    : "";

  return `
    <div style="position:relative;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
      ${labelHtml}
      <div style="width:34px;height:34px;border-radius:17px;background:${bg};border:2px solid ${border};box-sizing:border-box;box-shadow:0 2px 6px rgba(0,0,0,0.16);display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <span style="font-family:Inter,system-ui,sans-serif;font-weight:700;font-size:14px;line-height:17px;color:${textColor};">${escapeHtml(store.refNumber)}</span>
      </div>
    </div>
  `;
}

function WebLeafletMap({ userLocation, stores, selectedStoreId, onSelectStore, zoom }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const onSelectRef = useRef(onSelectStore);
  onSelectRef.current = onSelectStore;

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    const L = require("leaflet");
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: zoom || 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = require("leaflet");
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const userIcon = L.divIcon({
      className: "achai-user-pin",
      html: buildUserMarkerHtml(),
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
    L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      interactive: false,
      zIndexOffset: 200,
    }).addTo(layer);

    stores.forEach((store) => {
      const isSelected = store.id === selectedStoreId;
      const storeIcon = L.divIcon({
        className: "achai-store-pin",
        html: buildStoreMarkerHtml(store, isSelected),
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([store.lat, store.lng], {
        icon: storeIcon,
        zIndexOffset: isSelected ? 1000 : 500,
      }).addTo(layer);

      marker.on("click", () => {
        if (onSelectRef.current) {
          onSelectRef.current(store.id);
        }
      });
    });
  }, [userLocation, stores, selectedStoreId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const selectedStore = stores.find((s) => s.id === selectedStoreId);
    if (selectedStore) {
      map.panTo([selectedStore.lat, selectedStore.lng], { animate: true, duration: 0.4 });
    }
  }, [selectedStoreId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([userLocation.lat, userLocation.lng], zoom || map.getZoom(), {
      animate: true,
    });
  }, [userLocation.lat, userLocation.lng, zoom]);

  return (
    <View className="flex-1">
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#F0F0EA",
        }}
      />
    </View>
  );
}

function NativeWebViewLeafletMap({ userLocation, stores, selectedStoreId, onSelectStore, zoom }) {
  const webViewRef = useRef(null);
  const { WebView } = require("react-native-webview");

  const initialHtml = useMemo(
    () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="${LEAFLET_CSS_URL}" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F0F0EA; }
    .leaflet-div-icon { background: transparent !important; border: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      center: [${userLocation.lat}, ${userLocation.lng}],
      zoom: ${zoom || 16},
      zoomControl: false,
      attributionControl: false
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);

    window.updateMapState = function(payload) {
      if (!payload) return;
      layer.clearLayers();
      const u = payload.userLocation;
      if (u) {
        const uIcon = L.divIcon({
          html: payload.userHtml,
          iconSize: [52, 52],
          iconAnchor: [26, 26]
        });
        L.marker([u.lat, u.lng], { icon: uIcon, interactive: false, zIndexOffset: 200 }).addTo(layer);
      }
      (payload.stores || []).forEach(function(st) {
        const sIcon = L.divIcon({
          html: st.html,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });
        const m = L.marker([st.lat, st.lng], {
          icon: sIcon,
          zIndexOffset: st.isSelected ? 1000 : 500
        }).addTo(layer);
        m.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_STORE', id: st.id }));
          }
        });
      });
      if (payload.panTo) {
        map.setView([payload.panTo.lat, payload.panTo.lng], payload.zoom || map.getZoom(), { animate: true });
      }
    };
  </script>
</body>
</html>`,
    [],
  );

  useEffect(() => {
    if (!webViewRef.current) return;
    const selectedStore = stores.find((s) => s.id === selectedStoreId);
    const payload = {
      userLocation,
      userHtml: buildUserMarkerHtml(),
      zoom,
      panTo: selectedStore
        ? { lat: selectedStore.lat, lng: selectedStore.lng }
        : { lat: userLocation.lat, lng: userLocation.lng },
      stores: stores.map((store) => ({
        id: store.id,
        lat: store.lat,
        lng: store.lng,
        isSelected: store.id === selectedStoreId,
        html: buildStoreMarkerHtml(store, store.id === selectedStoreId),
      })),
    };
    const js = `window.updateMapState && window.updateMapState(${JSON.stringify(payload)}); true;`;
    webViewRef.current.injectJavaScript(js);
  }, [userLocation, stores, selectedStoreId, zoom]);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={["*"]}
      source={{ html: initialHtml, baseUrl: "https://achai.app" }}
      userAgent="AchaiMobileApp/1.0 (https://achai.app)"
      style={{ flex: 1, backgroundColor: "#F0F0EA" }}
      scrollEnabled={false}
      onLoadEnd={() => {
        const payload = {
          userLocation,
          userHtml: buildUserMarkerHtml(),
          zoom,
          panTo: { lat: userLocation.lat, lng: userLocation.lng },
          stores: stores.map((store) => ({
            id: store.id,
            lat: store.lat,
            lng: store.lng,
            isSelected: store.id === selectedStoreId,
            html: buildStoreMarkerHtml(store, store.id === selectedStoreId),
          })),
        };
        webViewRef.current?.injectJavaScript(
          `window.updateMapState && window.updateMapState(${JSON.stringify(payload)}); true;`,
        );
      }}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data?.type === "SELECT_STORE" && data.id) {
            onSelectStore(data.id);
          }
        } catch {
          // ignore malformed messages
        }
      }}
    />
  );
}

export function InteractiveStoreMap({
  userLocation,
  stores,
  selectedStoreId,
  onSelectStore,
  onLocatePress,
  locating = false,
  scaleLabel = "100 m",
  zoom = 16,
}) {
  return (
    <View className="relative h-[236px] w-full overflow-hidden bg-[#F0F0EA]">
      {Platform.OS === "web" ? (
        <WebLeafletMap
          onSelectStore={onSelectStore}
          selectedStoreId={selectedStoreId}
          stores={stores}
          userLocation={userLocation}
          zoom={zoom}
        />
      ) : (
        <NativeWebViewLeafletMap
          onSelectStore={onSelectStore}
          selectedStoreId={selectedStoreId}
          stores={stores}
          userLocation={userLocation}
          zoom={zoom}
        />
      )}

      {/* Escala do mapa */}
      <View
        className="flex-row items-center gap-1.5 rounded bg-white/80 px-1.5 py-0.5"
        pointerEvents="none"
        style={{ position: "absolute", left: 20, bottom: 18, zIndex: 1000 }}
      >
        <View style={{ width: 28, height: 2, backgroundColor: "#898A7F" }} />
        <Text className="font-sans text-[8px] leading-[10px] text-[#898A7F]">{scaleLabel}</Text>
      </View>

      {/*Atribuição discreta OpenStreetMap */}
      <View
        className="rounded bg-white/75 px-1.5 py-0.5"
        pointerEvents="none"
        style={{ position: "absolute", left: 20, top: 10, zIndex: 1000 }}
      >
        <Text className="font-sans text-[8px] leading-[10px] text-[#898A7F]">
          OpenStreetMap
        </Text>
      </View>

      {/* Botão centralizar localização (GPS real via expo-location) */}
      <Pressable
        accessibilityLabel="Centralizar na minha localização GPS"
        accessibilityRole="button"
        className="h-10 w-10 items-center justify-center rounded-[12px] bg-white active:opacity-80"
        disabled={locating}
        onPress={onLocatePress}
        style={{
          position: "absolute",
          right: 20,
          bottom: 22,
          zIndex: 1000,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {locating ? <ActivityIndicator color="#F26900" size="small" /> : <LocateFixedIcon />}
      </Pressable>
    </View>
  );
}
