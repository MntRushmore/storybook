import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

type StoryRevealScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "StoryReveal">;
  route: RouteProp<RootStackParamList, "StoryReveal">;
};

export function StoryRevealScreen({
  navigation,
  route,
}: StoryRevealScreenProps) {
  const insets = useSafeAreaInsets();
  const { storyId } = route.params;

  const story = useStoryStore(s => s.getStoryById(storyId));
  const revealStory = useStoryStore(s => s.revealStory);

  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!story) {
      navigation.goBack();
      return;
    }

    // Only run animation once
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Mark story as revealed
    revealStory(storyId);

    // Vibrate on reveal
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animate page reveal
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    opacity.value = withSpring(1);

    // Animate heart after delay
    heartScale.value = withDelay(
      800,
      withSequence(
        withSpring(1.3, { damping: 10 }),
        withSpring(1, { damping: 15 })
      )
    );
  }, [storyId, navigation]);

  const pageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  if (!story) {
    return null;
  }

  const fullStory = story.entries.map(e => e.word).join(" ");

  return (
    <View className="flex-1 bg-[#8B7355]">
      <View
        style={{ paddingTop: insets.top }}
        className="px-6 pb-4"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mt-2"
        >
          <Ionicons name="close" size={24} color="#FFF8F0" />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={[pageStyle]}
          className="bg-[#FFF8F0] rounded-3xl p-8 w-full max-w-md shadow-2xl"
        >
          {/* Decorative Header */}
          <Animated.View
            entering={FadeIn.delay(1000)}
            className="items-center mb-6"
          >
            <Animated.View style={heartStyle}>
              <Ionicons name="heart" size={48} color="#D4A5A5" />
            </Animated.View>
            <Text className="text-[#8B7355] text-2xl font-bold mt-4">
              Story Complete!
            </Text>
            <Text className="text-[#A0886C] text-sm mt-1">
              {format(story.createdAt, "MMMM d, yyyy")}
            </Text>
          </Animated.View>

          {/* Story Title */}
          <Animated.View
            entering={SlideInUp.delay(1200)}
            className="mb-6"
          >
            <View className="border-b-2 border-[#E8D5C4] pb-3">
              <Text className="text-[#5D4E37] text-xl font-semibold text-center">
                {story.title}
              </Text>
            </View>
          </Animated.View>

          {/* Story Content */}
          <Animated.View
            entering={SlideInUp.delay(1400)}
            className="mb-6"
          >
            <ScrollView
              className="max-h-80"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-[#5D4E37] text-lg leading-8 text-center">
                {fullStory}
              </Text>
            </ScrollView>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            entering={FadeIn.delay(1600)}
            className="flex-row justify-around py-4 border-t border-[#E8D5C4]"
          >
            <View className="items-center">
              <Text className="text-[#D4A5A5] text-2xl font-bold">
                {story.entries.length}
              </Text>
              <Text className="text-[#A0886C] text-xs mt-1">words</Text>
            </View>
            <View className="w-px bg-[#E8D5C4]" />
            <View className="items-center">
              <Text className="text-[#D4A5A5] text-2xl font-bold">
                {story.partnerId ? "2" : "1"}
              </Text>
              <Text className="text-[#A0886C] text-xs mt-1">
                {story.partnerId ? "authors" : "author"}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={SlideInUp.delay(1800)}
          className="w-full mt-6 space-y-3"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-white rounded-2xl py-4 items-center shadow-lg"
          >
            <Text className="text-[#8B7355] font-semibold text-base">
              View in Memories
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              navigation.navigate("Home");
            }}
            className="bg-white/20 rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Start New Story
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
