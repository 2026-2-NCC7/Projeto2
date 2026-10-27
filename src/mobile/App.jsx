import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { ForgotPasswordConfirmationScreen } from "./src/screens/ForgotPasswordConfirmationScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { QrScannerScreen } from "./src/screens/QrScannerScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { CreateListScreen } from "./src/screens/CreateListScreen";
import { RouteScreen } from "./src/screens/RouteScreen";
import { appFonts } from "./src/theme/fonts";
import "./src/styles.css";

const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ["http://localhost:8081", "achai://"],
  config: {
    screens: {
      Login: "",
      Home: "home",
      QrScanner: "scan-qr",
      Catalog: "catalog",
      CreateList: "create-list",
      Route: "route",
      Register: "register",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password",
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts(appFonts);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer linking={linking}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="QrScanner" component={QrScannerScreen} />
            <Stack.Screen name="Catalog" component={CatalogScreen} />
            <Stack.Screen name="CreateList" component={CreateListScreen} />
            <Stack.Screen name="Route" component={RouteScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="ForgotPasswordConfirmation" component={ForgotPasswordConfirmationScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
