import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";

const storeFacadeImage = require("../assets/store/fachada-liberdade.png");

const productImages = {
  banana: require("../assets/products/banana.png"),
  leite: require("../assets/products/leite.png"),
  arroz: require("../assets/products/arroz.png"),
  ovos: require("../assets/products/ovos.png"),
};

const stroke = { strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function ChevronLeftOrangeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="#F26900" {...stroke} />
    </Svg>
  );
}

function MapPinOrangeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M14.9994 7.49994C14.9994 11.245 10.8456 15.1454 9.45072 16.35C9.32077 16.4477 9.16259 16.5006 9.00001 16.5006C8.83743 16.5006 8.67925 16.4477 8.54931 16.35C7.15445 15.1454 3.00061 11.245 3.00061 7.49994C3.00061 5.9085 3.63269 4.38223 4.75779 3.25691C5.8829 2.13159 7.40887 1.49939 9.00001 1.49939C10.5912 1.49939 12.1171 2.13159 13.2422 3.25691C14.3673 4.38223 14.9994 5.9085 14.9994 7.49994ZM11.2498 7.49994C11.2498 8.7427 10.2425 9.75015 9.00001 9.75015C7.75749 9.75015 6.75024 8.7427 6.75024 7.49994C6.75024 6.25719 7.75749 5.24974 9.00001 5.24974C10.2425 5.24974 11.2498 6.25719 11.2498 7.49994Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function NavigationOrangeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M2.25 8.24939L16.5 1.49939L9.75 15.7494L8.25 9.74939L2.25 8.24939Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function ClockOrangeIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M8.99999 4.49963V8.99999H12.0002M16.5006 8.99999C16.5006 13.1425 13.1425 16.5006 8.99999 16.5006C4.85752 16.5006 1.49939 13.1425 1.49939 8.99999C1.49939 4.85752 4.85752 1.49939 8.99999 1.49939C13.1425 1.49939 16.5006 4.85752 16.5006 8.99999Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function ListPlusDarkIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.3333 4.16602H2.5M9.16667 10H2.5M13.3333 15.834H2.5M15 7.49973V10M15 10V12.5003M15 10H17.5M15 10H12.5"
        stroke="#1F1F1F"
        {...stroke}
      />
    </Svg>
  );
}

function ChevronRightWarmIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15" fill="none">
      <Path d="M5.625 11.25L9.375 7.5L5.625 3.75" stroke="#A74600" {...stroke} />
    </Svg>
  );
}

function SearchOrangeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5001 17.5001L13.8835 13.8835M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function CarrotCategoryIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 30 30" fill="none">
      <Path
        d="M10.8004 17.5003L8.23787 14.9501M19.1753 18.7504L19.1529 18.7279M19.1529 18.7279L16.1003 15.6751M19.1529 18.7279C19.027 18.8839 18.8927 19.0333 18.7503 19.1754C15.1753 22.7507 2.83789 27.126 2.83789 27.126C2.83789 27.126 7.21288 14.8 10.8004 11.2123C11.3232 10.6902 11.9437 10.2763 12.6265 9.99405C13.3093 9.71183 14.041 9.56688 14.7798 9.56746C15.5186 9.56804 16.25 9.71414 16.9324 9.99743C17.266 10.136 17.5848 10.306 17.8844 10.5047M19.1529 18.7279C19.4893 18.3111 19.7652 17.8476 19.9713 17.351C20.2546 16.6686 20.4007 15.9371 20.4012 15.1982C20.4018 14.4594 20.2569 13.7276 19.9747 13.0448C19.8358 12.7086 19.6649 12.3876 19.465 12.0858M18.7509 11.2497C18.7509 11.2497 18.757 11.2432 18.7688 11.2308M18.7509 11.2497C18.7509 11.2497 19.0008 11.6256 19.465 12.0858M18.7509 11.2497C18.7509 11.2497 18.3584 10.9887 17.8844 10.5047M18.7509 11.2497C18.7509 11.2497 18.7575 11.2437 18.7699 11.2319M18.7688 11.2308C18.8102 11.1873 18.9222 11.0715 19.0897 10.9124M18.7688 11.2308C18.7692 11.2312 18.7696 11.2316 18.7699 11.2319M18.7688 11.2308C18.7647 11.2267 18.7607 11.2226 18.7566 11.2185C18.4898 10.9513 18.1976 10.7123 17.8844 10.5047M19.0897 10.9124C19.8082 10.2299 21.5485 8.74952 23.1259 8.74952C25.8384 8.74952 27.5009 11.2497 27.5009 11.2497C27.5009 11.2497 25.8384 13.7499 23.1259 13.7499C21.4651 13.7499 20.1979 12.8126 19.465 12.0858M19.0897 10.9124C19.7728 10.1987 21.2509 8.47002 21.2509 6.87437C21.2509 4.16166 18.7509 2.49902 18.7509 2.49902C18.7509 2.49902 16.2509 4.16166 16.2509 6.87437C16.2509 8.51219 17.1622 9.76723 17.8844 10.5047M19.0897 10.9124C18.9299 11.0793 18.8137 11.1907 18.7699 11.2319M19.465 12.0858C19.2623 11.7799 19.0296 11.4938 18.7699 11.2319"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function MilkCategoryIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 30 30" fill="none">
      <Path
        d="M10.0008 2.49902H11.2506M11.2506 2.49902H18.7494M11.2506 2.49902V5.98555C11.2506 6.97287 10.9583 7.93808 10.4107 8.75952L9.59084 9.98962C9.043 10.8114 8.75076 11.7771 8.75098 12.7648V18.7508M18.7494 2.49902H19.9992M18.7494 2.49902V5.9843C18.7492 6.97204 19.0414 7.93772 19.5892 8.75952L20.4091 9.98962C20.9567 10.8111 21.249 11.7763 21.249 12.7636V18.7508M8.75098 18.7508V25.0008C8.75098 25.6639 9.01433 26.2999 9.48309 26.7687C9.95186 27.2376 10.5876 27.501 11.2506 27.501H18.7494C19.4123 27.501 20.0481 27.2376 20.5169 26.7687C20.9856 26.2999 21.249 25.6639 21.249 25.0008V18.7508M8.75098 18.7508C9.74054 18.3363 10.8026 18.1228 11.8755 18.1228C12.9483 18.1228 14.0104 18.3363 15 18.7508C15.9895 19.1655 17.0516 19.379 18.1245 19.379C19.1973 19.379 20.2595 19.1655 21.249 18.7508"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function WheatCategoryIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 30 30" fill="none">
      <Path
        d="M2.49902 27.501L6.24961 23.7504M6.24961 23.7504L8.19867 21.8014M6.24961 23.7504L4.33724 21.8381C3.52043 21.018 3.06181 19.9078 3.06181 18.7503C3.06181 17.5929 3.52043 16.4826 4.33724 15.6626L6.2499 13.7499L8.16255 15.6626C8.97936 16.4826 9.43798 17.5929 9.43798 18.7503C9.43798 19.8906 8.99287 20.9851 8.19867 21.8014M8.16255 21.8381C8.98259 21.0213 10.0923 20.5632 11.2497 20.5632C12.4072 20.5632 13.5174 21.0218 14.3375 21.8386L16.2501 23.7513L14.3375 25.6639C13.5174 26.4808 12.4072 26.9394 11.2497 26.9394C10.0923 26.9394 8.98201 26.4808 8.16198 25.6639L6.2499 23.7507L6.24961 23.7504M8.19867 21.8014L11.25 18.75M8.19867 21.8014C8.18671 21.8137 8.17467 21.8259 8.16255 21.8381M11.25 18.75L13.1991 16.801M11.25 18.75L9.33764 16.8377C8.52083 16.0176 8.06221 14.9074 8.06221 13.7499C8.06221 12.5925 8.52083 11.4822 9.33764 10.6622L11.2503 8.74952L13.1629 10.6622C13.9798 11.4822 14.4384 12.5925 14.4384 13.7499C14.4384 14.8902 13.9933 15.9847 13.1991 16.801M11.25 18.75L11.2503 18.7503M13.1991 16.801L16.2504 13.7496M13.1991 16.801C13.1871 16.8133 13.1751 16.8255 13.1629 16.8377M16.2504 13.7496L18.1995 11.8005M16.2504 13.7496L14.338 11.8373C13.5212 11.0172 13.0626 9.90696 13.0626 8.74952C13.0626 7.59209 13.5212 6.48181 14.338 5.66178L16.2507 3.74912L18.1633 5.66178C18.9802 6.48181 19.4388 7.59209 19.4388 8.74952C19.4388 9.88977 18.9937 10.9842 18.1995 11.8005M16.2504 13.7496L16.2507 13.7499M18.1995 11.8005L20.0004 9.99962M18.1995 11.8005C18.1875 11.8128 18.1755 11.8251 18.1633 11.8373M20.0004 9.99962H22.5006C23.8268 9.99962 25.0987 9.4728 26.0364 8.53504C26.9742 7.59728 27.501 6.32541 27.501 4.99922V2.49902H25.0008C23.6746 2.49902 22.4028 3.02585 21.465 3.96361C20.5273 4.90136 20.0004 6.17323 20.0004 7.49942V9.99962ZM8.16255 21.8381L6.2499 23.7507M13.1629 16.8377L11.2503 18.7503M13.1629 16.8377C13.983 16.0209 15.0927 15.5628 16.2501 15.5628C17.4076 15.5628 18.5178 16.0214 19.3379 16.8382L21.2505 18.7509L19.3379 20.6635C18.5178 21.4804 17.4076 21.939 16.2501 21.939C15.0927 21.939 13.9824 21.4804 13.1624 20.6635L11.2503 18.7503M18.1633 11.8373L16.2507 13.7499M18.1633 11.8373C18.9834 11.0205 20.0931 10.5624 21.2505 10.5624C22.408 10.5624 23.5182 11.021 24.3383 11.8378L26.2509 13.7505L24.3383 15.6631C23.5182 16.48 22.408 16.9386 21.2505 16.9386C20.0931 16.9386 18.9828 16.48 18.1628 15.6631L16.2507 13.7499"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function CleaningCategoryIcon() {
  return (
    <Svg width={25} height={25} viewBox="0 0 30 30" fill="none">
      <Path
        d="M3.75 3.75H3.7625M8.75 6.25H8.7625M13.75 8.75H13.7625M3.75 8.75H3.7625M8.75 11.25H8.7625M3.75 13.75H3.7625M23.75 11.25V6.25H18.75V11.25M23.75 11.25H18.75M23.75 11.25L26.25 13.75V15M18.75 11.25L16.25 13.75V17.5M26.25 15V21.25M26.25 15L16.25 17.5M26.25 21.25V26.25C26.25 27 25.75 27.5 25 27.5H17.5C16.75 27.5 16.25 27 16.25 26.25V23.75M26.25 21.25L16.25 23.75M16.25 23.75V17.5"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function QrCodeOrangeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M19.25 14.6667H16.5C16.0138 14.6667 15.5475 14.8598 15.2036 15.2036C14.8598 15.5475 14.6667 16.0138 14.6667 16.5V19.25M19.25 19.25V19.2592M11 6.41667V9.16667C11 9.6529 10.8068 10.1192 10.463 10.463C10.1192 10.8068 9.6529 11 9.16667 11H6.41667M2.75 11H2.75917M11 2.75H11.0092M11 14.6667V14.6758M14.6667 11H15.5833M19.25 11V11.0092M11 19.25V18.3333M3.66667 2.75H6.41667C6.92293 2.75 7.33333 3.16041 7.33333 3.66667V6.41667C7.33333 6.92293 6.92293 7.33333 6.41667 7.33333H3.66667C3.16041 7.33333 2.75 6.92293 2.75 6.41667V3.66667C2.75 3.16041 3.16041 2.75 3.66667 2.75ZM15.5833 2.75H18.3333C18.8396 2.75 19.25 3.16041 19.25 3.66667V6.41667C19.25 6.92293 18.8396 7.33333 18.3333 7.33333H15.5833C15.0771 7.33333 14.6667 6.92293 14.6667 6.41667V3.66667C14.6667 3.16041 15.0771 2.75 15.5833 2.75ZM3.66667 14.6667H6.41667C6.92293 14.6667 7.33333 15.0771 7.33333 15.5833V18.3333C7.33333 18.8396 6.92293 19.25 6.41667 19.25H3.66667C3.16041 19.25 2.75 18.8396 2.75 18.3333V15.5833C2.75 15.0771 3.16041 14.6667 3.66667 14.6667Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

const CATEGORIES = [
  { id: "Hortifruti", label: "Hortifruti", bg: "#EDF3E7", Icon: CarrotCategoryIcon },
  { id: "Laticínios", label: "Laticínios", bg: "#EDF3F7", Icon: MilkCategoryIcon },
  { id: "Mercearia", label: "Mercearia", bg: "#FBF3DD", Icon: WheatCategoryIcon },
  { id: "Limpeza", label: "Limpeza", bg: "#FFF4E8", Icon: CleaningCategoryIcon },
];

const SHOWCASE_PRODUCTS = [
  {
    id: "prod-1",
    name: "Banana prata",
    packaging: "Porção de 1 kg",
    price: "R$ 6,99",
    category: "Hortifruti",
    image: productImages.banana,
  },
  {
    id: "prod-2",
    name: "Leite integral",
    packaging: "Caixa · 1 L",
    price: "R$ 4,79",
    category: "Laticínios",
    image: productImages.leite,
  },
  {
    id: "prod-3",
    name: "Arroz branco",
    packaging: "Tipo 1 · Pacote 5 kg",
    price: "R$ 24,90",
    category: "Mercearia",
    image: productImages.arroz,
  },
  {
    id: "prod-4",
    name: "Ovos brancos",
    packaging: "Bandeja · 12 unidades",
    price: "R$ 12,99",
    category: "Mercearia",
    image: productImages.ovos,
  },
];

function ShowcaseProductCard({ product, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[198px] flex-1 gap-[9px] rounded-[14px] border border-[#E8E8E0] bg-white p-3 active:opacity-90"
      onPress={onPress}
    >
      <View style={{ height: 102, width: "100%", overflow: "hidden" }}>
        <Image
          resizeMode="cover"
          source={product.image}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      <View className="gap-1">
        <Text className="font-inter-semibold text-[13px] leading-[17px] text-[#1F1F1F]" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="font-sans text-[10px] leading-[12px] text-[#66645F]" numberOfLines={1}>
          {product.packaging}
        </Text>
      </View>

      <Text className="font-inter-bold text-[17px] leading-[21px] text-[#1F1F1F]">
        {product.price}
      </Text>
    </Pressable>
  );
}

export function StoreDetailsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { setCurrentStore } = useAuth();
  const [productQuery, setProductQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const store = route?.params?.store || {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Mercado Liberdade",
    address: "Av. da Liberdade, 680",
    distance: "350 m",
    hours: "Aberto · até 22h",
  };

  const hoursLabel = useMemo(() => {
    if (!store.hours) return "Funcionamento informado: até 22h";
    if (store.hours.includes("até")) {
      const idx = store.hours.indexOf("até");
      return `Funcionamento informado: ${store.hours.slice(idx)}`;
    }
    return `Funcionamento informado: ${store.hours}`;
  }, [store.hours]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return SHOWCASE_PRODUCTS.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.packaging.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [productQuery, selectedCategory]);

  const productPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      pairs.push(filteredProducts.slice(i, i + 2));
    }
    return pairs;
  }, [filteredProducts]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Catalog");
    }
  };

  const handleCreateListHere = async () => {
    await setCurrentStore({ id: store.id, name: store.name });
    navigation.navigate("CreateList");
  };

  const handleUseExistingList = async () => {
    await setCurrentStore({ id: store.id, name: store.name });
    navigation.navigate("MyLists");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Navegação de retorno — h=64, pad 0/20/0/20 */}
        <View
          className="flex-row items-center justify-between px-5"
          style={{
            paddingTop: Math.max(insets.top, 44),
            height: Math.max(insets.top, 44) + 64,
          }}
        >
          <Pressable
            accessibilityLabel="Voltar para Buscar supermercados"
            accessibilityRole="button"
            className="flex-row items-center gap-1"
            hitSlop={8}
            onPress={handleBack}
          >
            <ChevronLeftOrangeIcon />
            <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#A74600]">
              Buscar supermercados
            </Text>
          </Pressable>

          <Text className="font-brand text-[20px] leading-[24px] text-[#1F1F1F]">Ach.ai</Text>
        </View>

        {/* Apresentação da loja — pad 0/20/24/20, gap 16 */}
        <View className="gap-4 px-5 pb-6">
          {/* Identificação da unidade — gap 6 */}
          <View className="gap-1.5">
            <Text className="font-inter-extrabold text-[27px] leading-[33px] text-[#1F1F1F]">
              {store.name}
            </Text>
            <Text className="font-inter-medium text-[13px] leading-[16px] text-[#66645F]">
              {`Unidade ${store.address}`}
            </Text>
          </View>

          {/* Fotografia da unidade — h=148, r=14 */}
          <View
            style={{
              position: "relative",
              height: 148,
              width: "100%",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <Image
              resizeMode="cover"
              source={storeFacadeImage}
              style={{ width: "100%", height: "100%" }}
            />
            <View
              className="rounded-[6px] bg-white px-[7px] py-1"
              style={{ position: "absolute", right: 10, bottom: 9 }}
            >
              <Text className="font-sans text-[9px] leading-[11px] text-[#66645F]">
                Imagem ilustrativa
              </Text>
            </View>
          </View>

          {/* Localização e funcionamento — gap 12 */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2.5">
              <MapPinOrangeIcon />
              <Text className="flex-1 font-inter-medium text-[13px] leading-[16px] text-[#1F1F1F]">
                {store.address}
              </Text>
            </View>

            <View className="flex-row items-center gap-2.5">
              <NavigationOrangeIcon />
              <Text className="flex-1 font-sans text-[13px] leading-[16px] text-[#66645F]">
                {`${store.distance || "350 m"} do endereço da busca`}
              </Text>
            </View>

            <View className="flex-row items-center gap-2.5">
              <ClockOrangeIcon />
              <Text className="flex-1 font-sans text-[13px] leading-[16px] text-[#66645F]">
                {hoursLabel}
              </Text>
            </View>

            <Text className="font-sans text-[10px] leading-[15px] text-[#66645F]">
              Dados do resultado da busca, sem atualização em tempo real.
            </Text>
          </View>

          {/* Escolha da loja para a lista — r=14, fill #FFF4E8, pad 16, gap 12 */}
          <View className="gap-3 rounded-[14px] bg-[#FFF4E8] p-4">
            <Text className="font-inter-bold text-[17px] leading-[21px] text-[#1F1F1F]">
              Sua próxima lista começa aqui
            </Text>
            <Text className="font-sans text-[12px] leading-[17px] text-[#66645F]">
              Comece com esta unidade selecionada. Depois, adicione os produtos à sua lista.
            </Text>

            <Pressable
              accessibilityRole="button"
              className="h-[50px] flex-row items-center justify-center gap-2 rounded-[12px] bg-[#F26900] active:opacity-90"
              onPress={handleCreateListHere}
            >
              <ListPlusDarkIcon />
              <Text className="font-inter-bold text-[14px] leading-[17px] text-[#1F1F1F]">
                Criar lista nesta loja
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              className="h-[40px] flex-row items-center justify-center gap-1.5"
              onPress={handleUseExistingList}
            >
              <Text className="font-inter-semibold text-[13px] leading-[16px] text-[#A74600]">
                Usar uma lista existente
              </Text>
              <ChevronRightWarmIcon />
            </Pressable>

            <Text className="font-sans text-[11px] leading-[16px] text-[#66645F]">
              Ao usar outra lista, confira os produtos nesta unidade: preços e disponibilidade podem ser diferentes.
            </Text>
          </View>
        </View>

        {/* Descoberta de produtos — pad 0/20/24/20, gap 24 */}
        <View className="gap-6 px-5 pb-6">
          {/* Busca na unidade — gap 12 */}
          <View className="gap-3">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-[#1F1F1F]">
              Explore esta loja
            </Text>
            <View className="h-[50px] flex-row items-center gap-2.5 rounded-[12px] border border-[#E8E8E0] bg-[#F7F7F3] px-3.5">
              <SearchOrangeIcon />
              <TextInput
                className="flex-1 p-0 font-sans text-[13px] leading-[16px] text-[#1F1F1F]"
                onChangeText={setProductQuery}
                placeholder="Buscar produto ou marca"
                placeholderTextColor="#66645F"
                value={productQuery}
              />
            </View>
          </View>

          {/* Categorias da loja — gap 14 */}
          <View className="gap-[14px]">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-bold text-[17px] leading-[21px] text-[#1F1F1F]">
                Explore por categoria
              </Text>
              <Pressable hitSlop={8} onPress={() => setSelectedCategory(null)}>
                <Text className="font-inter-semibold text-[11px] leading-[13px] text-[#A74600]">
                  Ver todas
                </Text>
              </Pressable>
            </View>

            <View className="flex-row items-start justify-between">
              {CATEGORIES.map(({ id, label, bg, Icon }) => {
                const isSelected = selectedCategory === id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    className="w-[76px] items-center gap-2"
                    key={id}
                    onPress={() =>
                      setSelectedCategory((prev) => (prev === id ? null : id))
                    }
                  >
                    <View
                      className={`h-16 w-16 items-center justify-center rounded-[18px] ${
                        isSelected ? "border-2 border-[#F26900]" : ""
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      <Icon />
                    </View>
                    <Text className="font-inter-medium text-[11px] leading-[13px] text-[#1F1F1F]">
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Vitrine demonstrativa — gap 14 */}
          <View className="gap-[14px]">
            <View className="gap-1.5">
              <Text className="font-inter-extrabold text-[20px] leading-[24px] text-[#F26900]">
                O básico que não pode faltar
              </Text>
              <Text className="font-sans text-[12px] leading-[17px] text-[#66645F]">
                Uma prévia para inspirar sua próxima lista.
              </Text>
            </View>

            {productPairs.map((pair, rowIndex) => (
              <View className="flex-row gap-3" key={rowIndex}>
                {pair.map((product) => (
                  <ShowcaseProductCard
                    key={product.id}
                    onPress={handleCreateListHere}
                    product={product}
                  />
                ))}
                {pair.length === 1 ? <View className="flex-1" /> : null}
              </View>
            ))}

            <Text className="font-sans text-[11px] leading-[17px] text-[#66645F]">
              Produtos e preços demonstrativos. Confirme os valores e a disponibilidade nesta unidade.
            </Text>
          </View>
        </View>

        {/* Uso do Ach.ai na unidade — pad 0/20/24/20 */}
        <View className="px-5 pb-6">
          <Pressable
            accessibilityRole="button"
            className="flex-row items-start gap-3 rounded-[14px] bg-[#F7F7F3] p-4 active:opacity-90"
            onPress={() => navigation.navigate("QrScanner")}
          >
            <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-white">
              <QrCodeOrangeIcon />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="font-inter-bold text-[14px] leading-[17px] text-[#1F1F1F]">
                Com o Ach.ai na loja
              </Text>
              <Text className="font-sans text-[12px] leading-[18px] text-[#66645F]">
                Leve sua lista com você. Se houver um QR Code Ach.ai na entrada, escaneie para acessar a orientação de compra.
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Buscar" />
    </View>
  );
}
