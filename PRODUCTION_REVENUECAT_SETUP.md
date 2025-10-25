# Production RevenueCat Setup Guide

## 📦 Step 1: Install RevenueCat SDK

```bash
bun add react-native-purchases
```

## 🔑 Step 2: Get Your RevenueCat API Keys

1. Go to RevenueCat Dashboard
2. Navigate to your project
3. Go to **"API Keys"**
4. Copy:
   - **iOS API Key** (starts with `appl_...`)
   - **Android API Key** (starts with `goog_...`)

## 🔧 Step 3: Update revenueCat.ts

Replace `/src/services/revenueCat.ts` with this code:

```typescript
/**
 * RevenueCat Integration Service - PRODUCTION VERSION
 */

import Purchases, { LOG_LEVEL, PurchasesOffering } from "react-native-purchases";
import { useStoryStore } from "../state/storyStore";
import { Platform } from "react-native";

// ⚠️ IMPORTANT: Add these to your .env file or Vibecode ENV tab
const REVENUE_CAT_IOS_KEY = "appl_YOUR_IOS_KEY_HERE";
const REVENUE_CAT_ANDROID_KEY = "goog_YOUR_ANDROID_KEY_HERE";

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 * Call this once at app startup
 */
export async function initializeRevenueCat(userId: string) {
  if (isInitialized) return;

  try {
    // Configure RevenueCat
    Purchases.setLogLevel(LOG_LEVEL.INFO);

    if (Platform.OS === "ios") {
      await Purchases.configure({ apiKey: REVENUE_CAT_IOS_KEY, appUserID: userId });
    } else {
      await Purchases.configure({ apiKey: REVENUE_CAT_ANDROID_KEY, appUserID: userId });
    }

    isInitialized = true;
    console.log("RevenueCat initialized successfully");

    // Check initial premium status
    await checkPremiumStatus();
  } catch (error) {
    console.error("Error initializing RevenueCat:", error);
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
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    // Update local state
    useStoryStore.getState().updateUserProfile({ isPremium });

    return isPremium;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
}

/**
 * Purchase premium subscription
 */
export async function purchasePremium(packageIdentifier: string = "$rc_annual"): Promise<PurchaseResult> {
  try {
    // Get available offerings
    const offerings = await Purchases.getOfferings();

    if (offerings.current === null) {
      return {
        success: false,
        isPremium: false,
        error: "No offerings available",
      };
    }

    // Find the package
    const packageToPurchase = offerings.current.availablePackages.find(
      pkg => pkg.identifier === packageIdentifier
    );

    if (!packageToPurchase) {
      return {
        success: false,
        isPremium: false,
        error: "Package not found",
      };
    }

    // Make the purchase
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

    // Update user profile in store
    useStoryStore.getState().updateUserProfile({ isPremium: true });

    return {
      success: true,
      isPremium,
    };
  } catch (error: any) {
    console.error("Purchase error:", error);

    // User cancelled
    if (error.userCancelled) {
      return {
        success: false,
        isPremium: false,
        error: "Purchase cancelled",
      };
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
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = customerInfo.entitlements.active["premium"] !== undefined;

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
    const offerings = await Purchases.getOfferings();

    if (offerings.current === null) {
      return [];
    }

    return offerings.current.availablePackages.map(pkg => ({
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
```

## 🚀 Step 4: Initialize RevenueCat at App Startup

Update your `App.tsx` to initialize RevenueCat:

```typescript
import { useEffect } from 'react';
import { initializeRevenueCat } from './src/services/revenueCat';
import { useStoryStore } from './src/state/storyStore';

function App() {
  const userProfile = useStoryStore(s => s.userProfile);

  useEffect(() => {
    if (userProfile?.userId) {
      initializeRevenueCat(userProfile.userId);
    }
  }, [userProfile?.userId]);

  // ... rest of your app
}
```

## 🎯 Step 5: Update PaywallModal to Use Real Packages

The PaywallModal component will automatically work with real packages once RevenueCat is initialized!

## 🧪 Step 6: Testing

### Test in Development:
1. Run `bun ios` or `bun android`
2. Use sandbox App Store account for testing
3. Create sandbox tester in App Store Connect

### Test Purchases:
- Monthly subscription should show real price
- Yearly subscription should show real price
- Purchase flow works end-to-end
- Restore purchases works

## ✅ Step 7: Production Checklist

Before going live:
- [ ] RevenueCat API keys added to app
- [ ] In-app purchases created in App Store Connect
- [ ] Products linked in RevenueCat dashboard
- [ ] Entitlements configured (premium)
- [ ] Offerings created (default with monthly/yearly)
- [ ] Tested with sandbox account
- [ ] App submitted to App Store with IAP capability
- [ ] Privacy policy mentions subscriptions
- [ ] Terms of service updated

## 💰 Pricing Recommendations

Based on similar apps:
- **Monthly**: $4.99 - $6.99
- **Yearly**: $29.99 - $39.99 (save 40-50%)

## 📱 Where to Add ENV Variables in Vibecode

Since you're using Vibecode:
1. Go to Vibecode app
2. Navigate to **ENV tab**
3. Add these keys:
   - `REVENUE_CAT_IOS_KEY`: Your iOS API key
   - `REVENUE_CAT_ANDROID_KEY`: Your Android API key

Then update the code to use:
```typescript
import Constants from 'expo-constants';

const REVENUE_CAT_IOS_KEY = Constants.expoConfig?.extra?.revenueCatIosKey;
const REVENUE_CAT_ANDROID_KEY = Constants.expoConfig?.extra?.revenueCatAndroidKey;
```

## 🆘 Troubleshooting

**Problem**: "No products available"
- Check App Store Connect products are approved
- Verify Bundle ID matches
- Wait 24 hours after creating products

**Problem**: "Unable to purchase"
- Ensure you're using sandbox tester account
- Check App Store Connect agreements signed
- Verify tax forms completed

**Problem**: "RevenueCat not initialized"
- Ensure initializeRevenueCat is called on app start
- Check API keys are correct
- Look for errors in console logs

## 📚 Resources

- RevenueCat Docs: https://docs.revenuecat.com/
- Apple IAP Guide: https://developer.apple.com/in-app-purchase/
- RevenueCat Dashboard: https://app.revenuecat.com/
