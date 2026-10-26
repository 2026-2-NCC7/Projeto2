import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchCatalog } from "../services/catalog-api";
import { addListItem, createShoppingList } from "../services/shopping-list-api";

const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";
const categories = [
  ["Hortifruti", "🥕"],
  ["Laticínios", "🥛"],
  ["Mercearia", "🌾"],
  ["Limpeza", "🧴"],
];
const icons = ["🍌", "🥛", "🍚", "🥚", "☕", "🧴"];
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;

function ProductCard({ product, quantity, onChangeQuantity }) {
  const canAdd = product.inStock !== false;
  return (
    <View className="mb-2 mr-2 w-[calc(50%-4px)] rounded-[12px] border border-[#e8e8e0] bg-white p-2">
      <View className="h-[84px] items-center justify-center rounded-[7px] bg-[#f1f1ed]">
        <Text className="text-[48px]">{product.icon}</Text>
      </View>
      <Text className="font-inter-semibold mt-2 text-[11px] text-ink">{product.name}</Text>
      <Text className="font-sans mt-0.5 text-[9px] text-[#555]">{product.size || "Tamanho não informado"}</Text>
      <Text className="font-inter-semibold mt-1 text-[13px] text-ink">{money(product.price)}</Text>
      {!canAdd ? <Text className="mt-1 font-sans text-[8px] text-[#b42318]">Fora de estoque</Text> : null}
      {!product.location ? <Text className="mt-1 font-sans text-[8px] text-[#b05b00]">Sem localização</Text> : null}
      {quantity ? (
        <View className="mt-2 h-8 flex-row items-center justify-between rounded-[9px] bg-achai px-2">
          <Pressable onPress={() => onChangeQuantity(-1)} accessibilityLabel={`Remover uma unidade de ${product.name}`}>
            <Text className="text-lg text-ink">−</Text>
          </Pressable>
          <Text className="font-inter-semibold text-xs text-ink">{quantity}</Text>
          <Pressable onPress={() => onChangeQuantity(1)} accessibilityLabel={`Adicionar uma unidade de ${product.name}`}>
            <Text className="text-lg text-ink">+</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          className={`mt-2 h-8 items-center justify-center rounded-[9px] ${canAdd ? "bg-achai" : "bg-[#e7e7e2]"}`}
          disabled={!canAdd}
          onPress={() => onChangeQuantity(1)}
        >
          <Text className="font-inter-semibold text-[10px] text-ink">＋ Adicionar</Text>
        </Pressable>
      )}
    </View>
  );
}

