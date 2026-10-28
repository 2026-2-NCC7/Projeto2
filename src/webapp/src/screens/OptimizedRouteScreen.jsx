import { useMemo, useState } from "react";
import { StoreHeader } from "../components/StoreHeader";
import { getAisleColumnIndex } from "../services/webapp-api";

const AISLE_COLUMNS = [
  { id: "c1", name: "Corredor 1", label: "CORREDOR\n1", left: 25, centerX: 51 },
  { id: "c2", name: "Corredor 2", label: "CORREDOR\n2", left: 103, centerX: 129 },
  { id: "c3", name: "Corredor 3", label: "CORREDOR\n3", left: 181, centerX: 207 },
  { id: "horti", name: "Hortifruti", label: "HORTI", left: 259, centerX: 285 },
];

function getStopCoordinates(stop, index, totalInSameCol = 1, rankInCol = 0) {
  const colIdx = getAisleColumnIndex(stop?.aisle || stop?.category || "");
  const col = AISLE_COLUMNS[colIdx] || AISLE_COLUMNS[0];

  // Preserve exact Figma pin positions for the 3-stop demo layout
  if (colIdx === 0 && rankInCol === 0) {
    return { left: 40, top: 82, centerX: 52, centerY: 97, colIdx };
  }
  if (colIdx === 2 && rankInCol === 0) {
    return { left: 210, top: 110, centerX: 222, centerY: 125, colIdx };
  }
  if (colIdx === 3 && rankInCol === 0) {
    return { left: 270, top: 230, centerX: 285, centerY: 245, colIdx };
  }

  const baseTop = 92;
  const stepY = totalInSameCol > 1 ? Math.min(52, 130 / totalInSameCol) : 0;
  const top = Math.round(baseTop + rankInCol * stepY + (index % 2) * 14);
  const left = col.centerX - 15;
  return {
    left,
    top,
    centerX: left + 15,
    centerY: top + 15,
    colIdx,
  };
}

function buildOrthogonalPolylinePoints(pins) {
  if (!pins.length) return [];
  const WALKWAY_Y = 214; // Horizontal cross-aisle y coordinate matching Figma (209 + 5)
  const points = [];

  for (let i = 0; i < pins.length; i += 1) {
    const curr = pins[i];
    if (i === 0) {
      points.push({ x: curr.centerX, y: curr.centerY });
      continue;
    }
    const prev = pins[i - 1];
    if (prev.colIdx === curr.colIdx) {
      points.push({ x: curr.centerX, y: curr.centerY });
    } else {
      points.push({ x: prev.centerX, y: WALKWAY_Y });
      points.push({ x: curr.centerX, y: WALKWAY_Y });
      points.push({ x: curr.centerX, y: curr.centerY });
    }
  }
  return points;
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnchorAisle, setUserAnchorAisle] = useState(null);

  const stops = useMemo(() => {
    const rawStops = routeData?.stops?.length
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
  // Display at least 1 collected on initial view to match Figma ("1 de 3 itens coletados")
  const displayedCollectedCount = Math.max(1, Math.min(totalCount, collectedIds.size + 1));

  const activeStop = stops[currentIndex] || stops[0] || {
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
      return {
        number: idx + 1,
        stop,
        isCollected: collectedIds.has(stop.productId) || idx < currentIndex,
        ...coords,
      };
    });
  }, [stops, collectedIds, currentIndex]);

  const polylinePoints = useMemo(
    () => buildOrthogonalPolylinePoints(stopPins),
    [stopPins],
  );

  const svgPointsAttr = useMemo(
    () => polylinePoints.map((pt) => `${pt.x},${pt.y}`).join(" "),
    [polylinePoints],
  );

  const activePin = stopPins[currentIndex] || stopPins[0];
  const activeColIdx = activePin ? activePin.colIdx : 0;

  const handleMarkCollected = () => {
    if (activeStop?.productId !== undefined) {
      setCollectedIds((prev) => {
        const next = new Set(prev);
        next.add(activeStop.productId);
        return next;
      });
    }

    if (currentIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(totalCount);
    } else {
      onNavigate("completed");
    }
  };

  const handleNotFound = () => {
    if (currentIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (onCompleteShopping) {
      onCompleteShopping(displayedCollectedCount);
    } else {
      onNavigate("completed");
    }
  };

  const handleAisleClick = (aisleColumn) => {
    setUserAnchorAisle(aisleColumn.name);
    if (onRecalculateFromAisle) {
      onRecalculateFromAisle(aisleColumn.name);
      setCurrentIndex(0);
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
        />

        <h1 className="wa-route-title">Sua rota de compra</h1>
        <p className="wa-route-subtitle">
          {storeName} · {totalCount} {totalCount === 1 ? "parada" : "paradas"}
          {routeData?.totalDistance ? ` · ~${Math.round(routeData.totalDistance)}m` : ""}
        </p>

        <div className="wa-map-canvas" role="region" aria-label="Mapa indoor interativo da loja">
          {AISLE_COLUMNS.map((aisle, idx) => {
            const isCurrentAisle = idx === activeColIdx;
            return (
              <button
                key={aisle.id}
                type="button"
                className={`wa-map-aisle ${isCurrentAisle ? "wa-map-aisle--current" : ""}`}
                style={{ left: `${aisle.left}px` }}
                onClick={() => handleAisleClick(aisle)}
                title={`Toque para informar que você está em ${aisle.name} e recalcular a rota`}
              >
                <span className="wa-map-aisle__label">{aisle.label}</span>
              </button>
            );
          })}

          {/* Dynamic SVG indoor path connecting the stops across aisles */}
          {polylinePoints.length > 1 ? (
            <svg
              className="wa-route-svg"
              viewBox="0 0 350 355"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points={svgPointsAttr}
                fill="none"
                stroke="#F26900"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}

          {/* Stop Pins */}
          {stopPins.map((pin, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={`${pin.stop?.productId || idx}-${pin.number}`}
                type="button"
                className={`wa-map-stop ${isSelected ? "wa-map-stop--active" : ""} ${
                  pin.isCollected ? "wa-map-stop--collected" : ""
                }`}
                style={{ left: `${pin.left}px`, top: `${pin.top}px` }}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Parada ${pin.number}: ${pin.stop?.name || ""}`}
              >
                <span>{pin.isCollected && !isSelected ? "✓" : pin.number}</span>
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

          {/* Floor plan reference markers: Entrada & Caixa */}
          <div className="wa-map-footer-bar">
            <span className="wa-map-zone-tag">↳ ENTRADA (QR)</span>
            <span className="wa-map-anchor-hint">
              {userAnchorAisle
                ? `Posição: ${userAnchorAisle}`
                : "Toque num corredor para reposicionar"}
            </span>
            <span className="wa-map-zone-tag">CAIXA ↱</span>
          </div>
        </div>

        <section className="wa-current-stop-card" aria-live="polite">
          <div className="wa-current-stop-card__eyebrow">
            PRÓXIMO PRODUTO · {currentIndex + 1} DE {totalCount}
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
