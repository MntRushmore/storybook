import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useStoryStore } from "../state/storyStore";
import { useAuthStore } from "../state/authStore";
import { Story } from "../types/story";
import { THEMES } from "../constants/storyConstants";
import { format } from "date-fns";

type Props = NativeStackScreenProps<RootStackParamList, "BranchComparison">;

export function BranchComparisonScreen({ route, navigation }: Props) {
  const { parentPromptId } = route.params;
  const getBranchStories = useStoryStore(s => s.getBranchStories);
  const mergeBranches = useStoryStore(s => s.mergeBranches);
  const user = useAuthStore(s => s.user);

  const [viewMode, setViewMode] = useState<"side-by-side" | "toggle">("side-by-side");
  const [activeView, setActiveView] = useState<"user" | "partner">("user");
  const [showMergeModal, setShowMergeModal] = useState(false);

  const branchStories = getBranchStories(parentPromptId);

  if (branchStories.length === 0) {
    navigation.goBack();
    return null;
  }

  const userBranch = branchStories.find(s => s.branchAuthorId === user?.id);
  const partnerBranch = branchStories.find(s => s.branchAuthorId !== user?.id);

  if (!userBranch || !partnerBranch) {
    navigation.goBack();
    return null;
  }

  const theme = userBranch.theme;
  const themeColors = THEMES[theme];

  const userStoryText = userBranch.entries.map(e => e.word).join(" ");
  const partnerStoryText = partnerBranch.entries.map(e => e.word).join(" ");

  const handleMerge = async () => {
    try {
      const newStoryId = await mergeBranches(userBranch.id, partnerBranch.id);
      setShowMergeModal(false);
      navigation.replace("StoryDetail", { storyId: newStoryId });
    } catch (error) {
      console.error("Error merging branches:", error);
    }
  };

  const renderStoryPanel = (story: Story, title: string, accentColor: string) => (
    <View className="flex-1 bg-white/40 rounded-2xl p-4">
      <View className="flex-row items-center mb-3">
        <View style={{ backgroundColor: accentColor, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <Ionicons name="person" size={18} color="#FFF" />
        </View>
        <View>
          <Text className="text-[#5D4E37] font-bold">{title}</Text>
          <Text className="text-[#8B7355] text-xs">
            {story.entries.length} {story.entries.length === 1 ? "word" : "words"}
          </Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="text-[#5D4E37] leading-6">
          {story.entries.map(e => e.word).join(" ")}
        </Text>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F0]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4">
        <View className="flex-row items-center justify-between mb-2">
          <Pressable onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#8B7355" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-bold text-[#8B7355]" numberOfLines={1}>
              {userBranch.title}
            </Text>
            <Text className="text-[#A0927D] text-xs">
              {format(userBranch.createdAt, "MMM d, yyyy")}
            </Text>
          </View>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row bg-white rounded-xl p-1 mt-2">
          <Pressable
            onPress={() => setViewMode("side-by-side")}
            className={`flex-1 py-2 rounded-lg ${viewMode === "side-by-side" ? "bg-[#D4A5A5]" : ""}`}
          >
            <Text className={`text-center font-bold ${viewMode === "side-by-side" ? "text-white" : "text-[#8B7355]"}`}>
              Side by Side
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("toggle")}
            className={`flex-1 py-2 rounded-lg ${viewMode === "toggle" ? "bg-[#D4A5A5]" : ""}`}
          >
            <Text className={`text-center font-bold ${viewMode === "toggle" ? "text-white" : "text-[#8B7355]"}`}>
              Toggle
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Story Content */}
      <View className="flex-1 px-6">
        <LinearGradient
          colors={themeColors.gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, borderRadius: 24, padding: 16 }}
        >
          {viewMode === "side-by-side" ? (
            <View className="flex-row flex-1 space-x-3">
              {renderStoryPanel(userBranch, "Your Version", "#D4A5A5")}
              <View className="w-3" />
              {renderStoryPanel(partnerBranch, "Partner Version", "#85B79D")}
            </View>
          ) : (
            <View className="flex-1">
              {/* Toggle Buttons */}
              <View className="flex-row mb-3 space-x-2">
                <Pressable
                  onPress={() => setActiveView("user")}
                  className={`flex-1 py-3 rounded-xl ${activeView === "user" ? "bg-white/60" : "bg-white/20"}`}
                >
                  <Text className={`text-center font-bold ${activeView === "user" ? "text-[#5D4E37]" : "text-[#8B7355]"}`}>
                    Your Version
                  </Text>
                </Pressable>
                <View className="w-2" />
                <Pressable
                  onPress={() => setActiveView("partner")}
                  className={`flex-1 py-3 rounded-xl ${activeView === "partner" ? "bg-white/60" : "bg-white/20"}`}
                >
                  <Text className={`text-center font-bold ${activeView === "partner" ? "text-[#5D4E37]" : "text-[#8B7355]"}`}>
                    Partner Version
                  </Text>
                </Pressable>
              </View>

              {/* Active Story */}
              {renderStoryPanel(
                activeView === "user" ? userBranch : partnerBranch,
                activeView === "user" ? "Your Version" : "Partner Version",
                activeView === "user" ? "#D4A5A5" : "#85B79D"
              )}
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View className="px-6 py-4 space-y-3">
        <Pressable onPress={() => setShowMergeModal(true)}>
          <LinearGradient
            colors={["#D4A5A5", "#E8B4B8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="git-merge" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-base">Merge Branches</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Merge Confirmation Modal */}
      <Modal visible={showMergeModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-[#FFF8F0] rounded-3xl p-6 w-full max-w-md">
            <Text className="text-2xl font-bold text-[#5D4E37] mb-3">Merge Branches?</Text>
            <Text className="text-[#8B7355] mb-6 leading-5">
              This will create a new collaborative story that combines elements from both branches. You can continue writing together!
            </Text>
            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setShowMergeModal(false)}
                className="flex-1 bg-[#E8D5C4] py-4 rounded-xl"
              >
                <Text className="text-[#8B7355] font-bold text-center">Cancel</Text>
              </Pressable>
              <View className="w-3" />
              <Pressable
                onPress={handleMerge}
                className="flex-1 bg-[#D4A5A5] py-4 rounded-xl"
              >
                <Text className="text-white font-bold text-center">Merge</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
