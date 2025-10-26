import React from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface BranchModeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectClassic: () => void;
  onSelectBranch: () => void;
}

export function BranchModeSelectionModal({
  visible,
  onClose,
  onSelectClassic,
  onSelectBranch,
}: BranchModeSelectionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="w-full max-w-md" onPress={(e) => e.stopPropagation()}>
          <View className="bg-[#FFF8F0] rounded-3xl p-6 shadow-lg">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-[#5D4E37]">Choose Story Mode</Text>
              <Pressable onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#5D4E37" />
              </Pressable>
            </View>

            <Text className="text-[#8B7355] mb-6 leading-5">
              Select how you and your partner will create this story together.
            </Text>

            {/* Classic Mode Card */}
            <Pressable onPress={onSelectClassic} className="mb-4">
              <LinearGradient
                colors={["#FFC5D9", "#FFE5EC"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 20 }}
              >
                <View className="flex-row items-start">
                  <View className="bg-white/40 p-3 rounded-full mr-4">
                    <Ionicons name="people" size={28} color="#D4A5A5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-[#5D4E37] mb-2">Classic Mode</Text>
                    <Text className="text-[#8B7355] leading-5">
                      Take turns adding one word at a time. Build your story together, word by word.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Branch Mode Card */}
            <Pressable onPress={onSelectBranch}>
              <LinearGradient
                colors={["#A7D7C5", "#D4EDE1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 20 }}
              >
                <View className="flex-row items-start">
                  <View className="bg-white/40 p-3 rounded-full mr-4">
                    <Ionicons name="git-branch" size={28} color="#85B79D" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-[#5D4E37] mb-2">Branch Mode</Text>
                    <Text className="text-[#8B7355] leading-5">
                      Write your own version while your partner writes theirs. Compare perspectives when done!
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Info Note */}
            <View className="mt-6 p-4 bg-[#FFE5EC] rounded-xl flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#D4A5A5" style={{ marginRight: 8, marginTop: 2 }} />
              <Text className="text-sm text-[#8B7355] flex-1 leading-5">
                In Branch Mode, each partner writes independently from the same prompt, creating parallel stories to compare later.
              </Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
