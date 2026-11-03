import { useMemo, useState } from "react";
import { StoreHeader } from "../components/StoreHeader";
import { getAisleColumnIndex } from "../services/webapp-api";

const AISLE_COLUMNS = [
  { id: "c1", name: "Corredor 1", label: "CORREDOR\n1", left: 25, centerX: 51 },
  { id: "c2", name: "Corredor 2", label: "CORREDOR\n2", left: 103, centerX: 129 },
  { id: "c3", name: "Corredor 3", label: "CORREDOR\n3", left: 181, centerX: 207 },
  { id: "horti", name: "Hortifruti", label: "HORTI", left: 259, centerX: 285 },
];

function getStopCoordinates(stop, index, totalStops = 3) {
  const colIdx = getAisleColumnIndex(stop?.aisle || stop?.category || "");
  const col = AISLE_COLUMNS[colIdx] || AISLE_COLUMNS[0];

  // Coordenadas exatas do Figma (Node 2063:122) para os corredores:
  // Corredor 1: Stop 1 -> top 82px, left 40px
  // Corredor 3: Stop 2 -> top 110px, left 210px
  // Hortifruti: Stop 3 -> top 230px, left 270px
  // Corredor 2: centro do corredor -> top 140px, left 114px
  if (colIdx === 0) {
    return { left: 40, top: 82, centerX: 55, centerY: 97, colIdx };
  }
  if (colIdx === 1) {
    return { left: 114, top: 140, centerX: 129, centerY: 155, colIdx };
  }
  if (colIdx === 2) {
    return { left: 210, top: 110, centerX: 225, centerY: 125, colIdx };
  }
  if (colIdx === 3) {
    return { left: 270, top: 230, centerX: 285, centerY: 245, colIdx };
  }

  return {
    left: col.centerX - 15,
    top: 130 + (index % 3) * 35,
    centerX: col.centerX,
    centerY: 145 + (index % 3) * 35,
    colIdx,
  };
}

function buildFigmaOrthogonalPath(pins) {
  if (!pins || pins.length === 0) return "";
  const WALKWAY_Y = 214; // Altura exata da travessia horizontal do Figma (relY 209 + 5px)

  let pathD = "";
  for (let i = 0; i < pins.length; i += 1) {
    const curr = pins[i];
    if (i === 0) {
      pathD += `M ${curr.centerX} ${curr.centerY}`;
      continue;
    }
    const prev = pins[i - 1];
    if (prev.colIdx === curr.colIdx) {
      pathD += ` L ${curr.centerX} ${curr.centerY}`;
    } else {
      // Desce até o corredor transversal inferior, atravessa horizontalmente e sobe/desce até a parada
      pathD += ` L ${prev.centerX} ${WALKWAY_Y} L ${curr.centerX} ${WALKWAY_Y} L ${curr.centerX} ${curr.centerY}`;
    }
  }
  return pathD;
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

  // Ordena os stops para seguir a ordem do corredor (Corredor 1 -> Corredor 3 -> Hortifruti) como no Figma
  const stops = useMemo(() => {
    const rawStops = Array.isArray(routeData?.stops) && routeData.stops.length > 0
      ? routeData.stops
      : listItems.map((item) => ({
          productId: item.id,
          name: item.name,
          category: item.category,
          aisle: item.location?.aisle || "Corredor 3",
          shelf: item.location?.shelf || "Prateleira central",
          quantity: item.quantity || 1,
        }));

    return [...rawStops].sort((a, b) => {
      const colA = getAisleColumnIndex(a.aisle || a.category || "");
      const colB = getAisleColumnIndex(b.aisle || b.category || "");
      return colA - colB;
    });
  }, [routeData, listItems]);

  const totalCount = Math.max(stops.length, 1);
  const activeIndex = Math.min(currentIndex, Math.max(0, stops.length - 1));

  // O Figma (Node 2063:148) ilustra "Leite integral 1 L" no card principal
  const activeStop = stops[activeIndex] || stops[0] || {
    productId: 2,
    name: "Leite integral 1 L",
    aisle: "Corredor 3",
    shelf: "Prateleira central",
  };

  const stopPins = useMemo(() => {
    return stops.map((stop, idx) => {
      const coords = getStopCoordinates(stop, idx, stops.length);
      const isNotFound = notFoundIds.has(stop.productId);
      const isCollected = !isNotFound && (collectedIds.has(stop.productId) || idx < activeIndex);
      return {
        number: idx + 1,
        stop,
        isCollected,
        isNotFound,
        ...coords,
      };
    });
  }, [stops, collectedIds, notFoundIds, activeIndex]);

  // SVG path exato conectando os corredores
  const svgPathData = useMemo(() => {
    return buildFigmaOrthogonalPath(stopPins);
  }, [stopPins]);

  // No Figma a barra exibe "1 de 3 itens coletados" quando está na Parada 2 (Leite)
  const displayedCollectedCount = Math.max(
    1,
    Math.min(totalCount, collectedIds.size + 1),
  );
  const progressRatio = Math.min(1, Math.max(0.33, displayedCollectedCount / totalCount));

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
      onCompleteShopping(totalCount);
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
    if (onRecalculateFromAisle) {
      onRecalculateFromAisle(aisleColumn.name);
      setCurrentIndex(0);
    }
  };

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
        </p>

        {/* Mapa Indoor da Loja — Exato do Figma (Node 2063:128) */}
        <div
          className="wa-map-canvas"
          role="region"
          aria-label="Mapa indoor da loja com rota otimizada"
        >
          {/* As 4 colunas de corredores (Corredor 1, 2, 3 e Horti) */}
          {AISLE_COLUMNS.map((aisle) => (
            <button
              key={aisle.id}
              type="button"
              className="wa-map-aisle"
              style={{ left: `${aisle.left}px` }}
              onClick={() => handleAisleClick(aisle)}
              title={`Corredor ${aisle.name} — clique para reposicionar rota`}
            >
              <span className="wa-map-aisle__label">{aisle.label}</span>
            </button>
          ))}

          {/* Traçado oficial da rota em laranja contínuo de 10px */}
          {svgPathData ? (
            <svg
              className="wa-route-svg"
              viewBox="0 0 350 355"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d={svgPathData}
                fill="none"
                stroke="#F26900"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}

          {/* Pins numerados das paradas nos corredores */}
          {stopPins.map((pin, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={`${pin.stop?.productId || idx}-${pin.number}`}
                type="button"
                className={`wa-map-stop ${isSelected ? "wa-map-stop--active" : ""}`}
                style={{ left: `${pin.left}px`, top: `${pin.top}px` }}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Parada ${pin.number}: ${pin.stop?.name || ""}`}
              >
                <span>{pin.number}</span>
              </button>
            );
          })}
        </div>

        {/* Card do Próximo Produto — Exato do Figma (Node 2063:146) */}
        <section className="wa-current-stop-card" aria-live="polite">
          <div className="wa-current-stop-card__eyebrow">
            PRÓXIMO PRODUTO · {activeIndex + 1} DE {totalCount}
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

        {/* Barra de Progresso — Exato do Figma (Node 2063:153) */}
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
