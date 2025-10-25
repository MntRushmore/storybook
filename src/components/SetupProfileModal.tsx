import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";

export function SetupProfileModal() {
  const [name, setName] = useState("");
  const createUserProfile = useStoryStore(s => s.createUserProfile);

  const handleCreate = () => {
    if (name.trim()) {
      createUserProfile(name.trim());
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FFF8F0] justify-center px-8"
    >
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-[#D4A5A5] items-center justify-center mb-4">
          <Ionicons name="heart" size={40} color="white" />
        </View>
        <Text className="text-[#5D4E37] text-3xl font-bold text-center mb-2">
          Welcome to
        </Text>
        <Text className="text-[#8B7355] text-3xl font-bold text-center mb-3">
          Our Story Book
        </Text>
        <Text className="text-[#A0886C] text-center text-base">
          Create beautiful memories together,{"\n"}one word at a time
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8D5C4]">
        <Text className="text-[#5D4E37] font-semibold text-base mb-2">
          What should we call you?
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#A0886C"
          className="bg-[#FFF8F0] text-[#5D4E37] rounded-xl px-4 py-3 text-base mb-4 border border-[#E8D5C4]"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />
        <Pressable
          onPress={handleCreate}
          disabled={!name.trim()}
          className={`rounded-xl py-4 items-center ${
            name.trim() ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
          }`}
        >
          <Text className="text-white font-semibold text-base">
            Get Started
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
