import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";

const listIcons = {
  carrinho: require("../assets/lists/carrinho.png"),
  churrasco: require("../assets/lists/churrasco.png"),
  cafe: require("../assets/lists/cafe.png"),
};

const savedLists = [
  {
    id: "compra-da-semana",
    title: "Compra da semana",
    meta: "8 itens · Atualizada hoje",
    icon: listIcons.carrinho,
  },
  {
    id: "churrasco",
    title: "Churrasco",
    meta: "5 itens · Atualizada ontem",
    icon: listIcons.churrasco,
  },
  {
    id: "cafe-da-manha",
    title: "Café da manhã",
    meta: "6 itens · Há 4 dias",
    icon: listIcons.cafe,
  },
];

function ChevronRightIcon({ size = 18, color = "#F26900" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 15L12.5 10L7.5 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SavedListCard({ item, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[88px] flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-3"
      onPress={onPress}
    >
      <View className="h-[54px] w-[54px] items-center justify-center rounded-[12px] bg-[#FFF4E8]">
        <View style={{ width: 24, height: 24, overflow: "hidden" }}>
          <Image source={item.icon} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
        </View>
      </View>

      <View className="ml-3.5 flex-1">
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mt-[9px] font-sans text-[11px] leading-[13px] text-[#555555]" numberOfLines={1}>
          {item.meta}
        </Text>
      </View>

      <View className="ml-2 h-7 w-5 items-center justify-center">
        <ChevronRightIcon />
      </View>
    </Pressable>
  );
}

export function MyListsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="px-5"
          style={{ paddingTop: Math.max(insets.top, 44) + 20 }}
        >
          {/* Cabeçalho no mesmo padrão de Buscar supermercados */}
          <View className="gap-3">
            <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
            <Text className="font-inter-extrabold text-[25px] leading-[30px] text-achai">
              Minhas listas
            </Text>

            {/* Botão Criar nova lista */}
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-[14px] bg-achai"
              onPress={() => navigation.navigate("CreateList")}
            >
              <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
                +  Criar nova lista
              </Text>
            </Pressable>
          </View>

          {/* Listas salvas */}
          <View className="mt-[22px] gap-4">
            {savedLists.map((item) => (
              <SavedListCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate("CreateList")}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
