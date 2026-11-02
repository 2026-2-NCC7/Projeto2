import { useMemo, useState } from "react";
import { StoreHeader } from "../components/StoreHeader";
import { getAisleColumnIndex } from "../services/webapp-api";

const AISLE_COLUMNS = [
  { id: "c1", name: "Corredor 1", label: "C1", left: 28, centerX: 46 },
  { id: "c2", name: "Corredor 2", label: "C2", left: 105, centerX: 123 },
  { id: "c3", name: "Corredor 3", label: "C3", left: 182, centerX: 200 },
  { id: "horti", name: "Hortifruti", label: "HORTI", left: 259, centerX: 277 },
];

function getStopCoordinates(stop, index, totalInSameCol = 1, rankInCol = 0) {
  const colIdx = getAisleColumnIndex(stop?.aisle || stop?.category || "");
  const col = AISLE_COLUMNS[colIdx] || AISLE_COLUMNS[0];
  const baseTop = 78;
  const stepY = totalInSameCol > 1
    ? Math.min(42, 160 / (totalInSameCol - 1))
    : 80;
  const top = Math.round(
    totalInSameCol > 1
      ? baseTop + rankInCol * stepY
      : baseTop + stepY,
  );
  const left = col.centerX - 14;
  return {
    left,
    top,
    centerX: left + 14,
    centerY: top + 14,
    colIdx,
  };
}

function buildOrthogonalSegment(prev, curr, transitionIndex) {
  if (prev.colIdx === curr.colIdx) {
    return [
      { x: prev.centerX, y: prev.centerY },
      { x: curr.centerX, y: curr.centerY },
    ];
  }

  // Alternate the two open cross-aisles so the path remains outside the shelves.
  const walkwayY = transitionIndex % 2 === 0 ? 278 : 38;
  return [
    { x: prev.centerX, y: prev.centerY },
    { x: prev.centerX, y: walkwayY },
    { x: curr.centerX, y: walkwayY },
    { x: curr.centerX, y: curr.centerY },
  ];
}

function buildOrthogonalRouteSegments(pins) {
  if (pins.length < 2) return [];
  return pins.slice(1).map((pin, index) => {
    return buildOrthogonalSegment(pins[index], pin, index);
  });
}

function flattenRouteSegments(segments) {
  return segments.reduce((points, segment, index) => {
    if (index === 0) return [...segment];
    return [...points, ...segment.slice(1)];
  }, []);
}

