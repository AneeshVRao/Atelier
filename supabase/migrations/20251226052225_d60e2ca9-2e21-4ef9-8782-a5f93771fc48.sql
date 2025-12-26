-- Add outfit_calendar for planning looks ahead
CREATE TABLE public.outfit_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  occasion TEXT,
  notes TEXT,
  outfit_items JSONB,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, planned_date)
);

ALTER TABLE public.outfit_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar" ON public.outfit_calendar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create calendar entries" ON public.outfit_calendar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar" ON public.outfit_calendar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendar" ON public.outfit_calendar FOR DELETE USING (auth.uid() = user_id);

-- Add saved_outfits for favorite looks
CREATE TABLE public.saved_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB,
  occasion TEXT,
  season TEXT,
  is_favorite BOOLEAN DEFAULT false,
  times_worn INTEGER DEFAULT 0,
  last_worn DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own outfits" ON public.saved_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create outfits" ON public.saved_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON public.saved_outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON public.saved_outfits FOR DELETE USING (auth.uid() = user_id);

-- Add style_boards for inspiration/mood boards
CREATE TABLE public.style_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  inspiration_urls TEXT[],
  color_scheme TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.style_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own boards" ON public.style_boards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create boards" ON public.style_boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boards" ON public.style_boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boards" ON public.style_boards FOR DELETE USING (auth.uid() = user_id);

-- Add shopping_list for wardrobe gaps
CREATE TABLE public.shopping_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  estimated_price DECIMAL(10,2),
  notes TEXT,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own list" ON public.shopping_list FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to list" ON public.shopping_list FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own list" ON public.shopping_list FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from list" ON public.shopping_list FOR DELETE USING (auth.uid() = user_id);

-- Add body type and more fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS body_type TEXT,
ADD COLUMN IF NOT EXISTS height TEXT,
ADD COLUMN IF NOT EXISTS preferred_brands TEXT[],
ADD COLUMN IF NOT EXISTS budget_range TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;