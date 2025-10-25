import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useEffect } from "react";
import { useStoryStore } from "./src/state/storyStore";
import { registerForPushNotifications } from "./src/services/pushNotifications";

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
  const userProfile = useStoryStore(s => s.userProfile);
  const loadUserStories = useStoryStore(s => s.loadUserStories);

  useEffect(() => {
    // Register for push notifications on app start
    registerForPushNotifications().then(token => {
      if (token) {
        console.log("Push notification token:", token);
        // You could save this token to the user profile or send to backend
      }
    }).catch(error => {
      console.error("Error registering for push notifications:", error);
    });
  }, []);

  useEffect(() => {
    // Load stories from Supabase when app starts
    if (userProfile) {
      loadUserStories();
    }
  }, [userProfile, loadUserStories]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
