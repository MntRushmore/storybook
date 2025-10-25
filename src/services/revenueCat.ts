/**
 * RevenueCat Integration Service
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Vibecode app API tab
 * 2. Add RevenueCat integration
 * 3. Get your API key from RevenueCat dashboard
 * 4. The Vibecode system will handle the rest
 *
 * For now, this uses a mock/local implementation until RevenueCat is configured
 */

import { useStoryStore } from "../state/storyStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "@wordchain_premium_status";

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

/**
 * Check if user has premium access
 */
export async function checkPremiumStatus(): Promise<boolean> {
  try {
    // TODO: Replace with actual RevenueCat SDK call when integrated
    // const customerInfo = await Purchases.getCustomerInfo();
    // return customerInfo.entitlements.active["premium"] !== undefined;

    // Mock implementation - checks local storage
    const status = await AsyncStorage.getItem(PREMIUM_KEY);
    return status === "true";
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Purchase premium subscription
 */
export async function purchasePremium(): Promise<PurchaseResult> {
  try {
    // TODO: Replace with actual RevenueCat purchase flow
    // const purchaseResult = await Purchases.purchasePackage(package);
    // const isPremium = purchaseResult.customerInfo.entitlements.active["premium"] !== undefined;

    // Mock implementation - simulates purchase
    await AsyncStorage.setItem(PREMIUM_KEY, "true");

    // Update user profile in store
    useStoryStore.getState().updateUserProfile({ isPremium: true });

    return {
      success: true,
      isPremium: true,
    };
  } catch (error: any) {
    return {
      success: false,
      isPremium: false,
      error: error.message || "Purchase failed",
    };
  }
}

/**
 * Restore previous purchases
 */
export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    // TODO: Replace with actual RevenueCat restore
    // const customerInfo = await Purchases.restorePurchases();
    // const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    const status = await AsyncStorage.getItem(PREMIUM_KEY);
    const isPremium = status === "true";

    if (isPremium) {
      useStoryStore.getState().updateUserProfile({ isPremium: true });
    }

    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    return {
      success: false,
      isPremium: false,
      error: error.message || "Restore failed",
    };
  }
}

/**
 * Get available subscription packages
 */
export async function getSubscriptionPackages() {
  try {
    // TODO: Replace with actual RevenueCat offerings
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.availablePackages || [];

    // Mock packages
    return [
      {
        identifier: "monthly",
        product: {
          title: "Premium Monthly",
          description: "All features unlocked",
          priceString: "$4.99",
          price: 4.99,
        },
      },
      {
        identifier: "yearly",
        product: {
          title: "Premium Yearly",
          description: "Save 40% with annual billing",
          priceString: "$29.99",
          price: 29.99,
        },
      },
    ];
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

/**
 * Check if feature requires premium
 */
export function requiresPremium(feature: string): boolean {
  const premiumFeatures = [
    "voice_input",
    "premium_themes",
    "premium_templates",
    "epic_mode",
    "sentence_mode",
    "unlimited_stories",
    "streak_tracking",
  ];

  return premiumFeatures.includes(feature);
}

/**
 * Show paywall modal
 * Returns true if user should proceed (already premium or purchased)
 */
export async function showPaywallIfNeeded(feature: string): Promise<boolean> {
  if (!requiresPremium(feature)) {
    return true;
  }

  const isPremium = await checkPremiumStatus();
  return isPremium;
}
