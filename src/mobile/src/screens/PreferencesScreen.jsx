import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const stroke = { strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="#1F1F1F"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
      <Path
        d="M9.99969 3L4.50024 8.4996L2.00049 5.99978"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CarrotIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M7.92045 12.8335L6.04129 10.9634M14.0621 13.7503L14.0456 13.7338M14.0456 13.7338L11.8071 11.4951M14.0456 13.7338C13.9533 13.8482 13.8548 13.9577 13.7504 14.062C11.1288 16.6839 2.0813 19.8924 2.0813 19.8924C2.0813 19.8924 5.28962 10.8534 7.92045 8.22235C8.30385 7.83951 8.7589 7.53595 9.25961 7.32899C9.76032 7.12204 10.2969 7.01573 10.8387 7.01616C11.3805 7.01659 11.9169 7.12373 12.4173 7.33147C12.662 7.43306 12.8957 7.55774 13.1154 7.70347M14.0456 13.7338C14.2924 13.4282 14.4946 13.0883 14.6458 12.7241C14.8535 12.2237 14.9607 11.6872 14.9611 11.1454C14.9615 10.6036 14.8552 10.067 14.6483 9.5662C14.5464 9.31969 14.4211 9.08424 14.2745 8.86296M13.9993 8.00246C14.5262 7.50197 15.8024 6.41634 16.9592 6.41634C18.9483 6.41634 20.1675 8.24982 20.1675 8.24982C20.1675 8.24982 18.9483 10.0833 16.9592 10.0833C15.7413 10.0833 14.812 9.39596 14.2745 8.86296M13.9993 8.00246C14.5002 7.47908 15.5842 6.21137 15.5842 5.04123C15.5842 3.05191 13.7509 1.83264 13.7509 1.83264C13.7509 1.83264 11.9175 3.05191 11.9175 5.04123C11.9175 6.24231 12.5858 7.16268 13.1154 7.70347"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function PackageIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M11 20.1674V20.1655M11 20.1655V11.0002M11 20.1655C10.6782 20.1655 10.362 20.0808 10.0833 19.9198L3.66667 16.253C3.38824 16.0922 3.15698 15.861 2.99609 15.5827C2.8352 15.3043 2.75033 14.9886 2.75 14.667V7.33328C2.75033 7.01176 2.8352 6.69598 2.99609 6.41762C3.15698 6.13926 3.38824 5.90811 3.66667 5.74735L6.8753 3.91374M11 20.1655C11.3218 20.1655 11.638 20.0808 11.9167 19.9198L18.3333 16.253C18.6118 16.0922 18.843 15.861 19.0039 15.5827C19.1648 15.3043 19.2497 14.9886 19.25 14.667V7.33328C19.2497 7.01176 19.1648 6.69598 19.0039 6.41762C18.843 6.13926 18.6118 5.90811 18.3333 5.74735L11.9167 2.08047C11.638 1.91956 11.3218 1.83484 11 1.83484C10.6782 1.83484 10.362 1.91956 10.0833 2.08047L6.8753 3.91374M11 11.0002L3.01587 6.41665M11 11.0002L15.1228 8.63342M15.1228 8.63342L18.9842 6.41665M15.1228 8.63342L6.8753 3.91374"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function MilkIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M7.334 1.83252H8.25052M8.25052 1.83252H13.7496M8.25052 1.83252V4.38931C8.2505 5.11334 8.0362 5.82116 7.63462 6.42355L7.03338 7.32563C6.63163 7.92828 6.41732 8.63645 6.41748 9.36079V13.7505M13.7496 1.83252H14.6662M13.7496 1.83252V4.38839C13.7495 5.11273 13.9638 5.8209 14.3655 6.42355L14.9668 7.32563C15.3684 7.92802 15.5827 8.63584 15.5827 9.35987V13.7505M6.41748 13.7505V18.3338C6.41748 18.8201 6.6106 19.2865 6.95437 19.6303C7.29813 19.9742 7.76437 20.1673 8.25052 20.1673H13.7496C14.2358 20.1673 14.702 19.9742 15.0458 19.6303C15.3896 19.2865 15.5827 18.8201 15.5827 18.3338V13.7505M6.41748 13.7505C7.14316 13.4465 7.92204 13.29 8.70878 13.29C9.49552 13.29 10.2744 13.4465 11.0001 13.7505C11.7257 14.0546 12.5046 14.2112 13.2914 14.2112C14.0781 14.2112 14.857 14.0546 15.5827 13.7505"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function CupSodaIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M5.49929 7.33293L7.10364 18.5904C7.16591 19.031 7.38625 19.4339 7.7236 19.724C8.06094 20.0141 8.49227 20.1716 8.93718 20.1672H13.0993C13.5442 20.1716 13.9756 20.0141 14.3129 19.724C14.6503 19.4339 14.8706 19.031 14.9329 18.5904L16.5005 7.33293M5.49929 7.33293H4.58252M5.49929 7.33293H10.9999M16.5005 7.33293H10.9999M16.5005 7.33293H17.4173M10.9999 7.33293L11.9167 1.83252H13.7502M6.41606 13.7497C7.14191 13.4456 7.92102 13.289 8.70799 13.289C9.49496 13.289 10.2741 13.4456 10.9999 13.7497C11.7258 14.0538 12.5049 14.2104 13.2918 14.2104C14.0788 14.2104 14.8579 14.0538 15.5838 13.7497"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function SprayCanIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M2.75 2.75H2.75917M6.41667 4.58333H6.42583M10.0833 6.41667H10.0925M2.75 6.41667H2.75917M6.41667 8.25H6.42583M2.75 10.0833H2.75917M17.4167 8.25V4.58333H13.75V8.25M17.4167 8.25H13.75M17.4167 8.25L19.25 10.0833V11M13.75 8.25L11.9167 10.0833V12.8333M19.25 11V15.5833M19.25 11L11.9167 12.8333M19.25 15.5833V19.25C19.25 19.8 18.8833 20.1667 18.3333 20.1667H12.8333C12.2833 20.1667 11.9167 19.8 11.9167 19.25V17.4167M19.25 15.5833L11.9167 17.4167M11.9167 17.4167V12.8333"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

function SoapDispenserIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M9.62553 1.83252V5.49948M9.62553 1.83252H12.8337M9.62553 1.83252H6.41735C5.93114 1.83252 5.46485 2.02569 5.12105 2.36953C4.77725 2.71338 4.5841 3.17973 4.5841 3.666M9.62553 5.49948H11.0005C11.2436 5.49948 11.4767 5.59606 11.6486 5.76799C11.8205 5.93991 11.9171 6.17309 11.9171 6.41622V9.16644H7.33397M9.62553 5.49948H8.2506C8.00749 5.49948 7.77435 5.59606 7.60245 5.76799C7.43055 5.93991 7.33397 6.17309 7.33397 6.41622V9.16644M8.80699 19.2506H5.50073C5.01452 19.2506 4.54823 19.0574 4.20443 18.7136C3.86063 18.3697 3.66748 17.9034 3.66748 17.4171V10.9999C3.66748 10.5137 3.86063 10.0473 4.20443 9.70345C4.54823 9.35961 5.01452 9.16644 5.50073 9.16644H7.33397M17.6827 13.5301C16.6131 12.6519 15.873 11.4366 15.5836 10.0832C15.299 11.4386 14.558 12.6553 13.4845 13.5301C12.4304 14.3735 11.9171 15.4003 11.9171 16.4545C11.9171 18.4897 13.567 20.1673 15.5836 20.1673C17.6002 20.1673 19.2501 18.4897 19.2501 16.4545C19.2501 15.3911 18.7276 14.3827 17.6827 13.5301Z"
        stroke={color}
        {...stroke}
      />
    </Svg>
  );
}

