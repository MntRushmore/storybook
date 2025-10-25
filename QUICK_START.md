# 🚀 Quick Start Guide - WordChain Premium

## What Was Just Added? ✨

Your WordChain app now has:

1. **✅ Template Selection Screen** - Choose from 50+ story prompts across 8 themes
2. **✅ Multiple Story Modes** - Quick (25 words), Standard (75), Epic (150), Sentence (20)
3. **✅ Beautiful Paywall** - Monetize with Monthly ($4.99) and Yearly ($29.99) plans
4. **✅ Theme System** - Romance, Adventure, Comedy, Mystery, Fantasy, Sci-Fi, Horror, Slice-of-Life
5. **✅ Database Ready** - Schema updated for photos, voice, streaks, and more

## 🎮 Try It Now!

### 1. Run Database Migration (REQUIRED)
```
1. Open: https://supabase.com/dashboard/project/qwafuwhkksaffmbzfqpq/sql
2. Copy ALL the SQL from: supabase-migration.sql
3. Paste and click "Run"
```

### 2. Test Template Selection
1. Open your Vibecode app preview
2. Tap "New Story" button on home screen
3. You'll see the new Template Selection screen!
4. Try selecting different themes and modes
5. Pick a template to create a story

### 3. Test Paywall
1. On Template Selection screen, tap "GO PRO" button
2. Beautiful paywall modal appears
3. Tap "Start Premium" to unlock (mock mode)
4. Now you can access all premium themes and modes!

## 💎 What's Premium vs Free?

### FREE (works now):
- 3 active stories (not enforced yet - see below)
- Romance, Comedy, Slice-of-Life themes
- Quick & Standard modes
- Basic story templates
- All core features (writing, partner sync, reveal)

### PREMIUM ($4.99/month or $29.99/year):
- **✅ WORKS**: All 8 themes unlocked
- **✅ WORKS**: Epic & Sentence modes unlocked
- **✅ WORKS**: 50+ premium templates unlocked
- **🔨 NEEDS WORK**: Voice input (infrastructure ready)
- **🔨 NEEDS WORK**: Photo attachments (infrastructure ready)
- **🔨 NEEDS WORK**: Story export (infrastructure ready)
- **🔨 NEEDS WORK**: Unlimited stories (needs enforcement)

## 🔨 What Still Needs Implementation

### High Priority (Do These First):

#### 1. Enforce Free Tier Limits
**Where**: `src/screens/HomeScreen.tsx`
**What**: Check active story count before allowing new stories

```typescript
// In HomeScreen, before navigation:
const handleNewStory = async () => {
  const isPremium = await checkPremiumStatus();
  const activeStories = useStoryStore.getState().getActiveStories();

  if (!isPremium && activeStories.length >= 3) {
    setShowPaywall(true); // Show paywall instead
    return;
  }

  navigation.navigate("TemplateSelection");
};
```

#### 2. Add Photo Upload Feature
**Where**: `src/screens/StoryDetailScreen.tsx`
**What**: Add camera button that uploads to Supabase storage

```typescript
import * as ImagePicker from 'expo-image-picker';

// Add button in UI:
<Pressable onPress={handleAddPhoto}>
  <Ionicons name="camera" size={24} />
</Pressable>

// Handler:
const handleAddPhoto = async () => {
  const isPremium = await checkPremiumStatus();
  if (!isPremium) {
    setShowPaywall(true);
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    // Upload to Supabase storage
    const file = await fetch(result.assets[0].uri);
    const blob = await file.blob();

    const { data, error } = await supabase.storage
      .from('story-photos')
      .upload(`${storyId}/${Date.now()}.jpg`, blob);

    if (data) {
      // Save to database
      await supabase.from('story_photos').insert({
        id: uuidv4(),
        story_id: storyId,
        photo_url: data.path,
        user_id: userProfile.userId,
        timestamp: Date.now()
      });
    }
  }
};
```

#### 3. Add Story Export Feature
**Where**: `src/screens/StoryRevealScreen.tsx`
**What**: Export completed story as image

```typescript
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

// Wrap your story display in ViewShot:
<ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
  {/* Story content */}
</ViewShot>

// Export handler:
const handleExport = async () => {
  const isPremium = await checkPremiumStatus();
  if (!isPremium) {
    setShowPaywall(true);
    return;
  }

  const uri = await viewShotRef.current.capture();
  await Sharing.shareAsync(uri);
};
```

### Medium Priority:

#### 4. Streak Tracking
Create a service to track daily activity:
```typescript
// src/services/streakService.ts
export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Fetch user stats
  const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Calculate streak logic
  // Update user_stats table
}
```

#### 5. Partner Reactions
Add emoji reactions to finished stories in `StoryRevealScreen.tsx`

### Low Priority:
- Voice input
- Tags/collections
- Advanced filters

## 🎯 Recommended Next Steps (In Order)

1. **Run SQL migration** (5 minutes) - REQUIRED
2. **Test template selection** (2 minutes) - Make sure it works
3. **Test paywall** (2 minutes) - Make sure it looks good
4. **Add free tier enforcement** (10 minutes) - Prevent unlimited free stories
5. **Add photo upload** (30 minutes) - High-value premium feature
6. **Add story export** (30 minutes) - Key monetization feature
7. **Set up real RevenueCat** (optional) - Or keep mock mode for testing

## 💰 RevenueCat Setup (Optional)

Current status: App uses **mock subscriptions** (everyone can unlock premium)

To use real payments:
1. Go to Vibecode app → API tab
2. Add RevenueCat integration
3. Update `src/services/revenueCat.ts` with real SDK calls
4. Replace mock code with actual RevenueCat SDK

**OR** keep mock mode for testing - it works perfectly for development!

## 🐛 Troubleshooting

### "Type errors on createStory"
- Make sure you ran `bun install` if any packages were added
- Database migration must be run

### "Templates not showing"
- Check `src/constants/storyConstants.ts` - it has 50+ templates

### "Paywall not working"
- It's mock mode - tapping "Start Premium" sets local flag
- This is intentional for easy testing

### "New Story button doesn't navigate"
- Check that TemplateSelectionScreen is registered in RootNavigator

## ✨ What's Beautiful About This

1. **Professional Paywall** - Beautiful UI with pricing, features, restore
2. **50+ Templates** - Categorized by theme, ready to use
3. **8 Themes** - Each with unique colors and gradients
4. **Smart Feature Gating** - Premium features show locks
5. **Mock Revenue Cat** - Test premium features without setup
6. **Database Ready** - All tables ready for remaining features

## 📞 Need Help?

Check these files:
- `PREMIUM_FEATURES_SUMMARY.md` - Detailed implementation guide
- `README.md` - Full feature documentation
- `supabase-migration.sql` - Database schema
- `src/constants/storyConstants.ts` - All themes/templates
- `src/services/revenueCat.ts` - Subscription logic

Your app is now monetization-ready! 🎉
