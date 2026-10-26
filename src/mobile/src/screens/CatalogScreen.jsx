import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SearchBar } from "../components/SearchBar";
import { fetchCatalog } from "../services/catalog-api";

const categories = ["Todos", "Mercearia", "Bebidas", "Hortifruti", "Laticínios", "Limpeza", "Padaria"];

function ProductCard({ product, onAdd }) {
  const location = product.location
    ? [product.location.aisle, product.location.shelf].filter(Boolean).join(", ")
    : "Localização não cadastrada";
  const disabled = !product.inStock;

  return (
    <View className="mb-2 flex-row items-center rounded-[14px] border border-[#e8e8e0] bg-white p-2.5">
      <View className="h-14 w-14 items-center justify-center rounded-[10px] bg-achai">
        <Text className="text-xl text-ink">✦</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-inter-semibold text-sm text-ink">{product.name}</Text>
        <Text className="font-sans mt-1 text-[11px] text-[#555]">
          {[product.brand, product.size].filter(Boolean).join(" · ") || product.category}
        </Text>
        <Text className="font-sans mt-1 text-[10px] text-[#777]">{location}</Text>
        <Text className={`font-inter-semibold mt-1 text-[10px] ${disabled ? "text-[#b42318]" : "text-[#267a3d]"}`}>
          {disabled ? "Fora de estoque" : "Em estoque"}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={disabled ? `${product.name}, fora de estoque` : `Adicionar ${product.name}`}
        accessibilityState={{ disabled }}
        className={`h-9 w-9 items-center justify-center rounded-[10px] bg-achai ${disabled ? "opacity-40" : ""}`}
        disabled={disabled}
        onPress={onAdd}
      >
        <Text className="font-inter-semibold text-lg text-ink">{disabled ? "−" : "+"}</Text>
      </Pressable>
    </View>
  );
}

function ProductSkeleton() {
  return (
    <View className="mb-2 h-[104px] flex-row items-center rounded-[14px] border border-[#e8e8e0] p-2.5">
      <View className="h-14 w-14 rounded-[10px] bg-[#ededeb]" />
      <View className="ml-3 flex-1">
        <View className="h-3 w-3/4 rounded bg-[#ededeb]" />
        <View className="mt-2 h-2.5 w-1/2 rounded bg-[#ededeb]" />
        <View className="mt-2 h-2.5 w-2/5 rounded bg-[#ededeb]" />
      </View>
      <View className="h-9 w-9 rounded-[10px] bg-[#ededeb]" />
    </View>
  );
}

function CatalogState({ kind, onRetry }) {
  const states = {
    offline: ["Sem conexão", "Verifique sua internet e tente novamente.", "Tentar novamente"],
    error: ["Não foi possível carregar", "O catálogo não respondeu agora.", "Tentar novamente"],
    empty: ["Nenhum produto encontrado", "Tente outro nome, marca ou categoria.", null],
  };
  const [title, description, action] = states[kind];
  return (
    <View className="items-center rounded-[14px] border border-[#e8e8e0] px-5 py-8">
      <Text className="font-inter-semibold text-center text-base text-ink">{title}</Text>
      <Text className="font-sans mt-2 text-center text-xs text-[#555]">{description}</Text>
      {action ? (
        <Pressable className="mt-4 rounded-[10px] bg-achai px-4 py-2" onPress={onRetry}>
          <Text className="font-inter-semibold text-xs text-ink">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CatalogScreen({ navigation }) {
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorKind, setErrorKind] = useState(null);
  const [addedProduct, setAddedProduct] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setErrorKind(null);
      fetchCatalog(auth?.token, undefined, search, controller.signal)
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          setErrorKind(error instanceof TypeError ? "offline" : "error");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, 300);
    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [auth?.token, search, retryKey]);

  const filteredProducts = useMemo(
    () => (category === "Todos" ? products : products.filter((product) => product.category === category)),
    [category, products],
  );

  const header = (
    <View className="px-5 pb-4 pt-12">
      <View className="flex-row items-center">
        <Pressable
          accessibilityLabel="Voltar"
          className="mr-3 h-9 w-9 items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-[30px] text-ink">‹</Text>
        </Pressable>
        <Text className="font-brand text-[22px] text-ink">Buscar produtos</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch("")} />

      <FlatList
        className="mt-4"
        data={categories}
        horizontal
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: category === item }}
            className={`mr-2 rounded-full px-4 py-2 ${category === item ? "bg-achai" : "bg-[#f5f5f0]"}`}
            onPress={() => setCategory(item)}
          >
            <Text className={`font-inter-semibold text-xs ${category === item ? "text-ink" : "text-[#555]"}`}>
              {item}
            </Text>
          </Pressable>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <Text className="font-inter-semibold mt-7 text-[19px] text-achai">Produtos da loja</Text>
      <Text className="font-sans mt-1 text-[11px] text-[#555]">Catálogo inicial do MVP</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        contentContainerStyle={{ paddingBottom: 24 }}
        data={loading ? [] : errorKind ? [] : filteredProducts}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          loading ? (
            <View className="px-5">
              {Array.from({ length: 5 }, (_, index) => <ProductSkeleton key={index} />)}
            </View>
          ) : errorKind ? (
            <View className="px-5">
              <CatalogState kind={errorKind} onRetry={() => setRetryKey((key) => key + 1)} />
            </View>
          ) : (
            <View className="px-5">
              <CatalogState kind="empty" />
            </View>
          )
        }
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="px-5">
            <ProductCard
              product={item}
              onAdd={() => setAddedProduct(`${item.name} será adicionado à sua próxima lista.`)}
            />
          </View>
        )}
        ListFooterComponent={
          addedProduct ? (
            <Text className="font-sans mt-1 px-5 text-center text-xs text-achai">{addedProduct}</Text>
          ) : null
        }
        refreshing={loading}
        onRefresh={() => setRetryKey((key) => key + 1)}
      />
    </View>
  );
}
