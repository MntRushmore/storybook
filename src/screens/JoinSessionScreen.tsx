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
import { useAuthStore } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type JoinSessionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "JoinSession">;
};

export function JoinSessionScreen({ navigation }: JoinSessionScreenProps) {
  const insets = useSafeAreaInsets();
  const [storyCode, setStoryCode] = useState("");
  const [error, setError] = useState("");

  const user = useAuthStore(s => s.user);
  const joinWithCode = useStoryStore(s => s.joinWithCode);

  const handleJoin = async () => {
    setError("");

    if (!user) {
      setError("Please sign in first");
      return;
    }

    if (storyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // Try to join story via code
    const result = await joinWithCode(storyCode);

    if (!result.success) {
      setError(result.error || "Failed to join. Check the code and try again.");
      return;
    }

    // Navigate to the story
    if (result.storyId) {
      navigation.navigate("StoryDetail", { storyId: result.storyId });
    } else {
      navigation.goBack();
    }
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
                <Ionicons name="book" size={40} color="white" />
              </View>
              <Text className="text-[#5D4E37] text-2xl font-bold text-center mb-2">
                Join a Story
              </Text>
              <Text className="text-[#A0886C] text-center text-base">
                Enter the 6-digit story code to join and write together
              </Text>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8D5C4] mb-4">
              <Text className="text-[#8B7355] font-semibold text-base mb-3">
                Story Code
              </Text>
              <TextInput
                value={storyCode}
                onChangeText={(text) => {
                  setStoryCode(text);
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
              disabled={storyCode.length !== 6}
              className={`rounded-2xl py-4 items-center shadow-sm ${
                storyCode.length === 6 ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
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
