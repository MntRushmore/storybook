import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStoryStore } from "../state/storyStore";
import { Ionicons } from "@expo/vector-icons";
import { PaywallModal } from "../components/PaywallModal";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairCode, setPairCode] = useState("");
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

  const userProfile = useStoryStore(s => s.userProfile);
  const generateSessionCode = useStoryStore(s => s.generateSessionCode);
  const updateUserProfile = useStoryStore(s => s.updateUserProfile);

  const isPremium = userProfile?.isPremium || false;

  const handleGenerateCode = () => {
    const code = generateSessionCode();
    setGeneratedCode(code);
    setShowCodeModal(true);
  };

  const handlePairWithCode = () => {
    if (pairCode.trim().length === 6) {
      updateUserProfile({ coupleCode: pairCode.trim() });
      setPairCode("");
      setShowPairModal(false);
      // Show success message in UI instead of Alert
    } else {
      // Show error message in UI instead of Alert
    }
  };

  return (
    <View className="flex-1 bg-[#FFF8F0]">
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
          <Text className="text-white text-xl font-semibold">Settings</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Profile Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <Text className="text-[#8B7355] font-semibold text-base mb-4">
            Your Profile
          </Text>
          <View className="flex-row items-center">
            <View
              className="w-16 h-16 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: userProfile?.color || "#D4A5A5" }}
            >
              <Text className="text-white text-2xl font-bold">
                {userProfile?.initials || "ME"}
              </Text>
            </View>
            <View>
              <Text className="text-[#5D4E37] font-semibold text-lg">
                {userProfile?.name || "User"}
              </Text>
              {userProfile?.coupleCode && (
                <Text className="text-[#A0886C] text-sm mt-1">
                  Paired • Code: {userProfile.coupleCode}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Premium Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="diamond" size={24} color="#FFD700" />
            <Text className="text-[#8B7355] font-semibold text-base ml-2">
              Premium Status
            </Text>
          </View>

          {isPremium ? (
            <View>
              <View className="bg-[#FFD700]/10 rounded-xl p-4 mb-3 border border-[#FFD700]/30">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
                  <Text className="text-[#8B7355] font-semibold ml-2">Premium Active</Text>
                </View>
                <Text className="text-[#A0886C] text-sm">
                  You have access to all premium features including unlimited stories, all themes, and streak tracking.
                </Text>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-[#A0886C] text-sm mb-4">
                Upgrade to premium for unlimited stories, all themes, voice input, and more!
              </Text>
              <Pressable
                onPress={() => setShowPaywall(true)}
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-xl py-4 items-center"
                style={{ backgroundColor: "#FFD700" }}
              >
                <Text className="text-white font-bold text-base">Go Premium ✨</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Couple Pairing Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="heart-circle" size={24} color="#D4A5A5" />
            <Text className="text-[#8B7355] font-semibold text-base ml-2">
              Partner Connection
            </Text>
          </View>

          {userProfile?.partnerId ? (
            <View>
              <View className="bg-[#D4A5A5]/10 rounded-xl p-4 mb-3 border border-[#D4A5A5]/30">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#D4A5A5" />
                  <Text className="text-[#8B7355] font-semibold ml-2">
                    Connected to Partner
                  </Text>
                </View>
                <Text className="text-[#A0886C] text-sm mb-3">
                  You can now create stories together! Choose to write with your partner or connect with someone new.
                </Text>
              </View>
              <Text className="text-[#A0886C] text-sm mb-3">
                Want to write with someone else?
              </Text>
              <Pressable
                onPress={() => setShowPairModal(true)}
                className="bg-[#E8D5C4] rounded-xl py-3 items-center"
              >
                <Text className="text-[#8B7355] font-semibold">
                  Connect with New Person
                </Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text className="text-[#A0886C] text-sm mb-4">
                Connect with your partner to write stories together in real-time
              </Text>
              <View className="space-y-2">
                <Pressable
                  onPress={handleGenerateCode}
                  className="bg-[#D4A5A5] rounded-xl py-4 items-center mb-2"
                >
                  <Text className="text-white font-semibold">
                    Generate Pairing Code
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowPairModal(true)}
                  className="bg-[#E8D5C4] rounded-xl py-4 items-center"
                >
                  <Text className="text-[#8B7355] font-semibold">
                    Enter Partner Code
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* About Section */}
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#E8D5C4] mb-4">
          <Text className="text-[#8B7355] font-semibold text-base mb-3">
            About
          </Text>
          <Text className="text-[#A0886C] text-sm leading-6">
            Our Story Book lets you and your partner create beautiful memories together. Write stories one word or sentence at a time, save your favorites, and revisit them anytime.
          </Text>
        </View>
      </ScrollView>

      {/* Pair Modal */}
      <Modal
        visible={showPairModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPairModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPairModal(false)}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4]">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-[#5D4E37] text-xl font-bold">
                      Enter Partner Code
                    </Text>
                    <Pressable
                      onPress={() => setShowPairModal(false)}
                      className="w-8 h-8 rounded-full bg-[#E8D5C4] items-center justify-center"
                    >
                      <Ionicons name="close" size={18} color="#8B7355" />
                    </Pressable>
                  </View>

                  <Text className="text-[#8B7355] text-sm mb-3">
                    Ask your partner to generate a code and enter it below
                  </Text>
                  <TextInput
                    value={pairCode}
                    onChangeText={setPairCode}
                    placeholder="123456"
                    placeholderTextColor="#A0886C"
                    keyboardType="number-pad"
                    maxLength={6}
                    className="bg-white text-[#5D4E37] rounded-xl px-4 py-3 text-center text-2xl font-semibold mb-4 border border-[#E8D5C4]"
                    autoFocus
                  />

                  <Pressable
                    onPress={handlePairWithCode}
                    disabled={pairCode.length !== 6}
                    className={`rounded-xl py-4 items-center ${
                      pairCode.length === 6 ? "bg-[#D4A5A5]" : "bg-[#E8D5C4]"
                    }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      Pair
                    </Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Code Display Modal */}
      <Modal
        visible={showCodeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCodeModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCodeModal(false)}>
          <View className="flex-1 bg-black/50 justify-center px-6">
            <TouchableWithoutFeedback onPress={() => {}}>
              <View className="bg-[#FFF8F0] rounded-3xl p-6 border-2 border-[#E8D5C4] items-center">
                <View className="w-16 h-16 rounded-full bg-[#D4A5A5] items-center justify-center mb-4">
                  <Ionicons name="heart" size={32} color="white" />
                </View>
                <Text className="text-[#5D4E37] text-xl font-bold mb-2">
                  Your Pairing Code
                </Text>
                <Text className="text-[#8B7355] text-sm text-center mb-6">
                  Share this code with your partner
                </Text>

                <View className="bg-white rounded-2xl p-6 border-2 border-[#D4A5A5] mb-6">
                  <Text className="text-[#5D4E37] text-5xl font-bold text-center tracking-wider">
                    {generatedCode}
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowCodeModal(false)}
                  className="bg-[#D4A5A5] rounded-xl py-4 px-8"
                >
                  <Text className="text-white font-semibold text-base">
                    Close
                  </Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          setShowPaywall(false);
        }}
      />
    </View>
  );
}
