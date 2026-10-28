import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const stroke = { strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M12.5 15L7.5 10L12.5 5" stroke="#1F1F1F" {...stroke} />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M17.5001 17.5001L13.8835 13.8835M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function ScanQrCodeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M14.1667 10V13.3333C14.1667 13.5543 14.0789 13.7663 13.9226 13.9226C13.7663 14.0789 13.5543 14.1667 13.3333 14.1667H10M14.1667 2.5H15.8333C16.2754 2.5 16.6993 2.67559 17.0118 2.98816C17.3244 3.30072 17.5 3.72464 17.5 4.16667V5.83333M14.1667 6.66667V5.83333M17.5 14.1667V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H14.1667M2.5 5.83333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H5.83333M5.83333 14.1667H5.84167M5.83333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V14.1667M6.66667 5.83333H9.16667C9.6269 5.83333 10 6.20643 10 6.66667V9.16667C10 9.6269 9.6269 10 9.16667 10H6.66667C6.20643 10 5.83333 9.6269 5.83333 9.16667V6.66667C5.83333 6.20643 6.20643 5.83333 6.66667 5.83333Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function MapPinIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M16.666 8.3333C16.666 12.4945 12.0506 16.8283 10.5008 18.1667C10.3564 18.2753 10.1806 18.334 9.99998 18.334C9.81934 18.334 9.64358 18.2753 9.4992 18.1667C7.94936 16.8283 3.33398 12.4945 3.33398 8.3333C3.33398 6.56503 4.03629 4.86918 5.28641 3.61882C6.53653 2.36846 8.23205 1.66602 9.99998 1.66602C11.7679 1.66602 13.4634 2.36846 14.7136 3.61882C15.9637 4.86918 16.666 6.56503 16.666 8.3333ZM12.4997 8.3333C12.4997 9.71414 11.3806 10.8335 9.99998 10.8335C8.61941 10.8335 7.50023 9.71414 7.50023 8.3333C7.50023 6.95246 8.61941 5.83307 9.99998 5.83307C11.3806 5.83307 12.4997 6.95246 12.4997 8.3333Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function ListPlusIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M13.3333 4.16602H2.5M9.16667 10H2.5M13.3333 15.834H2.5M15 7.49973V10M15 10V12.5003M15 10H17.5M15 10H12.5"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function RouteIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 15.8338C7.5 17.2146 6.38071 18.334 5 18.334C3.61929 18.334 2.5 17.2146 2.5 15.8338C2.5 14.453 3.61929 13.3336 5 13.3336C6.38071 13.3336 7.5 14.453 7.5 15.8338ZM7.5 15.8338H14.5833C15.3569 15.8338 16.0987 15.5265 16.6457 14.9795C17.1927 14.4325 17.5 13.6905 17.5 12.9169C17.5 12.1433 17.1927 11.4014 16.6457 10.8544C16.0987 10.3073 15.3569 10 14.5833 10H5.41667C4.64312 10 3.90125 9.6927 3.35427 9.14567C2.80729 8.59865 2.5 7.85673 2.5 7.08312C2.5 6.30951 2.80729 5.56758 3.35427 5.02056C3.90125 4.47353 4.64312 4.16622 5.41667 4.16622H12.5M12.5 4.16622C12.5 5.54704 13.6193 6.66642 15 6.66642C16.3807 6.66642 17.5 5.54704 17.5 4.16622C17.5 2.78539 16.3807 1.66602 15 1.66602C13.6193 1.66602 12.5 2.78539 12.5 4.16622Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function ChevronUpIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M13.5 11.25L9 6.75L4.5 11.25" stroke="#F26900" {...stroke} />
    </Svg>
  );
}

function ChevronDownIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="#F26900" {...stroke} />
    </Svg>
  );
}

function LightbulbIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        d="M10 9.33365C10.1333 8.66693 10.4667 8.20022 11 7.66685C11.6667 7.0668 12 6.20006 12 5.33333C12 4.27238 11.5786 3.25488 10.8284 2.50467C10.0783 1.75447 9.06087 1.33301 8 1.33301C6.93913 1.33301 5.92172 1.75447 5.17157 2.50467C4.42143 3.25488 4 4.27238 4 5.33333C4 6.00005 4.13333 6.80011 5 7.66685C5.46667 8.13355 5.86667 8.66693 6 9.33365M6 12.0005H10M6.66667 14.6674H9.33333"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function MessagesSquareIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M18.3338 8.24947C18.8201 8.24947 19.2865 8.44264 19.6303 8.78647C19.9742 9.1303 20.1673 9.59664 20.1673 10.0829V19.5121C20.1673 19.6409 20.1291 19.7667 20.0576 19.8737C19.9861 19.9807 19.8844 20.0641 19.7655 20.1134C19.6466 20.1626 19.5157 20.1755 19.3895 20.1504C19.2632 20.1253 19.1473 20.0633 19.0562 19.9723L17.0376 17.9537C16.6938 17.6099 16.2275 17.4167 15.7413 17.4165H9.16644C8.68017 17.4165 8.21382 17.2234 7.86997 16.8796C7.52613 16.5357 7.33296 16.0694 7.33296 15.5831V14.6664M14.6669 9.16618C14.6669 9.65243 14.4737 10.1188 14.1299 10.4626C13.786 10.8064 13.3197 10.9996 12.8334 10.9996H6.25854C5.77231 11.1929 5.30603 11.1929 4.96227 11.5368L2.94361 13.5554C2.85258 13.6464 2.73661 13.7084 2.61036 13.7335C2.48412 13.7586 2.35326 13.7457 2.23433 13.6964C2.11541 13.6472 2.01376 13.5638 1.94224 13.4567C1.87072 13.3497 1.83254 13.2239 1.83252 13.0952V3.66593C1.83252 3.17968 2.02569 2.71335 2.36953 2.36951C2.71338 2.02568 3.17973 1.83252 3.666 1.83252H12.8334C13.3197 1.83252 13.786 2.02568 14.1299 2.36951C14.4737 2.71335 14.6669 3.17968 14.6669 3.66593V9.16618Z"
        stroke="#F26900"
        {...stroke}
      />
    </Svg>
  );
}

function MessageCircleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M2.49249 13.6183C2.61503 13.9274 2.64231 14.2661 2.57083 14.5909L1.68326 17.3327C1.65466 17.4718 1.66206 17.6158 1.70474 17.7512C1.74743 17.8866 1.82399 18.0088 1.92717 18.1063C2.03035 18.2038 2.15672 18.2734 2.29431 18.3083C2.43189 18.3433 2.57613 18.3425 2.71334 18.3061L5.55773 17.4744C5.86419 17.4136 6.18155 17.4402 6.47364 17.5511C8.25327 18.3822 10.2692 18.558 12.1659 18.0475C14.0625 17.5371 15.7179 16.3732 16.84 14.7612C17.9621 13.1492 18.4789 11.1926 18.299 9.23677C18.1191 7.28091 17.2542 5.45143 15.8569 4.0711C14.4596 2.69077 12.6197 1.84831 10.6618 1.69234C8.70386 1.53638 6.75377 2.07694 5.15557 3.21865C3.55736 4.36037 2.41376 6.02986 1.92652 7.93258C1.43929 9.8353 1.63973 11.849 2.49249 13.6183Z"
        stroke="#FFFFFF"
        {...stroke}
      />
    </Svg>
  );
}

const faqItems = [
  {
    id: "qr-code",
    topic: "QR Code",
    question: "Como escanear o QR Code na gôndola?",
    answer:
      "Abra “Escanear QR Code” no Início e aponte a câmera para o código na gôndola. Mantenha o celular parado e o código inteiro dentro do visor.",
    tip: "Não conseguiu ler? Evite reflexos e confira a permissão da câmera.",
    Icon: ScanQrCodeIcon,
  },
  {
    id: "stores",
    topic: "Busca de lojas",
    question: "Como encontrar supermercados?",
    answer:
      "No Início ou na tela de criação de lista, você pode escanear o QR Code na entrada da loja para vincular seu supermercado automaticamente.",
    tip: "Você também pode trocar de loja a qualquer momento na sua lista.",
    Icon: MapPinIcon,
  },
  {
    id: "lists",
    topic: "Minhas listas",
    question: "Como criar uma lista de compras?",
    answer:
      "Acesse a aba “Listas” no menu inferior e toque em “+ Criar nova lista”. Escolha o nome da lista, adicione os produtos desejados e confirme.",
    tip: "Você pode ajustar as quantidades de cada item antes de gerar a rota.",
    Icon: ListPlusIcon,
  },
  {
    id: "route",
    topic: "Rota na loja",
    question: "Como seguir minha rota de compras?",
    answer:
      "Após criar e confirmar sua lista, o Ach.ai calcula o menor caminho pelos corredores e organiza as paradas em ordem para facilitar sua compra.",
    tip: "Itens sem localização cadastrada aparecem separados ao final da rota.",
    Icon: RouteIcon,
  },
];

