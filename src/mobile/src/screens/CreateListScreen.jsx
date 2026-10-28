import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { ClipPath, Defs, G, Path, Rect } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { fetchCatalog } from "../services/catalog-api";
import { addListItem, createShoppingList } from "../services/shopping-list-api";

const DEFAULT_STORE_ID = "00000000-0000-0000-0000-000000000001";

const C = {
  orange: "#F26900",
  ink: "#1F1F1F",
  muted: "#66645F",
  border: "#E8E8E0",
  peach: "#FFF4E8",
  peachBorder: "#F5B780",
};

const productImages = {
  banana: require("../assets/products/banana.png"),
  leite: require("../assets/products/leite.png"),
  arroz: require("../assets/products/arroz.png"),
  ovos: require("../assets/products/ovos.png"),
  cafe: require("../assets/products/cafe.png"),
  detergente: require("../assets/products/detergente.png"),
};

const fallbackProducts = [
  { id: 1, name: "Banana prata", size: "Porção de 1 kg", category: "Hortifruti", price: 6.99, inStock: true, location: { aisle: "Corredor 1" } },
  { id: 2, name: "Leite integral", size: "Caixa · 1 L", category: "Laticínios", price: 4.79, inStock: true, location: { aisle: "Corredor 2" } },
  { id: 3, name: "Arroz branco", size: "Tipo 1 · Pacote 5 kg", category: "Mercearia", price: 24.9, inStock: true, location: { aisle: "Corredor 3" } },
  { id: 4, name: "Ovos brancos", size: "Bandeja · 12 unidades", category: "Laticínios", price: 12.99, inStock: true, location: { aisle: "Corredor 2" } },
  { id: 5, name: "Café torrado e moído", size: "Tradicional · 500 g", category: "Mercearia", price: 18.9, inStock: true, location: { aisle: "Corredor 3" } },
  { id: 6, name: "Detergente neutro", size: "Frasco · 500 ml", category: "Limpeza", price: 2.49, inStock: true, location: { aisle: "Corredor 4" } },
];

