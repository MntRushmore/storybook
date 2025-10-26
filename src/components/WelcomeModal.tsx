import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface WelcomeModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get("window");

export function WelcomeModal({ visible, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: "book" as const,
      title: "Welcome to Dear We!",
      description: "Create beautiful stories together, one word at a time. Share stories with friends, family, or anyone you want to write with!",
      color: "#D4A5A5",
    },
    {
      icon: "pencil" as const,
      title: "Take Turns Writing",
      description: "Each person writes one word at a time. Watch your story unfold as you collaborate back and forth until you reach the word limit.",
      color: "#E8B4B8",
    },
    {
      icon: "share-social" as const,
      title: "Share Your Stories",
      description: "Tap the share button on any story to get a 6-digit code. Send it via text, SMS, or any app to invite someone to write with you!",
      color: "#B89B9B",
    },
    {
      icon: "people" as const,
      title: "Join Stories Easily",
      description: "Received a code? Tap 'Join' on the home screen, enter the 6-digit code, and start writing together instantly!",
      color: "#C8A4A4",
    },
    {
      icon: "heart" as const,
      title: "Ready to Create!",
      description: "Choose from 8 themes, different story lengths, and premium features. Let's start creating memories together!",
      color: "#D4A5A5",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center px-6">
        <View className="bg-[#FFF8F0] rounded-3xl overflow-hidden w-full max-w-md"
          style={{
            maxWidth: Math.min(width - 48, 400),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[currentStepData.color, currentStepData.color + "DD"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 32, alignItems: "center" }}
          >
            <View
              className="w-24 h-24 rounded-full bg-white/30 items-center justify-center mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
              }}
            >
              <Ionicons name={currentStepData.icon} size={48} color="white" />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              {currentStepData.title}
            </Text>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            className="px-6 py-6"
            style={{ maxHeight: 200 }}
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-[#6D5C47] text-base leading-7 text-center">
              {currentStepData.description}
            </Text>
          </ScrollView>

          {/* Step indicators */}
          <View className="flex-row justify-center items-center px-6 pb-4">
            {steps.map((_, index) => (
              <View
                key={index}
                className="h-2 rounded-full mx-1"
                style={{
                  width: index === currentStep ? 24 : 8,
                  backgroundColor: index === currentStep ? currentStepData.color : "#E8D5C4",
                }}
              />
            ))}
          </View>

          {/* Buttons */}
          <View className="px-6 pb-6">
            <Pressable
              onPress={handleNext}
              className="rounded-2xl py-4 items-center mb-3"
              style={{ backgroundColor: currentStepData.color }}
            >
              <Text className="text-white font-bold text-base">
                {currentStep < steps.length - 1 ? "Next" : "Get Started!"}
              </Text>
            </Pressable>

            {currentStep < steps.length - 1 && (
              <Pressable
                onPress={handleSkip}
                className="py-3 items-center"
              >
                <Text className="text-[#A0886C] text-sm font-medium">
                  Skip Tutorial
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
