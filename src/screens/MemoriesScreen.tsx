import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type MemoriesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Memories">;
};

export function MemoriesScreen({ navigation }: MemoriesScreenProps) {
  const insets = useSafeAreaInsets();
  const finishedStories = useStoryStore(s => s.getFinishedStories());

  return (
    <View className="flex-1 bg-[#FFF8F0]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#8B7355] px-6 pb-4 shadow-sm"
      >
        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-white text-2xl font-semibold">Memories</Text>
            <Text className="text-[#F5E6D3] text-sm mt-1">
              {finishedStories.length}{" "}
              {finishedStories.length === 1 ? "story" : "stories"} saved
            </Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="heart" size={20} color="#FFF8F0" />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {finishedStories.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="mb-4">
              <Ionicons name="albums-outline" size={64} color="#C8B4A0" />
            </View>
            <Text className="text-[#8B7355] text-lg text-center mb-2">
              No finished stories yet
            </Text>
            <Text className="text-[#A0886C] text-center">
              Complete a story to save it here as a memory
            </Text>
          </View>
        ) : (
          <View className="space-y-4 pb-6">
            {finishedStories.map((story) => {
              const previewText = story.entries
                .map(e => e.text)
                .join(" ")
                .slice(0, 150);

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
                        {format(story.createdAt, "MMM d, yyyy")} •{" "}
                        {story.entries.length}{" "}
                        {story.entries.length === 1 ? "entry" : "entries"}
                      </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-[#F5E6D3] items-center justify-center">
                      <Ionicons name="bookmark" size={18} color="#D4A5A5" />
                    </View>
                  </View>

                  <Text
                    className="text-[#6D5C47] text-sm leading-6"
                    numberOfLines={4}
                  >
                    {previewText}
                    {story.entries.map(e => e.text).join(" ").length > 150 &&
                      "..."}
                  </Text>

                  <View className="flex-row items-center justify-end pt-3 mt-3 border-t border-[#E8D5C4]">
                    <Text className="text-[#D4A5A5] text-xs mr-1">
                      Read full story
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color="#D4A5A5" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
