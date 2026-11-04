import {
  getNearestIndoorCorridor,
  INDOOR_CORRIDORS,
  INDOOR_MAP_HEIGHT,
  INDOOR_MAP_THEMES,
  INDOOR_MAP_WIDTH,
  INDOOR_SHELVES,
  isPointInsideIndoorMap,
  isPointOnIndoorShelf,
} from "../../../shared/indoor-map-engine";

export function IndoorStoreMap({
  variant = "webapp",
  stops = [],
  activeIndex = 0,
  collectedIds = new Set(),
  notFoundIds = new Set(),
  userAnchor = null,
  collectedPointsAttr = "",
  upcomingPointsAttr = "",
  onSelectUserAnchor,
  onSelectStopIndex,
}) {
  const theme = INDOOR_MAP_THEMES[variant] || INDOOR_MAP_THEMES.webapp;
  const activeStop = stops[activeIndex] || stops[0];

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

  const badgeX = userAnchor ? userAnchor.x : activeStop?.centerX || 23;
  const badgeY = userAnchor ? userAnchor.y : activeStop ? activeStop.centerY + 18 : 120;

  return (
    <div
      className="wa-map-canvas"
      role="region"
      aria-label="Mapa esquemático de corredores. Toque em um corredor para indicar sua localização atual."
      onClick={handleMapClick}
      style={{
        width: `${INDOOR_MAP_WIDTH}px`,
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
          left: "13px",
          top: "228px",
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
          left: "201px",
          top: "228px",
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
            left: `${corridor.centerX - 12}px`,
            top: "44px",
            width: "24px",
            textAlign: "center",
            fontSize: "8px",
            fontWeight: 600,
            color: theme.corridorCodeColor,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {corridor.label}
        </div>
      ))}

      {/* As 4 Prateleiras / Gôndolas compridas fechadas (bloqueadas para clique) */}
      {INDOOR_SHELVES.map((shelf) => (
        <div
          key={shelf.id}
          style={{
            position: "absolute",
            left: `${shelf.left}px`,
            top: `${shelf.top}px`,
            width: `${shelf.width}px`,
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
        {collectedPointsAttr ? (
          <polyline
            points={collectedPointsAttr}
            fill="none"
            stroke={theme.collectedLineStroke}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {upcomingPointsAttr ? (
          <polyline
            points={upcomingPointsAttr}
            fill="none"
            stroke={theme.upcomingLineStroke}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

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

      {/* Pins numerados das paradas nos corredores */}
      {stops.map((stop, idx) => {
        const isCollected = collectedIds.has(stop.productId);
        const isNotFound = notFoundIds.has(stop.productId);
        const isCurrent = idx === activeIndex && !isCollected && !isNotFound;
        const pinLeft = stop.centerX - 12;
        const pinTop = stop.centerY - 12;

        return (
          <button
            key={`${stop.productId || idx}-${idx + 1}`}
            type="button"
            className={`wa-map-stop ${isCurrent ? "wa-map-stop--active" : ""} ${
              isCollected ? "wa-map-stop--collected" : ""
            } ${isNotFound ? "wa-map-stop--not-found" : ""}`}
            style={{
              left: `${pinLeft}px`,
              top: `${pinTop}px`,
              width: "24px",
              height: "24px",
              borderRadius: "999px",
              backgroundColor: isCollected
                ? theme.pinCollectedBg
                : isCurrent
                  ? theme.pinCurrentBg
                  : theme.pinPendingBg,
              border: `1.5px solid ${
                isCollected ? theme.pinCollectedBorder : theme.pinPendingBorder
              }`,
              color: isCollected
                ? theme.pinCollectedText
                : isCurrent
                  ? theme.pinCurrentText
                  : theme.pinPendingText,
              fontSize: "11px",
              fontWeight: 700,
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (onSelectStopIndex) {
                onSelectStopIndex(idx);
              }
            }}
            aria-label={`Parada ${idx + 1}: ${stop.name || ""}`}
          >
            <span>
              {isNotFound && !isCurrent
                ? "X"
                : isCollected && !isCurrent
                  ? "✓"
                  : idx + 1}
            </span>
          </button>
        );
      })}

      {/* Indicador da posição do usuário */}
      <div
        className="wa-user-position-badge"
        style={{
          left: `${Math.min(285, Math.max(8, badgeX - 22))}px`,
          top: `${Math.min(208, Math.max(8, badgeY + (userAnchor ? 8 : 0)))}px`,
        }}
        aria-hidden="true"
      >
        <span className="wa-user-position-dot" />
        <span>VOCÊ</span>
      </div>
    </div>
  );
}
