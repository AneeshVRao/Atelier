-- ============================================
-- Style Intelligence System Migration
-- Adds fields for style analysis and learning
-- ============================================

-- 1. Add new columns to wardrobe_items for richer style data
ALTER TABLE wardrobe_items 
ADD COLUMN IF NOT EXISTS style_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS pattern TEXT DEFAULT 'solid',
ADD COLUMN IF NOT EXISTS secondary_color TEXT,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS fit TEXT;

-- 2. Add learned preferences to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS learned_style_mix JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS actual_color_palette TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS style_confidence DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS color_temperature TEXT;

-- 3. Create index for style_tags array search
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_style_tags 
ON wardrobe_items USING GIN (style_tags);

-- 4. Create index for pattern filtering
CREATE INDEX IF NOT EXISTS idx_wardrobe_items_pattern 
ON wardrobe_items (pattern);

-- 5. Add comments for documentation
COMMENT ON COLUMN wardrobe_items.style_tags IS 'Array of style archetypes this item fits (minimalist, streetwear, etc.)';
COMMENT ON COLUMN wardrobe_items.pattern IS 'Pattern type: solid, stripes, plaid, floral, etc.';
COMMENT ON COLUMN wardrobe_items.secondary_color IS 'Secondary color for multi-color items';
COMMENT ON COLUMN wardrobe_items.material IS 'Fabric/material: cotton, denim, silk, wool, etc.';
COMMENT ON COLUMN wardrobe_items.fit IS 'Fit type: fitted, regular, relaxed, oversized, cropped';

COMMENT ON COLUMN profiles.learned_style_mix IS 'JSON object with style percentages learned from wardrobe, e.g., {"minimalist": 0.6, "casual": 0.3}';
COMMENT ON COLUMN profiles.actual_color_palette IS 'Array of colors extracted from actual wardrobe items';
COMMENT ON COLUMN profiles.style_confidence IS 'Confidence score 0-1 based on wardrobe size and data quality';
COMMENT ON COLUMN profiles.color_temperature IS 'Learned color temperature: warm, cool, or neutral';
