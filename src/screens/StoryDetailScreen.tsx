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
  Modal,
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
  const [newWord, setNewWord] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  const story = useStoryStore(s => s.getStoryById(storyId));
  const userProfile = useStoryStore(s => s.userProfile);
  const addWord = useStoryStore(s => s.addWord);
  const finishStory = useStoryStore(s => s.finishStory);
  const deleteStory = useStoryStore(s => s.deleteStory);

  useEffect(() => {
    if (!story) {
      navigation.goBack();
      return;
    }

    // Auto-navigate to reveal screen when story reaches max words
    if (story.isFinished && !story.isRevealed) {
      navigation.navigate("StoryReveal", { storyId });
    }
  }, [story, navigation, storyId]);

  if (!story || !userProfile) {
    return null;
  }

  // Compute these values from story directly (avoid Zustand selector functions)
  const isMyTurn = story.currentTurnUserId === userProfile.userId;
  const lastThreeWords = story.entries.slice(-3).map(e => e.word);

  const handleAddWord = () => {
    const trimmedWord = newWord.trim();
    if (trimmedWord) {
      // Validate it's a single word
      const wordCount = trimmedWord.split(/\s+/).length;
      if (wordCount > 1) {
        // Show error - only one word allowed
        return;
      }
      addWord(storyId, trimmedWord);
      setNewWord("");
      setShowInput(false);
    }
  };

  const handleFinishStory = () => {
    finishStory(storyId);
    setShowFinishModal(false);
    // Navigate to reveal screen
    navigation.navigate("StoryReveal", { storyId });
  };

  const handleDeleteStory = () => {
    deleteStory(storyId);
    setShowDeleteModal(false);
    navigation.goBack();
  };

  const wordsRemaining = story.maxWords - story.entries.length;
  const progressPercent = (story.entries.length / story.maxWords) * 100;

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
            onPress={() => setShowDeleteModal(true)}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          >
            <Ionicons name="trash-outline" size={20} color="#FFF8F0" />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View className="mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-[#F5E6D3] text-xs">
              {story.entries.length} / {story.maxWords} words
            </Text>
            <Text className="text-[#F5E6D3] text-xs">
              {wordsRemaining} remaining
            </Text>
          </View>
          <View className="h-2 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#D4A5A5] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-4">
        {/* Turn Indicator */}
        {!story.isFinished && (
          <View
            className={`rounded-2xl p-4 mb-4 ${
              isMyTurn ? "bg-[#D4A5A5]" : "bg-white border border-[#E8D5C4]"
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name={isMyTurn ? "pencil" : "time-outline"}
                size={20}
                color={isMyTurn ? "white" : "#A0886C"}
              />
              <Text
                className={`ml-2 font-semibold ${
                  isMyTurn ? "text-white" : "text-[#A0886C]"
                }`}
              >
                {isMyTurn ? "Your turn to add a word!" : "Waiting for your partner..."}
              </Text>
            </View>
          </View>
        )}

        {/* Last 3 Words Preview */}
        {lastThreeWords.length > 0 && !story.isFinished && (
          <View className="bg-[#FFF8F0] rounded-2xl p-4 mb-4 border-2 border-[#E8D5C4]">
            <Text className="text-[#8B7355] text-xs font-semibold mb-2">
              LAST {lastThreeWords.length === 1 ? "WORD" : "WORDS"}
            </Text>
            <Text className="text-[#5D4E37] text-xl font-semibold">
              {lastThreeWords.join(" ")}
            </Text>
          </View>
        )}

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
                Start your story by adding your first word below
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-[#5D4E37] text-lg leading-8 mb-6">
                {story.entries.map((entry, index) => (
                  <Text key={entry.id}>
                    <Text className="text-[#5D4E37]">{entry.word}</Text>
                    {index < story.entries.length - 1 && " "}
                  </Text>
                ))}
              </Text>

              <View className="border-t border-[#E8D5C4] pt-4">
                <Text className="text-[#A0886C] text-xs">
                  {story.entries.length}{" "}
                  {story.entries.length === 1 ? "word" : "words"} •{" "}
                  {format(story.updatedAt, "MMM d, yyyy 'at' h:mm a")}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Add Word Section */}
        {!story.isFinished && isMyTurn && (
          <>
            {!showInput ? (
              <Pressable
                onPress={() => setShowInput(true)}
                className="bg-[#D4A5A5] rounded-2xl p-4 flex-row items-center justify-center shadow-sm mb-4"
              >
                <Ionicons name="add-circle-outline" size={24} color="white" />
                <Text className="text-white font-semibold text-base ml-2">
                  Add Your Word
                </Text>
              </Pressable>
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8D5C4] mb-4">
                  <Text className="text-[#8B7355] font-semibold mb-2">
                    Add one word
                  </Text>
                  <TextInput
                    value={newWord}
                    onChangeText={setNewWord}
                    placeholder="Type a word..."
                    placeholderTextColor="#A0886C"
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="bg-[#FFF8F0] text-[#5D4E37] rounded-xl px-4 py-3 text-lg mb-3 border border-[#E8D5C4]"
                  />
                  {newWord.trim().split(/\s+/).length > 1 && (
                    <Text className="text-red-500 text-sm mb-2">
                      Only one word at a time!
                    </Text>
                  )}
                  <View className="flex-row space-x-2">
                    <Pressable
                      onPress={() => {
                        setNewWord("");
                        setShowInput(false);
                      }}
                      className="flex-1 bg-[#E8D5C4] rounded-xl py-3 items-center"
                    >
                      <Text className="text-[#8B7355] font-semibold">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddWord}
                      disabled={!newWord.trim() || newWord.trim().split(/\s+/).length > 1}
                      className={`flex-1 rounded-xl py-3 items-center ${
                        newWord.trim() && newWord.trim().split(/\s+/).length === 1
                          ? "bg-[#D4A5A5]"
                          : "bg-[#E8D5C4]"
                      }`}
                    >
                      <Text className="text-white font-semibold">Add</Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          </>
        )}

        {/* Session Code Display */}
        {story.sessionCode && !story.partnerId && (
          <View className="bg-[#F5E6D3] rounded-2xl p-4 mb-4 border border-[#E8D5C4]">
            <View className="flex-row items-center mb-2">
              <Ionicons name="share-social" size={20} color="#8B7355" />
              <Text className="text-[#8B7355] font-semibold ml-2">
                Share this code with your partner
              </Text>
            </View>
            <Text className="text-[#5D4E37] text-3xl font-bold text-center tracking-wider">
              {story.sessionCode}
            </Text>
          </View>
        )}

        {/* Finish Story Button */}
        {story.entries.length > 0 && !story.isFinished && (
          <Pressable
            onPress={() => setShowFinishModal(true)}
            className="bg-[#8B7355] rounded-2xl p-4 flex-row items-center justify-center shadow-sm mb-4"
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Finish Story
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDeleteModal(false)}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4]">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
                    <Ionicons name="trash" size={32} color="#DC2626" />
                  </View>
                  <Text className="text-[#5D4E37] text-xl font-bold mb-2">
                    Delete Story?
                  </Text>
                  <Text className="text-[#8B7355] text-center">
                    This action cannot be undone.
                  </Text>
                </View>

                <View className="flex-row space-x-2">
                  <Pressable
                    onPress={() => setShowDeleteModal(false)}
                    className="flex-1 bg-[#E8D5C4] rounded-xl py-4 items-center"
                  >
                    <Text className="text-[#8B7355] font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDeleteStory}
                    className="flex-1 bg-red-500 rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold">Delete</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Finish Confirmation Modal */}
      <Modal
        visible={showFinishModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFinishModal(false)}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4]">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 rounded-full bg-[#D4A5A5] items-center justify-center mb-4">
                    <Ionicons name="checkmark-circle" size={32} color="white" />
                  </View>
                  <Text className="text-[#5D4E37] text-xl font-bold mb-2">
                    Finish Story?
                  </Text>
                  <Text className="text-[#8B7355] text-center">
                    This will move the story to your Memories. You cannot add more words after finishing.
                  </Text>
                </View>

                <View className="flex-row space-x-2">
                  <Pressable
                    onPress={() => setShowFinishModal(false)}
                    className="flex-1 bg-[#E8D5C4] rounded-xl py-4 items-center"
                  >
                    <Text className="text-[#8B7355] font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleFinishStory}
                    className="flex-1 bg-[#D4A5A5] rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold">Finish</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}
