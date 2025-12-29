/**
 * Centralized type definitions for My Style Muse
 *
 * This file contains all shared types used across the application.
 * Import types from here rather than from hooks to avoid circular dependencies.
 */

import type { StyleAnalysis } from "@/lib/styleAnalyzer";
import type { ColorHarmonyResult } from "@/lib/colorHarmony";

// ============ WARDROBE TYPES ============

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  occasion: string[] | null;
  season: string[] | null;
  image_url?: string | null;
  created_at: string;
  // Wear tracking fields
  wear_count: number;
  wears_since_wash: number;
  wears_before_wash: number;
  last_worn: string | null;
  last_washed: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  // Style intelligence fields
  style_tags: string[] | null;
  pattern: string | null;
  secondary_color: string | null;
  material: string | null;
  fit: string | null;
}

// ============ USER TYPES ============

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  gender: string | null;
  style_preference: string | null;
  color_palette: string | null;
  body_type: string | null;
  height: string | null;
  budget_range: string | null;
  occasions: string[] | null;
  preferred_brands: string[] | null;
  avatar_url: string | null;
  style_streak?: number;
  last_outfit_date?: string;
  onboarding_completed?: boolean;
}

// ============ OUTFIT TYPES ============

export interface OutfitItem {
  name: string;
  category: string;
  stylingTip?: string;
}

export interface OutfitRecommendation {
  outfitName?: string;
  items?: OutfitItem[];
  overallLook?: string;
  trendNote?: string;
  occasionSuitability?: string;
  stylingTips?: string[];
  alternativeSwaps?: string[];
  recommendation?: string;
  weatherNote?: string;
  // Style Intelligence additions
  whyThisWorks?: {
    styleMatch?: string;
    colorHarmony?: string;
    bodyTypeConsideration?: string;
  };
  confidenceScore?: number;
  confidenceReason?: string;
}

export interface DailyOutfit {
  id: string;
  user_id: string;
  outfit_date: string;
  recommendation: string;
  items: OutfitItem[] | null;
  trend_notes: string | null;
  weather_note: string | null;
  mood_rating: number | null;
  occasion: string | null;
  is_user_logged: boolean;
  created_at: string;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  items: OutfitItem[] | null;
  occasion: string | null;
  season: string | null;
  is_favorite: boolean;
  times_worn: number;
  last_worn: string | null;
  created_at: string;
}

// ============ CALENDAR TYPES ============

export interface CalendarOutfitItems {
  items?: OutfitItem[];
  outfitName?: string;
}

export interface CalendarEntry {
  id: string;
  user_id: string;
  planned_date: string;
  occasion: string | null;
  notes: string | null;
  outfit_items: CalendarOutfitItems | null;
  is_completed: boolean | null;
  created_at: string;
}

// ============ SHOPPING TYPES ============

export type ShoppingPriority = "low" | "medium" | "high";

export interface ShoppingItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string | null;
  priority: ShoppingPriority | null;
  estimated_price: number | null;
  notes: string | null;
  is_purchased: boolean | null;
  created_at: string;
}

// ============ LAUNDRY TYPES ============

export type WashType = "machine" | "hand" | "dry_clean" | "spot_clean";

export interface LaundryLogItem {
  wardrobe_item_id: string;
  wardrobe_items?: {
    id: string;
    name: string;
    category: string;
    color: string | null;
  };
}

export interface LaundryLog {
  id: string;
  user_id: string;
  wash_date: string;
  wash_type: WashType;
  notes: string | null;
  created_at: string;
  laundry_log_items?: LaundryLogItem[];
}

// ============ STYLE BOARD TYPES ============

export interface StyleBoard {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  inspiration_urls: string[] | null;
  color_scheme: string[] | null;
  tags: string[] | null;
  created_at: string;
}

// ============ STYLE INTELLIGENCE TYPES ============

export interface StyleProfile {
  // Core analysis
  analysis: StyleAnalysis;

  // Quick access helpers
  primaryStyle: string;
  styleBreakdown: Array<{ style: string; label: string; percentage: number }>;
  colorPalette: {
    primary: string[];
    accent: string[];
    temperature: "warm" | "cool" | "mixed";
  };

  // Comparison with declared preferences
  declaredStyle: string | null;
  declaredColorPalette: string | null;
  styleMatchesDeclared: boolean;
  comparisonInsight: string | null;

  // Suggestions
  colorSuggestions: {
    recommended: Array<{ color: string; reason: string }>;
    avoid: Array<{ color: string; reason: string }>;
  };

  // Scores
  versatilityScore: number;
  harmonyScore: number;
  confidence: number;

  // Utility function
  checkItemMatch: (item: Partial<WardrobeItem>) => {
    matchesStyle: boolean;
    addsVariety: boolean;
    suggestion: string;
  };
}

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
  wardrobeCount: number;
  savedOutfits: number;
  shoppingItems: number;
  plannedOutfits: number;
}

// ============ WEATHER TYPES ============

export interface WeatherData {
  temperature: number;
  condition: string;
  icon?: string;
  isDay?: boolean;
}

// ============ QUERY KEY TYPES ============

export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  wardrobe: (userId: string) => ["wardrobe", userId] as const,
  wardrobeItem: (itemId: string) => ["wardrobe", "item", itemId] as const,
  dailyOutfit: (userId: string, date: string) =>
    ["dailyOutfit", userId, date] as const,
  savedOutfits: (userId: string) => ["savedOutfits", userId] as const,
  shoppingList: (userId: string) => ["shoppingList", userId] as const,
  calendarEntries: (userId: string, month: string) =>
    ["calendar", userId, month] as const,
  stats: (userId: string) => ["stats", userId] as const,
  styleBoards: (userId: string) => ["styleBoards", userId] as const,
  weather: (lat: number, lon: number) => ["weather", lat, lon] as const,
  laundryBasket: (userId: string) => ["laundryBasket", userId] as const,
  laundryHistory: (userId: string) => ["laundryHistory", userId] as const,
} as const;

// Re-export color harmony types
export type { StyleAnalysis, ColorHarmonyResult };
