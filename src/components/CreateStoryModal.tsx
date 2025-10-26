import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Share,
} from "react-native";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";

type CreateStoryModalProps = {
  visible: boolean;
  onClose: () => void;
  onStoryCreated: (storyId: string) => void;
};

export function CreateStoryModal({
  visible,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const [title, setTitle] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [storyCode, setStoryCode] = useState("");
  const [createdStoryId, setCreatedStoryId] = useState("");
  const [createdStoryTitle, setCreatedStoryTitle] = useState("");

  const createStory = useStoryStore(s => s.createStory);
  const getStoryById = useStoryStore(s => s.getStoryById);

  const handleCreate = async () => {
    if (title.trim()) {
      try {
        const storyId = await createStory(title.trim());

        // Wait a moment for the store to update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the story to access its session code
        const story = getStoryById(storyId);

        console.log("Created story:", { storyId, sessionCode: story?.sessionCode });

        if (story?.sessionCode) {
          setStoryCode(story.sessionCode);
          setCreatedStoryId(storyId);
          setCreatedStoryTitle(title.trim());
          setTitle("");
          setShowCodeModal(true);
        } else {
          console.warn("Story created but no session code found:", storyId);
          // Fallback if code is not available yet
          setTitle("");
          onStoryCreated(storyId);
        }
      } catch (error) {
        console.error("Error creating story:", error);
      }
    }
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  const handleCodeModalClose = () => {
    setShowCodeModal(false);
    setStoryCode("");
    onStoryCreated(createdStoryId);
  };

  const handleShareCode = async () => {
    const message = `Join my story "${createdStoryTitle}"! Use code ${storyCode} in Our Story Book app.`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Error sharing story code:", error);
    }
  };

  return (
    <>
      {/* Create Story Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4]">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-full bg-[#D4A5A5] items-center justify-center mr-3">
                        <Ionicons name="book" size={20} color="white" />
                      </View>
                      <Text className="text-[#5D4E37] text-xl font-bold">
                        New Story
                      </Text>
                    </View>
                    <Pressable
                      onPress={handleClose}
                      className="w-8 h-8 rounded-full bg-[#E8D5C4] items-center justify-center"
                    >
                      <Ionicons name="close" size={18} color="#8B7355" />
                    </Pressable>
                  </View>

                  <Text className="text-[#8B7355] text-sm mb-2">
                    Give your story a title
                  </Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Our Adventure, Date Night, etc."
                    placeholderTextColor="#A0886C"
                    className="bg-white text-[#5D4E37] rounded-xl px-4 py-3 text-base mb-4 border border-[#E8D5C4]"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleCreate}
                  />

                  <Pressable
                    onPress={handleCreate}
                    disabled={!title.trim()}
                    className={`rounded-xl py-4 items-center ${
                      title.trim() ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
                    }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      Start Writing
                    </Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Story Code Display Modal */}
      <Modal
        visible={showCodeModal}
        transparent
        animationType="fade"
        onRequestClose={handleCodeModalClose}
      >
        <TouchableWithoutFeedback onPress={handleCodeModalClose}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4]">
                <View className="items-center mb-6">
                  <View className="w-16 h-16 rounded-full bg-[#D4A5A5] items-center justify-center mb-4">
                    <Ionicons name="checkmark-circle" size={36} color="white" />
                  </View>
                  <Text className="text-[#5D4E37] text-2xl font-bold text-center mb-2">
                    Story Created!
                  </Text>
                  <Text className="text-[#8B7355] text-center text-base">
                    Share this code with your partner to write together
                  </Text>
                </View>

                <View className="bg-[#F5E6D3] rounded-2xl p-6 mb-6 border-2 border-[#E8D5C4]">
                  <View className="flex-row items-center justify-center mb-3">
                    <Ionicons name="key" size={24} color="#8B7355" />
                    <Text className="text-[#8B7355] font-bold text-lg ml-2">
                      Story Code
                    </Text>
                  </View>
                  <Text className="text-[#5D4E37] text-4xl font-bold text-center tracking-wider mb-2">
                    {storyCode}
                  </Text>
                  <Text className="text-[#A0886C] text-xs text-center">
                    This code can be used to join your story
                  </Text>
                </View>

                <View className="space-y-3">
                  <Pressable
                    onPress={handleShareCode}
                    className="bg-[#D4A5A5] rounded-xl py-4 items-center flex-row justify-center mb-3"
                  >
                    <Ionicons name="share-social" size={20} color="white" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Share Code
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCodeModalClose}
                    className="bg-[#8B7355] rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-semibold text-base">
                      Start Writing
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
