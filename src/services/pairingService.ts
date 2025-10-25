import { supabase } from "../api/supabase";

export interface PairingCode {
  code: string;
  creatorId: string;
  storyId: string | null;
  expiresAt: string;
  isUsed: boolean;
}

/**
 * Generate a 6-digit pairing code that expires in 15 minutes
 */
export async function generatePairingCode(userId: string, storyId?: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  const { error } = await supabase.from("pairing_codes").insert({
    code,
    creator_id: userId,
    story_id: storyId || null,
    expires_at: expiresAt,
    is_used: false,
  });

  if (error) {
    console.error("Error generating pairing code:", error);
    throw new Error("Failed to generate pairing code");
  }

  return code;
}

/**
 * Validate and use a pairing code to establish a pair relationship
 */
export async function joinWithPairingCode(
  code: string,
  userId: string
): Promise<{ partnerId: string; storyId: string | null } | null> {
  // Fetch the pairing code
  const { data: pairingCode, error: fetchError } = await supabase
    .from("pairing_codes")
    .select("*")
    .eq("code", code)
    .eq("is_used", false)
    .single();

  if (fetchError || !pairingCode) {
    console.error("Invalid or expired code:", fetchError);
    return null;
  }

  // Check if expired
  if (new Date(pairingCode.expires_at) < new Date()) {
    console.error("Code has expired");
    return null;
  }

  // Can't pair with yourself
  if (pairingCode.creator_id === userId) {
    console.error("Cannot pair with yourself");
    return null;
  }

  const partnerId = pairingCode.creator_id;
  const storyId = pairingCode.story_id;

  try {
    // Create the pair relationship (with proper ordering for unique constraint)
    const [userA, userB] = [userId, partnerId].sort();

    const { error: pairError } = await supabase.from("pairs").insert({
      user_a: userA,
      user_b: userB,
    });

    // Ignore duplicate pair errors (already paired)
    if (pairError && !pairError.message.includes("duplicate")) {
      console.error("Error creating pair:", pairError);
      throw pairError;
    }

    // Mark code as used
    await supabase
      .from("pairing_codes")
      .update({ is_used: true })
      .eq("code", code);

    // If there's a story, add the partner to it
    if (storyId) {
      await supabase
        .from("stories")
        .update({ partner_id: userId })
        .eq("id", storyId);
    }

    return { partnerId, storyId };
  } catch (error) {
    console.error("Error using pairing code:", error);
    return null;
  }
}

/**
 * Get all partners for a user
 */
export async function getUserPartners(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("pairs")
    .select("user_a, user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (error || !data) {
    console.error("Error fetching partners:", error);
    return [];
  }

  // Extract partner IDs
  return data.map((pair: { user_a: string; user_b: string }) =>
    pair.user_a === userId ? pair.user_b : pair.user_a
  );
}

/**
 * Check if two users are paired
 */
export async function areUsersPaired(userIdA: string, userIdB: string): Promise<boolean> {
  const [userA, userB] = [userIdA, userIdB].sort();

  const { data, error } = await supabase
    .from("pairs")
    .select("id")
    .eq("user_a", userA)
    .eq("user_b", userB)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Delete a pair relationship
 */
export async function unpairUsers(userIdA: string, userIdB: string): Promise<boolean> {
  const [userA, userB] = [userIdA, userIdB].sort();

  const { error } = await supabase
    .from("pairs")
    .delete()
    .eq("user_a", userA)
    .eq("user_b", userB);

  if (error) {
    console.error("Error unpairing users:", error);
    return false;
  }

  return true;
}
