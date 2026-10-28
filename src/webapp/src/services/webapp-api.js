export const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const FALLBACK_STORE = {
  id: DEFAULT_STORE_ID,
  name: "Mercado Aurora",
};

export const FALLBACK_PRODUCTS = [
  {
    id: 2,
    name: "Leite integral 1 L",
    brand: "Aurora",
    category: "Laticínios",
    price: 5.49,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 3",
      shelf: "Prateleira central",
      nodeId: 3,
    },
  },
  {
    id: 1,
    name: "Banana prata",
    brand: null,
    category: "Hortifruti",
    price: 6.99,
    size: "1 kg",
    unitSuffix: "/kg",
    inStock: true,
    location: {
      aisle: "Setor A",
      shelf: "Banca central",
      nodeId: 4,
    },
  },
  {
    id: 9,
    name: "Pão de forma",
    brand: "Seven Boys",
    category: "Padaria",
    price: 8.9,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 1",
      shelf: "Prateleira central",
      nodeId: 1,
    },
  },
  {
    id: 6,
    name: "Detergente neutro 500 ml",
    brand: "Ypê",
    category: "Limpeza",
    price: 2.49,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 2",
      shelf: "Prateleira central",
      nodeId: 2,
    },
  },
  {
    id: 11,
    name: "Sabão em pó 1 kg",
    brand: "Omo",
    category: "Limpeza",
    price: 14.9,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 2",
      shelf: "Prateleira inferior",
      nodeId: 2,
    },
  },
  {
    id: 12,
    name: "Tomate 1 kg",
    brand: null,
    category: "Hortifruti",
    price: 7.49,
    size: "1 kg",
    unitSuffix: "/kg",
    inStock: true,
    location: {
      aisle: "Setor A",
      shelf: "Banca lateral",
      nodeId: 4,
    },
  },
  {
    id: 13,
    name: "Queijo muçarela 200 g",
    brand: "Aurora",
    category: "Laticínios",
    price: 11.9,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 3",
      shelf: "Balcão refrigerado",
      nodeId: 3,
    },
  },
  {
    id: 8,
    name: "Ovos brancos 12 unidades",
    brand: "Aurora",
    category: "Laticínios",
    price: 12.99,
    size: "1 dz.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 3",
      shelf: "Prateleira inferior",
      nodeId: 3,
    },
  },
  {
    id: 7,
    name: "Café torrado e moído 500 g",
    brand: "Pilão",
    category: "Mercearia",
    price: 18.9,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 1",
      shelf: "Prateleira superior",
      nodeId: 1,
    },
  },
  {
    id: 3,
    name: "Arroz Tio João 5 kg",
    brand: "Tio João",
    category: "Mercearia",
    price: 24.9,
    size: "1 un.",
    unitSuffix: "",
    inStock: true,
    location: {
      aisle: "Corredor 2",
      shelf: "Prateleira inferior",
      nodeId: 2,
    },
  },
];

export function getProductEmoji(product) {
  const name = (product?.name || "").toLowerCase();
  const category = (product?.category || "").toLowerCase();

  if (name.includes("leite")) return "🥛";
  if (name.includes("banana")) return "🍌";
  if (name.includes("pão") || name.includes("pao")) return "🍞";
  if (name.includes("tomate")) return "🍅";
  if (name.includes("queijo")) return "🧀";
  if (name.includes("ovo")) return "🥚";
  if (name.includes("café") || name.includes("cafe")) return "☕";
  if (name.includes("arroz")) return "🍚";
  if (name.includes("feijão") || name.includes("feijao")) return "🫘";
  if (name.includes("macarrão") || name.includes("macarrao")) return "🍝";
  if (name.includes("água") || name.includes("agua")) return "💧";
  if (name.includes("suco")) return "🧃";
  if (name.includes("papel")) return "🧻";
  if (name.includes("detergente") || name.includes("sabão") || name.includes("sabao")) return "🧼";

  if (category.includes("horti")) return "🥬";
  if (category.includes("latic")) return "🥛";
  if (category.includes("padaria")) return "🍞";
  if (category.includes("limpeza")) return "🧼";
  if (category.includes("bebida")) return "🧃";
  return "🛒";
}

export function inferProductLocation(product) {
  const existingAisle = product?.location?.aisle || product?.aisle;
  const existingShelf = product?.location?.shelf || product?.shelf;
  const name = (product?.name || "").toLowerCase();
  const category = (product?.category || "").toLowerCase();

  if (existingAisle) {
    return {
      aisle: existingAisle,
      shelf: existingShelf || "Prateleira central",
    };
  }

  if (name.includes("leite") || category.includes("latic")) {
    return { aisle: "Corredor 3", shelf: "Prateleira central" };
  }
  if (name.includes("banana") || name.includes("tomate") || category.includes("horti")) {
    return { aisle: "Setor A", shelf: "Banca central" };
  }
  if (name.includes("pão") || name.includes("pao") || category.includes("padaria")) {
    return { aisle: "Corredor 1", shelf: "Prateleira central" };
  }
  if (category.includes("limpeza")) {
    return { aisle: "Corredor 2", shelf: "Prateleira central" };
  }
  return { aisle: "Corredor 2", shelf: "Prateleira central" };
}

