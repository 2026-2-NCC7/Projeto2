import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function ScanCorners() {
  return (
    <View className="h-[250px] w-[250px]">
      <View className="absolute left-0 top-0 h-12 w-12 border-l-4 border-t-4 border-achai" />
      <View className="absolute right-0 top-0 h-12 w-12 border-r-4 border-t-4 border-achai" />
      <View className="absolute bottom-0 left-0 h-12 w-12 border-b-4 border-l-4 border-achai" />
      <View className="absolute bottom-0 right-0 h-12 w-12 border-b-4 border-r-4 border-achai" />
    </View>
  );
}

function FlashIcon({ enabled }) {
  return <Text className={`text-[25px] ${enabled ? "text-achai" : "text-white"}`}>⚡</Text>;
}

export function QrScannerScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-[#111]">
        <ActivityIndicator color="#F26900" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-[#111] px-8">
        <Text className="font-inter-semibold text-center text-lg text-white">Permissão da câmera necessária</Text>
        <Text className="font-sans mt-3 text-center text-sm text-[#d0d0d0]">
          Permita o acesso à câmera para escanear o QR Code da loja.
        </Text>
        {permission.canAskAgain ? (
          <Pressable className="mt-6 rounded-[12px] bg-achai px-5 py-3" onPress={requestPermission}>
            <Text className="font-inter-semibold text-sm text-ink">Permitir câmera</Text>
          </Pressable>
        ) : (
          <Text className="font-sans mt-6 text-center text-xs text-[#aaa]">
            Acesse as configurações do aparelho para liberar a câmera.
          </Text>
        )}
        <Pressable className="mt-5 px-4 py-2" onPress={() => navigation.goBack()}>
          <Text className="font-inter-semibold text-sm text-white">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView className="absolute inset-0" facing="back" enableTorch={torchEnabled} />
      <View className="absolute inset-0 bg-black/35" />

      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-4">
          <Pressable className="h-10 w-10 items-center justify-center" onPress={() => navigation.goBack()}>
            <Text className="text-[30px] text-white">‹</Text>
          </Pressable>
          <Text className="font-inter-semibold text-[17px] text-white">Escanear QR Code</Text>
          <View className="h-10 w-10" />
        </View>

        <View className="flex-1 items-center justify-center">
          <ScanCorners />
          <Text className="font-sans mt-8 text-center text-sm text-white">
            Aponte a câmera para o QR Code da loja
          </Text>
        </View>

        <View className="items-center pb-8" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <Pressable
            accessibilityLabel={torchEnabled ? "Desabilitar flash" : "Ativar flash"}
            className="h-14 w-14 items-center justify-center rounded-full bg-[#1f1f1f]/90"
            onPress={() => setTorchEnabled((enabled) => !enabled)}
          >
            <FlashIcon enabled={torchEnabled} />
          </Pressable>
          <Text className="font-sans mt-3 text-xs text-white">
            {torchEnabled ? "Flash ativado" : "Ativar flash"}
          </Text>
        </View>
      </View>
    </View>
  );
}
