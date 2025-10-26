/**
 * RevenueCat Integration Service - PRODUCTION
 * Real implementation using react-native-purchases SDK
 */

import Purchases, { LOG_LEVEL, PurchasesPackage } from "react-native-purchases";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../state/authStore";
import { updatePremiumStatus } from "./profileService";

const REVENUE_CAT_API_KEY = Constants.expoConfig?.extra?.revenueCatApiKey || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
const ENTITLEMENT_ID = "Pro";

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once when the app starts
 */
export async function initializeRevenueCat(userId?: string) {
  if (isInitialized) return;

  try {
    if (!REVENUE_CAT_API_KEY) {
      console.warn("⚠️ RevenueCat API key not found");
      return;
    }

    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);

    await Purchases.configure({
      apiKey: REVENUE_CAT_API_KEY,
      appUserID: userId,
    });

    isInitialized = true;
    console.log("✅ RevenueCat initialized");

    // Check initial premium status
    await checkPremiumStatus();
  } catch (error) {
    console.error("❌ RevenueCat initialization error:", error);
  }
}

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
    if (!isInitialized) {
      console.warn("RevenueCat not initialized");
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    // Update user profile in Supabase
    const user = useAuthStore.getState().user;
    if (user) {
      await updatePremiumStatus(user.id, isPremium);
    }

    return isPremium;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Purchase a specific package
 */
export async function purchasePremium(packageIdentifier?: string): Promise<PurchaseResult> {
  try {
    if (!isInitialized) {
      return {
        success: false,
        isPremium: false,
        error: "RevenueCat not initialized",
      };
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current?.availablePackages.length) {
      return {
        success: false,
        isPremium: false,
        error: "No packages available",
      };
    }

    // Find the requested package or default to annual
    let packageToPurchase = offerings.current.availablePackages.find(
      (pkg: PurchasesPackage) => pkg.identifier === (packageIdentifier || "$rc_annual")
    );

    // If not found, use the first available package
    if (!packageToPurchase) {
      packageToPurchase = offerings.current.availablePackages[0];
    }

    console.log("Purchasing package:", packageToPurchase.identifier);

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    // Update user profile in Supabase
    const user = useAuthStore.getState().user;
    if (user && isPremium) {
      await updatePremiumStatus(user.id, true);
    }

    return { success: true, isPremium };
  } catch (error: any) {
    console.error("Purchase error:", error);

    if (error.userCancelled) {
      return { success: false, isPremium: false, error: "Purchase cancelled" };
    }

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
    if (!isInitialized) {
      return {
        success: false,
        isPremium: false,
        error: "RevenueCat not initialized",
      };
    }

    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;

    if (isPremium) {
      const user = useAuthStore.getState().user;
      if (user) {
        await updatePremiumStatus(user.id, true);
      }
    }

    return {
      success: true,
      isPremium,
      error: isPremium ? undefined : "No purchases found to restore",
    };
  } catch (error: any) {
    console.error("Restore error:", error);
    return {
      success: false,
      isPremium: false,
      error: error.message || "Restore failed",
    };
  }
}

/**
 * Get available subscription packages from RevenueCat
 */
export async function getSubscriptionPackages() {
  try {
    if (!isInitialized) {
      console.warn("RevenueCat not initialized, returning empty packages");
      return [];
    }

    const offerings = await Purchases.getOfferings();

    if (!offerings.current?.availablePackages.length) {
      console.warn("No packages available in current offering");
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
      packageType: pkg.packageType,
    }));
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
 * Show paywall modal if needed
 * Returns true if user should proceed (already premium or purchased)
 */
export async function showPaywallIfNeeded(feature: string): Promise<boolean> {
  if (!requiresPremium(feature)) {
    return true;
  }

  const isPremium = await checkPremiumStatus();
  return isPremium;
}

/**
 * Check if RevenueCat is initialized
 */
export function isRevenueCatInitialized(): boolean {
  return isInitialized;
}
