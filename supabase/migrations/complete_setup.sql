-- =====================================================
-- COMPLETE DATABASE SETUP FOR MY-STYLE-MUSE
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  style_preference TEXT,
  color_palette TEXT,
  occasions TEXT[],
  body_type TEXT,
  height TEXT,
  preferred_brands TEXT[],
  budget_range TEXT,
  avatar_url TEXT,
  style_streak INTEGER DEFAULT 0,
  last_outfit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. WARDROBE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  brand TEXT,
  image_url TEXT,
  occasion TEXT[],
  season TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. DAILY OUTFITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  outfit_date DATE DEFAULT CURRENT_DATE,
  recommendation TEXT NOT NULL,
  items JSONB,
  trend_notes TEXT,
  weather_note TEXT,
  mood_rating INTEGER,
  occasion VARCHAR(100),
  is_user_logged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, outfit_date)
);

-- =====================================================
-- 4. SAVED OUTFITS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS saved_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB,
  occasion TEXT,
  season TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  times_worn INTEGER DEFAULT 0,
  last_worn DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. OUTFIT CALENDAR TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS outfit_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  planned_date DATE NOT NULL,
  occasion TEXT,
  notes TEXT,
  outfit_items JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, planned_date)
);

-- =====================================================
-- 6. SHOPPING LIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shopping_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  estimated_price DECIMAL(10,2),
  notes TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. STYLE BOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS style_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  inspiration_urls TEXT[],
  color_scheme TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON wardrobe_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON wardrobe_items(category);
CREATE INDEX IF NOT EXISTS idx_daily_outfits_user_date ON daily_outfits(user_id, outfit_date);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user ON saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON outfit_calendar(user_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_style_boards_user ON style_boards(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_streak ON profiles(style_streak DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_boards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wardrobe policies
CREATE POLICY "Users can view own wardrobe" ON wardrobe_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wardrobe" ON wardrobe_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wardrobe" ON wardrobe_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wardrobe" ON wardrobe_items FOR DELETE USING (auth.uid() = user_id);

-- Daily outfits policies
CREATE POLICY "Users can view own daily outfits" ON daily_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily outfits" ON daily_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily outfits" ON daily_outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily outfits" ON daily_outfits FOR DELETE USING (auth.uid() = user_id);

-- Saved outfits policies
CREATE POLICY "Users can view own saved outfits" ON saved_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved outfits" ON saved_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved outfits" ON saved_outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved outfits" ON saved_outfits FOR DELETE USING (auth.uid() = user_id);

-- Calendar policies
CREATE POLICY "Users can view own calendar" ON outfit_calendar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar" ON outfit_calendar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar" ON outfit_calendar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar" ON outfit_calendar FOR DELETE USING (auth.uid() = user_id);

-- Shopping list policies
CREATE POLICY "Users can view own shopping list" ON shopping_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shopping list" ON shopping_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shopping list" ON shopping_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shopping list" ON shopping_list FOR DELETE USING (auth.uid() = user_id);

-- Style boards policies
CREATE POLICY "Users can view own style boards" ON style_boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own style boards" ON style_boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own style boards" ON style_boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own style boards" ON style_boards FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Database setup complete! All tables, indexes, and RLS policies created.' as status;
