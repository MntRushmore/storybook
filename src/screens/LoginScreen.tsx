import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../state/authStore";

interface LoginScreenProps {
  onSignUpPress: () => void;
  onSuccess: () => void;
}

export function LoginScreen({ onSignUpPress, onSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = useAuthStore(s => s.signIn);
  const resetPassword = useAuthStore(s => s.resetPassword);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

    if (error) {
      Alert.alert("Sign In Failed", error.message || "Please check your credentials");
    } else {
      onSuccess();
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter Email", "Please enter your email address to reset your password");
      return;
    }

    const { error } = await resetPassword(email.trim().toLowerCase());

    if (error) {
      Alert.alert("Error", error.message || "Failed to send reset email");
    } else {
      Alert.alert(
        "Check Your Email",
        "We have sent you a password reset link. Please check your inbox."
      );
    }
  };

  return (
    <LinearGradient
      colors={["#E8B4B8", "#D4A5A5", "#B89B9B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 justify-center px-6 py-8">
              {/* Logo and Title */}
              <View className="items-center mb-12">
                <View
                  className="w-20 h-20 rounded-3xl bg-white/30 items-center justify-center mb-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                  }}
                >
                  <Ionicons name="book" size={40} color="white" />
                </View>
                <Text className="text-white text-3xl font-bold mb-2">
                  Welcome Back
                </Text>
                <Text className="text-white/80 text-base text-center">
                  Sign in to continue your stories
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-6">
                <View className="bg-white/95 rounded-2xl px-4 py-4 mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="mail-outline" size={20} color="#8B7355" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#5D4E37]"
                      placeholder="Email"
                      placeholderTextColor="#A0886C"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

                <View className="bg-white/95 rounded-2xl px-4 py-4">
                  <View className="flex-row items-center">
                    <Ionicons name="lock-closed-outline" size={20} color="#8B7355" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#5D4E37]"
                      placeholder="Password"
                      placeholderTextColor="#A0886C"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="ml-2"
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#8B7355"
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Forgot Password */}
              <Pressable
                onPress={handleForgotPassword}
                className="mb-6"
                disabled={isSubmitting}
              >
                <Text className="text-white text-sm text-right">
                  Forgot Password?
                </Text>
              </Pressable>

              {/* Sign In Button */}
              <Pressable
                onPress={handleSignIn}
                disabled={isSubmitting}
                className="bg-white rounded-2xl py-4 mb-4"
                style={{
                  opacity: isSubmitting ? 0.7 : 1,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
              >
                <Text className="text-[#D4A5A5] text-center text-lg font-bold">
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Text>
              </Pressable>

              {/* Sign Up Link */}
              <View className="flex-row items-center justify-center">
                <Text className="text-white/80 text-sm">
                  {"Don't have an account? "}
                </Text>
                <Pressable onPress={onSignUpPress} disabled={isSubmitting}>
                  <Text className="text-white text-sm font-bold">
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
