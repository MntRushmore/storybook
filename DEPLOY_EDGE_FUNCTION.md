# 🚀 Deploy Edge Function - Quick Guide

Your Edge Function URL is ready: `https://qwafuwhkksaffmbzfqpq.supabase.co/functions/v1/send-turn-notification`

But the function code needs to be deployed. Here's how:

## Step 1: Go to Supabase Dashboard

Open this link: https://supabase.com/dashboard/project/qwafuwhkksaffmbzfqpq/functions

## Step 2: Create the Edge Function

1. Click the **"Create a new function"** button
2. Enter function name: `send-turn-notification` (exactly this name)
3. Click **"Create function"**

## Step 3: Paste the Function Code

Copy and paste this ENTIRE code into the editor:

```typescript
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

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

    const payload: TurnNotificationPayload = await req.json();
    const { story_id, story_title, partner_id, partner_name } = payload;

    if (!story_id || !partner_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

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

    const pushToken = profile.push_token;
    if (!pushToken.startsWith("ExponentPushToken[") && !pushToken.startsWith("ExpoPushToken[")) {
      console.log("Invalid push token format:", pushToken);
      return new Response(
        JSON.stringify({ message: "Invalid push token format" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

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
```

## Step 4: Deploy

1. Click the **"Deploy"** button (or **"Save"**)
2. Wait for deployment to complete (usually takes 10-30 seconds)
3. You'll see a success message

## Step 5: Verify

Once deployed, you should see:
- ✅ Status: **Active** or **Deployed**
- ✅ URL: `https://qwafuwhkksaffmbzfqpq.supabase.co/functions/v1/send-turn-notification`

## ✅ That's It!

No additional configuration needed. The Edge Function will automatically:
- Use your Supabase URL and API key (auto-injected)
- Query the profiles table for push tokens
- Send notifications via Expo Push API

## 🧪 Test It

After deployment, test the full flow:
1. Log in with two different accounts on two devices
2. Pair the accounts using pairing codes
3. Create a story together
4. Add a word from one device
5. The other device should receive a push notification within seconds!

## 🔍 Debugging

If notifications don't work, check:
1. **Edge Function Logs**: Dashboard → Edge Functions → send-turn-notification → Logs
2. **Push Token**: Dashboard → Table Editor → profiles → check push_token column has values
3. **App Logs**: Check expo.log for any errors

---

**Need Help?** The Edge Function is already coded and ready. Just copy, paste, and deploy!
