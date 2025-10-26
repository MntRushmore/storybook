import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";

interface SplashScreenProps {
  onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  const initialize = useAuthStore(s => s.initialize);
  const isInitialized = useAuthStore(s => s.isInitialized);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Small delay for smooth transition
      setTimeout(onReady, 500);
    }
  }, [isInitialized]);

  return (
    <LinearGradient
      colors={["#E8B4B8", "#D4A5A5", "#B89B9B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center"
    >
      <View className="items-center">
        {/* App Icon */}
        <View
          className="w-24 h-24 rounded-3xl bg-white/30 items-center justify-center mb-6"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          }}
        >
          <Ionicons name="book" size={48} color="white" />
        </View>

        {/* App Name */}
        <Text className="text-white text-4xl font-bold mb-2">
          Dear We
        </Text>
        <Text className="text-white/80 text-base mb-8">
          Create memories, one word at a time
        </Text>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="white" />
      </View>
    </LinearGradient>
  );
}
