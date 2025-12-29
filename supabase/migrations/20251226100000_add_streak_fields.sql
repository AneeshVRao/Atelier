-- Add streak tracking fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS style_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_outfit_date DATE;

-- Add mood rating to daily_outfits for outfit logging
ALTER TABLE daily_outfits
ADD COLUMN IF NOT EXISTS mood_rating INTEGER,
ADD COLUMN IF NOT EXISTS occasion TEXT,
ADD COLUMN IF NOT EXISTS is_user_logged BOOLEAN DEFAULT false;

-- Create index for faster streak queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_outfit_date ON profiles(last_outfit_date);
CREATE INDEX IF NOT EXISTS idx_daily_outfits_user_date ON daily_outfits(user_id, outfit_date);