export function formatProductPrice(product) {
  const num = Number(product?.price ?? 0);
  const formatted = num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const isKg =
    product?.unitSuffix === "/kg" ||
    (product?.name || "").toLowerCase().includes("banana") ||
    ((product?.category || "").toLowerCase().includes("horti") && !(product?.name || "").match(/\d+\s*kg/i));
  return `R$ ${formatted}${isKg ? "/kg" : ""}`;
}

export function formatSearchSubtitle(product) {
  const { aisle } = inferProductLocation(product);
  const category = product?.category || "Mercado";
  return `${category} · ${aisle}`;
}

export function formatListLocation(product) {
  const name = (product?.name || "").toLowerCase();
  const category = (product?.category || "").toLowerCase();
  if (name.includes("banana") || category.includes("horti")) {
    return "Hortifruti";
  }
  const { aisle } = inferProductLocation(product);
  return aisle;
}

export function formatQuantityLabel(item) {
  const qty = Number(item?.quantity || 1);
  const name = (item?.name || "").toLowerCase();
  const size = (item?.size || "").toLowerCase();
  if (name.includes("banana") || size.includes("kg")) {
    return `${qty} kg`;
  }
  return `${qty} un.`;
}

function normalizeProduct(raw) {
  const loc = inferProductLocation(raw);
  const name = raw?.name || "";
  const isPopularMilk = name.toLowerCase().includes("leite integral");
  const isPopularBread = name.toLowerCase().includes("pão de forma") || name.toLowerCase().includes("pao de forma");
  return {
    ...raw,
    id: Number(raw.id),
    name: isPopularBread ? "Pão de forma" : name,
    price: isPopularMilk && Number(raw.price) === 4.79
      ? 5.49
      : isPopularBread && Number(raw.price) === 8.49
        ? 8.9
        : Number(raw.price ?? 0),
    inStock: raw.inStock !== false,
    location: {
      aisle: loc.aisle,
      shelf: loc.shelf,
      nodeId: raw?.location?.nodeId ?? null,
    },
  };
}

export function sortCatalogForWebApp(products) {
  const priorityOrder = ["leite integral", "banana prata", "pão de forma"];
  return [...products].sort((a, b) => {
    const aName = (a.name || "").toLowerCase();
    const bName = (b.name || "").toLowerCase();
    const aIdx = priorityOrder.findIndex((p) => aName.includes(p));
    const bIdx = priorityOrder.findIndex((p) => bName.includes(p));
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return aName.localeCompare(bName, "pt-BR");
  });
}

export async function fetchStoreDetails(storeId = DEFAULT_STORE_ID) {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}`);
    if (!response.ok) throw new Error("Store fetch failed");
    const data = await response.json();
    return data.store || FALLBACK_STORE;
  } catch {
    return {
      id: storeId || DEFAULT_STORE_ID,
      name: FALLBACK_STORE.name,
    };
  }
}

export async function fetchStoreProducts(storeId = DEFAULT_STORE_ID, query = "") {
  const trimmed = query.trim();
  try {
    const params = new URLSearchParams({ limit: "30" });
    if (trimmed.length >= 2) {
      params.set("q", trimmed);
    }
    const response = await fetch(
      `${API_BASE_URL}/stores/${encodeURIComponent(storeId)}/products?${params.toString()}`,
    );
    if (!response.ok) throw new Error("Products fetch failed");
    const data = await response.json();
    const normalized = (data.products || []).map(normalizeProduct);
    return sortCatalogForWebApp(normalized);
  } catch {
    const normalized = FALLBACK_PRODUCTS.map(normalizeProduct);
    if (!trimmed) return sortCatalogForWebApp(normalized);
    const q = trimmed.toLowerCase();
    return sortCatalogForWebApp(
      normalized.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      ),
    );
  }
}

export function buildLocalFallbackRoute(store, listItems) {
  const stops = listItems.map((item) => {
    const loc = inferProductLocation(item);
    return {
      productId: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity || 1,
      aisle: loc.aisle === "Setor A" ? "Hortifruti" : loc.aisle,
      shelf: loc.shelf || "Prateleira central",
    };
  });

  return {
    store: store || FALLBACK_STORE,
    stops,
    unlocatedItems: [],
    totalDistance: stops.length * 8.5,
    hasLocationWarning: false,
    locationWarning: null,
  };
}

export async function generateOptimizedRoute(storeId, store, listItems) {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: listItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      }),
    });
    if (!response.ok) throw new Error("Route request failed");
    const data = await response.json();
    if (data?.route?.stops?.length) {
      return data.route;
    }
    return buildLocalFallbackRoute(store, listItems);
  } catch {
    return buildLocalFallbackRoute(store, listItems);
  }
}