function FaqCard({ item, expanded, onToggle }) {
  const { Icon, topic, question, answer, tip } = item;
  return (
    <View className="overflow-hidden rounded-[14px] border border-[#E8E8E0] bg-white">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="flex-row items-center gap-3 p-4"
        onPress={onToggle}
      >
        <View className="h-10 w-10 items-center justify-center rounded-[12px] bg-[#FFF4E8]">
          <Icon />
        </View>

        <View className="flex-1 gap-[5px]">
          <Text className="font-sans text-[11px] leading-[13px] text-[#555555]">{topic}</Text>
          <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">{question}</Text>
        </View>

        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Pressable>

      {expanded ? (
        <View className="gap-3 px-4 pb-4">
          <View className="h-[1px] bg-[#E8E8E0]" />
          <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">{answer}</Text>
          {tip ? (
            <View className="flex-row gap-2 rounded-[12px] bg-[#FAFAF8] p-3">
              <View className="pt-0.5">
                <LightbulbIcon />
              </View>
              <Text className="flex-1 font-sans text-[12px] leading-[18px] text-[#555555]">
                {tip}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function HelpScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState("qr-code");

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqItems;
    return faqItems.filter(
      (item) =>
        item.topic.toLowerCase().includes(query) ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query),
    );
  }, [search]);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Profile");
    }
  };

  const handleContactTeam = () => {
    navigation.navigate("ContactTeam");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho — h=64, pad 0/20 */}
        <View
          className="h-16 flex-row items-center justify-between px-5"
          style={{ marginTop: Math.max(insets.top, 44) }}
        >
          <Pressable
            accessibilityLabel="Voltar ao perfil"
            className="h-11 flex-row items-center gap-1.5"
            onPress={handleGoBack}
          >
            <ChevronLeftIcon />
            <Text className="font-inter-medium text-[14px] leading-[17px] text-ink">Meu perfil</Text>
          </Pressable>
          <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
        </View>

        {/* Apresentação — pad 8/20/28/20, gap 20 */}
        <View className="gap-5 px-5 pb-7 pt-2">
          {/* Orientação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">Ajuda</Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Encontre respostas para suas compras ou fale com a equipe Ach.ai.
            </Text>
          </View>

          {/* Busca nas dúvidas — gap 8 */}
          <View className="gap-2">
            <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">
              Como podemos ajudar?
            </Text>
            <View className="h-[54px] flex-row items-center gap-3 rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] px-4">
              <SearchIcon />
              <TextInput
                className="flex-1 p-0 font-sans text-[14px] leading-[17px] text-ink"
                onChangeText={setSearch}
                placeholder="Buscar nas dúvidas"
                placeholderTextColor="#555555"
                value={search}
              />
            </View>
          </View>
        </View>

        {/* Conteúdo de ajuda — pad 0/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8">
          {/* Dúvidas frequentes — gap 16 */}
          <View className="gap-4">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
              Dúvidas frequentes
            </Text>

            <View className="gap-3">
              {filteredFaqs.map((item) => (
                <FaqCard
                  expanded={expandedId === item.id}
                  item={item}
                  key={item.id}
                  onToggle={() =>
                    setExpandedId((current) => (current === item.id ? null : item.id))
                  }
                />
              ))}
            </View>
          </View>

          {/* Divisor de seções */}
          <View className="h-[1px] bg-[#E8E8E0]" />

          {/* Contato com a equipe — gap 16 */}
          <View className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-[12px] bg-[#FFF4E8]">
                <MessagesSquareIcon />
              </View>
              <View className="flex-1 gap-[5px]">
                <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
                  Ainda precisa de ajuda?
                </Text>
                <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                  Converse com a equipe Ach.ai sobre sua dúvida ou um problema no app.
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-[54px] flex-row items-center justify-center gap-2.5 rounded-[12px] bg-achai"
              onPress={handleContactTeam}
            >
              <MessageCircleIcon />
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                Falar com a equipe
              </Text>
            </Pressable>

            <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
              Ao entrar em contato, descreva o que aconteceu. Não compartilhe sua senha.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
