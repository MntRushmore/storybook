/**
 * RevenueCat Integration Service - PRODUCTION VERSION
 *
 * This is a backup file showing how to implement real payments.
 * To use this in production:
 * 1. Run: bun add react-native-purchases
 * 2. Replace src/services/revenueCat.ts with this code
 * 3. Add your RevenueCat API keys to environment
 * 4. Configure products in App Store Connect
 */

// PRODUCTION CODE - Uncomment after installing react-native-purchases

/*
import Purchases, { LOG_LEVEL, PurchasesPackage } from "react-native-purchases";
import { useStoryStore } from "../state/storyStore";
import { Platform } from "react-native";
import Constants from "expo-constants";

const REVENUE_CAT_IOS_KEY = Constants.expoConfig?.extra?.revenueCatIosKey || "appl_YOUR_KEY";
const REVENUE_CAT_ANDROID_KEY = Constants.expoConfig?.extra?.revenueCatAndroidKey || "goog_YOUR_KEY";

let isInitialized = false;

export async function initializeRevenueCat(userId: string) {
  if (isInitialized) return;

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
    const apiKey = Platform.OS === "ios" ? REVENUE_CAT_IOS_KEY : REVENUE_CAT_ANDROID_KEY;

    await Purchases.configure({ apiKey, appUserID: userId });

    isInitialized = true;
    console.log("✅ RevenueCat initialized");

    await checkPremiumStatus();
  } catch (error) {
    console.error("❌ RevenueCat error:", error);
  }
}

export interface PurchaseResult {
  success: boolean;
  isPremium: boolean;
  error?: string;
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    if (!isInitialized) return false;

    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    useStoryStore.getState().updateUserProfile({ isPremium });
    return isPremium;
  } catch (error) {
    console.error("Error checking premium:", error);
    return false;
  }
}

export async function purchasePremium(packageIdentifier?: string): Promise<PurchaseResult> {
  try {
    if (!isInitialized) {
      useStoryStore.getState().updateUserProfile({ isPremium: true });
      return { success: true, isPremium: true };
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current?.availablePackages.length) {
      return {
        success: false,
        isPremium: false,
        error: "No packages available",
      };
    }

    let packageToPurchase = offerings.current.availablePackages.find(
      (pkg: PurchasesPackage) => pkg.identifier === (packageIdentifier || "$rc_annual")
    ) || offerings.current.availablePackages[0];

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    useStoryStore.getState().updateUserProfile({ isPremium });

    return { success: true, isPremium };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPremium: false, error: "Cancelled" };
    }
    return {
      success: false,
      isPremium: false,
      error: error.message || "Purchase failed",
    };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  try {
    if (!isInitialized) {
      return { success: false, isPremium: false, error: "Not available" };
    }

    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    if (isPremium) {
      useStoryStore.getState().updateUserProfile({ isPremium: true });
    }

    return {
      success: true,
      isPremium,
      error: isPremium ? undefined : "No purchases found",
    };
  } catch (error: any) {
    return {
      success: false,
      isPremium: false,
      error: error.message || "Restore failed",
    };
  }
}

export async function getSubscriptionPackages() {
  try {
    if (!isInitialized) {
      return [
        {
          identifier: "$rc_monthly",
          product: {
            title: "Premium Monthly",
            description: "All features unlocked",
            priceString: "$4.99",
            price: 4.99,
          },
        },
        {
          identifier: "$rc_annual",
          product: {
            title: "Premium Yearly",
            description: "Save 40%",
            priceString: "$29.99",
            price: 29.99,
          },
        },
      ];
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current?.availablePackages.length) {
      return [];
    }

    return offerings.current.availablePackages.map((pkg: PurchasesPackage) => ({
      identifier: pkg.identifier,
      product: {
        title: pkg.product.title,
        description: pkg.product.description,
        priceString: pkg.product.priceString,
        price: pkg.product.price,
      },
    }));
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

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

export async function showPaywallIfNeeded(feature: string): Promise<boolean> {
  if (!requiresPremium(feature)) return true;
  return await checkPremiumStatus();
}

export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}
*/

// The code above is commented out because react-native-purchases is not installed yet.
// This file is provided as reference for when you want to add real payments.
// See PRODUCTION_REVENUECAT_SETUP.md for complete setup instructions.

export {}; // Make this a module
