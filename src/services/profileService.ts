import { supabase } from "../api/supabase";

/**
 * Update user's premium status in Supabase profiles table
 */
export async function updatePremiumStatus(userId: string, isPremium: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: isPremium })
      .eq("id", userId);

    if (error) {
      console.error("Error updating premium status:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to update premium status:", error);
    throw error;
  }
}

/**
 * Update user's push token in Supabase profiles table
 */
export async function updatePushToken(userId: string, pushToken: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ push_token: pushToken })
      .eq("id", userId);

    if (error) {
      console.error("Error updating push token:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to update push token:", error);
    throw error;
  }
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}
