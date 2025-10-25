import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { LinearGradient } from "expo-linear-gradient";
import { CreateStoryModal } from "../components/CreateStoryModal";
import { SetupProfileModal } from "../components/SetupProfileModal";
import { StreakDisplay } from "../components/StreakDisplay";
import { getTodayPrompt, getRandomPrompt } from "../utils/dailyPrompts";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(getTodayPrompt());
  const userProfile = useStoryStore(s => s.userProfile);
  const stories = useStoryStore(s => s.stories);
  const createStory = useStoryStore(s => s.createStory);

  const activeStories = useMemo(() => stories.filter(s => !s.isFinished), [stories]);

  const handleUsePrompt = async () => {
    navigation.navigate("TemplateSelection");
  };

  const handleShufflePrompt = () => {
    setCurrentPrompt(getRandomPrompt());
  };

  const handleNewStory = () => {
    navigation.navigate("TemplateSelection");
  };

  if (!userProfile) {
    return <SetupProfileModal />;
  }

  return (
    <View className="flex-1 bg-[#FFF8F0]">
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={["#D4A5A5", "#C8A4A4", "#B89B9B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 20,
          paddingHorizontal: 24,
          shadowColor: "#8B7355",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="book" size={28} color="white" />
              <Text className="text-white text-2xl font-bold ml-2">
                Our Story Book
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <View className="w-6 h-6 rounded-full bg-white/30 items-center justify-center mr-2">
                <Ionicons name="person" size={14} color="white" />
              </View>
              <Text className="text-white/90 text-sm font-medium">
                {userProfile.name}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            className="w-12 h-12 rounded-full bg-white/25 items-center justify-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </Pressable>
        </View>

        {/* Streak Display in Header */}
        <View className="mt-2">
          <StreakDisplay />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
        <View className="px-6">
        {/* Enhanced Daily Prompt Card */}
        <LinearGradient
          colors={["#E8B4B8", "#D4A5A5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
            shadowColor: "#8B7355",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/30 rounded-full p-2 mr-3">
                <Ionicons name="bulb" size={20} color="white" />
              </View>
              <Text className="text-white font-semibold text-base">
                {"Today's Prompt"}
              </Text>
            </View>
            <Pressable
              onPress={handleShufflePrompt}
              className="bg-white/30 rounded-full p-2"
            >
              <Ionicons name="shuffle" size={20} color="white" />
            </Pressable>
          </View>
          <Pressable onPress={handleUsePrompt}>
            <Text className="text-white text-lg font-bold mb-2">
              {currentPrompt}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white/90 text-sm mr-2">
                Tap to start writing
              </Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </View>
          </Pressable>
        </LinearGradient>

        {activeStories.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="mb-4">
              <Ionicons name="book-outline" size={64} color="#C8B4A0" />
            </View>
            <Text className="text-[#8B7355] text-lg text-center mb-2">
              No stories yet
            </Text>
            <Text className="text-[#A0886C] text-center mb-1">Start your first story together!</Text>
            <Text className="text-[#A0886C] text-center text-sm">
              Create memories, one word at a time ✨
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-6">
            {activeStories.map((story) => {
              const previewText = story.entries
                .map(e => e.word)
                .join(" ")
                .slice(0, 100);

              return (
                <Pressable
                  key={story.id}
                  onPress={() =>
                    navigation.navigate("StoryDetail", { storyId: story.id })
                  }
                  className="bg-white rounded-2xl p-5 mb-4 border-2 border-[#E8D5C4]"
                  style={{
                    shadowColor: "#8B7355",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-[#5D4E37] text-xl font-bold mb-1">
                        {story.title}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="calendar-outline" size={12} color="#A0886C" />
                        <Text className="text-[#A0886C] text-xs ml-1">
                          {format(story.updatedAt, "MMM d, yyyy")}
                        </Text>
                      </View>
                    </View>
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A5A5] to-[#E8B4B8] items-center justify-center"
                      style={{ backgroundColor: "#D4A5A5" }}
                    >
                      <Ionicons name="book" size={22} color="white" />
                    </View>
                  </View>

                  {previewText ? (
                    <View className="bg-[#FFF8F0] rounded-xl p-3 mb-3">
                      <Text
                        className="text-[#6D5C47] text-sm leading-6"
                        numberOfLines={3}
                      >
                        {previewText}
                        {story.entries.map(e => e.word).join(" ").length > 100 &&
                          "..."}
                      </Text>
                    </View>
                  ) : (
                    <View className="bg-[#FFF8F0] rounded-xl p-3 mb-3">
                      <Text className="text-[#A0886C] text-sm italic">
                        Start writing...
                      </Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between pt-3 border-t border-[#E8D5C4]">
                    <View className="flex-row items-center">
                      <Ionicons name="pencil" size={14} color="#A0886C" />
                      <Text className="text-[#A0886C] text-xs ml-1 font-medium">
                        {story.entries.length}{" "}
                        {story.entries.length === 1 ? "word" : "words"}
                      </Text>
                    </View>
                    <View className="flex-row items-center bg-[#D4A5A5]/10 px-3 py-1.5 rounded-full">
                      <Text className="text-[#D4A5A5] text-xs font-semibold mr-1">
                        Continue
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#D4A5A5" />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        </View>
      </ScrollView>

      {/* Enhanced Floating Action Buttons */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 items-center px-6"
      >
        <View className="flex-row space-x-3 w-full justify-center">
          <Pressable
            onPress={() => navigation.navigate("JoinSession")}
            className="bg-white rounded-full px-7 py-4 shadow-lg flex-row items-center border-2 border-[#D4A5A5]"
            style={{
              shadowColor: "#8B7355",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Ionicons name="people" size={24} color="#D4A5A5" />
            <Text className="text-[#D4A5A5] font-bold text-base ml-2">
              Join
            </Text>
          </Pressable>
          <LinearGradient
            colors={["#E8B4B8", "#D4A5A5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 999,
              shadowColor: "#8B7355",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Pressable
              onPress={handleNewStory}
              className="px-7 py-4 flex-row items-center"
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                New Story
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>

      <CreateStoryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={(storyId: string) => {
          setShowCreateModal(false);
          navigation.navigate("StoryDetail", { storyId });
        }}
      />
    </View>
  );
}
