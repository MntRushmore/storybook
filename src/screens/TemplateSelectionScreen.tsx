import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { STORY_TEMPLATES, THEMES, MODES } from "../constants/storyConstants";
import { StoryTheme, StoryMode } from "../types/story";
import { useStoryStore } from "../state/storyStore";
import { PaywallModal } from "../components/PaywallModal";
import { checkPremiumStatus } from "../services/revenueCat";

type Props = NativeStackScreenProps<RootStackParamList, "TemplateSelection">;

export function TemplateSelectionScreen({ navigation }: Props) {
  const createStory = useStoryStore(s => s.createStory);
  const userProfile = useStoryStore(s => s.userProfile);

  const [selectedTheme, setSelectedTheme] = useState<StoryTheme | "all">("all");
  const [selectedMode, setSelectedMode] = useState<StoryMode>("standard");
  const [customTitle, setCustomTitle] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  React.useEffect(() => {
    checkPremiumStatus().then(setIsPremium);
  }, []);

  const filteredTemplates = STORY_TEMPLATES.filter(
    t => selectedTheme === "all" || t.theme === selectedTheme
  );

  const handleTemplateSelect = async (prompt: string, theme: StoryTheme, templateIsPremium: boolean) => {
    if (templateIsPremium && !isPremium) {
      setShowPaywall(true);
      return;
    }

    try {
      const storyId = await createStory(prompt, prompt);
      navigation.replace("StoryDetail", { storyId });
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  const handleCustomCreate = async () => {
    if (!customTitle.trim()) return;

    try {
      const storyId = await createStory(customTitle, customTitle);
      navigation.replace("StoryDetail", { storyId });
    } catch (error) {
      console.error("Error creating story:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FFF8F0]" edges={["top"]}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center justify-between">
        <Pressable onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#8B7355" />
        </Pressable>
        <Text className="flex-1 text-2xl font-bold text-[#8B7355]">New Story</Text>
        <Pressable onPress={() => setShowPaywall(true)} className="px-3 py-1 bg-[#D4A5A5] rounded-full">
          <Text className="text-white text-xs font-bold">
            {isPremium ? "✨ PRO" : "GO PRO"}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Mode Selection */}
        <View className="px-6 mb-6">
          <Text className="text-[#8B7355] font-bold text-lg mb-3">Story Length</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(Object.keys(MODES) as StoryMode[]).map((mode) => {
              const modeData = MODES[mode];
              const isSelected = selectedMode === mode;
              const isLocked = ["epic", "sentence"].includes(mode) && !isPremium;

              return (
                <Pressable
                  key={mode}
                  onPress={() => {
                    if (isLocked) {
                      setShowPaywall(true);
                    } else {
                      setSelectedMode(mode);
                    }
                  }}
                  className={`mr-3 px-5 py-3 rounded-2xl ${
                    isSelected
                      ? "bg-[#D4A5A5]"
                      : "bg-white border-2 border-[#E8D5C5]"
                  }`}
                >
                  <View className="items-center">
                    <Text className="text-2xl mb-1">{modeData.icon}</Text>
                    <Text
                      className={`font-bold mb-1 ${
                        isSelected ? "text-white" : "text-[#8B7355]"
                      }`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                    <Text
                      className={`text-xs ${
                        isSelected ? "text-white/80" : "text-[#A0927D]"
                      }`}
                    >
                      {modeData.words} words
                    </Text>
                    {isLocked && (
                      <Ionicons
                        name="lock-closed"
                        size={14}
                        color={isSelected ? "#FFF" : "#A0927D"}
                        style={{ marginTop: 4 }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Theme Filter */}
        <View className="px-6 mb-6">
          <Text className="text-[#8B7355] font-bold text-lg mb-3">Theme</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable
              onPress={() => setSelectedTheme("all")}
              className={`mr-3 px-5 py-2 rounded-full ${
                selectedTheme === "all"
                  ? "bg-[#8B7355]"
                  : "bg-white border-2 border-[#E8D5C5]"
              }`}
            >
              <Text
                className={`font-bold ${
                  selectedTheme === "all" ? "text-white" : "text-[#8B7355]"
                }`}
              >
                All
              </Text>
            </Pressable>
            {(Object.keys(THEMES) as StoryTheme[]).map((theme) => {
              const isSelected = selectedTheme === theme;
              const themeData = THEMES[theme];

              return (
                <Pressable
                  key={theme}
                  onPress={() => setSelectedTheme(theme)}
                  className={`mr-3 px-5 py-2 rounded-full ${
                    isSelected
                      ? "border-2"
                      : "bg-white border-2 border-[#E8D5C5]"
                  }`}
                  style={isSelected ? { borderColor: themeData.color, backgroundColor: themeData.color + "20" } : {}}
                >
                  <Text
                    className={`font-bold ${
                      isSelected ? "" : "text-[#8B7355]"
                    }`}
                    style={isSelected ? { color: themeData.color } : {}}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Custom Prompt */}
        <View className="px-6 mb-6">
          <Text className="text-[#8B7355] font-bold text-lg mb-3">
            Or Start Your Own
          </Text>
          <View className="bg-white rounded-2xl border-2 border-[#E8D5C5] p-4 mb-3">
            <TextInput
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="Enter your story prompt..."
              placeholderTextColor="#A0927D"
              className="text-[#8B7355] text-base"
              multiline
            />
          </View>
          <Pressable
            onPress={handleCustomCreate}
            disabled={!customTitle.trim()}
            className={`rounded-2xl py-4 ${
              customTitle.trim() ? "bg-[#D4A5A5]" : "bg-[#E8D5C5]"
            }`}
          >
            <Text className="text-white text-center font-bold text-base">
              Create Custom Story
            </Text>
          </Pressable>
        </View>

        {/* Templates */}
        <View className="px-6 mb-6">
          <Text className="text-[#8B7355] font-bold text-lg mb-3">
            {selectedTheme === "all" ? "All Templates" : `${selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Templates`}
          </Text>
          {filteredTemplates.map((template) => {
            const themeData = THEMES[template.theme];
            const isLocked = template.isPremium && !isPremium;

            return (
              <Pressable
                key={template.id}
                onPress={() => handleTemplateSelect(template.prompt, template.theme, template.isPremium)}
                className="mb-3"
              >
                <LinearGradient
                  colors={themeData.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 16 }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center mb-2">
                        <Text className="text-[#8B7355] font-bold text-lg">
                          {template.title}
                        </Text>
                        {isLocked && (
                          <Ionicons
                            name="lock-closed"
                            size={16}
                            color="#8B7355"
                            style={{ marginLeft: 8 }}
                          />
                        )}
                      </View>
                      <Text className="text-[#A0927D] text-sm">
                        {template.prompt}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#8B7355" />
                  </View>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseSuccess={() => {
          setIsPremium(true);
          setShowPaywall(false);
        }}
      />
    </SafeAreaView>
  );
}
