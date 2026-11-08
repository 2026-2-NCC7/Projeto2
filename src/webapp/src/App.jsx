import { useEffect, useState } from "react";
import { QrEntryScreen } from "./screens/QrEntryScreen";
import { ProductSearchScreen } from "./screens/ProductSearchScreen";
import { ShoppingListScreen } from "./screens/ShoppingListScreen";
import { OptimizedRouteScreen } from "./screens/OptimizedRouteScreen";
import { PurchaseCompletedScreen } from "./screens/PurchaseCompletedScreen";
import { StoreBuildingIcon } from "./components/StoreHeader";
import {
  DEFAULT_STORE_ID,
  FALLBACK_PRODUCTS,
  FALLBACK_STORE,
  FALLBACK_STORES,
  fetchAvailableStores,
  fetchStoreDetails,
  fetchStoreProducts,
  generateOptimizedRoute,
  trackAnalyticsEvent,
} from "./services/webapp-api";

const SESSION_STORAGE_KEY = "achai_webapp_session_v2";
const SESSION_STORE_KEY = "achai_webapp_store_id_v1";

function getInitialStoreId() {
  const params = new URLSearchParams(window.location.search);
  const urlStoreId = params.get("storeId") || params.get("filialId");
  if (urlStoreId) return urlStoreId;
  try {
    const savedStoreId = window.sessionStorage.getItem(SESSION_STORE_KEY);
    if (savedStoreId) return savedStoreId;
  } catch {
    // Ignore storage errors
  }
  return DEFAULT_STORE_ID;
}

function getInitialScreen() {
  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get("screen");
  if (["entry", "search", "list", "route", "completed"].includes(screenParam)) {
    return screenParam;
  }
  return "entry";
}

function getDefaultSessionItems() {
  return [];
}

function loadSessionList() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return getDefaultSessionItems();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getDefaultSessionItems();
  } catch {
    return getDefaultSessionItems();
  }
}

