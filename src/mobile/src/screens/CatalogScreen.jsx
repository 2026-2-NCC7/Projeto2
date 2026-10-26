import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchCatalog } from "../services/catalog-api";

const categories = ["Todos", "Mercearia", "Bebidas", "Hortifruti", "Laticínios", "Limpeza"];

function ProductCard({ product, onAdd }) {
  return (
    <View className="mb-2 flex-row items-center rounded-[14px] border border-[#e8e8e0] bg-white p-2.5">
      <View className="h-14 w-14 items-center justify-center rounded-[10px] bg-achai">
        <Text className="text-xl text-ink">✦</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-inter-semibold text-sm text-ink">{product.name}</Text>
        <Text className="font-sans mt-1 text-[11px] text-[#555]">
          {product.category} · {product.aisle}
        </Text>
      </View>
      <Pressable className="h-8 w-9 items-center justify-center rounded-[10px] bg-achai" onPress={onAdd}>
        <Text className="font-inter-semibold text-lg text-ink">+</Text>
      </Pressable>
    </View>
  );
}

export function CatalogScreen({ navigation }) {
  const { auth } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addedProduct, setAddedProduct] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setMessage("");
      fetchCatalog(auth?.token, search, controller.signal)
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") setMessage("Não foi possível carregar os produtos.");
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
  }, [auth?.token, search]);

  const filteredProducts =
    category === "Todos" ? products : products.filter((product) => product.category === category);

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pb-4 pt-12">
          <View className="flex-row items-center">
            <Pressable className="mr-3 h-9 w-9 items-center justify-center" onPress={() => navigation.goBack()}>
              <Text className="text-[30px] text-ink">‹</Text>
            </Pressable>
            <Text className="font-brand text-[22px] text-ink">Buscar produtos</Text>
          </View>

          <TextInput
            autoCapitalize="none"
            className="font-sans mt-6 h-11 rounded-[14px] border border-[#e8e8e0] px-4 text-sm text-ink"
            onChangeText={setSearch}
            placeholder="Busque por produto ou categoria"
            placeholderTextColor="#777"
            value={search}
          />

          <ScrollView className="mt-4" horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((item) => (
              <Pressable
                className={`mr-2 rounded-full px-4 py-2 ${category === item ? "bg-achai" : "bg-[#f5f5f0]"}`}
                key={item}
                onPress={() => setCategory(item)}
              >
                <Text className={`font-inter-semibold text-xs ${category === item ? "text-ink" : "text-[#555]"}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text className="font-inter-semibold mt-7 text-[19px] text-achai">Produtos da loja</Text>
          <Text className="font-sans mt-1 text-[11px] text-[#555]">Catálogo inicial do MVP</Text>

          <View className="mt-4">
            {loading ? (
              <ActivityIndicator color="#F26900" />
            ) : message ? (
              <Text className="font-sans text-center text-xs text-[#555]">{message}</Text>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={() => setAddedProduct(`${product.name} será adicionado à sua próxima lista.`)}
                />
              ))
            ) : (
              <Text className="font-sans text-center text-xs text-[#555]">Nenhum produto encontrado.</Text>
            )}
          </View>
          {addedProduct ? (
            <Text className="font-sans mt-3 text-center text-xs text-achai">{addedProduct}</Text>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
