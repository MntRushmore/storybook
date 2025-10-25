// Supabase Edge Function: Send Push Notification When Turn Changes
// Deploy: supabase functions deploy send-turn-notification
// Set secrets: supabase secrets set EXPO_ACCESS_TOKEN=your_token

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface TurnNotificationPayload {
  story_id: string;
  story_title: string;
  partner_id: string;
  partner_name: string;
}

serve(async (req) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the auth header
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse the request body
    const payload: TurnNotificationPayload = await req.json();
    const { story_id, story_title, partner_id, partner_name } = payload;

    if (!story_id || !partner_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get partner's push token
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", partner_id)
      .single();

    if (profileError || !profile?.push_token) {
      console.log("Partner has no push token or profile not found");
      return new Response(
        JSON.stringify({ message: "Partner has no push token" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate Expo push token format
    const pushToken = profile.push_token;
    if (!pushToken.startsWith("ExponentPushToken[") && !pushToken.startsWith("ExpoPushToken[")) {
      console.log("Invalid push token format:", pushToken);
      return new Response(
        JSON.stringify({ message: "Invalid push token format" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send push notification via Expo
    const expoPushMessage = {
      to: pushToken,
      sound: "default",
      title: "Your turn! ✍️",
      body: `${partner_name} added a word to "${story_title}"`,
      data: {
        type: "your_turn",
        storyId: story_id,
        storyTitle: story_title,
      },
      priority: "high",
      channelId: "story-updates",
    };

    const expoResponse = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
      },
      body: JSON.stringify(expoPushMessage),
    });

    const expoResult = await expoResponse.json();

    if (!expoResponse.ok) {
      console.error("Expo push error:", expoResult);
      return new Response(
        JSON.stringify({ error: "Failed to send push notification", details: expoResult }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Push notification sent successfully:", expoResult);

    return new Response(
      JSON.stringify({ success: true, result: expoResult }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-turn-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
