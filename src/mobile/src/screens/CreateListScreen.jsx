import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

const categories = [
  ["Hortifruti", "🥕"],
  ["Laticínios", "🥛"],
  ["Mercearia", "🌾"],
  ["Limpeza", "🧴"],
];

const products = [
  { id: "banana-prata", name: "Banana prata", detail: "Porção de 1 kg", price: 6.99, icon: "🍌", category: "Hortifruti" },
  { id: "leite-integral", name: "Leite integral", detail: "Caixa · 1 L", price: 4.79, icon: "🥛", category: "Laticínios" },
  { id: "arroz-branco", name: "Arroz branco", detail: "Tipo 1 · Pacote 5 kg", price: 24.9, icon: "🍚", category: "Mercearia" },
  { id: "ovos-brancos", name: "Ovos brancos", detail: "Bandeja · 12 unidades", price: 12.99, icon: "🥚", category: "Laticínios" },
  { id: "cafe-torrado", name: "Café torrado e moído", detail: "Tradicional · 500 g", price: 18.9, icon: "☕", category: "Mercearia" },
  { id: "detergente-neutro", name: "Detergente neutro", detail: "Frasco · 500 ml", price: 2.49, icon: "🧴", category: "Limpeza" },
];

const money = (value) => `R$ ${value.toFixed(2).replace(".", ",")}`;

function ProductCard({ product, quantity, onChangeQuantity }) {
  return (
    <View className="mb-2 mr-2 w-[calc(50%-4px)] rounded-[12px] border border-[#e8e8e0] bg-white p-2">
      <View className="h-[84px] items-center justify-center rounded-[7px] bg-[#f1f1ed]">
        <Text className="text-[48px]">{product.icon}</Text>
      </View>
      <Text className="font-inter-semibold mt-2 text-[11px] text-ink">{product.name}</Text>
      <Text className="font-sans mt-0.5 text-[9px] text-[#555]">{product.detail}</Text>
      <Text className="font-inter-semibold mt-1 text-[13px] text-ink">{money(product.price)}</Text>
      {quantity ? (
        <View className="mt-2 h-8 flex-row items-center justify-between rounded-[9px] bg-achai px-2">
          <Pressable onPress={() => onChangeQuantity(-1)}>
            <Text className="text-lg text-ink">−</Text>
          </Pressable>
          <Text className="font-inter-semibold text-xs text-ink">{quantity}</Text>
          <Pressable onPress={() => onChangeQuantity(1)}>
            <Text className="text-lg text-ink">+</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable className="mt-2 h-8 items-center justify-center rounded-[9px] bg-achai" onPress={() => onChangeQuantity(1)}>
          <Text className="font-inter-semibold text-[10px] text-ink">＋ Adicionar</Text>
        </Pressable>
      )}
    </View>
  );
}

export function CreateListScreen({ navigation }) {
  const [listName, setListName] = useState("Compra da semana");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState({ "banana-prata": 1, "leite-integral": 2 });

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesSearch = !term || `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(term);
      return matchesSearch && (!category || product.category === category);
    });
  }, [category, search]);

  const selectedProducts = products.filter((product) => quantities[product.id]);
  const itemCount = selectedProducts.reduce((total, product) => total + quantities[product.id], 0);
  const total = selectedProducts.reduce((sum, product) => sum + product.price * quantities[product.id], 0);

  const changeQuantity = (id, delta) => {
    setQuantities((current) => {
      const next = Math.max(0, (current[id] || 0) + delta);
      const updated = { ...current };
      if (next) updated[id] = next;
      else delete updated[id];
      return updated;
    });
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
              <Text className="font-sans text-[8px] text-[#777]">Supermercado da Fita</Text>
              <Text className="font-inter-semibold text-[10px] text-ink">Mercado Aurora</Text>
            </View>
            <Text className="font-inter-semibold text-[9px] text-achai">Trocar　⌄</Text>
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
            <Text className="font-inter-semibold text-[9px] text-achai">Ver todas</Text>
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
          <Text className="font-sans mt-0.5 text-[9px] text-[#777]">Escolha os produtos e ajuste as quantidades.</Text>
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
          <Text className="font-sans mt-1 text-[8px] text-[#999]">Preços demonstrativos. Os valores podem variar na loja.</Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-[#f0e2d6] bg-[#fff5eb] px-3.5 pb-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-semibold text-[13px] text-ink">Sua lista até aqui</Text>
          <Text className="font-inter-semibold text-[9px] text-achai">{itemCount} itens · {selectedProducts.length} produtos</Text>
        </View>
        {selectedProducts.slice(0, 2).map((product) => (
          <View className="mt-1 flex-row justify-between" key={product.id}>
            <Text className="font-sans text-[8px] text-[#777]">{quantities[product.id]} × {product.name} · {product.detail.split(" · ")[0]}</Text>
            <Text className="font-sans text-[8px] text-ink">{money(product.price * quantities[product.id])}</Text>
          </View>
        ))}
        <View className="mt-3 flex-row items-center justify-between border-t border-[#ead9ca] pt-2">
          <Text className="font-sans text-[9px] text-[#777]">Total estimado</Text>
          <Text className="font-inter-semibold text-[17px] text-ink">{money(total)}</Text>
        </View>
        <Pressable className="mt-2 h-8 items-center justify-center rounded-[9px] bg-achai" onPress={() => navigation.goBack()}>
          <Text className="font-inter-semibold text-[10px] text-ink">☷　Criar lista com {itemCount} itens</Text>
        </Pressable>
        <Text className="font-sans mt-2 text-center text-[8px] text-[#777]">Você pode editar sua lista depois de criar.</Text>
      </View>
    </View>
  );
}
