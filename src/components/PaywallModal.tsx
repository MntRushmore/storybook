import React, { useState, useEffect } from "react";
import { View, Text, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native";
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
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("yearly");

  useEffect(() => {
    if (visible) {
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    const pkgs = await getSubscriptionPackages();
    setPackages(pkgs);
    // Set default selection to annual if available
    if (pkgs.length > 0) {
      const annualPkg = pkgs.find(p => p.identifier === "$rc_annual");
      if (annualPkg) {
        setSelectedPackage("$rc_annual");
      } else {
        setSelectedPackage(pkgs[0].identifier);
      }
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    const result = await purchasePremium(selectedPackage);
    setLoading(false);

    if (result.success) {
      onPurchaseSuccess?.();
      onClose();
    } else if (result.error && result.error !== "Purchase cancelled") {
      // Show error to user (you could add an Alert or error state here)
      console.error("Purchase failed:", result.error);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const result = await restorePurchases();
    setLoading(false);

    if (result.success && result.isPremium) {
      onPurchaseSuccess?.();
      onClose();
    } else if (result.error) {
      // Show error or "no purchases found" message
      console.log("Restore result:", result.error);
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
          <View className="mb-4">
            {features.map((feat, idx) => (
              <View key={idx} className="flex-row items-center mb-3">
                <View className="w-7 h-7 rounded-full bg-[#D4A5A5] items-center justify-center mr-3">
                  <Ionicons name="checkmark" size={18} color="#FFF8F0" />
                </View>
                <Text className="flex-1 text-[#8B7355] text-sm">{feat}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Options */}
          <View className="mb-4">
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.identifier;
              const isYearly = pkg.identifier === "yearly" || pkg.identifier === "$rc_annual";

              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => setSelectedPackage(pkg.identifier)}
                  className={`mb-3 rounded-2xl border-2 ${
                    isSelected ? "border-[#D4A5A5] bg-[#D4A5A5]/10" : "border-[#E8D5C5]"
                  }`}
                >
                  <View className="p-4">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-[#8B7355] text-base font-bold mr-2">
                            {pkg.product.title}
                          </Text>
                          {isYearly && (
                            <View className="bg-[#85B79D] px-2 py-1 rounded-full">
                              <Text className="text-white text-xs font-bold">SAVE 40%</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-[#A0927D] text-xs">
                          {pkg.product.description}
                        </Text>
                      </View>
                      <View className="items-end ml-3">
                        <Text className="text-[#8B7355] text-xl font-bold">
                          {pkg.product.priceString}
                        </Text>
                        {isYearly && (
                          <Text className="text-[#A0927D] text-xs">$2.50/month</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* CTA Button */}
          <Pressable
            onPress={handlePurchase}
            disabled={loading}
            className="bg-[#D4A5A5] rounded-2xl py-4 mb-3 shadow-lg"
          >
            {loading ? (
              <ActivityIndicator color="#FFF8F0" />
            ) : (
              <Text className="text-[#FFF8F0] text-center text-lg font-bold">
                Start Premium
              </Text>
            )}
          </Pressable>

          {/* Restore Button */}
          <Pressable onPress={handleRestore} className="py-3 mb-4">
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
