# Branch Mode Troubleshooting Guide

## Error: "insert or update on table stories violates foreign key constraint"

**Full Error:** `"insert or update on table \"stories\" violates foreign key constraint \"stories_creator_id_fkey\""`

**Problem:** Your database has a foreign key constraint that requires `creator_id` to exist in the `profiles` table. This is overly restrictive for the app's auth flow.

**Solution:**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Open the file `supabase-fix-foreign-keys.sql`
3. Copy the SQL content
4. Paste it into the Supabase SQL Editor
5. Click "Run"

This will remove the restrictive foreign key constraint while keeping your data safe.

**Why This Happens:**
- Some database setups create foreign keys to a `profiles` table
- But the app uses Supabase Auth's `auth.users` directly
- The constraint prevents story creation until a profile entry exists
- Removing it allows normal story creation

---

## Error: "Could not find the 'session_code' column"

**Problem:** The database migration hasn't been run yet.

**Solution:**
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT/sql
2. Open the file `supabase-complete-branch-migration.sql`
3. Copy the **entire SQL content**
4. Paste it into the Supabase SQL Editor
5. Click "Run"
6. Wait for confirmation that all statements executed successfully

**Verification:**
After running the migration, you can verify it worked by running this query:
```sql
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'stories'
  AND column_name IN ('session_code', 'collaboration_type', 'parent_prompt_id', 'branch_author_id')
ORDER BY column_name;
```

You should see all 4 columns listed.

---

## Error: "You need a partner to create branch stories"

**Problem:** Old version of the code was cached.

**Solution:** This error should no longer occur - the code has been updated to support session codes. If you still see it:
1. Force refresh the app
2. Restart the Expo dev server
3. Clear app cache if needed

---

## Branch Mode Not Working After Migration

**Checklist:**
1. ✅ Run `supabase-complete-branch-migration.sql` in Supabase SQL Editor
2. ✅ Verify all 4 columns exist (use verification query above)
3. ✅ Restart Expo dev server
4. ✅ Force refresh the app
5. ✅ Check Supabase schema cache is updated (wait 30 seconds if needed)

---

## Partner Can't Join Branch Story

**Common Issues:**

1. **Wrong Code:** Make sure the 6-digit code is entered correctly
2. **Network Issue:** Check internet connection
3. **Migration Not Run:** Verify database columns exist
4. **Cache Issue:** Partner should restart their app

**How It Should Work:**
1. Creator creates Branch Mode story → gets 6-digit code
2. Creator shares code with partner
3. Partner enters code in "Join Story" screen
4. Partner's branch is automatically created
5. Both can write independently

---

## Branches Not Showing in Memories

**Possible Causes:**

1. **Both branches not finished:** Both partners need to complete their versions
2. **Wrong user:** Make sure you're logged in as one of the branch authors
3. **Sync Issue:** Pull down to refresh the Memories screen

**Expected Behavior:**
- Branch stories appear as a single card in Memories
- Card shows both "Your Version" and "Partner's Version"
- Tap to open comparison view

---

## Migration Already Run But Still Getting Errors

**If you've already run a previous migration:**

The new `supabase-complete-branch-migration.sql` is **safe to run multiple times**. It uses `IF NOT EXISTS` checks, so:
- ✅ Won't duplicate columns
- ✅ Won't fail if columns already exist
- ✅ Will only add missing columns

**Just run it again** - it will skip existing columns and only add what's missing.

---

## Quick Test After Migration

1. **Create Branch Story:**
   - Tap "New Story"
   - Choose any template
   - Select "Branch Mode"
   - Story should create successfully
   - You should see a 6-digit code

2. **Test Session Code (Optional):**
   - Copy the code
   - Use a different account/device
   - Go to "Join Story"
   - Enter the code
   - Partner branch should be created

3. **Verify in Database:**
   ```sql
   SELECT id, title, collaboration_type, session_code, parent_prompt_id, branch_author_id
   FROM stories
   WHERE collaboration_type = 'branch'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

---

## Still Having Issues?

1. Check Supabase logs for detailed error messages
2. Verify your Supabase project is active
3. Check that RLS policies allow inserts/updates
4. Make sure you're using the latest code from GitHub

**Migration Files:**
- `supabase-complete-branch-migration.sql` ← **Use this one!**
- `supabase-branch-mode-migration.sql` (older, partial)
- `supabase-migration-simple.sql` (older, no branch support)

Always use the **complete** migration for the best results!
