import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BottomNavigation } from "../components/BottomNavigation";
import { useAuth } from "../context/AuthContext";
import { fetchSuggestions } from "../services/suggestions-api";

function SectionTitle({ children, action }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-inter-semibold text-[19px] text-achai">{children}</Text>
      {action ? <Text className="font-inter-semibold text-xs text-achai">{action}</Text> : null}
    </View>
  );
}

function EmptyLists({ onCreate }) {
  return (
    <View className="mt-4 items-center rounded-[14px] border border-[#e8e8e0] px-5 py-5">
      <Text className="text-[30px] text-achai">☷</Text>
      <Text className="font-inter-semibold mt-2 text-center text-sm text-ink">Crie sua primeira lista</Text>
      <Text className="font-sans mt-1 text-center text-[11px] text-[#555]">
        Organize suas compras e encontre tudo com mais facilidade.
      </Text>
      <Pressable className="mt-4 rounded-[10px] bg-achai px-4 py-2" onPress={onCreate}>
        <Text className="font-inter-semibold text-xs text-ink">Criar lista</Text>
      </Pressable>
    </View>
  );
}

function QrCodeIcon() {
  return (
    <Svg height={28} width={28} viewBox="0 0 28 28" fill="none">
      <Path
        d="M9.91667 3.5H4.08333C3.76117 3.5 3.5 3.76117 3.5 4.08333V9.91667C3.5 10.2388 3.76117 10.5 4.08333 10.5H9.91667C10.2388 10.5 10.5 10.2388 10.5 9.91667V4.08333C10.5 3.76117 10.2388 3.5 9.91667 3.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M23.9167 3.5H18.0833C17.7612 3.5 17.5 3.76117 17.5 4.08333V9.91667C17.5 10.2388 17.7612 10.5 18.0833 10.5H23.9167C24.2388 10.5 24.5 10.2388 24.5 9.91667V4.08333C24.5 3.76117 24.2388 3.5 23.9167 3.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M9.91667 17.5H4.08333C3.76117 17.5 3.5 17.7612 3.5 18.0833V23.9167C3.5 24.2388 3.76117 24.5 4.08333 24.5H9.91667C10.2388 24.5 10.5 24.2388 10.5 23.9167V18.0833C10.5 17.7612 10.2388 17.5 9.91667 17.5Z"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M17.5 17.5H21V21H24.5M17.5 24.5H21M24.5 17.5V14M14 3.5V7M14 14H10.5M3.5 14H7M14 17.5V24.5"
        stroke="#F26900"
        strokeWidth={2.1}
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <Path
        d="M7 7H7.01167M21 7H21.0117M7 21H7.01167"
        stroke="#F26900"
        strokeWidth={2.68333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SuggestionCard({ suggestion }) {
  return (
    <View className="mb-2 flex-row items-center rounded-[14px] border border-[#e8e8e0] bg-white p-2.5">
      <View className="h-14 w-14 items-center justify-center rounded-[10px] bg-achai">
        <Text className="text-xl text-ink">✦</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="font-inter-semibold text-sm text-ink">{suggestion.name}</Text>
        <Text className="font-sans mt-1 text-[11px] text-[#555]">
          {suggestion.category || "Sugestão para sua próxima compra"}
        </Text>
      </View>
      <Pressable className="h-8 w-9 items-center justify-center rounded-[10px] bg-achai">
        <Text className="font-inter-semibold text-lg text-ink">+</Text>
      </Pressable>
    </View>
  );
}

export function HomeScreen({ navigation }) {
  const { auth, currentStore } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    let active = true;
    fetchSuggestions(auth?.token, currentStore?.id)
      .then((items) => {
        if (active) setSuggestions(items);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      })
      .finally(() => {
        if (active) setLoadingSuggestions(false);
      });
    return () => {
      active = false;
    };
  }, [auth?.token, currentStore?.id]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
        <View className="px-5 pb-4 pt-12">
          <Text className="font-brand text-[22px] text-ink">Ach.ai</Text>
          <Text className="font-sans mt-5 text-[24px] font-extrabold text-achai">Olá!</Text>
          <Text className="font-sans mt-1 text-[13px] text-[#555]">Vamos facilitar sua próxima compra?</Text>

          <Pressable
            className="mt-6 h-[92px] flex-row items-center rounded-[18px] bg-achai px-3.5"
            onPress={() => navigation.navigate("QrScanner")}
          >
            <View className="h-[54px] w-[54px] items-center justify-center rounded-[14px] bg-white">
              <QrCodeIcon />
            </View>
            <View className="ml-3">
              <Text className="font-inter-semibold text-[17px] text-ink">Escanear QR Code</Text>
              <Text className="font-sans mt-1 text-xs text-ink">Entre na loja e gere sua rota</Text>
            </View>
          </Pressable>

          <View className="mt-7">
            <SectionTitle>Minhas listas</SectionTitle>
            <EmptyLists onCreate={() => navigation.navigate("CreateList")} />
          </View>

          <View className="mt-8">
            <SectionTitle>Sugestões para você</SectionTitle>
            <View className="mt-4">
              {loadingSuggestions ? (
                <ActivityIndicator color="#F26900" />
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => <SuggestionCard key={suggestion.id} suggestion={suggestion} />)
              ) : (
                <Text className="font-sans rounded-[14px] border border-[#e8e8e0] px-4 py-5 text-center text-[11px] text-[#555]">
                  Suas sugestões aparecerão aqui conforme você usar o app.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomNavigation navigation={navigation} activeTab="Início" />
    </View>
  );
}
