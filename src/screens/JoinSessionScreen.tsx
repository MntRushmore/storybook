import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type JoinSessionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "JoinSession">;
};

export function JoinSessionScreen({ navigation }: JoinSessionScreenProps) {
  const insets = useSafeAreaInsets();
  const [sessionCode, setSessionCode] = useState("");
  const [error, setError] = useState("");

  const stories = useStoryStore(s => s.stories);
  const userProfile = useStoryStore(s => s.userProfile);
  const joinSession = useStoryStore(s => s.joinSession);

  const handleJoin = () => {
    setError("");

    if (!userProfile) {
      setError("Please set up your profile first");
      return;
    }

    if (sessionCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // Find story with this session code
    const story = stories.find(s => s.sessionCode === sessionCode);

    if (!story) {
      setError("Story not found. Check the code and try again.");
      return;
    }

    if (story.partnerId) {
      setError("This story already has a partner");
      return;
    }

    // Join the session
    joinSession(sessionCode, userProfile.userId);

    // Navigate to the story
    navigation.navigate("StoryDetail", { storyId: story.id });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FFF8F0]"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
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
              <Text className="text-white text-xl font-semibold">
                Join Story
              </Text>
              <View className="w-10" />
            </View>
          </View>

          {/* Content */}
          <View className="flex-1 justify-center px-8">
            <View className="items-center mb-8">
              <View className="w-20 h-20 rounded-full bg-[#D4A5A5] items-center justify-center mb-4">
                <Ionicons name="people" size={40} color="white" />
              </View>
              <Text className="text-[#5D4E37] text-2xl font-bold text-center mb-2">
                Join Your Partner
              </Text>
              <Text className="text-[#A0886C] text-center text-base">
                Enter the 6-digit code your partner shared with you to start writing together
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8D5C4] mb-4">
              <Text className="text-[#8B7355] font-semibold text-base mb-3">
                Session Code
              </Text>
              <TextInput
                value={sessionCode}
                onChangeText={(text) => {
                  setSessionCode(text);
                  setError("");
                }}
                placeholder="123456"
                placeholderTextColor="#A0886C"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                className="bg-[#FFF8F0] text-[#5D4E37] rounded-xl px-4 py-4 text-center text-3xl font-bold mb-3 border-2 border-[#E8D5C4]"
                style={{ letterSpacing: 8 }}
              />
              {error !== "" && (
                <View className="bg-red-50 rounded-xl p-3 flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text className="text-red-600 text-sm ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={handleJoin}
              disabled={sessionCode.length !== 6}
              className={`rounded-2xl py-4 items-center shadow-sm ${
                sessionCode.length === 6 ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
              }`}
            >
              <Text className="text-white font-semibold text-base">
                Join Story
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.goBack()}
              className="mt-4 py-3 items-center"
            >
              <Text className="text-[#A0886C] text-base">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
