export const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "" : "https://achai-api-production.up.railway.app")).replace(/\/$/, "");
const ANALYTICS_SESSION_KEY = "achai_analytics_session_v1";

function getAnalyticsSessionId() {
  try {
    let id = window.sessionStorage.getItem(ANALYTICS_SESSION_KEY);
    if (!id) {
      id = window.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => { const random = Math.random() * 16 | 0; return (char === "x" ? random : (random & 3 | 8)).toString(16); });
      window.sessionStorage.setItem(ANALYTICS_SESSION_KEY, id);
    }
    return id;
  } catch { return null; }
}

export function trackAnalyticsEvent(type, storeId, payload = {}) {
  const sessionId = getAnalyticsSessionId();
  if (!sessionId) return;
  fetch(`${API_BASE_URL}/analytics/events`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, storeId, type, payload }), keepalive: true,
  }).catch(() => {});
}

export const FALLBACK_STORE = {
  id: DEFAULT_STORE_ID,
  name: "Mercado Liberdade",
  address: "Av. da Liberdade, 680 · Liberdade · São Paulo, SP",
};

export const FALLBACK_STORES = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Mercado Liberdade",
    address: "Av. da Liberdade, 680 · Liberdade · São Paulo, SP",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Supermercado Sakura",
    address: "Rua São Joaquim, 120 · Liberdade · São Paulo, SP",
  },
];

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
      aisle: "Corredor 4",
      shelf: "Gôndola P4 · Refrigerados",
      nodeId: 4,
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
      shelf: "Gôndola P1 · Café e padaria",
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
      aisle: "Corredor 3",
      shelf: "Gôndola P3 · Limpeza",
      nodeId: 3,
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
      aisle: "Corredor 3",
      shelf: "Gôndola P3 · Limpeza",
      nodeId: 3,
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
      aisle: "Corredor 4",
      shelf: "Gôndola P4 · Refrigerados",
      nodeId: 4,
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
      aisle: "Corredor 4",
      shelf: "Gôndola P4 · Refrigerados",
      nodeId: 4,
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
      shelf: "Gôndola P1 · Café e padaria",
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
      shelf: "Gôndola P2 · Grãos e massas",
      nodeId: 2,
    },
  },
  { id: 21, name: "Feijão carioca 1 kg", brand: "Camil", category: "Mercearia", price: 8.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 } },
  { id: 22, name: "Macarrão espaguete 500 g", brand: "Renata", category: "Mercearia", price: 4.29, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 } },
  { id: 23, name: "Suco de laranja 1 L", brand: "Del Valle", category: "Bebidas", price: 7.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 24, name: "Água mineral 1,5 L", brand: "Crystal", category: "Bebidas", price: 3.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 25, name: "Biscoito de chocolate 130 g", brand: "Bauducco", category: "Mercearia", price: 4.79, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 1", shelf: "Gôndola P1 · Café e padaria", nodeId: 1 } },
  { id: 26, name: "Iogurte natural 170 g", brand: "Nestlé", category: "Laticínios", price: 3.29, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 4", shelf: "Gôndola P4 · Refrigerados", nodeId: 4 } },
  { id: 27, name: "Amaciante concentrado 1 L", brand: "Comfort", category: "Limpeza", price: 16.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 } },
  { id: 28, name: "Maçã fuji 1 kg", brand: null, category: "Hortifruti", price: 9.9, size: "1 kg", unitSuffix: "/kg", inStock: true, location: { aisle: "Setor A", shelf: "Banca central", nodeId: 4 } },
  { id: 29, name: "Pizza congelada 450 g", brand: "Sadia", category: "Congelados", price: 18.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 5", shelf: "Gôndola P5 · Congelados", nodeId: 5 } },
  { id: 30, name: "Biscoito água e sal 200 g", brand: "Marilan", category: "Mercearia", price: 4.59, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 1", shelf: "Gôndola P1 · Café e padaria", nodeId: 1 } },
  { id: 31, name: "Granola tradicional 250 g", brand: "Mãe Terra", category: "Mercearia", price: 12.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 1", shelf: "Gôndola P1 · Café e padaria", nodeId: 1 } },
  { id: 32, name: "Farinha de trigo 1 kg", brand: "Dona Benta", category: "Mercearia", price: 5.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 } },
  { id: 33, name: "Macarrão parafuso 500 g", brand: "Renata", category: "Mercearia", price: 4.79, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 } },
  { id: 34, name: "Lentilha 500 g", brand: "Camil", category: "Mercearia", price: 8.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 } },
  { id: 35, name: "Água sanitária 1 L", brand: "Ypê", category: "Limpeza", price: 4.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 } },
  { id: 36, name: "Desinfetante lavanda 1 L", brand: "Pinho Sol", category: "Limpeza", price: 7.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 } },
  { id: 37, name: "Sabão líquido para roupas 1 L", brand: "OMO", category: "Limpeza", price: 18.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 } },
  { id: 38, name: "Manteiga com sal 200 g", brand: "Aviação", category: "Laticínios", price: 12.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 4", shelf: "Gôndola P4 · Refrigerados", nodeId: 4 } },
  { id: 39, name: "Requeijão cremoso 200 g", brand: "Catupiry", category: "Laticínios", price: 9.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 4", shelf: "Gôndola P4 · Refrigerados", nodeId: 4 } },
  { id: 40, name: "Creme de leite 200 g", brand: "Nestlé", category: "Laticínios", price: 4.29, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 4", shelf: "Gôndola P4 · Refrigerados", nodeId: 4 } },
  { id: 41, name: "Hambúrguer bovino  congelado 672 g", brand: "Sadia", category: "Congelados", price: 19.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 5", shelf: "Gôndola P5 · Congelados", nodeId: 5 } },
  { id: 42, name: "Batata palito congelada 400 g", brand: "Bem Brasil", category: "Congelados", price: 13.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 5", shelf: "Gôndola P5 · Congelados", nodeId: 5 } },
  { id: 43, name: "Refrigerante guaraná 2 L", brand: "Guaraná Antarctica", category: "Bebidas", price: 8.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 44, name: "Água com gás 500 ml", brand: "Crystal", category: "Bebidas", price: 2.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 45, name: "Chá mate 1,5 L", brand: "Leão", category: "Bebidas", price: 7.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 46, name: "Laranja pera 1 kg", brand: null, category: "Hortifruti", price: 5.99, size: "1 kg", unitSuffix: "/kg", inStock: true, location: { aisle: "Setor A", shelf: "Banca de frutas", nodeId: 4 } },
  { id: 47, name: "Cenoura 1 kg", brand: null, category: "Hortifruti", price: 4.49, size: "1 kg", unitSuffix: "/kg", inStock: true, location: { aisle: "Setor A", shelf: "Banca de legumes", nodeId: 4 } },
  { id: 48, name: "Alface crespa", brand: null, category: "Hortifruti", price: 3.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Setor A", shelf: "Banca de verduras", nodeId: 4 } },
  { id: 49, name: "Sabonete hidratante 85 g", brand: "Nivea", category: "Higiene", price: 3.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 7", shelf: "Gôndola P7 · Higiene", nodeId: 7 } },
  { id: 50, name: "Creme dental 90 g", brand: "Colgate", category: "Higiene", price: 5.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 7", shelf: "Gôndola P7 · Higiene", nodeId: 7 } },
  { id: 51, name: "Papel higiênico 12 rolos", brand: "Neve", category: "Higiene", price: 19.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 7", shelf: "Gôndola P7 · Higiene", nodeId: 7 } },
  { id: 52, name: "Bolo de chocolate 300 g", brand: "Pullman", category: "Padaria", price: 8.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 1", shelf: "Gôndola P1 · Café e padaria", nodeId: 1 } },
  { id: 53, name: "Amaciante concentrado 500 ml", brand: "Downy", category: "Limpeza", price: 12.99, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 } },
  { id: 54, name: "Refrigerante cola 2 L", brand: "Coca-Cola", category: "Bebidas", price: 10.49, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 } },
  { id: 55, name: "Uva sem semente 500 g", brand: null, category: "Hortifruti", price: 11.9, size: "1 un.", unitSuffix: "", inStock: true, location: { aisle: "Setor A", shelf: "Banca de frutas", nodeId: 4 } },
];

// Ofertas independentes do catálogo de recomendações; preços e itens são demonstrativos.
export const DEMO_PROMOTIONS = [
  { id: -52001, promoId: "oferta-demo-01", name: "Chocolate ao leite 80 g", brand: "Lacta", category: "Mercearia", price: 6.99, promoPrice: 4.99, offer: "Preço especial por tempo limitado", aisle: "Corredor 1", shelf: "Gôndola P1 · Café e padaria", nodeId: 1 },
  { id: -52002, promoId: "oferta-demo-02", name: "Azeite extravirgem 250 ml", brand: "Andorinha", category: "Mercearia", price: 24.9, promoPrice: 19.9, offer: "Oferta da loja nesta compra", aisle: "Corredor 2", shelf: "Gôndola P2 · Grãos e massas", nodeId: 2 },
  { id: -52003, promoId: "oferta-demo-03", name: "Limpador multiuso 500 ml", brand: "Veja", category: "Limpeza", price: 8.49, promoPrice: 6.49, offer: "Oferta relâmpago da seção", aisle: "Corredor 3", shelf: "Gôndola P3 · Limpeza", nodeId: 3 },
  { id: -52004, promoId: "oferta-demo-04", name: "Iogurte grego 90 g", brand: "Vigor", category: "Laticínios", price: 3.99, promoPrice: 2.99, offer: "Desconto especial hoje", aisle: "Corredor 4", shelf: "Gôndola P4 · Refrigerados", nodeId: 4 },
  { id: -52005, promoId: "oferta-demo-05", name: "Batata rústica congelada 400 g", brand: "Bem Brasil", category: "Congelados", price: 15.9, promoPrice: 12.9, offer: "Economize nesta compra", aisle: "Corredor 5", shelf: "Gôndola P5 · Congelados", nodeId: 5 },
  { id: -52006, promoId: "oferta-demo-06", name: "Energético 269 ml", brand: "Red Bull", category: "Bebidas", price: 9.49, promoPrice: 7.49, offer: "Oferta da loja por tempo limitado", aisle: "Corredor 6", shelf: "Gôndola P6 · Bebidas", nodeId: 6 },
  { id: -52007, promoId: "oferta-demo-07", name: "Morango 250 g", brand: null, category: "Hortifruti", price: 10.9, promoPrice: 7.99, offer: "Destaque do hortifruti", aisle: "Setor A", shelf: "Banca de frutas", nodeId: 7 },
  { id: -52008, promoId: "oferta-demo-08", name: "Shampoo hidratante 350 ml", brand: "Elseve", category: "Higiene", price: 19.9, promoPrice: 15.9, offer: "Oferta especial da loja", aisle: "Corredor 7", shelf: "Gôndola P7 · Higiene", nodeId: 7 },
].map((product) => ({ ...product, regularPrice: product.price, price: product.promoPrice, inStock: true, location: { aisle: product.aisle, shelf: product.shelf, nodeId: product.nodeId } }));

export const DEMO_AISLE_CONTENT = [
  { corridorIndex: 0, label: "Café, padaria e lanches", shelf: "Gôndola P1", recommendationIds: [9, 25, 30, 31] },
  { corridorIndex: 1, label: "Grãos, massas e básicos", shelf: "Gôndola P2", recommendationIds: [21, 22, 32, 33, 34] },
  { corridorIndex: 2, label: "Limpeza", shelf: "Gôndola P3", recommendationIds: [11, 27, 35, 36, 37] },
  { corridorIndex: 3, label: "Laticínios e refrigerados", shelf: "Gôndola P4", recommendationIds: [26, 13, 38, 39, 40] },
  { corridorIndex: 4, label: "Congelados", shelf: "Gôndola P5", recommendationIds: [29, 41, 42] },
  { corridorIndex: 5, label: "Bebidas", shelf: "Gôndola P6", recommendationIds: [23, 24, 43, 44, 45] },
  { corridorIndex: 6, label: "Hortifruti", shelf: "Banca de hortifruti", recommendationIds: [28, 12, 46, 47, 48] },
];

function normalizeRecommendationName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|unidades?|un)\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function getNearbyDemoRecommendations(corridorIndex, listItems = [], catalog = FALLBACK_PRODUCTS, limit = 1, routeStops = []) {
  const section = DEMO_AISLE_CONTENT.find((aisle) => aisle.corridorIndex === corridorIndex);
  if (!section) return [];

  const itemsAlreadyPlanned = [...listItems, ...routeStops];
  return section.recommendationIds
    .map((id) => FALLBACK_PRODUCTS.find((product) => product.id === id))
    .map((demoProduct) => catalog.find((product) => product.name?.toLowerCase() === demoProduct?.name.toLowerCase()) || demoProduct)
    .filter((product) => product && !itemsAlreadyPlanned.some((item) => {
      const existingId = item.id ?? item.productId;
      const productId = product.id ?? product.productId;
      if (existingId !== undefined && productId !== undefined && String(existingId) === String(productId)) return true;
      const existingName = normalizeRecommendationName(item.name);
      return existingName !== "" && existingName === normalizeRecommendationName(product.name);
    }))
    .slice(0, limit);
}

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

export async function fetchAvailableStores() {
  try {
    const response = await fetch(`${API_BASE_URL}/stores`);
    if (!response.ok) throw new Error("Stores list fetch failed");
    const data = await response.json();
    if (Array.isArray(data.stores) && data.stores.length > 0) {
      return data.stores;
    }
    return FALLBACK_STORES;
  } catch {
    return FALLBACK_STORES;
  }
}

export async function fetchStoreDetails(storeId = DEFAULT_STORE_ID) {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}`);
    if (!response.ok) throw new Error("Store fetch failed");
    const data = await response.json();
    return data.store || FALLBACK_STORES.find((s) => s.id === storeId) || FALLBACK_STORE;
  } catch {
    return {
      id: storeId || DEFAULT_STORE_ID,
      name: (FALLBACK_STORES.find((s) => s.id === storeId) || FALLBACK_STORE).name,
      address: (FALLBACK_STORES.find((s) => s.id === storeId) || FALLBACK_STORE).address,
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

const AISLE_INDEX_MAP = {
  "corredor 1": 0,
  "corredor 2": 1,
  "corredor 3": 2,
  "hortifruti": 3,
  "setor a": 3,
  "horti": 3,
};

export function getAisleColumnIndex(aisleName = "") {
  const normalized = String(aisleName || "").toLowerCase().trim();
  for (const [key, idx] of Object.entries(AISLE_INDEX_MAP)) {
    if (normalized.includes(key)) return idx;
  }
  return 0;
}

export function buildLocalFallbackRoute(store, listItems, options = {}) {
  const excludedIds = new Set(
    (options?.excludedProductIds || []).map((id) => String(id)),
  );
  const rawStops = listItems.filter(
    (item) => !excludedIds.has(String(item.id)),
  ).map((item) => {
    const loc = inferProductLocation(item);
    const aisleLabel = loc.aisle === "Setor A" ? "Hortifruti" : loc.aisle;
    return {
      productId: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity || 1,
      aisle: aisleLabel,
      shelf: loc.shelf || "Prateleira central",
      colIndex: getAisleColumnIndex(aisleLabel),
    };
  });

  // Greedy nearest-neighbor ordering starting from entrance (col 0) or options.startAisle
  const remaining = [...rawStops];
  const orderedStops = [];
  let currentCol = options?.startAisle ? getAisleColumnIndex(options.startAisle) : 0;
  let totalDistance = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i += 1) {
      const dist = Math.abs(remaining[i].colIndex - currentCol) * 6 + 4;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    const [chosen] = remaining.splice(bestIdx, 1);
    totalDistance += bestDist;
    currentCol = chosen.colIndex;
    orderedStops.push({
      ...chosen,
      distance: bestDist,
    });
  }

  return {
    store: store || FALLBACK_STORE,
    anchorNode: options?.startAisle
      ? { name: options.startAisle, type: "corredor" }
      : { name: "Entrada Principal", type: "entrada" },
    stops: orderedStops,
    unlocatedItems: [],
    totalDistance,
    hasLocationWarning: false,
    locationWarning: null,
  };
}

export async function generateOptimizedRoute(storeId, store, listItems, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: listItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
        startAisle: options?.startAisle || undefined,
        startNodeId: options?.startNodeId || undefined,
        excludedProductIds: options?.excludedProductIds || undefined,
      }),
    });
    if (!response.ok) throw new Error("Route request failed");
    const data = await response.json();
    if (data?.route?.stops?.length) {
      return data.route;
    }
    return buildLocalFallbackRoute(store, listItems, options);
  } catch {
    return buildLocalFallbackRoute(store, listItems, options);
  }
}

export async function registerAndSaveSessionList({
  name,
  email,
  password,
  storeId = DEFAULT_STORE_ID,
  storeName = FALLBACK_STORE.name,
  listItems = [],
}) {
  const registerRes = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });

  if (!registerRes.ok) {
    const errBody = await registerRes.json().catch(() => ({}));
    throw new Error(errBody.error || "Não foi possível criar a conta.");
  }

  const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    return { registered: true, savedList: false };
  }

  const { token } = await loginRes.json();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const listRes = await fetch(`${API_BASE_URL}/stores/${encodeURIComponent(storeId)}/lists`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: `Compra QR · ${storeName}` }),
  });

  if (listRes.ok) {
    const { list } = await listRes.json();
    for (const item of listItems) {
      await fetch(`${API_BASE_URL}/lists/${encodeURIComponent(list.id)}/items`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity || 1,
        }),
      }).catch(() => {});
    }
    return { registered: true, savedList: true, listName: list.name };
  }

  return { registered: true, savedList: false };
}
