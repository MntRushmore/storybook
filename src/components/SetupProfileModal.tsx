import React from "react";
import { View, Text } from "react-native";

// This component is no longer used - auth is handled by Supabase Auth
// Keeping for backwards compatibility but it should never be rendered
export function SetupProfileModal() {
  return (
    <View className="flex-1 bg-[#FFF8F0] justify-center items-center">
      <Text className="text-[#8B7355]">Loading...</Text>
    </View>
  );
}
