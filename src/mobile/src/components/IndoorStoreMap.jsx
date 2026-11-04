import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import {
  getNearestIndoorCorridor,
  INDOOR_CORRIDORS,
  INDOOR_MAP_HEIGHT,
  INDOOR_MAP_THEMES,
  INDOOR_MAP_WIDTH,
  INDOOR_SHELVES,
  isPointInsideIndoorMap,
  isPointOnIndoorShelf,
} from "../shared/indoor-map-engine";

export function IndoorStoreMap({
  variant = "mobile",
  stops = [],
  activeIndex = 0,
  collectedIds = new Set(),
  notFoundIds = new Set(),
  userAnchor = null,
  collectedPointsAttr = "",
  upcomingPointsAttr = "",
  onSelectUserAnchor,
  onInvalidShelfTap,
}) {
  const theme = INDOOR_MAP_THEMES[variant] || INDOOR_MAP_THEMES.mobile;
  const [mapLayout, setMapLayout] = useState({
    width: INDOOR_MAP_WIDTH,
    height: INDOOR_MAP_HEIGHT,
  });
  const mapContainerRef = useRef(null);
  const lastTouchHandledAtRef = useRef(0);

  const extractMapCoordinatesFromEvent = (event) => {
    const nativeEvent = event?.nativeEvent || event;
    if (!nativeEvent) return null;

    let rawX = null;
    let rawY = null;
    let containerWidth = mapLayout.width || INDOOR_MAP_WIDTH;
    let containerHeight = mapLayout.height || INDOOR_MAP_HEIGHT;

    const targetElement =
      mapContainerRef.current ||
      event?.currentTarget ||
      nativeEvent?.currentTarget ||
      nativeEvent?.target;

    if (targetElement && typeof targetElement.getBoundingClientRect === "function") {
      const rect = targetElement.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        containerWidth = rect.width;
        containerHeight = rect.height;

        const touch =
          nativeEvent.touches?.[0] ||
          nativeEvent.changedTouches?.[0] ||
          null;
        const clientX =
          typeof nativeEvent.clientX === "number"
            ? nativeEvent.clientX
            : typeof touch?.clientX === "number"
              ? touch.clientX
              : null;
        const clientY =
          typeof nativeEvent.clientY === "number"
            ? nativeEvent.clientY
            : typeof touch?.clientY === "number"
              ? touch.clientY
              : null;

        if (clientX !== null && clientY !== null) {
          rawX = clientX - rect.left;
          rawY = clientY - rect.top;
        }
      }
    }

    if (rawX === null || rawY === null) {
      if (typeof nativeEvent.locationX === "number" && typeof nativeEvent.locationY === "number") {
        rawX = nativeEvent.locationX;
        rawY = nativeEvent.locationY;
      } else if (typeof nativeEvent.offsetX === "number" && typeof nativeEvent.offsetY === "number") {
        rawX = nativeEvent.offsetX;
        rawY = nativeEvent.offsetY;
      }
    }

    if (typeof rawX !== "number" || typeof rawY !== "number" || Number.isNaN(rawX) || Number.isNaN(rawY)) {
      return null;
    }

    const scaleX = INDOOR_MAP_WIDTH / (containerWidth || INDOOR_MAP_WIDTH);
    const scaleY = INDOOR_MAP_HEIGHT / (containerHeight || INDOOR_MAP_HEIGHT);

    return {
      clickX: Math.round(rawX * scaleX),
      clickY: Math.round(rawY * scaleY),
    };
  };

  const handleMapPress = (event) => {
    const now = Date.now();
    if (now - lastTouchHandledAtRef.current < 80) {
      return;
    }

    const coords = extractMapCoordinatesFromEvent(event);
    if (!coords) return;
    lastTouchHandledAtRef.current = now;

    const { clickX, clickY } = coords;
    if (!isPointInsideIndoorMap(clickX, clickY)) {
      return;
    }

    if (isPointOnIndoorShelf(clickX, clickY)) {
      if (onInvalidShelfTap) {
        onInvalidShelfTap();
      }
      return;
    }

    const nearestCorridor = getNearestIndoorCorridor(clickX);
    const nextAnchor = {
      x: Math.min(INDOOR_MAP_WIDTH - 4, Math.max(4, clickX)),
      y: Math.min(INDOOR_MAP_HEIGHT - 4, Math.max(4, clickY)),
      corridorName: nearestCorridor.name,
      corridorIndex: nearestCorridor.index,
    };

    if (onSelectUserAnchor) {
      onSelectUserAnchor(nextAnchor, nearestCorridor);
    }
  };

  return (
    <Pressable
      ref={mapContainerRef}
      accessibilityRole="button"
      accessibilityLabel="Mapa esquemático de corredores. Toque em um corredor para indicar sua localização atual."
      className="relative h-[250px] w-full overflow-hidden rounded-[14px]"
      style={{
        maxWidth: INDOOR_MAP_WIDTH,
        alignSelf: "center",
        backgroundColor: theme.canvasBg,
        borderWidth: 1,
        borderColor: theme.canvasBorder,
      }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setMapLayout({ width, height });
        }
      }}
      onPressIn={handleMapPress}
      onPress={handleMapPress}
    >
      {/* Rótulos do mapa */}
      <Text
        pointerEvents="none"
        className="absolute left-[13px] top-[11px] font-sans text-[10px]"
        style={{ color: theme.headerLabelColor }}
      >
        Corredores da loja
      </Text>

      <Text
        pointerEvents="none"
        className="absolute left-[13px] top-[228px] font-sans text-[9px]"
        style={{ color: theme.footerLabelColor }}
      >
        ENTRADA
      </Text>

      <Text
        pointerEvents="none"
        className="absolute left-[201px] top-[228px] font-sans text-[9px]"
        style={{ color: theme.footerLabelColor }}
        numberOfLines={1}
      >
        Mapa esquemático
      </Text>

      {/* Identificação dos Corredores nos vãos caminháveis entre as prateleiras */}
      {INDOOR_CORRIDORS.map((corridor) => (
        <View
          key={corridor.id}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: corridor.centerX - 12,
            top: 44,
            width: 24,
            alignItems: "center",
          }}
        >
          <Text
            className="font-inter-semibold text-[8px]"
            style={{ color: theme.corridorCodeColor }}
          >
            {corridor.label}
          </Text>
        </View>
      ))}

      {/* As 4 Prateleiras / Gôndolas compridas com fecho (bloqueadas para clique) */}
      {INDOOR_SHELVES.map((shelf) => (
        <View
          key={shelf.id}
          pointerEvents="none"
          className="absolute items-center rounded-[6px] pt-[9px]"
          style={{
            left: shelf.left,
            top: shelf.top,
            width: shelf.width,
            height: shelf.height,
            backgroundColor: theme.shelfBg,
            borderWidth: theme.shelfBorder !== "transparent" ? 1 : 0,
            borderColor: theme.shelfBorder,
          }}
        >
          <Text
            className="font-inter-semibold text-[9px]"
            style={{ color: theme.shelfLabelColor }}
          >
            {shelf.label}
          </Text>
        </View>
      ))}

      {/* Traçado ortogonal do grafo (Trecho coletado + Caminho Dijkstra para as próximas coletas) */}
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${INDOOR_MAP_WIDTH} ${INDOOR_MAP_HEIGHT}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {collectedPointsAttr ? (
          <Polyline
            points={collectedPointsAttr}
            fill="none"
            stroke={theme.collectedLineStroke}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {upcomingPointsAttr ? (
          <Polyline
            points={upcomingPointsAttr}
            fill="none"
            stroke={theme.upcomingLineStroke}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {userAnchor ? (
          <>
            <Circle
              cx={userAnchor.x}
              cy={userAnchor.y}
              r={9}
              fill={theme.userPulseFill}
            />
            <Circle
              cx={userAnchor.x}
              cy={userAnchor.y}
              r={5}
              fill={theme.userCoreFill}
              stroke={theme.userCoreStroke}
              strokeWidth={2}
            />
          </>
        ) : null}
      </Svg>

      {/* Pins numerados das paradas nos corredores */}
      {stops.map((stop, idx) => {
        const isCollected = collectedIds.has(stop.productId);
        const isNotFound = notFoundIds.has(stop.productId);
        const isCurrent = idx === activeIndex && !isCollected && !isNotFound;
        const pinLeft = stop.centerX - 12;
        const pinTop = stop.centerY - 12;

        return (
          <View
            key={`${stop.productId}-${idx}`}
            pointerEvents="none"
            className="absolute h-[24px] w-[24px] items-center justify-center rounded-full"
            style={{
              left: pinLeft,
              top: pinTop,
              backgroundColor: isCollected
                ? theme.pinCollectedBg
                : isCurrent
                  ? theme.pinCurrentBg
                  : theme.pinPendingBg,
              borderWidth: 1.5,
              borderColor: isCollected ? theme.pinCollectedBorder : theme.pinPendingBorder,
            }}
          >
            <Text
              className="font-inter-bold text-[11px]"
              style={{
                color: isCollected
                  ? theme.pinCollectedText
                  : isCurrent
                    ? theme.pinCurrentText
                    : theme.pinPendingText,
              }}
            >
              {isNotFound && !isCurrent ? "X" : idx + 1}
            </Text>
          </View>
        );
      })}
    </Pressable>
  );
}