export function CreateListScreen({ navigation }) {
  const { auth } = useAuth();
  const [listName, setListName] = useState("Compra da semana");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCatalog(auth?.token, DEFAULT_STORE_ID)
      .then((items) => {
        if (active) setProducts(items.map((product, index) => ({ ...product, icon: icons[index % icons.length] })));
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth?.token]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesSearch = !term ||
        `${product.name} ${product.brand || ""} ${product.category || ""}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesSearch && (!category || product.category === category);
    });
  }, [category, products, search]);

  const selectedProducts = products.filter((product) => quantities[product.id]);
  const itemCount = selectedProducts.reduce((total, product) => total + quantities[product.id], 0);
  const total = selectedProducts.reduce(
    (sum, product) => sum + Number(product.price || 0) * quantities[product.id],
    0,
  );
  const hasLocationWarning = selectedProducts.some((product) => !product.location);

  const changeQuantity = (id, delta) => {
    setQuantities((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current };
      if (next) updated[id] = next;
      else delete updated[id];
      return updated;
    });
  };

  const saveList = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const { list } = await createShoppingList(auth?.token, DEFAULT_STORE_ID, listName);
      for (const product of selectedProducts) {
        await addListItem(auth?.token, list.id, product.id, quantities[product.id]);
      }
      Alert.alert(
        "Lista criada",
        hasLocationWarning
          ? "Alguns produtos não possuem localização e ficarão fora da rota."
          : "Sua lista foi salva com sucesso.",
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert("Não foi possível criar a lista", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 210 }}>
        <View className="px-3.5 pb-4 pt-10">
          <View className="flex-row items-center justify-between">
            <Pressable className="flex-row items-center" onPress={() => navigation.goBack()}>
              <Text className="mr-1 text-xl text-achai">‹</Text>
              <Text className="font-inter-semibold text-[10px] text-achai">Minhas listas</Text>
            </Pressable>
            <Text className="font-brand text-[16px] text-ink">Ach.ai</Text>
          </View>

          <Text className="font-inter-semibold mt-4 text-[21px] text-achai">Criar nova lista</Text>
          <Text className="font-sans mt-1 text-[9px] text-[#777]">Marina, o que não pode faltar na sua semana?</Text>
          <Text className="font-sans mt-4 text-[9px] text-[#555]">Nome da lista</Text>
          <View className="mt-1 h-8 flex-row items-center rounded-[8px] border border-[#e8e8e0] px-2.5">
            <TextInput className="flex-1 font-sans text-[10px] text-ink" onChangeText={setListName} value={listName} />
            <Text className="text-sm text-[#777]">⌕</Text>
          </View>

          <View className="mt-3 flex-row items-center rounded-[9px] bg-[#fff3e8] px-2.5 py-2">
            <Text className="mr-2 text-lg">🏪</Text>
            <View className="flex-1">
              <Text className="font-sans text-[8px] text-[#777]">Supermercado selecionado</Text>
              <Text className="font-inter-semibold text-[10px] text-ink">Mercado Aurora</Text>
            </View>
          </View>

          <View className="mt-3 h-8 flex-row items-center rounded-[8px] border border-[#e8e8e0] bg-[#f7f7f4] px-2.5">
            <Text className="mr-2 text-base text-achai">⌕</Text>
            <TextInput
              className="flex-1 font-sans text-[10px] text-ink"
              onChangeText={setSearch}
              placeholder="Buscar produto ou marca"
              placeholderTextColor="#777"
              value={search}
            />
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-[14px] text-ink">Explore por categoria</Text>
          </View>
          <View className="mt-2 flex-row justify-between">
            {categories.map(([label, icon]) => (
              <Pressable className="items-center" key={label} onPress={() => setCategory(category === label ? "" : label)}>
                <View className={`h-10 w-10 items-center justify-center rounded-[10px] ${category === label ? "bg-achai" : "bg-[#f0f3eb]"}`}>
                  <Text className="text-lg">{icon}</Text>
                </View>
                <Text className="font-sans mt-1 text-[8px] text-[#555]">{label}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="font-inter-semibold mt-4 text-[14px] text-achai">O básico que não pode faltar</Text>
          <Text className="font-sans mt-0.5 text-[9px] text-[#777]">
            {loading ? "Carregando produtos..." : "Escolha os produtos e ajuste as quantidades."}
          </Text>
          <View className="mt-3 flex-row flex-wrap">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id]}
                onChangeQuantity={(delta) => changeQuantity(product.id, delta)}
              />
            ))}
          </View>
          {!loading && visibleProducts.length === 0 ? (
            <Text className="font-sans mt-3 text-center text-[10px] text-[#777]">Nenhum produto encontrado.</Text>
          ) : null}
          <Text className="font-sans mt-1 text-[8px] text-[#999]">Preços demonstrativos. Os valores podem variar na loja.</Text>
          {hasLocationWarning ? (
            <Text className="mt-2 font-sans text-[9px] text-[#b05b00]">
              Alguns itens não possuem localização e ficarão fora da rota.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#f0e2d6] bg-[#fff5eb] px-3.5 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-[13px] text-ink">Sua lista até aqui</Text>
          <Text className="font-inter-semibold text-[9px] text-achai">{itemCount} itens · {selectedProducts.length} produtos</Text>
        </View>
        {selectedProducts.slice(0, 2).map((product) => (
          <View className="mt-1 flex-row justify-between" key={product.id}>
            <Text className="font-sans text-[8px] text-[#777]">{quantities[product.id]} × {product.name}</Text>
            <Text className="font-sans text-[8px] text-ink">{money(Number(product.price || 0) * quantities[product.id])}</Text>
          </View>
        ))}
        <View className="mt-3 flex-row items-center justify-between border-t border-[#ead9ca] pt-2">
          <Text className="font-sans text-[9px] text-[#777]">Total estimado</Text>
          <Text className="font-inter-semibold text-[17px] text-ink">{money(total)}</Text>
        </View>
        <Pressable
          className={`mt-2 h-8 items-center justify-center rounded-[9px] ${saving ? "bg-[#e7e7e2]" : "bg-achai"}`}
          disabled={saving}
          onPress={saveList}
        >
          <Text className="font-inter-semibold text-[10px] text-ink">
            {saving ? "Salvando..." : `☷　Criar lista com ${itemCount} itens`}
          </Text>
        </Pressable>
        <Text className="font-sans mt-2 text-center text-[8px] text-[#777]">Você pode editar sua lista depois de criar.</Text>
      </View>
    </View>
  );
}
