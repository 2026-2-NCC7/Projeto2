import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";

const ORANGE = "#F26900";
const stroke = { strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function VerifiedBadgeIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5C6.20101 1.5 1.5 6.20101 1.5 12C1.5 17.799 6.20101 22.5 12 22.5Z"
        fill={ORANGE}
        stroke="#FFFFFF"
        strokeWidth={3}
      />
      <Path
        d="M7.80005 12.1L10.5 14.8L16.2 9.1"
        stroke="#FFFFFF"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PersonalDataIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 8C16 10.2091 14.2091 12 12 12C9.79086 12 8 10.2091 8 8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8Z"
        stroke={ORANGE}
        {...stroke}
      />
      <Path
        d="M4 21V19C4 16.8783 4.84285 14.8434 6.34315 13.3431C7.84344 11.8429 9.87827 11 12 11C14.1217 11 16.1566 11.8429 17.6569 13.3431C19.1571 14.8434 20 16.8783 20 19V21"
        stroke={ORANGE}
        {...stroke}
      />
    </Svg>
  );
}

function PreferencesIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7H13M17 7H20M4 17H7M11 17H20" stroke={ORANGE} {...stroke} />
      <Path
        d="M17 7C17 8.10457 16.1046 9 15 9C13.8954 9 13 8.10457 13 7C13 5.89543 13.8954 5 15 5C16.1046 5 17 5.89543 17 7Z"
        stroke={ORANGE}
        {...stroke}
      />
      <Path
        d="M11 17C11 18.1046 10.1046 19 9 19C7.89543 19 7 18.1046 7 17C7 15.8954 7.89543 15 9 15C10.1046 15 11 15.8954 11 17Z"
        stroke={ORANGE}
        {...stroke}
      />
    </Svg>
  );
}

function PrivacyIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3L3.5 6.5V12C3.5 17 12 21 12 21C12 21 20.5 17 20.5 12V6.5L12 3Z" stroke={ORANGE} {...stroke} />
      <Path d="M8.5 12L11 14.5L15.5 9.5" stroke={ORANGE} {...stroke} />
    </Svg>
  );
}

function SecurityIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 10H17C18.1046 10 19 10.8954 19 12V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V12C5 10.8954 5.89543 10 7 10Z"
        stroke={ORANGE}
        {...stroke}
      />
      <Path
        d="M8 10V7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7V10M12 15V17"
        stroke={ORANGE}
        {...stroke}
      />
    </Svg>
  );
}

function HelpIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke={ORANGE}
        {...stroke}
      />
      <Path
        d="M9.1001 8.99997C9.34885 8.35161 9.81484 7.80962 10.4186 7.46646C11.0223 7.1233 11.7264 7.00022 12.4107 7.11821C13.0951 7.2362 13.7173 7.58796 14.1713 8.11348C14.6252 8.639 14.8828 9.30574 14.9001 9.99997C14.9001 12 11.9001 12.4 11.9001 14"
        stroke={ORANGE}
        {...stroke}
      />
      <Path
        d="M12 17.8C12.4418 17.8 12.8 17.4418 12.8 17C12.8 16.5582 12.4418 16.2 12 16.2C11.5581 16.2 11.2 16.5582 11.2 17C11.2 17.4418 11.5581 17.8 12 17.8Z"
        fill="#1F1F1F"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 18, color = ORANGE }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M7.5 15L12.5 10L7.5 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const settingsItems = [
  {
    id: "personal-data",
    title: "Dados pessoais",
    detail: "Gerencie suas informações",
    Icon: PersonalDataIcon,
    route: "PersonalData",
  },
  {
    id: "preferences",
    title: "Preferências",
    detail: "Personalize sua experiência",
    Icon: PreferencesIcon,
    route: "Preferences",
  },
  {
    id: "privacy",
    title: "Privacidade e dados",
    detail: "Controle seus dados",
    Icon: PrivacyIcon,
    route: "Privacy",
  },
  {
    id: "security",
    title: "Segurança",
    detail: "Senha e acesso",
    Icon: SecurityIcon,
    route: "Security",
  },
  {
    id: "help",
    title: "Ajuda",
    detail: "Fale com a equipe",
    Icon: HelpIcon,
    route: "Help",
  },
];

function SettingsCard({ item, onPress }) {
  const { Icon, title, detail } = item;
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[74px] flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-[11px]"
      onPress={onPress}
    >
      <View className="h-12 w-12 items-center justify-center rounded-[12px] bg-[#FFF4E8]">
        <Icon />
      </View>

      <View className="ml-[13px] flex-1">
        <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink" numberOfLines={1}>
          {title}
        </Text>
        <Text className="mt-2 font-sans text-[11px] leading-[13px] text-[#555555]" numberOfLines={1}>
          {detail}
        </Text>
      </View>

      <View className="ml-2 h-7 w-5 items-center justify-center">
        <ChevronRightIcon />
      </View>
    </Pressable>
  );
}

export function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();

  const userName = auth?.user?.name || "Marina Ferreira";
  const userEmail = auth?.user?.email || "marina@email.com";
  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "MF";

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5" style={{ paddingTop: Math.max(insets.top, 44) + 24 }}>
          {/* Marca e título */}
          <Text className="pl-0.5 font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
          <Text className="mt-1.5 pl-0.5 font-inter-extrabold text-[32px] leading-[39px] text-achai">
            Meu perfil
          </Text>

          {/* Card de perfil */}
          <View className="mt-[3px] h-[108px] flex-row items-center rounded-[14px] border border-[#E8E8E0] bg-white px-3.5">
            <View className="relative h-[66px] w-[66px] items-center justify-center rounded-full bg-[#FFF4E8]">
              <Text className="font-inter-semibold text-[23px] leading-[28px] text-achai">{initials}</Text>
              <View style={{ position: "absolute", right: -4, bottom: -4 }}>
                <VerifiedBadgeIcon />
              </View>
            </View>

            <View className="ml-3.5 flex-1">
              <Text className="font-inter-semibold text-[16px] leading-[19px] text-ink" numberOfLines={1}>
                {userName}
              </Text>
              <Text className="mt-2 font-sans text-[12px] leading-[15px] text-[#555555]" numberOfLines={1}>
                {userEmail}
              </Text>
              <Text className="mt-2 font-inter-semibold text-[11px] leading-[13px] text-achai">
                Conta verificada
              </Text>
            </View>
          </View>

          {/* Lista de opções */}
          <View className="mt-[30px] gap-[14px]">
            {settingsItems.map((item) => (
              <SettingsCard
                key={item.id}
                item={item}
                onPress={item.route ? () => navigation.navigate(item.route) : undefined}
              />
            ))}
          </View>

          {/* Sair da conta */}
          <Pressable
            accessibilityRole="button"
            className="mt-[26px] items-center py-1"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="font-inter-semibold text-[14px] leading-[17px] text-achai">Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} activeTab="Perfil" />
    </View>
  );
}
