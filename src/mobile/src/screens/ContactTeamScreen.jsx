import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../context/AuthContext";

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

function MailIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.334 5.83373L10.8409 10.6058C10.5866 10.7534 10.2978 10.8312 10.0038 10.8312C9.70971 10.8312 9.42089 10.7534 9.16662 10.6058L1.66602 5.83373M18.334 5.83373V5.00048C18.334 4.0801 17.5878 3.33398 16.6672 3.33398H3.33282C2.41227 3.33398 1.66602 4.0801 1.66602 5.00048V5.83373M18.334 5.83373V14.9995C18.334 15.9199 17.5878 16.666 16.6672 16.666H3.33282C2.41227 16.666 1.66602 15.9199 1.66602 14.9995V5.83373"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M14.9993 9.75012C14.9993 13.5002 12.3746 15.3753 9.25486 16.4628C9.0915 16.5182 8.91405 16.5156 8.75241 16.4553C5.62523 15.3753 3.00049 13.5002 3.00049 9.75012V4.49995C3.00049 4.30103 3.0795 4.11026 3.22014 3.9696C3.36077 3.82894 3.55152 3.74992 3.75041 3.74992C5.25026 3.74992 7.12508 2.84989 8.42995 1.70986C8.58882 1.5741 8.79092 1.49951 8.99989 1.49951C9.20885 1.49951 9.41096 1.5741 9.56983 1.70986C10.8822 2.85739 12.7495 3.74992 14.2494 3.74992C14.4483 3.74992 14.639 3.82894 14.7796 3.9696C14.9203 4.11026 14.9993 4.30103 14.9993 4.49995V9.75012Z"
        stroke="#555555"
        {...stroke}
      />
    </Svg>
  );
}

const subjectRows = [
  ["QR Code", "Busca de lojas"],
  ["Minhas listas", "Rota na loja"],
  ["Conta e acesso", "Outro assunto"],
];

function SubjectOption({ label, selected, onSelect }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      className={`h-11 flex-1 flex-row items-center gap-2 rounded-[12px] border px-3 ${
        selected ? "border-achai bg-[#FFF4E8]" : "border-[#E8E8E0] bg-white"
      }`}
      onPress={onSelect}
    >
      <View
        className={`h-4 w-4 items-center justify-center rounded-full border-[1.5px] ${
          selected ? "border-achai" : "border-[#555555]"
        }`}
      >
        {selected ? <View className="h-2 w-2 rounded-full bg-achai" /> : null}
      </View>

      <Text
        className={`text-[13px] leading-[16px] text-ink ${
          selected ? "font-inter-semibold" : "font-sans"
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ContactTeamScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { auth } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState("QR Code");
  const [message, setMessage] = useState("");

  const userEmail = auth?.user?.email || "marina@email.com";

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Help");
    }
  };

  const handleSend = () => {
    navigation.navigate("ContactSuccess", {
      email: userEmail,
      subject: selectedSubject,
    });
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
            accessibilityLabel="Voltar à Ajuda"
            className="h-11 flex-row items-center gap-1.5"
            onPress={handleGoBack}
          >
            <ChevronLeftIcon />
            <Text className="font-inter-medium text-[14px] leading-[17px] text-ink">Ajuda</Text>
          </Pressable>
          <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
        </View>

        {/* Contato com a equipe — pad 8/20/32/20, gap 24 */}
        <View className="gap-6 px-5 pb-8 pt-2">
          {/* Apresentação — gap 10 */}
          <View className="gap-2.5">
            <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">
              Falar com a equipe
            </Text>
            <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
              Conte sua dúvida ou o que aconteceu no app. Estamos aqui para ajudar.
            </Text>
          </View>

          {/* Canal de resposta — h=73, r=14, border #E8E8E0, pad 16, gap 12 */}
          <View className="min-h-[73px] flex-row items-center gap-3 rounded-[14px] border border-[#E8E8E0] bg-white p-4">
            <MailIcon />
            <View className="flex-1 gap-1.5">
              <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                Vamos responder pelo e-mail da sua conta:
              </Text>
              <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink" numberOfLines={1}>
                {userEmail}
              </Text>
            </View>
          </View>

          {/* Formulário de contato — gap 24 */}
          <View className="gap-6">
            {/* Assunto da mensagem — gap 8 */}
            <View className="gap-2">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">Assunto</Text>
                <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">(obrigatório)</Text>
              </View>

              <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                Escolha o assunto que mais combina com sua dúvida.
              </Text>

              {/* Assuntos disponíveis — gap 8 */}
              <View className="gap-2">
                {subjectRows.map((row, rowIndex) => (
                  <View className="flex-row gap-2" key={String(rowIndex)}>
                    {row.map((subject) => (
                      <SubjectOption
                        key={subject}
                        label={subject}
                        onSelect={() => setSelectedSubject(subject)}
                        selected={selectedSubject === subject}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Mensagem para a equipe — gap 8 */}
            <View className="gap-2">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="font-inter-semibold text-[14px] leading-[17px] text-ink">Mensagem</Text>
                <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">(obrigatório)</Text>
              </View>

              <View className="h-[180px] rounded-[12px] border border-[#E8E8E0] bg-[#FAFAF8] p-4">
                <TextInput
                  className="flex-1 p-0 font-sans text-[14px] leading-[21px] text-ink"
                  multiline
                  onChangeText={setMessage}
                  placeholder="Descreva o que aconteceu e como podemos ajudar."
                  placeholderTextColor="#555555"
                  style={{ textAlignVertical: "top" }}
                  value={message}
                />
              </View>

              <Text className="font-sans text-[12px] leading-[18px] text-[#555555]">
                Se for sobre uma loja ou produto, inclua o nome, se souber (opcional).
              </Text>
            </View>
          </View>

          {/* Cuidado com dados pessoais — r=12, fill #FAFAF8, pad 12, gap 8 */}
          <View className="flex-row gap-2 rounded-[12px] bg-[#FAFAF8] p-3">
            <View className="pt-0.5">
              <ShieldIcon />
            </View>
            <Text className="flex-1 font-sans text-[12px] leading-[18px] text-[#555555]">
              Não informe sua senha nem dados sensíveis, como CPF ou dados de cartão, na mensagem.
            </Text>
          </View>

          {/* Envio da mensagem — gap 12 */}
          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] bg-achai"
              onPress={handleSend}
            >
              <Text className="font-inter-bold text-[16px] leading-[19px] text-white">
                Enviar mensagem
              </Text>
            </Pressable>
            <Text className="text-center font-sans text-[12px] leading-[18px] text-[#555555]">
              Sua mensagem só será enviada ao tocar no botão.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
