// ============================================
// FASHION CONSTANTS
// Centralized configuration for style options
// ============================================

// Style Archetypes
export const STYLE_PREFERENCES = [
  {
    id: "classic",
    label: "Classic & Timeless",
    description: "Clean lines, neutral colors, investment pieces",
  },
  {
    id: "minimalist",
    label: "Minimalist Chic",
    description: "Less is more, quality over quantity",
  },
  {
    id: "bold",
    label: "Bold & Trendy",
    description: "Statement pieces, current trends",
  },
  {
    id: "romantic",
    label: "Romantic & Feminine",
    description: "Soft fabrics, delicate details",
  },
  {
    id: "bohemian",
    label: "Bohemian Free Spirit",
    description: "Flowy fabrics, eclectic patterns",
  },
  {
    id: "streetwear",
    label: "Urban Streetwear",
    description: "Casual cool, sneaker culture",
  },
  {
    id: "preppy",
    label: "Preppy & Polished",
    description: "Classic American, collegiate vibes",
  },
  {
    id: "edgy",
    label: "Edgy & Alternative",
    description: "Dark tones, leather, unconventional",
  },
] as const;

// Color Palettes
export const COLOR_PALETTES = [
  {
    id: "neutrals",
    label: "Warm Neutrals",
    colors: ["#E8DCD0", "#C4A484", "#8B7355"],
  },
  {
    id: "cool",
    label: "Cool & Crisp",
    colors: ["#F5F5F5", "#A9B4C2", "#4A5568"],
  },
  {
    id: "earth",
    label: "Earth Tones",
    colors: ["#8B6F47", "#6B5344", "#3D2914"],
  },
  {
    id: "pastels",
    label: "Soft Pastels",
    colors: ["#F5E6E0", "#E0D4C8", "#D4C4B0"],
  },
  {
    id: "jewel",
    label: "Jewel Tones",
    colors: ["#722F37", "#1E3A5F", "#2D5A27"],
  },
  {
    id: "monochrome",
    label: "Monochrome",
    colors: ["#1A1A1A", "#4A4A4A", "#8A8A8A"],
  },
] as const;

// Wardrobe Categories
export const WARDROBE_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Bags",
  "Accessories",
  "Jewelry",
  "Activewear",
  "Swimwear",
  "Sleepwear",
] as const;

// Common Colors
export const ITEM_COLORS = [
  "Black",
  "White",
  "Navy",
  "Beige",
  "Brown",
  "Gray",
  "Cream",
  "Pink",
  "Red",
  "Blue",
  "Green",
  "Burgundy",
  "Olive",
  "Camel",
  "Blush",
] as const;

// Occasions
export const OCCASIONS = [
  "Work",
  "Casual",
  "Evening",
  "Travel",
  "Date Night",
  "Formal Event",
  "Weekend",
  "Workout",
] as const;

// Seasons
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"] as const;

// Body Types
export const BODY_TYPES = [
  "Hourglass",
  "Pear",
  "Apple",
  "Rectangle",
  "Inverted Triangle",
  "Athletic",
] as const;

// Budget Ranges
export const BUDGET_RANGES = [
  "Budget-friendly",
  "Mid-range",
  "Premium",
  "Luxury",
] as const;

// Current Season Helper
export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

// Current Year
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

// Get Season Label (e.g., "Winter 2025")
export function getSeasonLabel(): string {
  return `${getCurrentSeason()} ${getCurrentYear()}`;
}

// ============================================
// STYLE INTELLIGENCE CONSTANTS
// For style analysis and learning
// ============================================

// Pattern Types
export const PATTERNS = [
  "Solid",
  "Stripes",
  "Plaid",
  "Floral",
  "Geometric",
  "Animal Print",
  "Tie-Dye",
  "Abstract",
  "Polka Dots",
  "Camo",
  "Paisley",
  "Houndstooth",
] as const;

// Materials/Fabrics
export const MATERIALS = [
  "Cotton",
  "Denim",
  "Silk",
  "Wool",
  "Linen",
  "Leather",
  "Polyester",
  "Cashmere",
  "Velvet",
  "Knit",
  "Satin",
  "Chiffon",
  "Tweed",
  "Corduroy",
  "Fleece",
] as const;

// Fit Types
export const FIT_TYPES = [
  "Fitted",
  "Regular",
  "Relaxed",
  "Oversized",
  "Cropped",
  "Slim",
  "Tailored",
] as const;

// Style Tags (subset of style preferences for item tagging)
export const STYLE_TAGS = [
  "minimalist",
  "classic",
  "streetwear",
  "romantic",
  "bohemian",
  "preppy",
  "edgy",
  "casual",
  "formal",
  "athleisure",
  "vintage",
  "trendy",
] as const;

