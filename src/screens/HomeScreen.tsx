import React, { useState, useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
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
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#8B7355] px-6 pb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-white text-2xl font-semibold">
              Our Story Book
            </Text>
            <Text className="text-[#F5E6D3] text-sm mt-1">
              {userProfile.name}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="#FFF8F0" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 pt-6">
        {/* Streak Display */}
        <StreakDisplay />

        <View className="px-6">
        {/* Daily Prompt Card */}
        <View
          className="bg-gradient-to-br from-[#D4A5A5] to-[#C98686] rounded-2xl p-5 mb-6 shadow-sm"
          style={{
            backgroundColor: "#D4A5A5",
            shadowColor: "#8B7355",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
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
        </View>

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
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4]"
                  style={{
                    shadowColor: "#8B7355",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-[#5D4E37] text-lg font-semibold mb-1">
                        {story.title}
                      </Text>
                      <Text className="text-[#A0886C] text-xs">
                        {format(story.updatedAt, "MMM d, yyyy")}
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-[#F5E6D3] items-center justify-center">
                      <Ionicons name="book" size={18} color="#8B7355" />
                    </View>
                  </View>

                  {previewText ? (
                    <Text
                      className="text-[#6D5C47] text-sm leading-6 mb-3"
                      numberOfLines={3}
                    >
                      {previewText}
                      {story.entries.map(e => e.word).join(" ").length > 100 &&
                        "..."}
                    </Text>
                  ) : (
                    <Text className="text-[#A0886C] text-sm italic mb-3">
                      Start writing...
                    </Text>
                  )}

                  <View className="flex-row items-center justify-between pt-3 border-t border-[#E8D5C4]">
                    <Text className="text-[#A0886C] text-xs">
                      {story.entries.length}{" "}
                      {story.entries.length === 1 ? "word" : "words"}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-[#D4A5A5] text-xs mr-1">
                        Continue
                      </Text>
                      <Ionicons name="arrow-forward" size={12} color="#D4A5A5" />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 items-center px-6"
      >
        <View className="flex-row space-x-3 w-full justify-center">
          <Pressable
            onPress={() => navigation.navigate("JoinSession")}
            className="bg-white rounded-full px-6 py-4 shadow-lg flex-row items-center border-2 border-[#D4A5A5]"
            style={{
              shadowColor: "#8B7355",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="enter" size={24} color="#D4A5A5" />
            <Text className="text-[#D4A5A5] font-semibold text-base ml-2">
              Join
            </Text>
          </Pressable>
          <Pressable
            onPress={handleNewStory}
            className="bg-[#D4A5A5] rounded-full px-6 py-4 shadow-lg flex-row items-center"
            style={{
              shadowColor: "#8B7355",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              New Story
            </Text>
          </Pressable>
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