export function App() {
  const [storeId, setStoreId] = useState(getInitialStoreId);
  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);
  const [store, setStore] = useState(
    () => FALLBACK_STORES.find((s) => s.id === getInitialStoreId()) || FALLBACK_STORE,
  );
  const [availableStores, setAvailableStores] = useState(FALLBACK_STORES);
  const [storePickerOpen, setStorePickerOpen] = useState(false);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [listItems, setListItems] = useState(loadSessionList);
  const [routeData, setRouteData] = useState(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const [completedCount, setCompletedCount] = useState(null);

  useEffect(() => {
    const key = `achai_analytics_started_${storeId}`;
    try {
      if (!window.sessionStorage.getItem(key)) {
        trackAnalyticsEvent("session_started", storeId);
        window.sessionStorage.setItem(key, "1");
      }
    } catch { trackAnalyticsEvent("session_started", storeId); }
  }, [storeId]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(listItems));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }, [listItems]);

  useEffect(() => {
    let active = true;
    fetchAvailableStores().then((stores) => {
      if (!active || !Array.isArray(stores) || stores.length === 0) return;
      setAvailableStores(stores);
      const match = stores.find((s) => String(s.id) === String(storeId));
      if (match) {
        setStore(match);
      }
    });
    return () => {
      active = false;
    };
  }, [storeId]);

  useEffect(() => {
    let active = true;
    fetchStoreDetails(storeId).then((loadedStore) => {
      if (active && loadedStore) {
        setStore(loadedStore);
      }
    });
    return () => {
      active = false;
    };
  }, [storeId]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      fetchStoreProducts(storeId, searchQuery).then((loadedProducts) => {
        if (!active) return;
        if (searchQuery.trim().length >= 2) trackAnalyticsEvent("product_search", storeId, { query: searchQuery.trim(), productName: loadedProducts[0]?.name, resultCount: loadedProducts.length });
        setProducts(loadedProducts);
        // Sync real backend IDs and locations for the selected store into session list items
        setListItems((prevItems) =>
          prevItems.map((item) => {
            const matched = loadedProducts.find(
              (p) => (p.name || "").toLowerCase() === (item.name || "").toLowerCase(),
            );
            return matched
              ? { ...item, id: matched.id, price: matched.price, location: matched.location }
              : item;
          }),
        );
      });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [storeId, searchQuery]);

  const handleSelectStore = async (nextStore) => {
    setStore(nextStore);
    setStoreId(nextStore.id);
    setStorePickerOpen(false);
    try {
      window.sessionStorage.setItem(SESSION_STORE_KEY, nextStore.id);
      const url = new URL(window.location.href);
      url.searchParams.set("storeId", nextStore.id);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // Ignore history/storage errors
    }

    if (currentScreen === "route" && listItems.length > 0) {
      const updatedRoute = await generateOptimizedRoute(nextStore.id, nextStore, listItems);
      setRouteData(updatedRoute);
    }
  };

  const handleAddProduct = (product) => {
    setListItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          Number(item.id) === Number(product.id) ||
          (item.name || "").toLowerCase() === (product.name || "").toLowerCase(),
      );
      // No MVP, cada produto adicionado entra apenas uma vez na lista (1 parada na rota)
      if (existingIndex >= 0) {
        return prev;
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          checked: true,
        },
      ];
    });
  };

  const handleRemoveProduct = (product) => {
    setListItems((prev) =>
      prev.filter(
        (item) =>
          String(item.id) !== String(product.id) &&
          (item.name || "").toLowerCase() !== (product.name || "").toLowerCase(),
      ),
    );
  };

  const handleToggleChecked = (productId) => {
    setListItems((prev) => {
      const target = prev.find((item) => Number(item.id) === Number(productId));
      if (!target) return prev;
      if (target.checked !== false) {
        return prev.filter((item) => Number(item.id) !== Number(productId));
      }
      return prev.map((item) =>
        Number(item.id) === Number(productId)
          ? { ...item, checked: item.checked === false }
          : item,
      );
    });
  };

  const handleIncrementQuantity = (productId) => {
    setListItems((prev) =>
      prev.map((item) => {
        if (Number(item.id) !== Number(productId)) return item;
        const nextQty = ((item.quantity || 1) % 5) + 1;
        return { ...item, quantity: nextQty };
      }),
    );
  };

  const handleGenerateRoute = async (options = {}) => {
    setIsGeneratingRoute(true);
    try {
      const generated = await generateOptimizedRoute(storeId, store, listItems, options);
      setRouteData(generated);
      trackAnalyticsEvent("route_calculated", storeId, { itemCount: listItems.length, aisles: (generated?.stops || []).map((stop) => stop.aisle).filter(Boolean) });
      setCurrentScreen("route");
    } finally {
      setIsGeneratingRoute(false);
    }
  };

  return (
    <div className="wa-viewport-shell">
      <main className="wa-phone-frame">
        {currentScreen === "entry" && (
          <QrEntryScreen
            storeName={store.name}
            onStartShopping={() => setCurrentScreen("search")}
            onOpenStorePicker={() => setStorePickerOpen(true)}
          />
        )}

        {currentScreen === "search" && (
          <ProductSearchScreen
            storeName={store.name}
            products={products}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            listItems={listItems}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onNavigate={setCurrentScreen}
            onOpenStorePicker={() => setStorePickerOpen(true)}
          />
        )}

        {currentScreen === "list" && (
          <ShoppingListScreen
            storeName={store.name}
            listItems={listItems}
            onToggleChecked={handleToggleChecked}
            onIncrementQuantity={handleIncrementQuantity}
            onAddMoreProducts={() => setCurrentScreen("search")}
            onGenerateRoute={() => handleGenerateRoute()}
            onNavigate={setCurrentScreen}
            onOpenStorePicker={() => setStorePickerOpen(true)}
            isGeneratingRoute={isGeneratingRoute}
          />
        )}

        {currentScreen === "route" && (
          <OptimizedRouteScreen
            storeName={store.name}
            routeData={routeData}
            listItems={listItems}
            onProductNotFound={(stop) => trackAnalyticsEvent("product_not_found", storeId, { productName: stop?.name, aisle: stop?.aisle })}
            onNavigate={setCurrentScreen}
            onOpenStorePicker={() => setStorePickerOpen(true)}
            onRecalculateFromAisle={(aisleName, excludedProductIds) =>
              handleGenerateRoute({
                startAisle: aisleName,
                excludedProductIds,
              })
            }
            onCompleteShopping={(count) => {
              trackAnalyticsEvent("route_completed", storeId, { itemCount: count });
              setCompletedCount(count);
              setCurrentScreen("completed");
            }}
          />
        )}

        {currentScreen === "completed" && (
          <PurchaseCompletedScreen
            storeId={storeId}
            storeName={store.name}
            listItems={listItems}
            collectedCount={completedCount || listItems.length}
            onStartNewShopping={() => {
              setListItems([]);
              setRouteData(null);
              setCompletedCount(null);
              setCurrentScreen("search");
            }}
            onBackToRoute={() => setCurrentScreen("route")}
          />
        )}

        {storePickerOpen ? (
          <div
            className="wa-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Selecionar supermercado da lista"
            onClick={() => setStorePickerOpen(false)}
          >
            <div
              className="wa-modal-sheet"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="wa-modal-handle" />
              <div className="wa-modal-header">
                <h3 className="wa-modal-title">Supermercado da lista</h3>
                <button
                  type="button"
                  className="wa-modal-close"
                  onClick={() => setStorePickerOpen(false)}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              <p className="wa-modal-subtitle">
                Escolha o supermercado para atualizar os produtos, corredores e rota:
              </p>

              <div className="wa-store-picker-list" role="radiogroup">
                {availableStores.map((item) => {
                  const isSelected = String(item.id) === String(storeId);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`wa-store-picker-option ${
                        isSelected ? "wa-store-picker-option--active" : ""
                      }`}
                      onClick={() => handleSelectStore(item)}
                    >
                      <div className="wa-list-store-banner__icon">
                        <StoreBuildingIcon />
                      </div>
                      <div className="wa-store-picker-option__info">
                        <div className="wa-store-picker-option__name">{item.name}</div>
                        {item.address ? (
                          <div className="wa-store-picker-option__address">{item.address}</div>
                        ) : null}
                      </div>
                      <span
                        className={`wa-store-picker-option__radio ${
                          isSelected ? "wa-store-picker-option__radio--checked" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
