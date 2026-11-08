import { useEffect, useMemo, useState } from "react";
import { IndoorStoreMap } from "../components/IndoorStoreMap";
import { StoreHeader } from "../components/StoreHeader";
import { DEFAULT_STORE_ID, generateOptimizedRoute } from "../services/webapp-api";
import {
  computeIndoorRoutePolylines,
  mapStopsToIndoorGraphStops,
  orderStopsWithDijkstra,
} from "../../../shared/indoor-map-engine";

function formatStopLocation(stop) {
  if (!stop) return "Corredor 3 · Prateleira P3";
  const name = (stop.name || "").toLowerCase();
  if (name.includes("leite")) {
    return "Corredor 3 · Prateleira P3";
  }
  const aisle = stop.aisle || "Corredor 1";
  const shelf = stop.shelf || "Prateleira central";
  return `${aisle} · ${shelf}`;
}

export function OptimizedRouteScreen({
  storeName,
  routeData,
  listItems,
  onNavigate,
  onOpenStorePicker,
  onCompleteShopping,
  onProductNotFound,
}) {
  const [collectedIds, setCollectedIds] = useState(() => new Set());
  const [notFoundIds, setNotFoundIds] = useState(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnchor, setUserAnchor] = useState(null);
  const [customOrderedStops, setCustomOrderedStops] = useState(null);

  const baseStops = useMemo(() => {
    const rawStops =
      Array.isArray(routeData?.stops) && routeData.stops.length > 0
        ? routeData.stops
        : listItems.map((item) => ({
            productId: item.id,
            name: item.name,
            category: item.category,
            aisle: item.location?.aisle || "Corredor 3",
            shelf: item.location?.shelf || "Prateleira central",
            nodeId: item.location?.nodeId ?? null,
            quantity: item.quantity || 1,
          }));
    const mapped = mapStopsToIndoorGraphStops(rawStops);
    return orderStopsWithDijkstra(mapped, "entrance", null);
  }, [routeData, listItems]);

  useEffect(() => {
    setCustomOrderedStops(null);
    setUserAnchor(null);
    setCurrentIndex(0);
  }, [baseStops]);

  const stops = customOrderedStops || baseStops;
  const totalCount = Math.max(stops.length, 1);
  const displayedCollectedCount = Math.min(totalCount, collectedIds.size);
  const activeIndex = Math.min(currentIndex, Math.max(0, stops.length - 1));

  const activeStop = stops[activeIndex] || stops[0] || {
    productId: 2,
    name: "Leite integral 1 L",
    aisle: "Corredor 3",
    shelf: "Prateleira P3",
    centerX: 255,
    centerY: 99,
  };

  const { collectedPointsAttr, upcomingPointsAttr } = useMemo(
    () => computeIndoorRoutePolylines(stops, collectedIds, notFoundIds, userAnchor),
    [stops, collectedIds, notFoundIds, userAnchor],
  );

  const handleMarkCollected = () => {
    if (activeStop?.productId !== undefined) {
      setCollectedIds((prev) => {
        const next = new Set(prev);
        next.add(activeStop.productId);
        return next;
      });
    }
    setUserAnchor(null);

    if (activeIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(Math.min(listItems.length, displayedCollectedCount + 1));
    } else {
      onNavigate("completed");
    }
  };

  const handleNotFound = () => {
    onProductNotFound?.(activeStop);
    if (activeStop?.productId !== undefined) {
      setNotFoundIds((prev) => {
        const next = new Set(prev);
        next.add(activeStop.productId);
        return next;
      });
    }
    setUserAnchor(null);

    if (activeIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(displayedCollectedCount);
    } else {
      onNavigate("completed");
    }
  };

  const handleSelectUserAnchor = (anchor, nearestCorridor) => {
    setUserAnchor(anchor);

    const doneStops = stops.filter(
      (stop, idx) =>
        collectedIds.has(stop.productId) ||
        notFoundIds.has(stop.productId) ||
        idx < activeIndex,
    );
    const pendingStops = stops.filter(
      (stop, idx) =>
        !collectedIds.has(stop.productId) &&
        !notFoundIds.has(stop.productId) &&
        idx >= activeIndex,
    );

    if (pendingStops.length > 0) {
      const reorderedPending = orderStopsWithDijkstra(pendingStops, "user", anchor);
      setCustomOrderedStops([...doneStops, ...reorderedPending]);
      setCurrentIndex(doneStops.length);

      generateOptimizedRoute(
        routeData?.store?.id || DEFAULT_STORE_ID,
        routeData?.store || { id: DEFAULT_STORE_ID, name: storeName },
        listItems,
        {
          startAisle: nearestCorridor.name,
          excludedProductIds: [...collectedIds, ...notFoundIds],
        },
      ).catch(() => {});
    }
  };

  const progressRatio = Math.min(1, Math.max(0, displayedCollectedCount / totalCount));

  return (
    <div className="wa-screen wa-screen--route">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="route"
          onBrandClick={() => onNavigate("entry")}
          onStoreClick={onOpenStorePicker}
        />

        <h1 className="wa-route-title">Sua rota de compra</h1>
        <p className="wa-route-subtitle">
          {storeName} · {totalCount} {totalCount === 1 ? "parada" : "paradas"}
          {routeData?.totalDistance ? ` · ~${Math.round(routeData.totalDistance)}m` : ""}
        </p>

        <IndoorStoreMap
          variant="webapp"
          stops={stops}
          activeIndex={activeIndex}
          collectedIds={collectedIds}
          notFoundIds={notFoundIds}
          userAnchor={userAnchor}
          collectedPointsAttr={collectedPointsAttr}
          upcomingPointsAttr={upcomingPointsAttr}
          onSelectUserAnchor={handleSelectUserAnchor}
          onSelectStopIndex={setCurrentIndex}
        />

        <section className="wa-current-stop-card" aria-live="polite">
          <div className="wa-current-stop-card__eyebrow">
            PRÓXIMA PARADA · {activeIndex + 1} DE {totalCount}
          </div>
          <h2 className="wa-current-stop-card__name">{activeStop.name}</h2>
          <p className="wa-current-stop-card__location">
            {formatStopLocation(activeStop)}
          </p>

          <div className="wa-current-stop-card__actions">
            <button
              type="button"
              className="wa-collected-btn"
              onClick={handleMarkCollected}
            >
              Marcar como coletado
            </button>
            <button
              type="button"
              className="wa-report-link"
              onClick={handleNotFound}
            >
              Não encontrei
            </button>
          </div>
        </section>

        <div className="wa-progress-section">
          <div
            className="wa-progress-track"
            role="progressbar"
            aria-valuenow={displayedCollectedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
          >
            <div
              className="wa-progress-fill"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
          <div className="wa-progress-label">
            {displayedCollectedCount} de {totalCount} itens coletados
          </div>
        </div>
      </div>
    </div>
  );
}
