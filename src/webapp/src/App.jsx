import { useEffect, useState } from "react";
import { QrEntryScreen } from "./screens/QrEntryScreen";
import { ProductSearchScreen } from "./screens/ProductSearchScreen";
import { ShoppingListScreen } from "./screens/ShoppingListScreen";
import { OptimizedRouteScreen } from "./screens/OptimizedRouteScreen";
import {
  DEFAULT_STORE_ID,
  FALLBACK_PRODUCTS,
  FALLBACK_STORE,
  fetchStoreDetails,
  fetchStoreProducts,
  generateOptimizedRoute,
} from "./services/webapp-api";

const SESSION_STORAGE_KEY = "achai_webapp_session_v1";

function getInitialStoreId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("storeId") || params.get("filialId") || DEFAULT_STORE_ID;
}

function getInitialScreen() {
  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get("screen");
  if (["entry", "search", "list", "route"].includes(screenParam)) {
    return screenParam;
  }
  return "entry";
}

function getDefaultSessionItems() {
  return FALLBACK_PRODUCTS.slice(0, 3).map((product) => ({
    ...product,
    quantity: 1,
    checked: true,
  }));
}

function loadSessionList() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return getDefaultSessionItems();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return getDefaultSessionItems();
  } catch {
    return getDefaultSessionItems();
  }
}

export function App() {
  const [storeId] = useState(getInitialStoreId);
  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);
  const [store, setStore] = useState(FALLBACK_STORE);
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [listItems, setListItems] = useState(loadSessionList);
  const [routeData, setRouteData] = useState(null);
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(listItems));
    } catch {
      // Ignore storage quota errors in private mode
    }
  }, [listItems]);

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
        setProducts(loadedProducts);
        // Sync real backend IDs into default session items if names match
        setListItems((prevItems) =>
          prevItems.map((item) => {
            const matched = loadedProducts.find(
              (p) => (p.name || "").toLowerCase() === (item.name || "").toLowerCase(),
            );
            return matched ? { ...item, id: matched.id, location: matched.location } : item;
          }),
        );
      });
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [storeId, searchQuery]);

  const handleAddProduct = (product) => {
    setListItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          Number(item.id) === Number(product.id) ||
          (item.name || "").toLowerCase() === (product.name || "").toLowerCase(),
      );
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: (next[existingIndex].quantity || 1) + 1,
          checked: true,
        };
        return next;
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

  const handleToggleChecked = (productId) => {
    setListItems((prev) => {
      const target = prev.find((item) => Number(item.id) === Number(productId));
      if (!target) return prev;
      if (prev.length > 1 && target.checked !== false) {
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

  const handleGenerateRoute = async () => {
    setIsGeneratingRoute(true);
    try {
      const generated = await generateOptimizedRoute(storeId, store, listItems);
      setRouteData(generated);
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
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === "list" && (
          <ShoppingListScreen
            storeName={store.name}
            listItems={listItems}
            onToggleChecked={handleToggleChecked}
            onIncrementQuantity={handleIncrementQuantity}
            onAddMoreProducts={() => setCurrentScreen("search")}
            onGenerateRoute={handleGenerateRoute}
            onNavigate={setCurrentScreen}
            isGeneratingRoute={isGeneratingRoute}
          />
        )}

        {currentScreen === "route" && (
          <OptimizedRouteScreen
            storeName={store.name}
            routeData={routeData}
            listItems={listItems}
            onNavigate={setCurrentScreen}
          />
        )}
      </main>
    </div>
  );
}
