import React, { useState, useEffect, useRef } from "react";
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
  Share,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { useAuthStore } from "../state/authStore";
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
  const [showShareModal, setShowShareModal] = useState(false);
  const hasNavigatedToReveal = useRef(false);

  const story = useStoryStore(s => s.getStoryById(storyId));
  const user = useAuthStore(s => s.user);
  const addWord = useStoryStore(s => s.addWord);
  const submitBranchAnswer = useStoryStore(s => s.submitBranchAnswer);
  const finishStory = useStoryStore(s => s.finishStory);
  const deleteStory = useStoryStore(s => s.deleteStory);
  const generateStoryCode = useStoryStore(s => s.generateStoryCode);

  useEffect(() => {
    if (!story) {
      navigation.goBack();
      return;
    }

    // Auto-navigate to reveal screen when story reaches max words (only once)
    if (story.isFinished && !story.isRevealed && !hasNavigatedToReveal.current) {
      hasNavigatedToReveal.current = true;
      navigation.navigate("StoryReveal", { storyId });
    }
  }, [story?.isFinished, story?.isRevealed, navigation, storyId]);

  if (!story || !user) {
    return null;
  }

  const isBranchMode = story.collaborationType === "branch";

  // For branch mode, separate prompt entries from answer entries
  const promptWords = isBranchMode ? story.title.split(/\s+/) : [];
  const promptWordCount = promptWords.length;
  const promptEntries = isBranchMode ? story.entries.slice(0, promptWordCount) : [];
  const answerEntries = isBranchMode ? story.entries.slice(promptWordCount) : story.entries;

  // Compute these values from story directly (avoid Zustand selector functions)
  // In branch mode, it's always the user's turn for their own branch
  const isMyTurn = isBranchMode ? story.branchAuthorId === user.id : story.currentTurnUserId === user.id;
  const lastThreeWords = story.entries.slice(-3).map(e => e.word);

  const handleAddWord = async () => {
    const trimmedWord = newWord.trim();
    if (!trimmedWord) return;

    if (isBranchMode) {
      // Branch mode: submit full answer (can be multiple words)
      await submitBranchAnswer(storyId, trimmedWord);
      setNewWord("");
      setShowInput(false);
    } else {
      // Classic mode: one word at a time
      const wordCount = trimmedWord.split(/\s+/).length;
      if (wordCount > 1) {
        // Show error - only one word allowed
        return;
      }
      await addWord(storyId, trimmedWord);
      setNewWord("");
      setShowInput(false);
    }
  };

  const handleFinishStory = async () => {
    await finishStory(storyId);
    setShowFinishModal(false);
    // Navigate to reveal screen
    navigation.navigate("StoryReveal", { storyId });
  };

  const handleDeleteStory = async () => {
    try {
      await deleteStory(storyId);
      setShowDeleteModal(false);

      // Navigate to Home screen instead of goBack
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      setShowDeleteModal(false);
    }
  };

  const handleShare = async () => {
    const storyCode = generateStoryCode(storyId);
    const message = `Join my story "${story.title}"! Use code ${storyCode} in Dear We app.`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share story code");
    }
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
          <View className="flex-row space-x-2">
            <Pressable
              onPress={handleShare}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-2"
            >
              <Ionicons name="share-outline" size={20} color="#FFF8F0" />
            </Pressable>
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="trash-outline" size={20} color="#FFF8F0" />
            </Pressable>
          </View>
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
        {/* Branch Mode Prompt Display */}
        {isBranchMode && (
          <View className="bg-gradient-to-br from-[#FFE5B4] to-[#FFD4A3] rounded-2xl p-5 mb-4 border-2 border-[#E8D5C4]">
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#8B7355] items-center justify-center">
                <Ionicons name="bulb" size={20} color="white" />
              </View>
              <Text className="ml-3 text-[#8B7355] font-bold text-base">Your Prompt</Text>
            </View>
            <Text className="text-[#5D4E37] text-lg leading-7 font-medium">
              {story.title}
            </Text>
            <View className="mt-3 pt-3 border-t border-[#E8D5C4]">
              <Text className="text-[#A0886C] text-xs italic">
                Write your complete answer below. Your partner is writing their own version separately!
              </Text>
            </View>
          </View>
        )}

        {/* Branch Mode Indicator */}
        {isBranchMode && (
          <View className="bg-[#85B79D] rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-center mb-2">
              <Ionicons name="git-branch" size={20} color="white" />
              <Text className="ml-2 font-bold text-white">Branch Mode Active</Text>
            </View>
            <Text className="text-white/90 text-xs text-center">
              Both of you are answering the same prompt independently
            </Text>
          </View>
        )}

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
                {isBranchMode
                  ? "Continue writing your version!"
                  : isMyTurn
                    ? "Your turn to add a word!"
                    : "Waiting for your partner..."}
              </Text>
            </View>
          </View>
        )}

        {/* Last 3 Words Preview - Only for Classic Mode */}
        {!isBranchMode && lastThreeWords.length > 0 && !story.isFinished && (
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
          {isBranchMode && (
            <View className="mb-4 pb-4 border-b border-[#E8D5C4]">
              <Text className="text-[#8B7355] text-xs font-semibold mb-2 uppercase tracking-wide">
                Your Answer
              </Text>
            </View>
          )}

          {answerEntries.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="create-outline" size={48} color="#C8B4A0" />
              <Text className="text-[#A0886C] text-center mt-4">
                {isBranchMode
                  ? "Answer the prompt above with your own unique response"
                  : "Start your story by adding your first word below"}
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-[#5D4E37] text-lg leading-8 mb-6">
                {answerEntries.map((entry, index) => (
                  <Text key={entry.id}>
                    <Text className="text-[#5D4E37]">{entry.word}</Text>
                    {index < answerEntries.length - 1 && " "}
                  </Text>
                ))}
              </Text>

              <View className="border-t border-[#E8D5C4] pt-4">
                <Text className="text-[#A0886C] text-xs">
                  {answerEntries.length}{" "}
                  {answerEntries.length === 1 ? "word" : "words"} •{" "}
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
                className="bg-[#D4A5A5] rounded-2xl p-5 shadow-md mb-4"
                style={{
                  shadowColor: "#8B7355",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="create" size={24} color="white" />
                  <Text className="text-white font-bold text-lg ml-3">
                    {isBranchMode ? "Answer the Prompt" : "Add Your Word"}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className="bg-white rounded-2xl p-5 shadow-md border-2 border-[#D4A5A5] mb-4">
                <Text className="text-[#8B7355] font-bold text-base mb-3">
                  {isBranchMode ? "Type your answer to the prompt" : "What's your word?"}
                </Text>
                <TextInput
                  value={newWord}
                  onChangeText={setNewWord}
                  placeholder={isBranchMode ? "Type your full answer..." : "Type one word..."}
                  placeholderTextColor="#A0886C"
                  autoFocus
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  returnKeyType="done"
                  onSubmitEditing={handleAddWord}
                  multiline={isBranchMode}
                  numberOfLines={isBranchMode ? 4 : 1}
                  className={`bg-[#FFF8F0] text-[#5D4E37] rounded-xl px-4 py-4 ${isBranchMode ? "text-base" : "text-2xl font-semibold"} mb-3 border-2 border-[#E8D5C4] ${isBranchMode ? "text-left" : "text-center"}`}
                />
                {!isBranchMode && newWord.trim().split(/\s+/).length > 1 && (
                  <View className="bg-red-50 rounded-xl p-3 mb-3 flex-row items-center">
                    <Ionicons name="warning" size={18} color="#DC2626" />
                    <Text className="text-red-600 text-sm ml-2 flex-1">
                      Only one word at a time!
                    </Text>
                  </View>
                )}
                <View className="flex-row space-x-3">
                  <Pressable
                    onPress={() => {
                      setNewWord("");
                      setShowInput(false);
                    }}
                    className="flex-1 bg-[#E8D5C4] rounded-xl py-4 items-center"
                  >
                    <Text className="text-[#8B7355] font-bold text-base">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddWord}
                    disabled={!newWord.trim() || (!isBranchMode && newWord.trim().split(/\s+/).length > 1)}
                    className={`flex-1 rounded-xl py-4 items-center ${
                      newWord.trim() && (isBranchMode || newWord.trim().split(/\s+/).length === 1)
                        ? "bg-[#D4A5A5]"
                        : "bg-[#E8D5C4]"
                    }`}
                  >
                    <Text className="text-white font-bold text-base">
                      {isBranchMode ? "Submit Answer" : "Add Word"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}

        {/* Session Code Display - Only show if not finished and no partner */}
        {story.sessionCode && !story.partnerId && !story.isFinished && (
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
