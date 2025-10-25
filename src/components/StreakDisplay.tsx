import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useStreakStore } from "../state/streakStore";

export function StreakDisplay() {
  const stats = useStreakStore(s => s.stats);

  if (!stats) {
    return null;
  }

  const { currentStreak, longestStreak } = stats;

  return (
    <View className="flex-row items-center justify-center space-x-4 bg-white/50 rounded-2xl p-4 mx-6 mb-4">
      {/* Current Streak */}
      <View className="flex-1 items-center">
        <View className="flex-row items-center mb-1">
          <Ionicons name="flame" size={24} color="#FF6B35" />
          <Text className="text-3xl font-bold text-[#8B7355] ml-2">{currentStreak}</Text>
        </View>
        <Text className="text-[#A0927D] text-sm">Day Streak</Text>
      </View>

      {/* Divider */}
      <View className="w-px h-12 bg-[#E8D5C5]" />

      {/* Longest Streak */}
      <View className="flex-1 items-center">
        <View className="flex-row items-center mb-1">
          <Ionicons name="trophy" size={24} color="#FFD700" />
          <Text className="text-3xl font-bold text-[#8B7355] ml-2">{longestStreak}</Text>
        </View>
        <Text className="text-[#A0927D] text-sm">Best Streak</Text>
      </View>
    </View>
  );
}

interface StreakBadgeProps {
  streak: number;
  size?: "small" | "large";
}

export function StreakBadge({ streak, size = "small" }: StreakBadgeProps) {
  const iconSize = size === "small" ? 16 : 20;
  const textSize = size === "small" ? "text-sm" : "text-base";

  if (streak === 0) {
    return null;
  }

  return (
    <View className="flex-row items-center bg-[#FF6B35]/10 px-3 py-1 rounded-full">
      <Ionicons name="flame" size={iconSize} color="#FF6B35" />
      <Text className={`${textSize} font-bold text-[#FF6B35] ml-1`}>{streak}</Text>
    </View>
  );
}
