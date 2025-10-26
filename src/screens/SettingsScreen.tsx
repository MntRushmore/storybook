import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { useAuthStore } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { PaywallModal } from "../components/PaywallModal";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showPaywall, setShowPaywall] = useState(false);

  const user = useAuthStore(s => s.user);
  const stories = useStoryStore(s => s.stories);
  const signOut = useAuthStore(s => s.signOut);

  const isPremium = false; // TODO: Get from Supabase profile

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FFF8F0]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#8B7355] px-6 pb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between mt-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#FFF8F0" />
          </Pressable>
          <Text className="text-white text-xl font-semibold">Settings</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Profile Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <Text className="text-[#8B7355] font-semibold text-base mb-4">
            Your Profile
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: "#D4A5A5" }}
            >
              <Text className="text-white text-2xl font-bold">
                {user?.user_metadata?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "ME"}
              </Text>
            </View>
            <View>
              <Text className="text-[#5D4E37] font-semibold text-lg">
                {user?.user_metadata?.name || user?.email || "User"}
              </Text>
              <Text className="text-[#A0886C] text-sm mt-1">
                {stories.length} {stories.length === 1 ? "story" : "stories"}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text className="text-[#8B7355] font-semibold text-base ml-2">
              Premium Status
            </Text>
          </View>

          {isPremium ? (
            <View>
              <View className="bg-[#FFD700]/10 rounded-xl p-4 mb-3 border border-[#FFD700]/30">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
                  <Text className="text-[#8B7355] font-semibold ml-2">Premium Active</Text>
                </View>
                <Text className="text-[#A0886C] text-sm">
                  You have access to all premium features including unlimited stories, all themes, and streak tracking.
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-[#A0886C] text-sm mb-4">
                Upgrade to premium for unlimited stories, all themes, voice input, and more!
              </Text>
              <Pressable
                onPress={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl py-4 items-center"
                style={{ backgroundColor: "#FFD700" }}
              >
                <Text className="text-white font-bold text-base">Go Premium ✨</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Account Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <Text className="text-[#8B7355] font-semibold text-base mb-3">
            Account
          </Text>
          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-between py-3"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={20} color="#C98686" />
              <Text className="text-[#C98686] text-base ml-3 font-medium">
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C98686" />
          </Pressable>
        </View>

        {/* About Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <Text className="text-[#8B7355] font-semibold text-base mb-3">
            About
          </Text>
          <Text className="text-[#A0886C] text-sm leading-6">
            Dear We lets you create beautiful memories with anyone. Write stories one word or sentence at a time using story codes, save your favorites, and revisit them anytime.
          </Text>
        </View>
      </ScrollView>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          setShowPaywall(false);
        }}
      />
    </View>
  );
}
