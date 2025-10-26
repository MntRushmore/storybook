import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useState, useEffect } from "react";
import { useAuthStore } from "./src/state/authStore";
import { useStoryStore } from "./src/state/storyStore";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignUpScreen } from "./src/screens/SignUpScreen";
import { WelcomeModal } from "./src/components/WelcomeModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeRevenueCat } from "./src/services/revenueCat";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project.
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const [authScreen, setAuthScreen] = useState<"login" | "signup">("login");
  const [showWelcome, setShowWelcome] = useState(false);

  const user = useAuthStore(s => s.user);
  const isInitialized = useAuthStore(s => s.isInitialized);
  const initialize = useAuthStore(s => s.initialize);
  const loadUserStories = useStoryStore(s => s.loadUserStories);

  // Initialize auth on app start
  useEffect(() => {
    initialize();
  }, []);

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    if (user) {
      initializeRevenueCat(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Load stories from Supabase when user is authenticated
    if (user) {
      loadUserStories();
      checkAndShowWelcome();
    }
  }, [user]);

  const checkAndShowWelcome = async () => {
    try {
      const hasSeenWelcome = await AsyncStorage.getItem("hasSeenWelcome");
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error("Error checking welcome status:", error);
    }
  };

  const handleWelcomeClose = async () => {
    try {
      await AsyncStorage.setItem("hasSeenWelcome", "true");
      setShowWelcome(false);
    } catch (error) {
      console.error("Error saving welcome status:", error);
      setShowWelcome(false);
    }
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {/* Simple loading state - you can customize this */}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Show auth screens if not logged in
  if (!user && isInitialized) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          {authScreen === "login" ? (
            <LoginScreen
              onSignUpPress={() => setAuthScreen("signup")}
              onSuccess={() => {
                // Navigation will happen automatically when user state changes
              }}
            />
          ) : (
            <SignUpScreen
              onSignInPress={() => setAuthScreen("login")}
              onSuccess={() => {
                // Navigation will happen automatically when user state changes
              }}
            />
          )}
          <StatusBar style="light" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  // Show main app
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>

        {/* Welcome Modal */}
        <WelcomeModal
          visible={showWelcome}
          onClose={handleWelcomeClose}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