function formatStopLocation(stop) {
  if (!stop) return "Corredor 3 · Prateleira central";
  const name = (stop.name || "").toLowerCase();
  if (name.includes("leite")) {
    return "Corredor 3 · Prateleira central";
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
  onCompleteShopping,
  onRecalculateFromAisle,
}) {
  const [collectedIds, setCollectedIds] = useState(() => new Set());
  const [notFoundIds, setNotFoundIds] = useState(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const stops = useMemo(() => {
    const rawStops = Array.isArray(routeData?.stops)
      ? routeData.stops
      : listItems.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category,
          aisle: item.location?.aisle || "Corredor 3",
          shelf: item.location?.shelf || "Prateleira central",
          quantity: item.quantity || 1,
        }));
    return rawStops;
  }, [routeData, listItems]);

  const totalCount = Math.max(stops.length, 1);
  const displayedCollectedCount = Math.min(totalCount, collectedIds.size);
  const activeIndex = Math.min(currentIndex, Math.max(0, stops.length - 1));

  const activeStop = stops[activeIndex] || stops[0] || {
    productId: 2,
    name: "Leite integral 1 L",
    aisle: "Corredor 3",
    shelf: "Prateleira central",
  };

  const stopPins = useMemo(() => {
    const countsByCol = new Map();
    const ranksByIdx = [];

    for (const stop of stops) {
      const col = getAisleColumnIndex(stop?.aisle || stop?.category || "");
      const currentRank = countsByCol.get(col) || 0;
      ranksByIdx.push({ col, rank: currentRank });
      countsByCol.set(col, currentRank + 1);
    }

    return stops.map((stop, idx) => {
      const { col, rank } = ranksByIdx[idx];
      const totalInCol = countsByCol.get(col) || 1;
      const coords = getStopCoordinates(stop, idx, totalInCol, rank);
      const isNotFound = notFoundIds.has(stop.productId);
      return {
        number: idx + 1,
        stop,
        isCollected:
          !isNotFound && (collectedIds.has(stop.productId) || idx < activeIndex),
        isNotFound,
        ...coords,
      };
    });
  }, [stops, collectedIds, notFoundIds, activeIndex]);

  const routeSegments = useMemo(
    () => buildOrthogonalRouteSegments(stopPins),
    [stopPins],
  );

  const routePoints = useMemo(
    () => flattenRouteSegments(routeSegments),
    [routeSegments],
  );

  const activeSegmentPoints = routeSegments[activeIndex] || [];
  const routePointsAttr = routePoints.map((pt) => `${pt.x},${pt.y}`).join(" ");
  const activeRoutePointsAttr = activeSegmentPoints
    .map((pt) => `${pt.x},${pt.y}`)
    .join(" ");
  const activePin = stopPins[activeIndex] || stopPins[0];
  const activeColIdx = activePin ? activePin.colIdx : 0;

  const handleMarkCollected = () => {
    if (activeStop?.productId !== undefined) {
      setCollectedIds((prev) => {
        const next = new Set(prev);
        next.add(activeStop.productId);
        return next;
      });
    }

    if (activeIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(Math.min(listItems.length, displayedCollectedCount + 1));
    } else {
      onNavigate("completed");
    }
  };

  const handleNotFound = () => {
    if (activeStop?.productId !== undefined) {
      setNotFoundIds((prev) => {
        const next = new Set(prev);
        next.add(activeStop.productId);
        return next;
      });
    }

    if (activeIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(displayedCollectedCount);
    } else {
      onNavigate("completed");
    }
  };

  const handleAisleClick = (aisleColumn) => {
    const excludedProductIds = Array.from(
      new Set([
        ...Array.from(collectedIds).map((id) => String(id)),
        ...Array.from(notFoundIds).map((id) => String(id)),
      ]),
    );
    const remainingStops = stops.filter(
      (stop) => !excludedProductIds.includes(String(stop.productId)),
    );

    if (remainingStops.length === 0) {
      if (onCompleteShopping) onCompleteShopping(displayedCollectedCount);
      return;
    }

    if (onRecalculateFromAisle) {
      onRecalculateFromAisle(aisleColumn.name, excludedProductIds);
      setCurrentIndex(0);
    }
  };

  const handleMapClick = (event) => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const localX = ((event.clientX - bounds.left) / bounds.width) * 350;
    const nearestAisle = AISLE_COLUMNS.reduce((closest, aisle) => {
      const closestDistance = Math.abs(closest.centerX - localX);
      const aisleDistance = Math.abs(aisle.centerX - localX);
      return aisleDistance < closestDistance ? aisle : closest;
    }, AISLE_COLUMNS[0]);
    handleAisleClick(nearestAisle);
  };

  const progressRatio = Math.min(1, Math.max(0, displayedCollectedCount / totalCount));

  return (
    <div className="wa-screen wa-screen--route">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="route"
          onBrandClick={() => onNavigate("entry")}
        />

        <h1 className="wa-route-title">Sua rota de compra</h1>
        <p className="wa-route-subtitle">
          {storeName} · {totalCount} {totalCount === 1 ? "parada" : "paradas"}
          {routeData?.totalDistance ? ` · ~${Math.round(routeData.totalDistance)}m` : ""}
        </p>

        <div
          className="wa-map-canvas"
          role="region"
          aria-label="Mapa indoor interativo da loja"
          onClick={handleMapClick}
        >
          {AISLE_COLUMNS.map((aisle, idx) => {
            const isCurrentAisle = idx === activeColIdx;
            return (
              <button
                key={aisle.id}
                type="button"
                className={`wa-map-aisle ${isCurrentAisle ? "wa-map-aisle--current" : ""}`}
                style={{ left: `${aisle.left}px` }}
                onClick={(event) => {
                  event.stopPropagation();
                  handleAisleClick(aisle);
                }}
                title={`Toque para informar que você está em ${aisle.name} e recalcular a rota`}
              >
                <span className="wa-map-aisle__label">{aisle.label}</span>
              </button>
            );
          })}

          {/* Dynamic SVG indoor path connecting the stops across aisles */}
          {routePoints.length > 1 ? (
            <svg
              className="wa-route-svg"
              viewBox="0 0 350 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points={routePointsAttr}
                fill="none"
                stroke="#f2d0a8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {activeRoutePointsAttr ? (
                <polyline
                  points={activeRoutePointsAttr}
                  fill="none"
                  stroke="#f26900"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </svg>
          ) : null}

          {/* Stop Pins */}
          {stopPins.map((pin, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${pin.stop?.productId || idx}-${pin.number}`}
                type="button"
                className={`wa-map-stop ${isSelected ? "wa-map-stop--active" : ""} ${
                  pin.isCollected ? "wa-map-stop--collected" : ""
                } ${pin.isNotFound ? "wa-map-stop--not-found" : ""}`}
                style={{ left: `${pin.left}px`, top: `${pin.top}px` }}
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Parada ${pin.number}: ${pin.stop?.name || ""}`}
              >
                <span>
                  {pin.isNotFound && !isSelected
                    ? "X"
                    : pin.isCollected && !isSelected
                      ? "✓"
                      : pin.number}
                </span>
              </button>
            );
          })}

          {/* Live User Position Badge on the active stop */}
          {activePin ? (
            <div
              className="wa-user-position-badge"
              style={{
                left: `${Math.min(265, Math.max(12, activePin.left - 12))}px`,
                top: `${Math.min(315, activePin.top + 34)}px`,
              }}
              aria-hidden="true"
            >
              <span className="wa-user-position-dot" />
              <span>VOCÊ</span>
            </div>
          ) : null}

        </div>

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
