import {
  getNearestIndoorCorridor,
  ENTRANCE_POINT,
  INDOOR_CORRIDORS,
  INDOOR_MAP_HEIGHT,
  INDOOR_MAP_THEMES,
  INDOOR_MAP_WIDTH,
  INDOOR_SHELVES,
  isPointInsideIndoorMap,
  isPointOnIndoorShelf,
} from "../shared/indoor-map-engine";

export function IndoorStoreMap({
  variant = "webapp",
  stops = [],
  activeIndex = 0,
  collectedIds = new Set(),
  notFoundIds = new Set(),
  userAnchor = null,
  upcomingPointsAttr = [],
  onSelectUserAnchor,
}) {
  const theme = INDOOR_MAP_THEMES[variant] || INDOOR_MAP_THEMES.webapp;

  const handleMapClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    const clickX = Math.round(((event.clientX - bounds.left) / bounds.width) * INDOOR_MAP_WIDTH);
    const clickY = Math.round(((event.clientY - bounds.top) / bounds.height) * INDOOR_MAP_HEIGHT);

    if (!isPointInsideIndoorMap(clickX, clickY) || isPointOnIndoorShelf(clickX, clickY)) {
      return;
    }

    const nearestCorridor = getNearestIndoorCorridor(clickX);
    const anchor = {
      x: Math.min(INDOOR_MAP_WIDTH - 4, Math.max(4, clickX)),
      y: Math.min(INDOOR_MAP_HEIGHT - 4, Math.max(4, clickY)),
      corridorName: nearestCorridor.name,
      corridorIndex: nearestCorridor.index,
    };

    if (onSelectUserAnchor) {
      onSelectUserAnchor(anchor, nearestCorridor);
    }
  };

  const lastCollectedStop = [...stops].reverse().find((stop) => collectedIds.has(stop.productId));
  const activeStop = stops[activeIndex];
  const badgeX = userAnchor?.x ?? lastCollectedStop?.centerX ?? ENTRANCE_POINT.x;
  const badgeY = userAnchor?.y ?? lastCollectedStop?.centerY ?? ENTRANCE_POINT.y;

  return (
    <div
      className="wa-map-canvas"
      role="region"
      aria-label="Mapa esquemático de corredores. Toque em um corredor para indicar sua localização atual."
      onClick={handleMapClick}
      style={{
        width: "100%",
        maxWidth: "100%",
        height: `${INDOOR_MAP_HEIGHT}px`,
        borderRadius: "14px",
        border: `1px solid ${theme.canvasBorder}`,
        backgroundColor: theme.canvasBg,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Rótulos superiores e inferiores unificados ("Corredores da loja", "ENTRADA" e "Mapa esquemático") */}
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          left: "13px",
          top: "11px",
          fontSize: "10px",
          fontWeight: 500,
          color: theme.headerLabelColor,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Corredores da loja
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 2,
          left: "13px",
          top: `${INDOOR_MAP_HEIGHT - 26}px`,
          fontSize: "9px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          color: theme.footerLabelColor,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        ENTRADA
      </div>

      <div
        style={{
          position: "absolute",
          zIndex: 2,
          right: "13px",
          top: `${INDOOR_MAP_HEIGHT - 26}px`,
          fontSize: "9px",
          fontWeight: 500,
          color: theme.footerLabelColor,
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        Mapa esquemático
      </div>

      {/* Identificação dos Corredores nos vãos caminháveis entre as prateleiras */}
      {INDOOR_CORRIDORS.map((corridor) => (
        <div
          key={corridor.id}
          style={{
            position: "absolute",
            left: `${(corridor.centerX / INDOOR_MAP_WIDTH) * 100}%`,
            transform: "translateX(-50%)",
            top: "34px",
            width: "42px",
            textAlign: "center",
            fontSize: "8px",
            fontWeight: 600,
            color: theme.corridorCodeColor,
          zIndex: 2,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span>{corridor.label}</span>
          <span style={{ display: "block", marginTop: "1px", fontSize: "6px", letterSpacing: "0.01em" }}>
            {corridor.aisleLabel}
          </span>
        </div>
      ))}

      {/* As 4 Prateleiras / Gôndolas compridas fechadas (bloqueadas para clique) */}
      {INDOOR_SHELVES.map((shelf) => (
        <div
          key={shelf.id}
          style={{
            position: "absolute",
            zIndex: 1,
            left: `${(shelf.left / INDOOR_MAP_WIDTH) * 100}%`,
            top: `${shelf.top}px`,
            width: `${(shelf.width / INDOOR_MAP_WIDTH) * 100}%`,
            height: `${shelf.height}px`,
            borderRadius: "6px",
            backgroundColor: theme.shelfBg,
            border: theme.shelfBorder !== "transparent" ? `1px solid ${theme.shelfBorder}` : "none",
            paddingTop: "9px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "not-allowed",
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
          title={`Prateleira ${shelf.label}`}
        >
          <span
            style={{
              fontSize: "9px",
              fontWeight: 600,
              color: theme.shelfLabelColor,
              userSelect: "none",
            }}
          >
            {shelf.label}
          </span>
        </div>
      ))}

      {/* Traçado ortogonal do grafo (Trecho coletado + Caminho Dijkstra para as próximas coletas) */}
      <svg
        className="wa-route-svg"
        viewBox={`0 0 ${INDOOR_MAP_WIDTH} ${INDOOR_MAP_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {upcomingPointsAttr.map((points, index) => (
          <polyline
            key={`upcoming-${index}`}
            points={points}
            fill="none"
            stroke={theme.upcomingLineStroke}
            strokeWidth="2.5"
            opacity="0.78"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {userAnchor ? (
          <>
            <circle
              cx={userAnchor.x}
              cy={userAnchor.y}
              r="9"
              fill={theme.userPulseFill}
            />
            <circle
              cx={userAnchor.x}
              cy={userAnchor.y}
              r="5"
              fill={theme.userCoreFill}
              stroke={theme.userCoreStroke}
              strokeWidth="2"
            />
          </>
        ) : null}
      </svg>

      <div
        className="wa-map-user-marker"
        style={{ left: `${(badgeX / INDOOR_MAP_WIDTH) * 100}%`, top: `${badgeY}px` }}
        role="img"
        aria-label="Sua posição atual no mapa"
      />

      {/* Somente a próxima parada é marcada para manter a leitura do mapa simples. */}
      {activeStop && !collectedIds.has(activeStop.productId) && !notFoundIds.has(activeStop.productId) && (() => {
        const stop = activeStop;
        const idx = activeIndex;
        const pinTop = stop.centerY - 12;
        return (
          <div
            key={`${stop.productId || idx}-${idx + 1}`}
            role="img"
            className="wa-map-stop wa-map-stop--active"
            style={{
            left: `${(stop.centerX / INDOOR_MAP_WIDTH) * 100}%`,
              top: `${pinTop}px`,
            transform: "translateX(-50%)",
              width: "24px",
              height: "24px",
              borderRadius: "999px",
              backgroundColor: theme.pinCurrentBg,
              border: `1.5px solid ${theme.pinPendingBorder}`,
              color: theme.pinCurrentText,
              fontSize: "11px",
              fontWeight: 700,
            }}
            aria-label={`Próxima parada ${idx + 1}: ${stop.name || ""}`}
          >
            <span>
              {idx + 1}
            </span>
          </div>
        );
      })()}

      {/* Indicador da posição do usuário */}
      <div
        className="wa-user-position-badge"
        style={{
          left: `${(Math.min(INDOOR_MAP_WIDTH - 82, Math.max(8, badgeX + 8)) / INDOOR_MAP_WIDTH) * 100}%`,
          top: `${Math.min(INDOOR_MAP_HEIGHT - 28, Math.max(8, badgeY - 24))}px`,
        }}
        aria-hidden="true"
      >
        <span className="wa-user-position-dot" />
        <span>VOCÊ</span>
      </div>
    </div>
  );
}