const categoryRows = [
  [
    { id: "Hortifruti", label: "Hortifruti", Icon: CarrotIcon },
    { id: "Mercearia", label: "Mercearia", Icon: PackageIcon },
  ],
  [
    { id: "Laticínios", label: "Laticínios", Icon: MilkIcon },
    { id: "Bebidas", label: "Bebidas", Icon: CupSodaIcon },
  ],
  [
    { id: "Limpeza", label: "Limpeza", Icon: SprayCanIcon },
    { id: "Higiene pessoal", label: "Higiene pessoal", Icon: SoapDispenserIcon },
  ],
];

function CategoryCard({ item, selected, onToggle }) {
  const { Icon, label } = item;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className={`h-20 flex-1 justify-between rounded-[12px] border p-3 ${
        selected ? "border-achai bg-[#FFF4E8]" : "border-[#E8E8E0] bg-white"
      }`}
      onPress={onToggle}
    >
      <View className="flex-row items-center justify-between">
        <Icon color={selected ? "#F26900" : "#555555"} />
        <View
          className={`h-[18px] w-[18px] items-center justify-center rounded-[5px] border ${
            selected ? "border-achai bg-achai" : "border-[#D9D9D3] bg-white"
          }`}
        >
          {selected ? <CheckIcon /> : null}
        </View>
      </View>

      <Text
        className={`text-[13px] leading-[16px] text-ink ${
          selected ? "font-inter-semibold" : "font-inter-medium"
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function PreferenceToggle({ value, onToggle, label }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      className={`h-7 w-[46px] justify-center rounded-full p-[3px] ${
        value ? "items-end bg-achai" : "items-start bg-[#D9D9D3]"
      }`}
      onPress={onToggle}
    >
      <View className="h-[22px] w-[22px] rounded-full bg-white" />
    </Pressable>
  );
}

export function PreferencesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState([
    "Hortifruti",
    "Mercearia",
    "Limpeza",
  ]);
  const [productSuggestions, setProductSuggestions] = useState(true);
  const [shoppingNotifications, setShoppingNotifications] = useState(false);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId],
    );
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Profile");
    }
  };

  const handleSave = () => {
    Alert.alert("Preferências salvas", "Suas preferências de compra foram atualizadas.");
  };

  const count = selectedCategories.length;
  const selectionSummary =
    count === 1 ? "1 categoria selecionada" : `${count} categorias selecionadas`;

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

        {/* Preferências de compra — pad 8/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">Preferências</Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Deixe as sugestões do Ach.ai mais parecidas com a sua lista de compras.
            </Text>
          </View>

          {/* Categorias de interesse — gap 14 */}
          <View className="gap-3.5">
            <View className="gap-1.5">
              <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
                O que você costuma comprar?
              </Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Escolha as categorias que quer ver nas sugestões. Pode marcar mais de uma.
              </Text>
            </View>

            {/* Opções de categorias — gap 10 */}
            <View className="gap-2.5">
              {categoryRows.map((row, rowIndex) => (
                <View className="flex-row gap-2.5" key={String(rowIndex)}>
                  {row.map((item) => (
                    <CategoryCard
                      key={item.id}
                      item={item}
                      onToggle={() => toggleCategory(item.id)}
                      selected={selectedCategories.includes(item.id)}
                    />
                  ))}
                </View>
              ))}
            </View>

            <Text className="font-inter-medium text-[12px] leading-[15px] text-[#555555]">
              {selectionSummary}
            </Text>
          </View>

          {/* Sugestões e notificações — gap 14 */}
          <View className="gap-3.5">
            <Text className="font-inter-bold text-[18px] leading-[22px] text-ink">
              Sugestões e notificações
            </Text>

            <View className="overflow-hidden rounded-[14px] border border-[#E8E8E0] bg-white">
              {/* Controle 1 */}
              <View className="min-h-[94px] flex-row items-center gap-4 p-4">
                <View className="flex-1 gap-1.5">
                  <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                    Sugestões de produtos
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Veja no início produtos das categorias que você escolheu.
                  </Text>
                </View>
                <PreferenceToggle
                  label="Sugestões de produtos"
                  onToggle={() => setProductSuggestions((v) => !v)}
                  value={productSuggestions}
                />
              </View>

              {/* Controle 2 */}
              <View className="min-h-[94px] flex-row items-center gap-4 border-t border-[#E8E8E0] p-4">
                <View className="flex-1 gap-1.5">
                  <Text className="font-inter-semibold text-[14px] leading-[20px] text-ink">
                    Notificações de compras
                  </Text>
                  <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                    Receba no celular lembretes para retomar suas listas de compras.
                  </Text>
                </View>
                <PreferenceToggle
                  label="Notificações de compras"
                  onToggle={() => setShoppingNotifications((v) => !v)}
                  value={shoppingNotifications}
                />
              </View>
            </View>

            <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
              As sugestões continuam no app, mesmo com as notificações desativadas.
            </Text>
          </View>

          {/* Ações — gap 12 */}
          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
              onPress={handleSave}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                Salvar preferências
              </Text>
            </Pressable>
            <Text className="text-center font-sans text-[12px] leading-[18px] text-[#555555]">
              As alterações só serão aplicadas ao salvar.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
