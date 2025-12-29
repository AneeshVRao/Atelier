-- Phase 1: Wear Tracking & Laundry System
-- Adds wear tracking columns to wardrobe_items and creates laundry logging tables

-- Enable uuid extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Add wear tracking columns to wardrobe_items
-- ============================================

ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS wear_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wears_since_wash INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wears_before_wash INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_worn DATE,
ADD COLUMN IF NOT EXISTS last_washed DATE,
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS purchase_date DATE;

-- Add index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_last_worn ON wardrobe_items(last_worn);
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_wears_since_wash ON wardrobe_items(wears_since_wash);

-- ============================================
-- 2. Create laundry_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS laundry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wash_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  wash_type TEXT CHECK (wash_type IN ('machine', 'hand', 'dry_clean', 'spot_clean')) DEFAULT 'machine',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE laundry_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own laundry logs" ON laundry_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own laundry logs" ON laundry_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own laundry logs" ON laundry_logs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Create laundry_log_items junction table
-- ============================================

CREATE TABLE IF NOT EXISTS laundry_log_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laundry_log_id UUID REFERENCES laundry_logs(id) ON DELETE CASCADE NOT NULL,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE laundry_log_items ENABLE ROW LEVEL SECURITY;

-- RLS policies (users can access via their laundry logs)
CREATE POLICY "Users can view own laundry log items" ON laundry_log_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM laundry_logs 
      WHERE laundry_logs.id = laundry_log_items.laundry_log_id 
      AND laundry_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own laundry log items" ON laundry_log_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM laundry_logs 
      WHERE laundry_logs.id = laundry_log_items.laundry_log_id 
      AND laundry_logs.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. Create outfit_item_logs for relational tracking
-- ============================================

CREATE TABLE IF NOT EXISTS outfit_item_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_outfit_id UUID REFERENCES daily_outfits(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfit_item_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own outfit item logs" ON outfit_item_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM daily_outfits 
      WHERE daily_outfits.id = outfit_item_logs.daily_outfit_id 
      AND daily_outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own outfit item logs" ON outfit_item_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_outfits 
      WHERE daily_outfits.id = outfit_item_logs.daily_outfit_id 
      AND daily_outfits.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. Set smart defaults based on category
-- ============================================

-- Update existing items with category-based defaults
UPDATE wardrobe_items SET wears_before_wash = 
  CASE 
    WHEN LOWER(category) IN ('underwear', 'socks', 'intimates') THEN 1
    WHEN LOWER(category) IN ('t-shirts', 'tank tops', 'activewear', 'sportswear', 'gym') THEN 1
    WHEN LOWER(category) IN ('shirts', 'blouses', 'polos', 'tops') THEN 2
    WHEN LOWER(category) IN ('dresses') THEN 2
    WHEN LOWER(category) IN ('sweaters', 'hoodies', 'cardigans', 'knitwear') THEN 4
    WHEN LOWER(category) IN ('jeans', 'pants', 'trousers', 'bottoms') THEN 6
    WHEN LOWER(category) IN ('dress pants', 'skirts', 'shorts') THEN 4
    WHEN LOWER(category) IN ('blazers', 'sport coats', 'suits') THEN 8
    WHEN LOWER(category) IN ('jackets', 'outerwear', 'light jackets') THEN 10
    WHEN LOWER(category) IN ('coats', 'winter coats', 'heavy outerwear') THEN 15
    WHEN LOWER(category) IN ('accessories', 'scarves', 'hats', 'belts') THEN 10
    WHEN LOWER(category) IN ('shoes', 'footwear', 'sneakers', 'boots') THEN 10
    ELSE 3  -- Default for unknown categories
  END
WHERE wears_before_wash = 1 OR wears_before_wash IS NULL;

-- ============================================
-- 6. Create function to get category default
-- ============================================

CREATE OR REPLACE FUNCTION get_category_wash_default(category_name TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE 
    WHEN LOWER(category_name) IN ('underwear', 'socks', 'intimates') THEN 1
    WHEN LOWER(category_name) IN ('t-shirts', 'tank tops', 'activewear', 'sportswear', 'gym') THEN 1
    WHEN LOWER(category_name) IN ('shirts', 'blouses', 'polos', 'tops') THEN 2
    WHEN LOWER(category_name) IN ('dresses') THEN 2
    WHEN LOWER(category_name) IN ('sweaters', 'hoodies', 'cardigans', 'knitwear') THEN 4
    WHEN LOWER(category_name) IN ('jeans', 'pants', 'trousers', 'bottoms') THEN 6
    WHEN LOWER(category_name) IN ('dress pants', 'skirts', 'shorts') THEN 4
    WHEN LOWER(category_name) IN ('blazers', 'sport coats', 'suits') THEN 8
    WHEN LOWER(category_name) IN ('jackets', 'outerwear', 'light jackets') THEN 10
    WHEN LOWER(category_name) IN ('coats', 'winter coats', 'heavy outerwear') THEN 15
    WHEN LOWER(category_name) IN ('accessories', 'scarves', 'hats', 'belts') THEN 10
    WHEN LOWER(category_name) IN ('shoes', 'footwear', 'sneakers', 'boots') THEN 10
    ELSE 3
  END;
END;
$$ LANGUAGE plpgsql;