const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace(".", ",")}`;

function enrichProduct(product) {
  const lower = `${product.name || ""}`.toLocaleLowerCase("pt-BR");
  if (lower.includes("banana")) {
    return {
      ...product,
      displayName: "Banana prata",
      package: product.size || "Porção de 1 kg",
      summaryUnit: "1 kg",
      image: productImages.banana,
      showcaseOrder: 1,
    };
  }
  if (lower.includes("leite")) {
    return {
      ...product,
      displayName: "Leite integral",
      package: product.size || "Caixa · 1 L",
      summaryUnit: "1 L",
      image: productImages.leite,
      showcaseOrder: 2,
    };
  }
  if (lower.includes("arroz")) {
    return {
      ...product,
      displayName: "Arroz branco",
      package: product.size || "Tipo 1 · Pacote 5 kg",
      summaryUnit: "5 kg",
      image: productImages.arroz,
      showcaseOrder: 3,
    };
  }
  if (lower.includes("ovo")) {
    return {
      ...product,
      displayName: "Ovos brancos",
      package: product.size || "Bandeja · 12 unidades",
      summaryUnit: "12 unidades",
      image: productImages.ovos,
      showcaseOrder: 4,
    };
  }
  if (lower.includes("café") || lower.includes("cafe")) {
    return {
      ...product,
      displayName: "Café torrado e moído",
      package: product.size || "Tradicional · 500 g",
      summaryUnit: "500 g",
      image: productImages.cafe,
      showcaseOrder: 5,
    };
  }
  if (lower.includes("detergente")) {
    return {
      ...product,
      displayName: "Detergente neutro",
      package: product.size || "Frasco · 500 ml",
      summaryUnit: "500 ml",
      image: productImages.detergente,
      showcaseOrder: 6,
    };
  }
  const categoryImageMap = {
    Hortifruti: productImages.banana,
    Laticínios: productImages.leite,
    Mercearia: productImages.arroz,
    Limpeza: productImages.detergente,
  };
  return {
    ...product,
    displayName: product.name,
    package: [product.brand, product.size].filter(Boolean).join(" · ") || product.size || "Tamanho não informado",
    summaryUnit: product.size || "",
    image: categoryImageMap[product.category] || productImages.arroz,
    showcaseOrder: 99,
  };
}

/* ---------- Ícones (SVG exportados do Figma, stroke 1.8) ---------- */

const stroke = { strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 15L7.5 10L12.5 5" stroke={C.orange} {...stroke} />
    </Svg>
  );
}

function PencilIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clipPencil">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clipPencil)">
        <Path
          d="M10.0002 3.33273L10.0048 3.33733M10.0048 3.33733L12.6627 5.9949M10.0048 3.33733L11.459 1.88301C11.8115 1.53063 12.2895 1.3327 12.788 1.33276C13.2864 1.33283 13.7644 1.53087 14.1169 1.88334C14.4693 2.23581 14.6672 2.71382 14.6672 3.21222C14.6671 3.71062 14.469 4.18858 14.1165 4.54096L12.6627 5.9949M10.0048 3.33733L2.56083 10.7822C2.40603 10.9365 2.29155 11.1265 2.22747 11.3355L1.34672 14.2368C1.32949 14.2945 1.32819 14.3557 1.34295 14.414C1.35772 14.4724 1.38801 14.5256 1.43059 14.5681C1.47318 14.6106 1.52648 14.6408 1.58485 14.6555C1.64321 14.6702 1.70446 14.6688 1.76209 14.6515L4.66435 13.7715C4.87315 13.708 5.06317 13.5942 5.21773 13.4401L12.6627 5.9949M12.6627 5.9949L12.6671 5.99935"
          stroke={C.muted}
          {...stroke}
        />
      </G>
    </Svg>
  );
}

function StoreIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M13.7501 19.2493V14.666C13.7501 14.4229 13.6535 14.1897 13.4816 14.0178C13.3097 13.8459 13.0765 13.7493 12.8334 13.7493H9.16675C8.92363 13.7493 8.69048 13.8459 8.51857 14.0178C8.34666 14.1897 8.25008 14.4229 8.25008 14.666V19.2493M16.2929 9.45014C16.1018 9.26721 15.8475 9.1651 15.5829 9.1651C15.3184 9.1651 15.064 9.26721 14.873 9.45014C14.4467 9.8567 13.8803 10.0835 13.2912 10.0835C12.7022 10.0835 12.1358 9.8567 11.7095 9.45014C11.5185 9.26748 11.2644 9.16554 11 9.16554C10.7357 9.16554 10.4816 9.26748 10.2905 9.45014C9.86425 9.85697 9.29763 10.084 8.70837 10.084C8.11911 10.084 7.55249 9.85697 7.1262 9.45014C6.93511 9.26721 6.68078 9.1651 6.41625 9.1651C6.15171 9.1651 5.89738 9.26721 5.70629 9.45014C5.29456 9.84304 4.75137 10.0687 4.18245 10.0831C4.00811 10.0876 3.83517 10.0721 3.66675 10.0378M3.66675 10.0378C3.28555 9.96011 2.92744 9.78604 2.6284 9.52841C2.19724 9.15694 1.91972 8.63834 1.84986 8.07353C1.78 7.50873 1.92279 6.93813 2.25045 6.47281L4.8987 2.63748C5.06674 2.38953 5.29296 2.18652 5.55758 2.04622C5.82221 1.90592 6.11718 1.83259 6.4167 1.83264H15.5834C15.882 1.83253 16.1762 1.90537 16.4402 2.04484C16.7043 2.18431 16.9303 2.38618 17.0986 2.63289L19.7524 6.47556C20.0801 6.94125 20.2227 7.51228 20.1524 8.07738C20.0821 8.64248 19.804 9.16116 19.3721 9.53236C19.0728 9.7896 18.7146 9.96325 18.3334 10.0405M3.66675 10.0378V10.037M3.66675 10.0378V17.4162C3.66675 17.9024 3.8599 18.3687 4.20372 18.7125C4.54754 19.0563 5.01385 19.2495 5.50008 19.2495H16.5001C16.9863 19.2495 17.4526 19.0563 17.7964 18.7125C18.1403 18.3687 18.3334 17.9024 18.3334 17.4162V10.0405M18.3334 10.0405C18.1646 10.0747 17.9912 10.09 17.8164 10.0853C17.2472 10.0699 16.7041 9.84318 16.2929 9.44922M18.3334 10.0405V10.037"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="M4 6L8 10L12 6" stroke={C.orange} {...stroke} />
    </Svg>
  );
}

function SearchIcon({ color = C.orange }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M18.3751 18.3751L14.5776 14.5776M16.625 9.625C16.625 13.491 13.491 16.625 9.625 16.625C5.75901 16.625 2.625 13.491 2.625 9.625C2.625 5.75901 5.75901 2.625 9.625 2.625C13.491 2.625 16.625 5.75901 16.625 9.625Z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function CarrotIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M10.8004 17.5003L8.23787 14.9501M19.1753 18.7504L19.1529 18.7279M19.1529 18.7279L16.1003 15.6751M19.1529 18.7279C19.027 18.8839 18.8927 19.0333 18.7503 19.1754C15.1753 22.7507 2.83789 27.126 2.83789 27.126C2.83789 27.126 7.21288 14.8 10.8004 11.2123C11.3232 10.6902 11.9437 10.2763 12.6265 9.99405C13.3093 9.71183 14.041 9.56688 14.7798 9.56746C15.5186 9.56804 16.25 9.71414 16.9324 9.99743C17.266 10.136 17.5848 10.306 17.8844 10.5047M19.1529 18.7279C19.4893 18.3111 19.7652 17.8476 19.9713 17.351C20.2546 16.6686 20.4007 15.9371 20.4012 15.1982C20.4018 14.4594 20.2569 13.7276 19.9747 13.0448C19.8358 12.7086 19.6649 12.3876 19.465 12.0858M18.7509 11.2497C18.7509 11.2497 18.757 11.2432 18.7688 11.2308M18.7509 11.2497C18.7509 11.2497 19.0008 11.6256 19.465 12.0858M18.7509 11.2497C18.7509 11.2497 18.3584 10.9887 17.8844 10.5047M18.7509 11.2497C18.7509 11.2497 18.7575 11.2437 18.7699 11.2319M18.7688 11.2308C18.8102 11.1873 18.9222 11.0715 19.0897 10.9124M18.7688 11.2308C18.7692 11.2312 18.7696 11.2316 18.7699 11.2319M18.7688 11.2308C18.7647 11.2267 18.7607 11.2226 18.7566 11.2185C18.4898 10.9513 18.1976 10.7123 17.8844 10.5047M19.0897 10.9124C19.8082 10.2299 21.5485 8.74952 23.1259 8.74952C25.8384 8.74952 27.5009 11.2497 27.5009 11.2497C27.5009 11.2497 25.8384 13.7499 23.1259 13.7499C21.4651 13.7499 20.1979 12.8126 19.465 12.0858M19.0897 10.9124C19.7728 10.1987 21.2509 8.47002 21.2509 6.87437C21.2509 4.16166 18.7509 2.49902 18.7509 2.49902C18.7509 2.49902 16.2509 4.16166 16.2509 6.87437C16.2509 8.51219 17.1622 9.76723 17.8844 10.5047M19.0897 10.9124C18.9299 11.0793 18.8137 11.1907 18.7699 11.2319M19.465 12.0858C19.2623 11.7799 19.0296 11.4938 18.7699 11.2319"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function MilkIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M10.0008 2.49902H11.2506M11.2506 2.49902H18.7494M11.2506 2.49902V5.98555C11.2506 6.97287 10.9583 7.93808 10.4107 8.75952L9.59084 9.98962C9.043 10.8114 8.75076 11.7771 8.75098 12.7648V18.7508M18.7494 2.49902H19.9992M18.7494 2.49902V5.9843C18.7492 6.97204 19.0414 7.93772 19.5892 8.75952L20.4091 9.98962C20.9567 10.8111 21.249 11.7763 21.249 12.7636V18.7508M8.75098 18.7508V25.0008C8.75098 25.6639 9.01433 26.2999 9.48309 26.7687C9.95186 27.2376 10.5876 27.501 11.2506 27.501H18.7494C19.4123 27.501 20.0481 27.2376 20.5169 26.7687C20.9856 26.2999 21.249 25.6639 21.249 25.0008V18.7508M8.75098 18.7508C9.74054 18.3363 10.8026 18.1228 11.8755 18.1228C12.9483 18.1228 14.0104 18.3363 15 18.7508C15.9895 19.1655 17.0516 19.379 18.1245 19.379C19.1973 19.379 20.2595 19.1655 21.249 18.7508"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function WheatIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M2.49902 27.501L6.24961 23.7504M6.24961 23.7504L8.19867 21.8014M6.24961 23.7504L4.33724 21.8381C3.52043 21.018 3.06181 19.9078 3.06181 18.7503C3.06181 17.5929 3.52043 16.4826 4.33724 15.6626L6.2499 13.7499L8.16255 15.6626C8.97936 16.4826 9.43798 17.5929 9.43798 18.7503C9.43798 19.8906 8.99287 20.9851 8.19867 21.8014M8.16255 21.8381C8.98259 21.0213 10.0923 20.5632 11.2497 20.5632C12.4072 20.5632 13.5174 21.0218 14.3375 21.8386L16.2501 23.7513L14.3375 25.6639C13.5174 26.4808 12.4072 26.9394 11.2497 26.9394C10.0923 26.9394 8.98201 26.4808 8.16198 25.6639L6.2499 23.7507L6.24961 23.7504M8.19867 21.8014L11.25 18.75M8.19867 21.8014C8.18671 21.8137 8.17467 21.8259 8.16255 21.8381M11.25 18.75L13.1991 16.801M11.25 18.75L9.33764 16.8377C8.52083 16.0176 8.06221 14.9074 8.06221 13.7499C8.06221 12.5925 8.52083 11.4822 9.33764 10.6622L11.2503 8.74952L13.1629 10.6622C13.9798 11.4822 14.4384 12.5925 14.4384 13.7499C14.4384 14.8902 13.9933 15.9847 13.1991 16.801M11.25 18.75L11.2503 18.7503M13.1991 16.801L16.2504 13.7496M13.1991 16.801C13.1871 16.8133 13.1751 16.8255 13.1629 16.8377M16.2504 13.7496L18.1995 11.8005M16.2504 13.7496L14.338 11.8373C13.5212 11.0172 13.0626 9.90696 13.0626 8.74952C13.0626 7.59209 13.5212 6.48181 14.338 5.66178L16.2507 3.74912L18.1633 5.66178C18.9802 6.48181 19.4388 7.59209 19.4388 8.74952C19.4388 9.88977 18.9937 10.9842 18.1995 11.8005M16.2504 13.7496L16.2507 13.7499M18.1995 11.8005L20.0004 9.99962M18.1995 11.8005C18.1875 11.8128 18.1755 11.8251 18.1633 11.8373M20.0004 9.99962H22.5006C23.8268 9.99962 25.0987 9.4728 26.0364 8.53504C26.9742 7.59728 27.501 6.32541 27.501 4.99922V2.49902H25.0008C23.6746 2.49902 22.4028 3.02585 21.465 3.96361C20.5273 4.90136 20.0004 6.17323 20.0004 7.49942V9.99962ZM8.16255 21.8381L6.2499 23.7507M13.1629 16.8377L11.2503 18.7503M13.1629 16.8377C13.983 16.0209 15.0927 15.5628 16.2501 15.5628C17.4076 15.5628 18.5178 16.0214 19.3379 16.8382L21.2505 18.7509L19.3379 20.6635C18.5178 21.4804 17.4076 21.939 16.2501 21.939C15.0927 21.939 13.9824 21.4804 13.1624 20.6635L11.2503 18.7503M18.1633 11.8373L16.2507 13.7499M18.1633 11.8373C18.9834 11.0205 20.0931 10.5624 21.2505 10.5624C22.408 10.5624 23.5182 11.021 24.3383 11.8378L26.2509 13.7505L24.3383 15.6631C23.5182 16.48 22.408 16.9386 21.2505 16.9386C20.0931 16.9386 18.9828 16.48 18.1628 15.6631L16.2507 13.7499"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function SprayCanIcon() {
  return (
    <Svg width={30} height={30} viewBox="0 0 30 30" fill="none">
      <Path
        d="M3.75 3.75H3.7625M8.75 6.25H8.7625M13.75 8.75H13.7625M3.75 8.75H3.7625M8.75 11.25H8.7625M3.75 13.75H3.7625M23.75 11.25V6.25H18.75V11.25M23.75 11.25H18.75M23.75 11.25L26.25 13.75V15M18.75 11.25L16.25 13.75V17.5M26.25 15V21.25M26.25 15L16.25 17.5M26.25 21.25V26.25C26.25 27 25.75 27.5 25 27.5H17.5C16.75 27.5 16.25 27 16.25 26.25V23.75M26.25 21.25L16.25 23.75M16.25 23.75V17.5"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function CroissantIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4.6 13.11l5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11zM18 14c1.77 1.67 3.5 2.5 5 1 1.5-1.5-.5-4-2-5.5-1.5-1.5-3.5-2.5-5-1M10 6C8.33 4.23 7.5 2.5 9 1c1.5-1.5 4 .5 5.5 2 1.5 1.5 2.5 3.5 1 5"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function BeefIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3zM18.5 6v.5a6.5 6.5 0 0 1-2.1 4.77C13.4 13.8 9 15.5 5 15.5a3 3 0 0 1-2.68-1.66L2 14.5a3 3 0 0 0 3 3.5c4 0 8.4-1.8 11.4-4.3A6.5 6.5 0 0 0 18.5 9V6zM12.5 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function CupSodaIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8l1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8M5 8h14M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0M12 8l1-6h3"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function SnowflakeIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function SparklesIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0zM20 3v4M22 5h-4M4 17v2M5 18H3"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function PawPrintIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM9 17c1.5-2 4.5-2 6 0 1.2 1.6.4 4-1.6 4H10.6c-2 0-2.8-2.4-1.6-4z"
        stroke={C.orange}
        {...stroke}
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
      <Path d="M9.16634 2.75L4.12518 7.7913L1.83374 5.4998" stroke={C.orange} {...stroke} />
    </Svg>
  );
}

function MinusIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Path d="M3.54102 8.5H13.4588" stroke={C.orange} {...stroke} />
    </Svg>
  );
}

function PlusIcon({ size = 17, color = C.orange }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M3.33276 8.00002H7.99996M7.99996 8.00002H12.6672M7.99996 8.00002V3.33282M7.99996 8.00002V12.6672" stroke={color} {...stroke} />
    </Svg>
  );
}

function ListChecksIcon() {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M11.375 4.3743H18.375M11.375 10.5H18.375M11.375 16.6257H18.375M2.625 14.8755L4.375 16.6257L7.875 13.1253M2.625 6.1245L4.375 7.8747L7.875 4.3743"
        stroke={C.ink}
        {...stroke}
      />
    </Svg>
  );
}

function HouseIcon({ color }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M13.125 18.3743V11.3743C13.125 11.1422 13.0328 10.9197 12.8687 10.7556C12.7046 10.5915 12.4821 10.4993 12.25 10.4993H8.75C8.51794 10.4993 8.29538 10.5915 8.13128 10.7556C7.96719 10.9197 7.875 11.1422 7.875 11.3743V18.3743M2.625 8.74972C2.62494 8.49515 2.68042 8.24364 2.78756 8.01272C2.89471 7.7818 3.05095 7.57704 3.24538 7.41272L9.37037 2.16272C9.68624 1.89576 10.0864 1.7493 10.5 1.7493C10.9136 1.7493 11.3138 1.89576 11.6296 2.16272L17.7546 7.41272C17.9491 7.57704 18.1053 7.7818 18.2124 8.01272C18.3196 8.24364 18.3751 8.49515 18.375 8.74972V16.6247C18.375 17.0888 18.1906 17.534 17.8624 17.8622C17.5342 18.1903 17.0891 18.3747 16.625 18.3747H4.375C3.91087 18.3747 3.46575 18.1903 3.13756 17.8622C2.80937 17.534 2.625 17.0888 2.625 16.6247V8.74972Z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function ListIcon({ color }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path d="M2.625 4.3743H2.63375M2.625 10.5H2.63375M2.625 16.6257H2.63375M7 4.3743H18.375M7 10.5H18.375M7 16.6257H18.375" stroke={color} {...stroke} />
    </Svg>
  );
}

function UserIcon({ color }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M15.7504 17.5006C15.7504 16.1081 15.1972 14.7726 14.2126 13.788C13.2279 12.8033 11.8925 12.2501 10.5 12.2501M10.5 12.2501C9.10747 12.2501 7.772 12.8033 6.78736 13.788C5.80272 14.7726 5.24955 16.1081 5.24955 17.5006M10.5 12.2501C12.4331 12.2501 14.0002 10.683 14.0002 8.74986C14.0002 6.81671 12.4331 5.24958 10.5 5.24958C8.56682 5.24958 6.99969 6.81671 6.99969 8.74986C6.99969 10.683 8.56682 12.2501 10.5 12.2501ZM19.2507 10.5C19.2507 15.3329 15.3328 19.2507 10.5 19.2507C5.66709 19.2507 1.74927 15.3329 1.74927 10.5C1.74927 5.66712 5.66709 1.7493 10.5 1.7493C15.3328 1.7493 19.2507 5.66712 19.2507 10.5Z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

const categories = [
  { label: "Hortifruti", bg: "#EDF3E7", Icon: CarrotIcon },
  { label: "Laticínios", bg: "#EDF3F7", Icon: MilkIcon },
  { label: "Mercearia", bg: "#FBF3DD", Icon: WheatIcon },
  { label: "Limpeza", bg: "#FFF4E8", Icon: SprayCanIcon },
  { label: "Padaria", bg: "#F9EFE4", Icon: CroissantIcon },
  { label: "Carnes", bg: "#FCEAEA", Icon: BeefIcon },
  { label: "Bebidas", bg: "#EAF4F4", Icon: CupSodaIcon },
  { label: "Congelados", bg: "#EBF1FA", Icon: SnowflakeIcon },
  { label: "Higiene", bg: "#F3EDF9", Icon: SparklesIcon },
  { label: "Pet", bg: "#F5EFE6", Icon: PawPrintIcon },
];

/* ---------- Componentes ---------- */

function ProductCard({ product, quantity, onChangeQuantity }) {
  const canAdd = product.inStock !== false;
  const selected = Boolean(quantity);
  const title = product.displayName || product.name;

  return (
    <View
      className="flex-1 gap-[9px] rounded-[14px] border bg-white p-3"
      style={{ borderColor: selected ? C.peachBorder : C.border }}
    >
      {/* Imagem e seleção (145x118, imagem alinhada embaixo) */}
      <View style={{ height: 118, justifyContent: "flex-end" }}>
        <View style={{ height: 102, width: "100%", overflow: "hidden" }}>
          <Image source={product.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        </View>
        {selected ? (
          <View className="absolute left-0 top-0 h-5 flex-row items-center gap-[3px] rounded-[6px] bg-[#FFF4E8] px-1.5 py-1">
            <CheckIcon />
            <Text className="font-inter-semibold text-[10px] leading-[12px] text-achai">Na lista</Text>
          </View>
        ) : null}
      </View>

      {/* Detalhes */}
      <View className="gap-1">
        <Text className="font-inter-semibold text-[13px] leading-[17px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="font-sans text-[11px] leading-[13px] text-[#66645F]" numberOfLines={1}>
          {product.package}
        </Text>
      </View>

      <Text className="font-inter-bold text-[17px] leading-[21px] text-ink">{money(product.price)}</Text>

      {!canAdd ? (
        <Text className="font-sans text-[10px] leading-[13px] text-[#b42318]">Fora de estoque</Text>
      ) : null}
      {!product.location ? (
        <Text className="font-sans text-[10px] leading-[13px] text-[#b05b00]">Sem localização</Text>
      ) : null}

      {selected ? (
        <View className="h-9 flex-row items-center justify-between rounded-[10px] bg-[#FFF4E8] px-2.5">
          <Pressable
            accessibilityLabel={`Remover uma unidade de ${title}`}
            hitSlop={8}
            onPress={() => onChangeQuantity(-1)}
          >
            <MinusIcon />
          </Pressable>
          <Text className="font-inter-bold text-[14px] leading-[17px] text-ink">{quantity}</Text>
          <Pressable
            accessibilityLabel={`Adicionar uma unidade de ${title}`}
            hitSlop={8}
            onPress={() => onChangeQuantity(1)}
          >
            <PlusIcon />
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityLabel={canAdd ? `Adicionar ${title}` : `${title} fora de estoque`}
          className={`h-9 flex-row items-center justify-center gap-1.5 rounded-[10px] ${
            canAdd ? "bg-achai" : "bg-[#e7e7e2]"
          }`}
          disabled={!canAdd}
          onPress={() => onChangeQuantity(1)}
        >
          <PlusIcon size={16} color={C.ink} />
          <Text className="font-inter-semibold text-[12px] leading-[15px] text-ink">Adicionar</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- Tela ---------- */

export function CreateListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth, currentStore } = useAuth();
  const listNameInputRef = useRef(null);
  const existingList = route?.params?.list || null;
  const [listName, setListName] = useState(existingList?.name || "Compra da semana");
  const [products, setProducts] = useState(() => fallbackProducts.map(enrichProduct));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [quantities, setQuantities] = useState(() => {
    if (Array.isArray(existingList?.items) && existingList.items.length > 0) {
      const initial = {};
      for (const item of existingList.items) {
        if (item?.productId && item?.quantity > 0) {
          initial[item.productId] = item.quantity;
        }
      }
      return initial;
    }
    return existingList ? {} : { 1: 1, 2: 2 };
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeStoreId = currentStore?.id || DEFAULT_STORE_ID;

  useEffect(() => {
    let active = true;
    if (!auth?.token) {
      return undefined;
    }
    setLoading(true);
    fetchCatalog(auth.token, activeStoreId)
      .then((items) => {
        if (active && Array.isArray(items) && items.length > 0) {
          const enriched = items
            .map(enrichProduct)
            .sort((a, b) => (a.showcaseOrder || 99) - (b.showcaseOrder || 99));
          setProducts(enriched);
        }
      })
      .catch(() => {
        // Mantém os produtos demonstrativos caso a API não responda
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, activeStoreId]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const filtered = products.filter((product) => {
      const matchesSearch =
        !term ||
        `${product.displayName || ""} ${product.name || ""} ${product.brand || ""} ${product.category || ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(term);
      return matchesSearch && (!category || product.category === category);
    });
    if (!term && !category) {
      const showcase = filtered.filter((p) => p.showcaseOrder && p.showcaseOrder <= 6);
      if (showcase.length === 6) return showcase;
    }
    return filtered;
  }, [category, products, search]);

  const rows = useMemo(() => {
    const chunked = [];
    for (let index = 0; index < visibleProducts.length; index += 2) {
      chunked.push(visibleProducts.slice(index, index + 2));
    }
    return chunked;
  }, [visibleProducts]);

  const selectedProducts = products.filter((product) => quantities[product.id]);
  const itemCount = selectedProducts.reduce((totalCount, product) => totalCount + quantities[product.id], 0);
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
    if (itemCount === 0) {
      Alert.alert("Lista vazia", "Adicione pelo menos um produto à lista.");
      return;
    }
    setSaving(true);
    try {
      const { list } = await createShoppingList(auth?.token, activeStoreId, listName);
      for (const product of selectedProducts) {
        await addListItem(auth?.token, list.id, product.id, quantities[product.id]);
      }
      navigation.navigate("Route", { listId: list.id, hasLocationWarning });
    } catch (error) {
      Alert.alert("Não foi possível criar a lista", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MyLists");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cabeçalho e campos — pad 16/20/20/20, gap 20 */}
        <View className="gap-5 px-5 pb-5" style={{ paddingTop: Math.max(insets.top, 44) + 16 }}>
          {/* Navegação de retorno */}
          <View className="h-6 flex-row items-center justify-between">
            <Pressable className="flex-row items-center gap-1" onPress={handleGoBack}>
              <ChevronLeftIcon />
              <Text className="font-inter-semibold text-[13px] leading-[16px] text-achai">Minhas listas</Text>
            </Pressable>
            <Text className="font-brand text-[20px] leading-[24px] text-ink">Ach.ai</Text>
          </View>

          {/* Apresentação — gap 6 */}
          <View className="gap-1.5">
            <Text className="font-inter-extrabold text-[30px] leading-[36px] text-achai">Criar nova lista</Text>
            <Text className="font-sans text-[13px] leading-[16px] text-[#66645F]">
              Marina, o que não pode faltar na sua semana?
            </Text>
          </View>

          {/* Nome da lista — gap 7 */}
          <View className="gap-[7px]">
            <Text className="font-inter-semibold text-[12px] leading-[15px] text-[#66645F]">Nome da lista</Text>
            <View className="h-12 flex-row items-center justify-between rounded-[12px] border border-[#E8E8E0] px-3.5">
              <TextInput
                ref={listNameInputRef}
                className="flex-1 p-0 font-inter-semibold text-[15px] leading-[18px] text-ink"
                onChangeText={setListName}
                value={listName}
              />
              <Pressable
                accessibilityLabel="Editar nome da lista"
                hitSlop={8}
                onPress={() => listNameInputRef.current?.focus()}
              >
                <PencilIcon />
              </Pressable>
            </View>
          </View>

          {/* Seletor de supermercado — pad 12, gap 12 */}
          <Pressable
            accessibilityRole="button"
            className="h-16 flex-row items-center gap-3 rounded-[14px] bg-[#FFF4E8] p-3"
            onPress={() => navigation.navigate("QrScanner")}
          >
            <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-white">
              <StoreIcon />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans text-[11px] leading-[13px] text-[#66645F]">Supermercado da lista</Text>
              <Text className="font-inter-bold text-[15px] leading-[18px] text-ink" numberOfLines={1}>
                {currentStore?.name || "Mercado Aurora"}
              </Text>
            </View>
            <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">Trocar</Text>
            <ChevronDownIcon />
          </Pressable>
        </View>

        {/* Vitrine do supermercado — pad 0/20/24/20, gap 24 */}
        <View className="gap-6 px-5 pb-6">
          {/* Busca de produtos */}
          <View className="h-[50px] flex-row items-center gap-2.5 rounded-[12px] border border-[#E8E8E0] bg-[#F7F7F3] px-3.5">
            <SearchIcon />
            <TextInput
              className="flex-1 p-0 font-sans text-[14px] leading-[17px] text-ink"
              onChangeText={setSearch}
              placeholder="Buscar produto ou marca"
              placeholderTextColor={C.muted}
              value={search}
            />
          </View>

          {/* Categorias — gap 14, scroll lateral sem "Ver todas" */}
          <View className="gap-3.5">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
              Explore por categoria
            </Text>
            <ScrollView
              contentContainerStyle={{ gap: 15, paddingRight: 4 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categories.map(({ label, bg, Icon }) => {
                const isSelected = category === label;
                return (
                  <Pressable
                    key={label}
                    className="w-[76px] items-center gap-2"
                    onPress={() => setCategory(isSelected ? "" : label)}
                  >
                    <View
                      className={`h-16 w-16 items-center justify-center rounded-[18px] ${
                        isSelected ? "border-2 border-achai" : ""
                      }`}
                      style={{ backgroundColor: bg }}
                    >
                      <Icon />
                    </View>
                    <Text className="font-inter-medium text-[11px] leading-[13px] text-ink" numberOfLines={1}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Produtos para a semana — gap 14 */}
          <View className="gap-3.5">
            <View className="gap-[5px]">
              <Text className="font-inter-extrabold text-[21px] leading-[25px] text-achai">
                O básico que não pode faltar
              </Text>
              <Text className="font-sans text-[12px] leading-[15px] text-[#66645F]">
                {loading ? "Carregando produtos..." : "Escolha os produtos e ajuste as quantidades."}
              </Text>
            </View>

            {rows.map((row, index) => (
              <View key={index} className="flex-row gap-3">
                {row.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id] || 0}
                    onChangeQuantity={(delta) => changeQuantity(product.id, delta)}
                  />
                ))}
                {row.length === 1 ? <View className="flex-1" /> : null}
              </View>
            ))}

            {!loading && visibleProducts.length === 0 ? (
              <Text className="font-sans text-center text-[12px] leading-[15px] text-[#66645F]">
                Nenhum produto encontrado.
              </Text>
            ) : null}

            <Text className="font-sans text-[10px] leading-[14px] text-[#66645F]">
              Preços demonstrativos. Os valores podem variar na loja.
            </Text>
            {hasLocationWarning ? (
              <Text className="font-sans text-[11px] leading-[14px] text-[#b05b00]">
                Alguns itens não possuem localização e ficarão fora da rota.
              </Text>
            ) : null}
          </View>
        </View>

        {/* Resumo e criação da lista — pad 20/20/24/20, gap 16 */}
        <View className="gap-4 bg-[#FFF4E8] px-5 pb-6 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">Sua lista até aqui</Text>
            <Text className="font-inter-semibold text-[12px] leading-[15px] text-achai">
              {itemCount} itens · {selectedProducts.length} produtos
            </Text>
          </View>

          {selectedProducts.length > 0 ? (
            <View className="gap-2.5">
              {selectedProducts.map((product) => {
                const title = product.displayName || product.name;
                const unitSuffix = product.summaryUnit ? ` · ${product.summaryUnit}` : "";
                return (
                  <View className="flex-row justify-between" key={product.id}>
                    <Text className="font-sans text-[12px] leading-[15px] text-[#66645F]">
                      {quantities[product.id]} × {title}
                      {unitSuffix}
                    </Text>
                    <Text className="font-inter-semibold text-[12px] leading-[15px] text-ink">
                      {money(Number(product.price || 0) * quantities[product.id])}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          <View className="flex-row items-center justify-between border-t border-[#F5B780] pt-3">
            <Text className="font-sans text-[13px] leading-[16px] text-[#66645F]">Total estimado</Text>
            <Text className="font-inter-extrabold text-[21px] leading-[25px] text-ink">{money(total)}</Text>
          </View>

          <Pressable
            className={`h-[50px] flex-row items-center justify-center gap-2.5 rounded-[14px] ${
              saving ? "bg-[#e7e7e2]" : "bg-achai"
            }`}
            disabled={saving}
            onPress={saveList}
          >
            <ListChecksIcon />
            <Text className="font-inter-bold text-[15px] leading-[18px] text-ink">
              {saving ? "Salvando..." : `Criar lista com ${itemCount} itens`}
            </Text>
          </Pressable>

          <Text className="text-center font-sans text-[11px] leading-[13px] text-[#66645F]">
            Você pode editar sua lista depois de criar.
          </Text>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Listas" />
    </View>
  );
}
