import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

function SuccessIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Circle cx={22} cy={22} r={20.5} stroke="#F26900" strokeWidth={3} />
      <Path
        d="M11 22L18.7 29.7L33 14.3"
        stroke="#F26900"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.334 5.83373L10.8409 10.6058C10.5866 10.7534 10.2978 10.8312 10.0038 10.8312C9.70971 10.8312 9.42089 10.7534 9.16662 10.6058L1.66602 5.83373M18.334 5.83373V5.00048C18.334 4.0801 17.5878 3.33398 16.6672 3.33398H3.33282C2.41227 3.33398 1.66602 4.0801 1.66602 5.00048V5.83373M18.334 5.83373V14.9995C18.334 15.9199 17.5878 16.666 16.6672 16.666H3.33282C2.41227 16.666 1.66602 15.9199 1.66602 14.9995V5.83373"
        stroke="#555555"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ContactSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const userEmail = route?.params?.email || auth?.user?.email || "marina@email.com";

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 26) }}>
      {/* Cabeçalho — h=64, pad 0/20 */}
      <View
        className="h-16 flex-row items-center px-5"
        style={{ marginTop: Math.max(insets.top, 44) }}
      >
        <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
      </View>

      {/* Confirmação de envio — pad 64/20/64/20, gap 24 */}
      <View className="flex-1 items-center justify-center gap-6 px-5 py-16">
        {/* Símbolo de sucesso — 88x88, r=100, fill #FFF4E8 */}
        <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-[#FFF4E8]">
          <SuccessIcon />
        </View>

        {/* Mensagem de sucesso — gap 12 */}
        <View className="w-full gap-3">
          <Text className="text-center font-inter-extrabold text-[32px] leading-[37px] text-ink">
            Mensagem enviada com sucesso
          </Text>
          <Text className="text-center font-sans text-[14px] leading-[21px] text-[#555555]">
            Recebemos sua mensagem. Obrigado por entrar em contato com a equipe do Ach.ai.
          </Text>
        </View>

        {/* Confirmação por e-mail — h=73, r=14, border #E8E8E0, pad 16, gap 12 */}
        <View className="min-h-[73px] w-full flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white p-4">
          <MailIcon />
          <View className="flex-1 gap-1.5">
            <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
              Enviamos a confirmação para:
            </Text>
            <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink" numberOfLines={1}>
              {userEmail}
            </Text>
          </View>
        </View>
      </View>

      {/* Retorno ao perfil — pad 24/20/32/20 */}
      <View className="px-5 pb-8 pt-6">
        <Pressable
          accessibilityRole="button"
          className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
          onPress={() => navigation.navigate("Profile")}
        >
          <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
            Voltar para Meu perfil
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
