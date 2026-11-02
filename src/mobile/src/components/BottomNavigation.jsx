import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const ORANGE = "#F26900";
const MUTED = "#66645F";
const stroke = { strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

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

function SearchIcon({ color }) {
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

function ListIcon({ color }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path
        d="M2.625 4.3743H2.63375M2.625 10.5H2.63375M2.625 16.6257H2.63375M7 4.3743H18.375M7 10.5H18.375M7 16.6257H18.375"
        stroke={color}
        {...stroke}
      />
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

const navItems = [
  { label: "Início", Icon: HouseIcon, route: "Home" },
  { label: "Buscar", Icon: SearchIcon, route: "Catalog" },
  { label: "Listas", Icon: ListIcon, route: "MyLists" },
  { label: "Perfil", Icon: UserIcon, route: "Profile" },
];

export function BottomNavigation({ navigation, activeTab }) {
  const insets = useSafeAreaInsets();

  return (
    <View className="border-t border-[#E8E8E0] bg-white" style={{ paddingBottom: Math.max(insets.bottom, 22) }}>
      <View className="h-[50px] flex-row pt-2.5">
        {navItems.map(({ label, Icon, route }) => {
          const active = label === activeTab;
          return (
            <Pressable
              key={label}
              className="flex-1 items-center gap-1.5"
              onPress={() => route && navigation.navigate(route)}
            >
              <Icon color={active ? ORANGE : MUTED} />
              <Text
                className={`text-[11px] leading-[13px] ${
                  active ? "font-inter-semibold text-achai" : "font-sans text-[#66645F]"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
