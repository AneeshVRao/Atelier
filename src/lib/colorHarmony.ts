// ============================================
// COLOR HARMONY SYSTEM
// Color theory utilities for outfit matching
// ============================================

import { ITEM_COLORS, COLOR_TEMPERATURE } from "./constants";

// Color wheel position for harmony calculations
const COLOR_WHEEL_POSITIONS: Record<string, number> = {
  Red: 0,
  Pink: 15,
  Blush: 20,
  Burgundy: 345,
  Brown: 30,
  Camel: 35,
  Beige: 40,
  Cream: 45,
  Olive: 75,
  Green: 120,
  Blue: 210,
  Navy: 225,
  Gray: -1, // Neutral
  Black: -1, // Neutral
  White: -1, // Neutral
};

// Complementary color pairs (opposite on color wheel)
export const COMPLEMENTARY_COLORS: Record<string, string[]> = {
  Navy: ["Cream", "Camel", "Beige"],
  Blue: ["Brown", "Camel", "Beige"],
  Red: ["Green", "Olive"],
  Pink: ["Green", "Olive"],
  Burgundy: ["Olive", "Cream"],
  Brown: ["Blue", "Navy"],
  Camel: ["Navy", "Blue"],
  Beige: ["Navy", "Blue", "Burgundy"],
  Cream: ["Navy", "Burgundy", "Brown"],
  Green: ["Red", "Pink", "Burgundy"],
  Olive: ["Burgundy", "Pink", "Blush"],
  Blush: ["Olive", "Green"],
};

// Analogous colors (adjacent on color wheel)
export const ANALOGOUS_COLORS: Record<string, string[]> = {
  Navy: ["Blue", "Gray"],
  Blue: ["Navy", "Green"],
  Red: ["Pink", "Burgundy"],
  Pink: ["Red", "Blush"],
  Burgundy: ["Red", "Brown"],
  Brown: ["Burgundy", "Camel", "Beige"],
  Camel: ["Brown", "Beige", "Cream"],
  Beige: ["Camel", "Cream", "Brown"],
  Cream: ["Beige", "White"],
  Green: ["Olive", "Blue"],
  Olive: ["Green", "Brown"],
  Blush: ["Pink", "Cream"],
};

// Neutral colors that pair with everything
export const NEUTRAL_COLORS = [
  "Black",
  "White",
  "Gray",
  "Beige",
  "Cream",
  "Navy",
];

// Triadic color schemes (3 colors equally spaced)
export const TRIADIC_SCHEMES = [
  ["Red", "Blue", "Olive"],
  ["Navy", "Brown", "Green"],
  ["Burgundy", "Navy", "Olive"],
  ["Pink", "Blue", "Camel"],
];

export interface ColorHarmonyResult {
  complementary: string[];
  analogous: string[];
  neutralPairings: string[];
  bestMatches: string[];
  avoidWith: string[];
  suggestion: string;
}

/**
 * Get color harmony suggestions for a given color
 */
export function getColorHarmony(color: string): ColorHarmonyResult {
  const complementary = COMPLEMENTARY_COLORS[color] || [];
  const analogous = ANALOGOUS_COLORS[color] || [];
  const neutralPairings = NEUTRAL_COLORS.filter((n) => n !== color);

  // Best matches combine complementary and neutrals
  const bestMatches = [
    ...new Set([...complementary, ...neutralPairings]),
  ].slice(0, 5);

  // Colors to potentially avoid (clashing, too similar non-analogous)
  const avoidWith = getClashingColors(color);

  // Generate human-readable suggestion
  const suggestion = generateColorSuggestion(color, complementary, analogous);

  return {
    complementary,
    analogous,
    neutralPairings,
    bestMatches,
    avoidWith,
    suggestion,
  };
}

/**
 * Get colors that might clash with the given color
 */
function getClashingColors(color: string): string[] {
  // These are subjective but common clashing combinations
  const clashMap: Record<string, string[]> = {
    Red: ["Pink", "Burgundy"], // Too similar, can look muddy
    Pink: ["Red", "Burgundy"],
    Brown: ["Black"], // Can look muddy together
    Navy: ["Black"], // Too similar, low contrast
    Olive: ["Gray"], // Can wash out
  };
  return clashMap[color] || [];
}

/**
 * Generate a human-readable color pairing suggestion
 */
function generateColorSuggestion(
  color: string,
  complementary: string[],
  analogous: string[]
): string {
  if (NEUTRAL_COLORS.includes(color)) {
    return `${color} is versatile and pairs beautifully with almost any color. Try it with bold accents like Red or Burgundy.`;
  }

  if (complementary.length > 0) {
    const compList = complementary.slice(0, 2).join(" or ");
    return `${color} looks stunning with ${compList} for a balanced, eye-catching combination.`;
  }

  if (analogous.length > 0) {
    const anaList = analogous.slice(0, 2).join(" and ");
    return `${color} creates a harmonious look when paired with ${anaList}.`;
  }

  return `${color} works well with neutral tones like Black, White, or Beige.`;
}

/**
 * Check if two colors harmonize well
 */
