import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

type StoryDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "StoryDetail">;
  route: RouteProp<RootStackParamList, "StoryDetail">;
};

export function StoryDetailScreen({
  navigation,
  route,
}: StoryDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const { storyId } = route.params;
  const [newText, setNewText] = useState("");
  const [showInput, setShowInput] = useState(false);

  const story = useStoryStore(s => s.getStoryById(storyId));
  const userProfile = useStoryStore(s => s.userProfile);
  const addEntry = useStoryStore(s => s.addEntry);
  const finishStory = useStoryStore(s => s.finishStory);
  const deleteStory = useStoryStore(s => s.deleteStory);

  useEffect(() => {
    if (!story) {
      navigation.goBack();
    }
  }, [story, navigation]);

  if (!story || !userProfile) {
    return null;
  }

  const handleAddEntry = () => {
    if (newText.trim()) {
      addEntry(storyId, newText.trim());
      setNewText("");
      setShowInput(false);
    }
  };

  const handleFinishStory = () => {
    Alert.alert(
      "Finish Story?",
      "This will move the story to your Memories. You cannot add more entries after finishing.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Finish",
          style: "default",
          onPress: () => {
            finishStory(storyId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteStory = () => {
    Alert.alert("Delete Story?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteStory(storyId);
          navigation.goBack();
        },
      },
    ]);
  };

  const storyText = story.entries.map(e => e.text).join(" ");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FFF8F0]"
    >
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
          <View className="flex-1 mx-4">
            <Text
              className="text-white text-lg font-semibold text-center"
              numberOfLines={1}
            >
              {story.title}
            </Text>
          </View>
          <Pressable
            onPress={handleDeleteStory}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="#FFF8F0" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-4">
        {/* Story Content */}
        <View
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8D5C4] mb-6"
          style={{
            shadowColor: "#8B7355",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {story.entries.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="create-outline" size={48} color="#C8B4A0" />
              <Text className="text-[#A0886C] text-center mt-4">
                Start your story by adding your first words below
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-[#5D4E37] text-base leading-7 mb-6">
                {story.entries.map((entry, index) => (
                  <Text key={entry.id}>
                    <Text className="text-[#5D4E37]">{entry.text}</Text>
                    <Text className="text-[#D4A5A5] text-xs"> ({userProfile.userId === entry.userId ? userProfile.initials : "Partner"})</Text>
                    {index < story.entries.length - 1 && " "}
                  </Text>
                ))}
              </Text>

              <View className="border-t border-[#E8D5C4] pt-4">
                <Text className="text-[#A0886C] text-xs">
                  {story.entries.length}{" "}
                  {story.entries.length === 1 ? "entry" : "entries"} •{" "}
                  {format(story.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Add Entry Section */}
        {!showInput ? (
          <Pressable
            onPress={() => setShowInput(true)}
            className="bg-[#D4A5A5] rounded-2xl p-4 flex-row items-center justify-center shadow-sm mb-4"
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Add to Story
            </Text>
          </Pressable>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8D5C4] mb-4">
              <Text className="text-[#8B7355] font-semibold mb-2">
                Add your words
              </Text>
              <TextInput
                value={newText}
                onChangeText={setNewText}
                placeholder="Continue the story..."
                placeholderTextColor="#A0886C"
                multiline
                autoFocus
                className="bg-[#FFF8F0] text-[#5D4E37] rounded-xl px-4 py-3 text-base mb-3 border border-[#E8D5C4] min-h-[80px]"
                textAlignVertical="top"
              />
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={() => {
                    setNewText("");
                    setShowInput(false);
                  }}
                  className="flex-1 bg-[#E8D5C4] rounded-xl py-3 items-center"
                >
                  <Text className="text-[#8B7355] font-semibold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddEntry}
                  disabled={!newText.trim()}
                  className={`flex-1 rounded-xl py-3 items-center ${
                    newText.trim() ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
                  }`}
                >
                  <Text className="text-white font-semibold">Add</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Finish Story Button */}
        {story.entries.length > 0 && (
          <Pressable
            onPress={handleFinishStory}
            className="bg-[#8B7355] rounded-2xl p-4 flex-row items-center justify-center shadow-sm mb-4"
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Finish Story
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
