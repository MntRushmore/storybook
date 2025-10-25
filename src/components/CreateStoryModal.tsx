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
  const createStory = useStoryStore(s => s.createStory);

  const handleCreate = async () => {
    if (title.trim()) {
      const storyId = await createStory(title.trim());
      setTitle("");
      onStoryCreated(storyId);
    }
  };

  const handleClose = () => {
    setTitle("");
    onClose();
  };

  return (
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
  );
}