export function doColorsHarmonize(
  color1: string,
  color2: string
): {
  harmonizes: boolean;
  relationship: "complementary" | "analogous" | "neutral" | "clash" | "same";
  score: number; // 0-100
} {
  if (color1 === color2) {
    return { harmonizes: true, relationship: "same", score: 70 };
  }

  // Check if either is neutral
  if (NEUTRAL_COLORS.includes(color1) || NEUTRAL_COLORS.includes(color2)) {
    return { harmonizes: true, relationship: "neutral", score: 85 };
  }

  // Check complementary
  if (COMPLEMENTARY_COLORS[color1]?.includes(color2)) {
    return { harmonizes: true, relationship: "complementary", score: 95 };
  }

  // Check analogous
  if (ANALOGOUS_COLORS[color1]?.includes(color2)) {
    return { harmonizes: true, relationship: "analogous", score: 80 };
  }

  // Check clash
  const clashing = getClashingColors(color1);
  if (clashing.includes(color2)) {
    return { harmonizes: false, relationship: "clash", score: 30 };
  }

  // Default - might work
  return { harmonizes: true, relationship: "neutral", score: 60 };
}

/**
 * Analyze a color palette (array of colors) for harmony
 */
export function analyzePaletteHarmony(colors: string[]): {
  overallScore: number;
  temperature: "warm" | "cool" | "mixed";
  dominantColors: string[];
  suggestions: string[];
  isBalanced: boolean;
} {
  if (colors.length === 0) {
    return {
      overallScore: 0,
      temperature: "mixed",
      dominantColors: [],
      suggestions: [
        "Add some items to your wardrobe to analyze your color palette.",
      ],
      isBalanced: false,
    };
  }

  // Count color frequencies
  const colorCounts: Record<string, number> = {};
  colors.forEach((color) => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });

  // Get dominant colors (top 3)
  const sortedColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const dominantColors = sortedColors.map(([color]) => color);

  // Calculate temperature
  let warmCount = 0;
  let coolCount = 0;
  colors.forEach((color) => {
    const temp = COLOR_TEMPERATURE[color];
    if (temp === "warm") warmCount++;
    else if (temp === "cool") coolCount++;
  });

  const temperature: "warm" | "cool" | "mixed" =
    warmCount > coolCount * 1.5
      ? "warm"
      : coolCount > warmCount * 1.5
      ? "cool"
      : "mixed";

  // Calculate harmony score
  let totalScore = 0;
  let comparisons = 0;

  for (let i = 0; i < dominantColors.length; i++) {
    for (let j = i + 1; j < dominantColors.length; j++) {
      const result = doColorsHarmonize(dominantColors[i], dominantColors[j]);
      totalScore += result.score;
      comparisons++;
    }
  }

  const overallScore =
    comparisons > 0 ? Math.round(totalScore / comparisons) : 50;

  // Generate suggestions
  const suggestions: string[] = [];

  // Check for missing neutrals
  const hasNeutrals = colors.some((c) => NEUTRAL_COLORS.includes(c));
  if (!hasNeutrals) {
    suggestions.push(
      "Consider adding neutral colors like Black, White, or Navy for more versatile outfit options."
    );
  }

  // Check temperature balance
  if (temperature === "warm") {
    suggestions.push(
      "Your palette leans warm. Adding cool tones like Navy or Gray could add balance."
    );
  } else if (temperature === "cool") {
    suggestions.push(
      "Your palette leans cool. Warm accents like Camel or Burgundy could add warmth."
    );
  }

  // Check for accent colors
  const nonNeutralCount = colors.filter(
    (c) => !NEUTRAL_COLORS.includes(c)
  ).length;
  if (nonNeutralCount < colors.length * 0.2) {
    suggestions.push(
      "Your wardrobe is mostly neutrals. A pop of color like Burgundy or Green could add interest."
    );
  }

  const isBalanced = overallScore >= 70 && suggestions.length <= 1;

  return {
    overallScore,
    temperature,
    dominantColors,
    suggestions,
    isBalanced,
  };
}

/**
 * Get color suggestions based on existing wardrobe
 */
export function getColorSuggestionsForWardrobe(existingColors: string[]): {
  recommended: Array<{ color: string; reason: string }>;
  avoid: Array<{ color: string; reason: string }>;
} {
  const colorCounts: Record<string, number> = {};
  existingColors.forEach((color) => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });

  const dominantColors = Object.entries(colorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([color]) => color);

  const recommended: Array<{ color: string; reason: string }> = [];
  const avoid: Array<{ color: string; reason: string }> = [];

  // Find complementary colors to recommend
  dominantColors.forEach((color) => {
    const complements = COMPLEMENTARY_COLORS[color] || [];
    complements.forEach((comp) => {
      if (!colorCounts[comp] || colorCounts[comp] < 2) {
        recommended.push({
          color: comp,
          reason: `Pairs beautifully with your ${color} pieces`,
        });
      }
    });
  });

  // Check for overrepresented colors
  const totalItems = existingColors.length;
  Object.entries(colorCounts).forEach(([color, count]) => {
    if (count > totalItems * 0.4) {
      avoid.push({
        color,
        reason: `You already have many ${color} items (${Math.round(
          (count / totalItems) * 100
        )}% of wardrobe)`,
      });
    }
  });

  // Add neutrals if missing
  const missingNeutrals = NEUTRAL_COLORS.filter(
    (n) => !colorCounts[n] || colorCounts[n] < 2
  );
  missingNeutrals.slice(0, 2).forEach((neutral) => {
    recommended.push({
      color: neutral,
      reason: `${neutral} is a versatile foundation piece that pairs with everything`,
    });
  });

  // Deduplicate and limit
  const uniqueRecommended = recommended
    .filter((r, i, arr) => arr.findIndex((x) => x.color === r.color) === i)
    .slice(0, 5);

  return {
    recommended: uniqueRecommended,
    avoid,
  };
}
