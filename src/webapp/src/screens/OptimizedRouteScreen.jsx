import { useEffect, useMemo, useRef, useState } from "react";
import { IndoorStoreMap } from "../components/IndoorStoreMap";
import { StoreHeader } from "../components/StoreHeader";
import { DEMO_PROMOTIONS, formatProductPrice, getNearbyDemoRecommendations } from "../services/webapp-api";
import {
  computeIndoorRoutePolylines,
  mapStopsToIndoorGraphStops,
  orderStopsWithDijkstra,
} from "../shared/indoor-map-engine";

const PROMOTION_MILESTONES = new Set([2, 6, 10, 14]);

function formatStopLocation(stop) {
  if (!stop) return "Corredor 3 · Prateleira P3";
  const aisle = stop.aisle || "Corredor 1";
  const shelf = stop.shelf || "Prateleira central";
  return `${aisle} · ${shelf}`;
}
export function OptimizedRouteScreen({
  storeName,
  routeData,
  listItems,
  onNavigate,
  products = [],
  onAddRecommendation,
  onCompleteShopping,
  onProductNotFound,
  onTrackEngagement,
}) {
  const [collectedIds, setCollectedIds] = useState(() => new Set());
  const [notFoundIds, setNotFoundIds] = useState(() => new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnchor, setUserAnchor] = useState(null);
  const [customOrderedStops, setCustomOrderedStops] = useState(null);
  const [addedRecommendationName, setAddedRecommendationName] = useState("");
  const [recommendationLimits, setRecommendationLimits] = useState({});
  const [activePromotion, setActivePromotion] = useState(null);
  const handledPromotionMilestones = useRef(new Set());
  const trackedRecommendationImpressions = useRef(new Set());
  const trackedPromotionImpressions = useRef(new Set());
  const initialListItems = useRef(listItems);

  const recommendationQuotaForStop = () => {
    const chance = Math.random();
    if (chance < 0.1) return 0;
    if (chance < 0.45) return 1;
    if (chance < 0.8) return 2;
    return 3;
  };

  const baseStops = useMemo(() => {
    const routeStops = Array.isArray(routeData?.stops) ? routeData.stops : [];
    const routeProductIds = new Set(routeStops.map((stop) => String(stop.productId ?? stop.id)));
    const missingListStops = initialListItems.current
      .filter((item) => !routeProductIds.has(String(item.id ?? item.productId)))
      .map((item) => ({
            productId: item.id,
            name: item.name,
            category: item.category,
            aisle: item.location?.aisle || "Corredor 3",
            shelf: item.location?.shelf || "Prateleira central",
            nodeId: item.location?.nodeId ?? null,
            quantity: item.quantity || 1,
          }));
    const rawStops = [...routeStops, ...missingListStops];
    const mapped = mapStopsToIndoorGraphStops(rawStops);
    return orderStopsWithDijkstra(mapped, "entrance", null);
  }, [routeData]);

  useEffect(() => {
    setCustomOrderedStops(null);
    setUserAnchor(null);
    setCurrentIndex(0);
    setRecommendationLimits({});
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
  const currentCorridor = activeStop?.corridorIndex ?? activeStop?.colIndex ?? 0;
  const activeStopKey = `${activeIndex}:${activeStop?.productId ?? "next"}`;
  const recommendationLimit = recommendationLimits[activeStopKey];
  const recommendationAllowance = Math.max(0, (recommendationLimit?.limit || 0) - (recommendationLimit?.added || 0));
  const nearbySuggestions = getNearbyDemoRecommendations(currentCorridor, listItems, products, recommendationAllowance, stops);

  useEffect(() => {
    setRecommendationLimits((previous) => {
      if (previous[activeStopKey]) return previous;
      return { ...previous, [activeStopKey]: { limit: recommendationQuotaForStop(), added: 0 } };
    });
  }, [activeStopKey]);

  useEffect(() => {
    const suggestion = nearbySuggestions[0];
    if (!suggestion) return;
    const key = `${activeStopKey}:${currentCorridor}:${suggestion.id}`;
    if (trackedRecommendationImpressions.current.has(key)) return;
    trackedRecommendationImpressions.current.add(key);
    onTrackEngagement?.("recommendation_impression", {
      productId: suggestion.id, productName: suggestion.name, aisle: `Corredor ${currentCorridor + 1}`, source: "nearby_recommendation",
    });
  }, [activeStopKey, currentCorridor, nearbySuggestions, onTrackEngagement]);

  useEffect(() => {
    if (!PROMOTION_MILESTONES.has(collectedIds.size) || activePromotion) return;
    if (handledPromotionMilestones.current.has(collectedIds.size)) return;
    const planned = [...listItems, ...stops];
    const eligible = DEMO_PROMOTIONS.filter((offer) => !planned.some((item) =>
      item.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase() ===
        offer.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase(),
    ));
    if (eligible.length === 0) return;
    handledPromotionMilestones.current.add(collectedIds.size);
    const offer = eligible[(collectedIds.size / 2 - 1) % eligible.length];
    setActivePromotion(offer);
  }, [collectedIds, activePromotion, listItems, stops]);

  useEffect(() => {
    if (!activePromotion) return;
    if (trackedPromotionImpressions.current.has(activePromotion.promoId)) return;
    trackedPromotionImpressions.current.add(activePromotion.promoId);
    onTrackEngagement?.("promotion_impression", {
      productId: activePromotion.id, productName: activePromotion.name, aisle: activePromotion.location?.aisle,
      promoId: activePromotion.promoId, offer: activePromotion.offer, source: "store_promotion_demo",
    });
  }, [activePromotion, onTrackEngagement]);

  const { upcomingPointsAttr } = useMemo(
    () => computeIndoorRoutePolylines(stops, collectedIds, notFoundIds, userAnchor),
    [stops, collectedIds, notFoundIds, userAnchor],
  );

  const collectStop = (stop, advanceCurrentStop) => {
    if (stop?.productId === undefined) return;
    const nextCollected = new Set(collectedIds);
    nextCollected.add(stop.productId);
    setCollectedIds(nextCollected);
    if (advanceCurrentStop) setAddedRecommendationName("");
    if (!advanceCurrentStop) return;
    setUserAnchor(null);
    const nextIndex = stops.findIndex((item, index) => index > activeIndex && !nextCollected.has(item.productId) && !notFoundIds.has(item.productId));
    if (nextIndex >= 0) setCurrentIndex(nextIndex);
    else if (onCompleteShopping) onCompleteShopping(Math.min(listItems.length, nextCollected.size));
    else onNavigate("completed");
  };

  const handleMarkCollected = () => collectStop(activeStop, true);

  const handleAddRecommendation = (product) => {
    if (!product) return;
    const alreadyAdded = recommendationLimits[activeStopKey]?.added || 0;
    if (alreadyAdded >= (recommendationLimits[activeStopKey]?.limit || 0)) return;
    setRecommendationLimits((previous) => ({
      ...previous,
      [activeStopKey]: { ...previous[activeStopKey], added: alreadyAdded + 1 },
    }));
    onAddRecommendation?.(product);
    onTrackEngagement?.("recommendation_added", {
      productId: product.id, productName: product.name, aisle: product.location?.aisle, source: "nearby_recommendation",
    });

    handleAddRouteStop(product);

    setAddedRecommendationName(product.name);
  };

  const handleAddPromotion = () => {
    if (!activePromotion) return;
    onAddRecommendation?.(activePromotion);
    onTrackEngagement?.("promotion_added", {
      productId: activePromotion.id, productName: activePromotion.name, aisle: activePromotion.location?.aisle,
      promoId: activePromotion.promoId, offer: activePromotion.offer, source: "store_promotion_demo",
    });
    const promotedProduct = { ...activePromotion, price: activePromotion.regularPrice };
    handleAddRouteStop(promotedProduct);
    setActivePromotion(null);
  };

  const handleAddRouteStop = (product) => {
    const alreadyOnRoute = stops.some((stop) => stop.name?.toLowerCase() === product.name?.toLowerCase());
    if (alreadyOnRoute) return;
    const addedStop = mapStopsToIndoorGraphStops([{
      ...product, productId: product.id, aisle: product.location?.aisle, shelf: product.location?.shelf,
    }])[0];
    // Preserve a rota calculada e acrescente os itens novos depois das paradas originais.
    const activeCorridor = stops[activeIndex]?.corridorIndex ?? 0;
    if (addedStop.corridorIndex < activeCorridor) return;
    let insertAt = activeIndex + 1;
    while (insertAt < stops.length && stops[insertAt].corridorIndex <= addedStop.corridorIndex) insertAt += 1;
    setCustomOrderedStops([...stops.slice(0, insertAt), addedStop, ...stops.slice(insertAt)]);
  };

  const dismissPromotion = () => {
    if (activePromotion) onTrackEngagement?.("promotion_dismissed", {
      productId: activePromotion.id, productName: activePromotion.name, aisle: activePromotion.location?.aisle,
      promoId: activePromotion.promoId, offer: activePromotion.offer, source: "store_promotion_demo",
    });
    setActivePromotion(null);
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

    const nextIndex = stops.findIndex((item, index) => index > activeIndex && !collectedIds.has(item.productId) && !notFoundIds.has(item.productId));
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    } else if (onCompleteShopping) {
      onCompleteShopping(displayedCollectedCount);
    } else {
      onNavigate("completed");
    }
  };

  const handleSelectUserAnchor = (anchor) => {
    setUserAnchor(anchor);
  };

  const progressRatio = Math.min(1, Math.max(0, displayedCollectedCount / totalCount));

  return (
    <div className="wa-screen wa-screen--route">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="route"
          onBrandClick={() => onNavigate("entry")}
          onStoreClick={undefined}
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
          upcomingPointsAttr={upcomingPointsAttr}
          onSelectUserAnchor={handleSelectUserAnchor}
        />

        <section className="wa-current-stop-card" aria-live="polite">
          <div className="wa-current-stop-card__eyebrow">
            PRÓXIMA PARADA · {activeIndex + 1} DE {totalCount}
          </div>
          <h2 className="wa-current-stop-card__name">{activeStop.name}</h2>
          <p className="wa-current-stop-card__location">
            {formatStopLocation(activeStop)}
          </p>
          {nearbySuggestions.length > 0 && (
            <section className="wa-nearby-suggestions" aria-label="Sugestão da gôndola próxima">
              <div className="wa-nearby-suggestions__heading">
                <span aria-hidden="true">✦</span>
                <div><b>Tem a ver com sua compra</b><small>Sugestão {(recommendationLimit?.added || 0) + 1} de {recommendationLimit?.limit} · {nearbySuggestions[0].location?.shelf || "gôndola próxima"}</small></div>
              </div>
              <button type="button" className="wa-recommendation" onClick={() => handleAddRecommendation(nearbySuggestions[0])}>
                <span className="wa-recommendation__top"><span>POR PERTO · CORREDOR {currentCorridor + 1}</span><span>DEMO</span></span>
                <span className="wa-recommendation__name">{nearbySuggestions[0].name}</span>
                <span className="wa-recommendation__meta">{nearbySuggestions[0].brand || nearbySuggestions[0].category} · {formatProductPrice(nearbySuggestions[0])} ilustrativo</span>
                <span className="wa-recommendation__cta">＋ Toque para adicionar à lista</span>
              </button>
            </section>
          )}
          {addedRecommendationName && <p className="wa-recommendation__feedback" role="status">✓ {addedRecommendationName} entrou na lista e na rota. A parada atual continua {activeStop.name}.</p>}

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
      {activePromotion && (
        <div className="wa-promo-backdrop" role="presentation">
          <section className="wa-promo-card" role="dialog" aria-modal="true" aria-labelledby="wa-promo-title">
            <div className="wa-promo-card__eyebrow">⚡ OFERTA DA LOJA · DEMONSTRAÇÃO</div>
            <h2 id="wa-promo-title">Uma oferta perto de você</h2>
            <p className="wa-promo-card__offer">{activePromotion.offer}</p>
            <strong className="wa-promo-card__product">{activePromotion.name}</strong>
            <p className="wa-promo-card__price"><s>{formatProductPrice({ ...activePromotion, price: activePromotion.regularPrice })}</s> <b>{formatProductPrice(activePromotion)}</b></p>
            <small>Preço ilustrativo para demonstração. {activePromotion.location?.aisle}</small>
            <button type="button" className="wa-promo-card__add" onClick={handleAddPromotion}>Adicionar oferta à lista</button>
            <button type="button" className="wa-promo-card__dismiss" onClick={dismissPromotion}>Agora não</button>
          </section>
        </div>
      )}
    </div>
  );
}
