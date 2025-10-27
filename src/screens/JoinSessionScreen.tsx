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
  Modal,
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
  const [debugInfo, setDebugInfo] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const user = useAuthStore(s => s.user);
  const joinWithCode = useStoryStore(s => s.joinWithCode);

  const handleJoin = async () => {
    setError("");
    setDebugInfo("");

    if (!user) {
      setError("Please sign in first");
      return;
    }

    if (storyCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    let logs: string[] = [];

    console.log = (...args) => {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      logs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
      originalError(...args);
    };

    // Try to join story via code
    const result = await joinWithCode(storyCode);

    // Restore console
    console.log = originalLog;
    console.error = originalError;

    // Show debug info
    setDebugInfo(logs.join('\n\n'));
    setShowDebug(true);

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
                <View className="bg-red-50 rounded-xl p-4">
                  <View className="flex-row items-start mb-2">
                    <Ionicons name="alert-circle" size={20} color="#DC2626" />
                    <Text className="text-red-600 text-sm ml-2 flex-1 font-semibold">
                      {error}
                    </Text>
                  </View>
                  {error.includes("created before session codes") && (
                    <View className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Text className="text-yellow-800 text-xs leading-5">
                        💡 To fix this, ask the story creator to:{'\n'}
                        1. Open their story{'\n'}
                        2. Tap the share button{'\n'}
                        3. Get the new 6-digit code{'\n'}
                        {'\n'}
                        Or create a new Branch Mode story together!
                      </Text>
                    </View>
                  )}
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

      {/* Debug Modal */}
      <Modal
        visible={showDebug}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDebug(false)}
      >
        <View className="flex-1 bg-black/80 pt-20 px-4">
          <View className="bg-white rounded-t-3xl flex-1 p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[#5D4E37] text-xl font-bold">
                Debug Info
              </Text>
              <Pressable
                onPress={() => setShowDebug(false)}
                className="w-8 h-8 rounded-full bg-[#E8D5C4] items-center justify-center"
              >
                <Ionicons name="close" size={18} color="#8B7355" />
              </Pressable>
            </View>
            <View className="flex-1 bg-gray-100 rounded-xl p-4">
              <Text className="text-gray-800 text-xs font-mono">
                {debugInfo || "No debug info available"}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