// Style Indicators - map characteristics to style archetypes
export const STYLE_INDICATORS: Record<
  string,
  {
    colors: string[];
    patterns: string[];
    materials: string[];
    categories: string[];
    fits: string[];
  }
> = {
  minimalist: {
    colors: ["Black", "White", "Gray", "Beige", "Navy", "Cream"],
    patterns: ["Solid"],
    materials: ["Cotton", "Linen", "Wool", "Cashmere"],
    categories: ["Tops", "Bottoms", "Outerwear"],
    fits: ["Regular", "Relaxed", "Tailored"],
  },
  classic: {
    colors: ["Navy", "White", "Beige", "Camel", "Burgundy", "Black"],
    patterns: ["Solid", "Stripes", "Plaid", "Houndstooth"],
    materials: ["Cotton", "Wool", "Silk", "Tweed", "Cashmere"],
    categories: ["Tops", "Bottoms", "Outerwear", "Dresses"],
    fits: ["Regular", "Tailored", "Fitted"],
  },
  streetwear: {
    colors: ["Black", "White", "Gray", "Red", "Blue"],
    patterns: ["Solid", "Tie-Dye", "Abstract", "Camo"],
    materials: ["Cotton", "Denim", "Fleece", "Leather"],
    categories: ["Tops", "Bottoms", "Shoes", "Activewear", "Outerwear"],
    fits: ["Oversized", "Relaxed", "Cropped"],
  },
  romantic: {
    colors: ["Pink", "Blush", "Cream", "White", "Red"],
    patterns: ["Floral", "Polka Dots", "Solid"],
    materials: ["Silk", "Chiffon", "Satin", "Lace", "Velvet"],
    categories: ["Dresses", "Tops", "Accessories", "Jewelry"],
    fits: ["Fitted", "Regular", "Cropped"],
  },
  bohemian: {
    colors: ["Brown", "Cream", "Olive", "Beige", "Burgundy"],
    patterns: ["Floral", "Paisley", "Abstract", "Geometric"],
    materials: ["Cotton", "Linen", "Leather", "Knit"],
    categories: ["Dresses", "Tops", "Accessories", "Jewelry", "Bags"],
    fits: ["Relaxed", "Oversized", "Regular"],
  },
  preppy: {
    colors: ["Navy", "White", "Pink", "Green", "Red", "Blue"],
    patterns: ["Stripes", "Plaid", "Solid", "Polka Dots"],
    materials: ["Cotton", "Wool", "Cashmere", "Tweed"],
    categories: ["Tops", "Bottoms", "Outerwear", "Shoes"],
    fits: ["Regular", "Fitted", "Tailored"],
  },
  edgy: {
    colors: ["Black", "Gray", "Burgundy", "Red"],
    patterns: ["Solid", "Animal Print", "Abstract"],
    materials: ["Leather", "Denim", "Velvet", "Cotton"],
    categories: ["Outerwear", "Tops", "Bottoms", "Shoes", "Accessories"],
    fits: ["Fitted", "Slim", "Oversized"],
  },
  casual: {
    colors: ["Blue", "Gray", "White", "Beige", "Navy", "Green"],
    patterns: ["Solid", "Stripes", "Plaid"],
    materials: ["Cotton", "Denim", "Knit", "Fleece"],
    categories: ["Tops", "Bottoms", "Shoes", "Outerwear"],
    fits: ["Regular", "Relaxed"],
  },
};

// Color Temperature Classification
export const COLOR_TEMPERATURE: Record<string, "warm" | "cool" | "neutral"> = {
  Black: "neutral",
  White: "neutral",
  Gray: "cool",
  Navy: "cool",
  Blue: "cool",
  Beige: "warm",
  Brown: "warm",
  Cream: "warm",
  Camel: "warm",
  Pink: "warm",
  Blush: "warm",
  Red: "warm",
  Burgundy: "warm",
  Green: "cool",
  Olive: "warm",
};

// Color Mood Descriptions
export const COLOR_MOODS: Record<string, string> = {
  Black: "sophisticated and powerful",
  White: "clean and fresh",
  Gray: "balanced and versatile",
  Navy: "professional and trustworthy",
  Blue: "calm and reliable",
  Beige: "warm and approachable",
  Brown: "earthy and grounded",
  Cream: "soft and elegant",
  Camel: "luxurious and timeless",
  Pink: "playful and feminine",
  Blush: "romantic and gentle",
  Red: "bold and passionate",
  Burgundy: "rich and refined",
  Green: "natural and balanced",
  Olive: "earthy and adventurous",
};
