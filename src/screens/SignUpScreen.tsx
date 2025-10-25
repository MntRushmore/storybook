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

interface SignUpScreenProps {
  onSignInPress: () => void;
  onSuccess: () => void;
}

export function SignUpScreen({ onSignInPress, onSuccess }: SignUpScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signUp = useAuthStore(s => s.signUp);

  const validateInputs = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return false;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setIsSubmitting(true);
    const { error } = await signUp(
      email.trim().toLowerCase(),
      password,
      name.trim()
    );
    setIsSubmitting(false);

    if (error) {
      Alert.alert(
        "Sign Up Failed",
        error.message || "An error occurred. Please try again."
      );
    } else {
      onSuccess();
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
                  Create Account
                </Text>
                <Text className="text-white/80 text-base text-center">
                  Start creating stories together
                </Text>
              </View>

              {/* Input Fields */}
              <View className="mb-6">
                <View className="bg-white/95 rounded-2xl px-4 py-4 mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={20} color="#8B7355" />
                    <TextInput
                      className="flex-1 ml-3 text-base text-[#5D4E37]"
                      placeholder="Your Name"
                      placeholderTextColor="#A0886C"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect={false}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>

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
                      placeholder="Password (min 6 characters)"
                      placeholderTextColor="#A0886C"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
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

              {/* Sign Up Button */}
              <Pressable
                onPress={handleSignUp}
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
                  {isSubmitting ? "Creating Account..." : "Sign Up"}
                </Text>
              </Pressable>

              {/* Sign In Link */}
              <View className="flex-row items-center justify-center">
                <Text className="text-white/80 text-sm">
                  Already have an account?{" "}
                </Text>
                <Pressable onPress={onSignInPress} disabled={isSubmitting}>
                  <Text className="text-white text-sm font-bold">
                    Sign In
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
