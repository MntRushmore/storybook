import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Story } from "../types/story";
import { THEMES } from "../constants/storyConstants";
import { format } from "date-fns";

interface BranchStoryCardProps {
  stories: Story[]; // Array of branch stories with same parentPromptId
  onPress: () => void;
  currentUserId: string;
}

export function BranchStoryCard({ stories, onPress, currentUserId }: BranchStoryCardProps) {
  if (stories.length === 0) return null;

  // Get the parent prompt info from the first story
  const parentStory = stories[0];
  const theme = parentStory.theme;
  const themeColors = THEMES[theme];

  // Separate user's branch and partner's branch
  const userBranch = stories.find(s => s.branchAuthorId === currentUserId);
  const partnerBranch = stories.find(s => s.branchAuthorId !== currentUserId);

  // Check if both branches are finished
  const bothFinished = userBranch?.isFinished && partnerBranch?.isFinished;
  const userFinished = userBranch?.isFinished || false;
  const partnerFinished = partnerBranch?.isFinished || false;

  // Get word counts
  const userWordCount = userBranch?.entries.length || 0;
  const partnerWordCount = partnerBranch?.entries.length || 0;

  return (
    <Pressable onPress={onPress} className="mb-4">
      <LinearGradient
        colors={themeColors.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 20 }}
      >
        {/* Header with Branch Icon */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="bg-white/40 p-2 rounded-full mr-3">
              <Ionicons name="git-branch" size={20} color={themeColors.color} />
            </View>
            <View className="flex-1">
              <Text className="text-[#5D4E37] font-bold text-base" numberOfLines={1}>
                {parentStory.title}
              </Text>
              <Text className="text-[#8B7355] text-xs">
                {format(parentStory.createdAt, "MMM d, yyyy")}
              </Text>
            </View>
          </View>
          {bothFinished && (
            <View className="bg-white/60 px-3 py-1 rounded-full">
              <Text className="text-[#5D4E37] text-xs font-bold">Complete</Text>
            </View>
          )}
        </View>

        {/* Branch Status Indicators */}
        <View className="flex-row mt-3 space-x-2">
          {/* User's Branch */}
          <View className="flex-1 bg-white/30 rounded-xl p-3 mr-2">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#5D4E37] font-bold text-sm">Your Version</Text>
              {userFinished ? (
                <Ionicons name="checkmark-circle" size={18} color="#85B79D" />
              ) : (
                <Ionicons name="create" size={16} color="#8B7355" />
              )}
            </View>
            <Text className="text-[#8B7355] text-xs">
              {userWordCount} {userWordCount === 1 ? "word" : "words"}
            </Text>
            {!userFinished && (
              <Text className="text-[#D4A5A5] text-xs font-bold mt-1">In Progress</Text>
            )}
          </View>

          {/* Partner's Branch */}
          <View className="flex-1 bg-white/30 rounded-xl p-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[#5D4E37] font-bold text-sm">Partner&apos;s Version</Text>
              {partnerFinished ? (
                <Ionicons name="checkmark-circle" size={18} color="#85B79D" />
              ) : (
                <Ionicons name="time" size={16} color="#8B7355" />
              )}
            </View>
            <Text className="text-[#8B7355] text-xs">
              {partnerWordCount} {partnerWordCount === 1 ? "word" : "words"}
            </Text>
            {!partnerFinished && (
              <Text className="text-[#F9C74F] text-xs font-bold mt-1">Waiting...</Text>
            )}
          </View>
        </View>

        {/* Call to Action */}
        {bothFinished && (
          <View className="mt-3 bg-white/50 rounded-xl p-3 flex-row items-center justify-between">
            <Text className="text-[#5D4E37] font-bold text-sm">Ready to compare!</Text>
            <Ionicons name="chevron-forward" size={20} color="#5D4E37" />
          </View>
        )}

        {!bothFinished && !userFinished && (
          <View className="mt-3 bg-white/50 rounded-xl p-3 flex-row items-center justify-between">
            <Text className="text-[#5D4E37] font-bold text-sm">Continue writing</Text>
            <Ionicons name="chevron-forward" size={20} color="#5D4E37" />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
