import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  purchasePremium,
  restorePurchases,
  getSubscriptionPackages
} from "../services/revenueCat";
import { PREMIUM_FEATURES } from "../constants/storyConstants";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  feature?: string;
}

export function PaywallModal({ visible, onClose, onPurchaseSuccess, feature }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      setError("");
      console.log("Loading packages...");

      const pkgs = await getSubscriptionPackages();
      console.log("Packages loaded:", pkgs);

      setPackages(pkgs);

      // Set default selection to annual if available, otherwise first package
      if (pkgs.length > 0) {
        const annualPkg = pkgs.find((p: any) => p.identifier === "$rc_annual");
        if (annualPkg) {
          setSelectedPackage("$rc_annual");
        } else {
          setSelectedPackage(pkgs[0].identifier);
        }
      } else {
        setError("No subscription packages available. Please check your RevenueCat configuration.");
      }
    } catch (err) {
      console.error("Error loading packages:", err);
      setError("Failed to load subscription options. Please try again.");
    } finally {
      setLoadingPackages(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert("Error", "Please select a subscription plan");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("Starting purchase for package:", selectedPackage);

      const result = await purchasePremium(selectedPackage);
      console.log("Purchase result:", result);

      if (result.success) {
        Alert.alert("Success!", "Premium unlocked! Enjoy all features.");
        onPurchaseSuccess?.();
        onClose();
      } else if (result.error && result.error !== "Purchase cancelled") {
        setError(result.error);
        Alert.alert("Purchase Failed", result.error);
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      setError(err.message || "Purchase failed");
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Restoring purchases...");

      const result = await restorePurchases();
      console.log("Restore result:", result);

      if (result.success && result.isPremium) {
        Alert.alert("Success!", "Your premium subscription has been restored.");
        onPurchaseSuccess?.();
        onClose();
      } else if (result.error) {
        Alert.alert("No Purchases Found", "We could not find any previous purchases to restore.");
      }
    } catch (err: any) {
      console.error("Restore error:", err);
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = Object.values(PREMIUM_FEATURES);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-[#FFF8F0]" edges={["top"]}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pb-4">
          <Text className="text-2xl font-bold text-[#8B7355]">Go Premium</Text>
          <Pressable onPress={onClose} className="p-2">
            <Ionicons name="close" size={28} color="#8B7355" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={["#D4A5A5", "#E8B4B8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}
          >
            <Text className="text-white text-2xl font-bold mb-2">✨ Unlock Everything</Text>
            <Text className="text-white/90 text-base">
              Create unlimited stories with premium themes and voice
            </Text>
          </LinearGradient>

          {/* Features List */}
          <View className="mb-6">
            {features.map((feat, idx) => (
              <View key={idx} className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-full bg-[#D4A5A5] items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={18} color="#FFF8F0" />
                </View>
                <Text className="flex-1 text-[#8B7355] text-sm">{feat}</Text>
              </View>
            ))}
          </View>

          {/* Loading State */}
          {loadingPackages && (
            <View className="py-8">
              <ActivityIndicator color="#D4A5A5" size="large" />
              <Text className="text-[#8B7355] text-center mt-4">Loading plans...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !loadingPackages && (
            <View className="bg-red-100 p-4 rounded-2xl mb-4">
              <Text className="text-red-800 text-sm text-center">{error}</Text>
            </View>
          )}

          {/* Pricing Options */}
          {!loadingPackages && packages.length > 0 && (
            <>
              <Text className="text-[#8B7355] font-bold text-base mb-3">Choose Your Plan</Text>
              <View className="mb-6">
                {packages.map((pkg) => {
                  const isSelected = selectedPackage === pkg.identifier;
                  const isAnnual = pkg.identifier === "$rc_annual" || pkg.identifier.toLowerCase().includes("annual") || pkg.identifier.toLowerCase().includes("year");

                  return (
                    <Pressable
                      key={pkg.identifier}
                      onPress={() => setSelectedPackage(pkg.identifier)}
                      className={`mb-3 rounded-2xl border-2 ${
                        isSelected ? "border-[#D4A5A5] bg-[#D4A5A5]/10" : "border-[#E8D5C5] bg-white"
                      }`}
                    >
                      <View className="p-4">
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                              <Text className="text-[#8B7355] text-lg font-bold mr-2">
                                {pkg.product.title}
                              </Text>
                              {isAnnual && (
                                <View className="bg-[#85B79D] px-2 py-1 rounded-full">
                                  <Text className="text-white text-xs font-bold">BEST VALUE</Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-[#A0927D] text-xs">
                              {pkg.product.description}
                            </Text>
                          </View>
                          <View className="items-end ml-3">
                            <Text className="text-[#8B7355] text-2xl font-bold">
                              {pkg.product.priceString}
                            </Text>
                            {isAnnual && (
                              <Text className="text-[#85B79D] text-xs font-semibold">Save 40%</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* CTA Button */}
          {!loadingPackages && packages.length > 0 && (
            <Pressable
              onPress={handlePurchase}
              disabled={loading || !selectedPackage}
              className={`rounded-2xl py-4 mb-3 shadow-lg ${
                loading || !selectedPackage ? "bg-[#D4A5A5]/50" : "bg-[#D4A5A5]"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#FFF8F0" />
              ) : (
                <Text className="text-[#FFF8F0] text-center text-lg font-bold">
                  Start Premium
                </Text>
              )}
            </Pressable>
          )}

          {/* Restore Button */}
          <Pressable onPress={handleRestore} disabled={loading} className="py-3 mb-4">
            <Text className="text-[#8B7355] text-center text-sm">
              Restore Previous Purchase
            </Text>
          </Pressable>

          {/* Fine Print */}
          <Text className="text-[#A0927D] text-xs text-center">
            Subscription automatically renews unless cancelled 24 hours before the end of the current period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
