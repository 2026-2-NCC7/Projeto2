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
import { StoreDetailsScreen } from "./src/screens/StoreDetailsScreen";
import { MyListsScreen } from "./src/screens/MyListsScreen";
import { CreateListScreen } from "./src/screens/CreateListScreen";
import { RouteScreen } from "./src/screens/RouteScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { PersonalDataScreen } from "./src/screens/PersonalDataScreen";
import { PreferencesScreen } from "./src/screens/PreferencesScreen";
import { PrivacyScreen } from "./src/screens/PrivacyScreen";
import { PrivacyPolicyScreen } from "./src/screens/PrivacyPolicyScreen";
import { DeleteAccountScreen } from "./src/screens/DeleteAccountScreen";
import { SecurityScreen } from "./src/screens/SecurityScreen";
import { HelpScreen } from "./src/screens/HelpScreen";
import { ContactTeamScreen } from "./src/screens/ContactTeamScreen";
import { ContactSuccessScreen } from "./src/screens/ContactSuccessScreen";
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
      StoreDetails: "store-details",
      MyLists: "lists",
      CreateList: "create-list",
      Route: "route",
      Profile: "profile",
      PersonalData: "personal-data",
      Preferences: "preferences",
      Privacy: "privacy",
      PrivacyPolicy: "privacy-policy",
      DeleteAccount: "delete-account",
      Security: "security",
      Help: "help",
      ContactTeam: "contact-team",
      ContactSuccess: "contact-success",
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
            <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
            <Stack.Screen name="MyLists" component={MyListsScreen} />
            <Stack.Screen name="CreateList" component={CreateListScreen} />
            <Stack.Screen name="Route" component={RouteScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
            <Stack.Screen name="Preferences" component={PreferencesScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen name="Help" component={HelpScreen} />
            <Stack.Screen name="ContactTeam" component={ContactTeamScreen} />
            <Stack.Screen name="ContactSuccess" component={ContactSuccessScreen} />
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
