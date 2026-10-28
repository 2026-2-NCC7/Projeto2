import { useMemo, useState } from "react";
import { StoreHeader } from "../components/StoreHeader";

const AISLE_COLUMNS = [
  { id: "c1", label: "CORREDOR\n1", left: 25 },
  { id: "c2", label: "CORREDOR\n2", left: 103 },
  { id: "c3", label: "CORREDOR\n3", left: 181 },
  { id: "horti", label: "HORTI", left: 259 },
];

function getStopPinPosition(stop, index) {
  // Exact Figma positions for the 3 stops on the 350x355 map canvas:
  // Stop 1: (40, 82) inside Corredor 1
  // Stop 2: (210, 110) inside Corredor 3
  // Stop 3: (270, 230) inside HORTI
  if (index === 0) return { left: 40, top: 82 };
  if (index === 1) return { left: 210, top: 110 };
  if (index === 2) return { left: 270, top: 230 };

  const aisle = (stop?.aisle || "").toLowerCase();
  if (aisle.includes("1")) return { left: 40, top: 130 + (index % 3) * 36 };
  if (aisle.includes("2")) return { left: 118, top: 110 + (index % 3) * 36 };
  if (aisle.includes("3")) return { left: 210, top: 145 + (index % 3) * 36 };
  return { left: 270, top: 170 + (index % 3) * 36 };
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
}) {
  const stops = useMemo(() => {
    const rawStops = routeData?.stops?.length
      ? routeData.stops
      : listItems.map((item) => ({
          productId: item.id,
          name: item.name,
          aisle: item.location?.aisle || "Corredor 3",
          shelf: item.location?.shelf || "Prateleira central",
          quantity: item.quantity || 1,
        }));

    // Keep "Leite integral 1 L" as the first highlighted product to match Figma 2063:122
    const sorted = [...rawStops].sort((a, b) => {
      const aMilk = (a.name || "").toLowerCase().includes("leite");
      const bMilk = (b.name || "").toLowerCase().includes("leite");
      if (aMilk && !bMilk) return -1;
      if (!aMilk && bMilk) return 1;
      return 0;
    });
    return sorted;
  }, [routeData, listItems]);

  const totalCount = Math.max(stops.length, 1);
  // Start with 1 of N collected in progress bar as shown in Figma ("1 de 3 itens coletados")
  const [currentIndex, setCurrentIndex] = useState(0);
  const [collectedCount, setCollectedCount] = useState(1);

  const activeStop = stops[currentIndex] || stops[0] || {
    name: "Leite integral 1 L",
    aisle: "Corredor 3",
    shelf: "Prateleira central",
  };

  const stopPins = useMemo(() => {
    const baseStops = stops.length >= 3 ? stops : [
      stops[0] || { name: "Pão de forma", aisle: "Corredor 1" },
      stops[1] || { name: "Leite integral 1 L", aisle: "Corredor 3" },
      stops[2] || { name: "Banana prata", aisle: "Hortifruti" },
    ];
    return baseStops.slice(0, 6).map((stop, idx) => ({
      number: idx + 1,
      stop,
      ...getStopPinPosition(stop, idx),
    }));
  }, [stops]);

  const handleMarkCollected = () => {
    if (currentIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setCollectedCount((prev) => Math.min(totalCount, prev + 1));
    } else if (collectedCount < totalCount) {
      setCollectedCount(totalCount);
    } else {
      // Restart tour or go back to list
      setCurrentIndex(0);
      setCollectedCount(1);
    }
  };

  const handleNotFound = () => {
    if (currentIndex < stops.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onNavigate("list");
    }
  };

  const progressRatio = Math.min(1, Math.max(0, collectedCount / totalCount));

  return (
    <div className="wa-screen wa-screen--route">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="route"
          onBrandClick={() => onNavigate("entry")}
        />

        <h1 className="wa-route-title">{`Sua rota de compra`}</h1>
        <p className="wa-route-subtitle">
          {storeName} · {totalCount} {totalCount === 1 ? "parada" : "paradas"}
        </p>

        <div className="wa-map-canvas" role="img" aria-label="Mapa indoor da loja com rota otimizada">
          {AISLE_COLUMNS.map((aisle) => (
            <div
              key={aisle.id}
              className="wa-map-aisle"
              style={{ left: `${aisle.left}px` }}
            >
              <span className="wa-map-aisle__label">{aisle.label}</span>
            </div>
          ))}

          {/* Route segments matching Figma 2063:137, 2063:138, 2063:139 */}
          <div className="wa-route-segment wa-route-segment--vertical" />
          <div className="wa-route-segment wa-route-segment--horizontal" />
          <div className="wa-route-segment wa-route-segment--last" />

          {stopPins.map((pin, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={pin.number}
                type="button"
                className={`wa-map-stop ${isSelected ? "wa-map-stop--active" : ""}`}
                style={{ left: `${pin.left}px`, top: `${pin.top}px` }}
                onClick={() => {
                  if (idx < stops.length) setCurrentIndex(idx);
                }}
                aria-label={`Parada ${pin.number}: ${pin.stop?.name || ""}`}
              >
                <span>{pin.number}</span>
              </button>
            );
          })}
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
          <div className="wa-progress-track" role="progressbar" aria-valuenow={collectedCount} aria-valuemin={0} aria-valuemax={totalCount}>
            <div
              className="wa-progress-fill"
              style={{ width: `${Math.round(progressRatio * 100)}%` }}
            />
          </div>
          <div className="wa-progress-label">
            {collectedCount} de {totalCount} itens coletados
          </div>
        </div>
      </div>
    </div>
  );
}
