// ============================================
// STYLE ANALYZER ENGINE
// Analyzes wardrobe to learn user's style DNA
// ============================================

import { WardrobeItem } from "@/hooks/useDataQueries";
import {
  STYLE_INDICATORS,
  STYLE_PREFERENCES,
  COLOR_TEMPERATURE,
  COLOR_MOODS,
} from "./constants";
import {
  analyzePaletteHarmony,
  getColorSuggestionsForWardrobe,
} from "./colorHarmony";

// ============ TYPES ============

export interface StyleDistribution {
  style: string;
  label: string;
  percentage: number;
  itemCount: number;
}

export interface ColorAnalysis {
  primary: string[]; // Top 3 most common colors
  accent: string[]; // Colors used sparingly (< 10%)
  missing: string[]; // Complementary colors not in wardrobe
  temperature: "warm" | "cool" | "mixed";
  harmonyScore: number;
  mood: string;
}

export interface StyleGap {
  type: "color" | "category" | "occasion" | "season" | "style";
  description: string;
  suggestion: string;
  priority: "high" | "medium" | "low";
}

export interface StyleAnalysis {
  // Core style breakdown
  dominantStyles: StyleDistribution[];
  primaryStyle: string;
  stylePersonality: string;

  // Color analysis
  colorAnalysis: ColorAnalysis;

  // Wardrobe health
  versatilityScore: number; // 0-100
  gaps: StyleGap[];
  strengths: string[];

  // Confidence in analysis
  confidence: number; // 0-1, based on wardrobe size and data quality

  // Comparison with declared preferences
  declaredVsActual: {
    styleMatch: boolean;
    colorMatch: boolean;
    insight: string;
  } | null;
}

// ============ MAIN ANALYSIS FUNCTION ============

/**
 * Analyze a wardrobe to extract style DNA
 */
export function analyzeWardrobeStyle(
  items: WardrobeItem[],
  declaredStyle?: string | null,
  declaredColorPalette?: string | null
): StyleAnalysis {
  if (items.length === 0) {
    return getEmptyAnalysis();
  }

  // Calculate style distribution
  const styleScores = calculateStyleScores(items);
  const dominantStyles = getTopStyles(styleScores, items.length);
  const primaryStyle = dominantStyles[0]?.style || "casual";

  // Analyze colors
  const colors = items.map((item) => item.color).filter(Boolean) as string[];
  const colorAnalysis = analyzeColors(colors, items);

  // Calculate versatility
  const versatilityScore = calculateVersatility(items);

  // Find gaps and strengths
  const gaps = identifyGaps(items, colorAnalysis);
  const strengths = identifyStrengths(items, dominantStyles);

  // Generate style personality description
  const stylePersonality = generateStylePersonality(
    dominantStyles,
    colorAnalysis,
    items.length
  );

  // Calculate confidence
  const confidence = calculateConfidence(items);

  // Compare with declared preferences
  const declaredVsActual = declaredStyle
    ? compareWithDeclared(
        dominantStyles,
        colorAnalysis,
        declaredStyle,
        declaredColorPalette ?? null
      )
    : null;

  return {
    dominantStyles,
    primaryStyle,
    stylePersonality,
    colorAnalysis,
    versatilityScore,
    gaps,
    strengths,
    confidence,
    declaredVsActual,
  };
}

// ============ STYLE SCORING ============

/**
 * Calculate style archetype scores for each item
 */
function calculateStyleScores(items: WardrobeItem[]): Record<string, number> {
  const scores: Record<string, number> = {};

  // Initialize all styles with 0
  Object.keys(STYLE_INDICATORS).forEach((style) => {
    scores[style] = 0;
  });

  items.forEach((item) => {
    Object.entries(STYLE_INDICATORS).forEach(([style, indicators]) => {
      let itemScore = 0;

      // Check color match (weight: 25%)
      if (item.color && indicators.colors.includes(item.color)) {
        itemScore += 0.25;
      }

      // Check pattern match (weight: 20%)
      const pattern = (item as any).pattern || "Solid";
      if (indicators.patterns.includes(pattern)) {
        itemScore += 0.2;
      }

      // Check category match (weight: 20%)
      if (indicators.categories.includes(item.category)) {
        itemScore += 0.2;
      }

      // Check material match (weight: 20%)
      const material = (item as any).material;
      if (material && indicators.materials.includes(material)) {
        itemScore += 0.2;
      }

      // Check fit match (weight: 15%)
      const fit = (item as any).fit;
      if (fit && indicators.fits.includes(fit)) {
        itemScore += 0.15;
      }

      // Check explicit style tags (weight: bonus 30%)
      const styleTags = (item as any).style_tags || [];
      if (styleTags.includes(style)) {
        itemScore += 0.3;
      }

      // Weight by wear count (frequently worn = stronger signal)
      const wearMultiplier = Math.min(1 + (item.wear_count || 0) * 0.05, 1.5);
      scores[style] += itemScore * wearMultiplier;
    });
  });

  return scores;
}

/**
 * Get top styles sorted by score
 */
function getTopStyles(
  scores: Record<string, number>,
  itemCount: number
): StyleDistribution[] {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  if (totalScore === 0) {
    return [
      {
        style: "casual",
        label: "Casual",
        percentage: 100,
        itemCount,
      },
    ];
  }

  const distributions: StyleDistribution[] = Object.entries(scores)
    .map(([style, score]) => {
      const styleInfo = STYLE_PREFERENCES.find((s) => s.id === style);
      return {
        style,
        label: styleInfo?.label || style,
        percentage: Math.round((score / totalScore) * 100),
        itemCount: Math.round((score / totalScore) * itemCount),
      };
    })
    .filter((d) => d.percentage >= 5) // Only show styles with 5%+ representation
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4); // Top 4 styles

  // Ensure percentages sum to 100
  const shownTotal = distributions.reduce((a, b) => a + b.percentage, 0);
  if (distributions.length > 0 && shownTotal !== 100) {
    const diff = 100 - shownTotal;
    distributions[0].percentage += diff;
  }

  return distributions;
}

// ============ COLOR ANALYSIS ============

/**
 * Analyze color distribution and harmony
 */
function analyzeColors(colors: string[], items: WardrobeItem[]): ColorAnalysis {
  if (colors.length === 0) {
    return {
      primary: [],
      accent: [],
      missing: ["Black", "White", "Navy"],
      temperature: "mixed",
      harmonyScore: 0,
      mood: "undefined",
    };
  }

  // Count color frequencies
  const colorCounts: Record<string, number> = {};
  colors.forEach((color) => {
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });

  const totalColors = colors.length;
  const sortedColors = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  // Primary colors (top 3, each > 10%)
  const primary = sortedColors
    .filter(([_, count]) => count / totalColors >= 0.1)
    .slice(0, 3)
    .map(([color]) => color);

  // Accent colors (< 10% but present)
  const accent = sortedColors
    .filter(
      ([_, count]) => count / totalColors < 0.1 && count / totalColors >= 0.03
    )
    .slice(0, 3)
    .map(([color]) => color);

  // Get harmony analysis
  const harmonyAnalysis = analyzePaletteHarmony(colors);
  const colorSuggestions = getColorSuggestionsForWardrobe(colors);

  // Get missing complementary colors
  const missing = colorSuggestions.recommended.slice(0, 3).map((r) => r.color);

  // Calculate mood based on dominant color
  const dominantColor = primary[0] || "Gray";
  const mood = COLOR_MOODS[dominantColor] || "versatile and balanced";

  return {
    primary,
    accent,
    missing,
    temperature: harmonyAnalysis.temperature,
    harmonyScore: harmonyAnalysis.overallScore,
    mood,
  };
}

// ============ VERSATILITY & GAPS ============

/**
 * Calculate wardrobe versatility score (0-100)
 */
function calculateVersatility(items: WardrobeItem[]): number {
  if (items.length === 0) return 0;

  let score = 0;

  // Category coverage (max 30 points)
  const categories = new Set(items.map((i) => i.category));
  const categoryScore = Math.min(categories.size / 6, 1) * 30;
  score += categoryScore;

  // Season coverage (max 20 points)
  const seasons = new Set(items.flatMap((i) => i.season || []));
  const seasonScore = (seasons.size / 4) * 20;
  score += seasonScore;

  // Occasion coverage (max 20 points)
  const occasions = new Set(items.flatMap((i) => i.occasion || []));
  const occasionScore = Math.min(occasions.size / 5, 1) * 20;
  score += occasionScore;

  // Color variety (max 15 points)
  const colors = new Set(items.map((i) => i.color).filter(Boolean));
  const colorScore = Math.min(colors.size / 6, 1) * 15;
  score += colorScore;

  // Neutral foundation (max 15 points)
  const neutralColors = ["Black", "White", "Gray", "Navy", "Beige", "Cream"];
  const hasNeutrals = items.filter((i) =>
    neutralColors.includes(i.color || "")
  ).length;
  const neutralScore = Math.min(hasNeutrals / (items.length * 0.3), 1) * 15;
  score += neutralScore;

  return Math.round(score);
}

/**
 * Identify gaps in the wardrobe
 */
function identifyGaps(
  items: WardrobeItem[],
  colorAnalysis: ColorAnalysis
): StyleGap[] {
  const gaps: StyleGap[] = [];

  // Check category gaps
  const categories = items.map((i) => i.category);
  const essentialCategories = ["Tops", "Bottoms", "Shoes", "Outerwear"];
  essentialCategories.forEach((cat) => {
    if (!categories.includes(cat)) {
      gaps.push({
        type: "category",
        description: `No ${cat.toLowerCase()} in your wardrobe`,
        suggestion: `Add some ${cat.toLowerCase()} for a more complete wardrobe`,
        priority: "high",
      });
    }
  });

  // Check season gaps
  const seasons = items.flatMap((i) => i.season || []);
  const allSeasons = ["Spring", "Summer", "Fall", "Winter"];
  allSeasons.forEach((season) => {
    if (!seasons.includes(season)) {
      gaps.push({
        type: "season",
        description: `Limited options for ${season}`,
        suggestion: `Add ${season}-appropriate pieces to stay stylish year-round`,
        priority: "medium",
      });
    }
  });

  // Check color gaps
  if (colorAnalysis.missing.length > 0) {
    gaps.push({
      type: "color",
      description: `Your palette could use more variety`,
      suggestion: `Consider adding ${colorAnalysis.missing
        .slice(0, 2)
        .join(" or ")} to complement your existing colors`,
      priority: "low",
    });
  }

  // Check occasion gaps
  const occasions = items.flatMap((i) => i.occasion || []);
  if (!occasions.includes("Work") && !occasions.includes("Formal Event")) {
    gaps.push({
      type: "occasion",
      description: "Limited formal/work options",
      suggestion: "Add some professional pieces for work or formal events",
      priority: "medium",
    });
  }

  return gaps;
}

/**
 * Identify wardrobe strengths
 */
function identifyStrengths(
  items: WardrobeItem[],
  dominantStyles: StyleDistribution[]
): string[] {
  const strengths: string[] = [];

  // Strong style identity
  if (dominantStyles.length > 0 && dominantStyles[0].percentage >= 40) {
    strengths.push(`Clear ${dominantStyles[0].label.toLowerCase()} aesthetic`);
  }

  // Good variety
  if (dominantStyles.length >= 3) {
    strengths.push("Versatile mix of styles");
  }

  // Category coverage
  const categories = new Set(items.map((i) => i.category));
  if (categories.size >= 5) {
    strengths.push("Well-rounded category coverage");
  }

  // Season coverage
  const seasons = new Set(items.flatMap((i) => i.season || []));
  if (seasons.size >= 3) {
    strengths.push("Good seasonal versatility");
  }

  // High-wear items
  const wellWorn = items.filter((i) => i.wear_count >= 5).length;
  if (wellWorn >= items.length * 0.3) {
    strengths.push("Many well-loved, frequently worn pieces");
  }

  return strengths;
}

// ============ STYLE PERSONALITY ============

/**
 * Generate a human-readable style personality description
 */
function generateStylePersonality(
  dominantStyles: StyleDistribution[],
  colorAnalysis: ColorAnalysis,
  itemCount: number
): string {
  if (itemCount < 5) {
    return "Building your personal style. Add more items to discover your style DNA.";
  }

  const primary = dominantStyles[0];
  const secondary = dominantStyles[1];

  let personality = "";

  // Primary style description
  if (primary) {
    const styleDescriptions: Record<string, string> = {
      minimalist: "You appreciate clean lines and understated elegance",
      classic: "You gravitate toward timeless, sophisticated pieces",
      streetwear: "You embrace urban cool with casual, statement-making style",
      romantic: "You love soft, feminine details and delicate touches",
      bohemian: "You're drawn to free-spirited, artistic expression",
      preppy: "You prefer polished, put-together looks with classic appeal",
      edgy: "You're not afraid to make bold, unconventional choices",
      casual: "You prioritize comfort without sacrificing style",
    };

    personality =
      styleDescriptions[primary.style] || `Your style leans ${primary.label}`;
  }

  // Add secondary influence
  if (secondary && secondary.percentage >= 15) {
    personality += `, with ${secondary.label.toLowerCase()} influences`;
  }

  // Add color personality
  if (colorAnalysis.primary.length > 0) {
    const colorTemp = colorAnalysis.temperature;
    const colorDescriptor =
      colorTemp === "warm"
        ? "warm, inviting"
        : colorTemp === "cool"
        ? "cool, sophisticated"
        : "balanced, versatile";

    personality += `. Your ${colorDescriptor} color palette is ${colorAnalysis.mood}.`;
  } else {
    personality += ".";
  }

  return personality;
}

// ============ CONFIDENCE & COMPARISON ============

/**
 * Calculate analysis confidence based on data quality
 */
function calculateConfidence(items: WardrobeItem[]): number {
  if (items.length === 0) return 0;

  let confidence = 0;

  // Item count factor (max 0.4)
  if (items.length >= 20) confidence += 0.4;
  else if (items.length >= 10) confidence += 0.3;
  else if (items.length >= 5) confidence += 0.2;
  else confidence += 0.1;

  // Data completeness factor (max 0.3)
  const completeItems = items.filter(
    (i) => i.color && i.category && (i.occasion?.length || 0) > 0
  );
  confidence += (completeItems.length / items.length) * 0.3;

  // Wear data factor (max 0.3)
  const wornItems = items.filter((i) => i.wear_count > 0);
  confidence += (wornItems.length / items.length) * 0.3;

  return Math.round(confidence * 100) / 100;
}

/**
 * Compare learned style with declared preferences
 */
function compareWithDeclared(
  dominantStyles: StyleDistribution[],
  colorAnalysis: ColorAnalysis,
  declaredStyle: string,
  declaredColorPalette: string | null
): { styleMatch: boolean; colorMatch: boolean; insight: string } {
  const primaryStyle = dominantStyles[0]?.style;
  const styleMatch = primaryStyle === declaredStyle;

  // Check if declared style is in top 3
  const styleInTop3 = dominantStyles
    .slice(0, 3)
    .some((s) => s.style === declaredStyle);

  // Simple color match (would need color palette mapping for full implementation)
  const colorMatch = true; // Simplified for now

  let insight = "";

  if (styleMatch) {
    insight = `Your wardrobe perfectly reflects your ${dominantStyles[0]?.label} style preference!`;
  } else if (styleInTop3) {
    const styleInfo = STYLE_PREFERENCES.find((s) => s.id === declaredStyle);
    insight = `Your declared ${
      styleInfo?.label || declaredStyle
    } style shows up in your wardrobe, but you lean more ${
      dominantStyles[0]?.label
    }.`;
  } else {
    const styleInfo = STYLE_PREFERENCES.find((s) => s.id === declaredStyle);
    insight = `Interesting! You said ${
      styleInfo?.label || declaredStyle
    }, but your wardrobe suggests you're more ${
      dominantStyles[0]?.label
    }. Maybe your style is evolving?`;
  }

  return { styleMatch, colorMatch, insight };
}

/**
 * Get empty analysis for empty wardrobe
 */
function getEmptyAnalysis(): StyleAnalysis {
  return {
    dominantStyles: [],
    primaryStyle: "casual",
    stylePersonality: "Start adding items to discover your style DNA!",
    colorAnalysis: {
      primary: [],
      accent: [],
      missing: ["Black", "White", "Navy"],
      temperature: "mixed",
      harmonyScore: 0,
      mood: "undefined",
    },
    versatilityScore: 0,
    gaps: [
      {
        type: "category",
        description: "Your wardrobe is empty",
        suggestion: "Start by adding your everyday essentials",
        priority: "high",
      },
    ],
    strengths: [],
    confidence: 0,
    declaredVsActual: null,
  };
}

// ============ UTILITY EXPORTS ============

/**
 * Get style match score for a new item against wardrobe
 */
export function getItemStyleMatch(
  item: Partial<WardrobeItem>,
  existingItems: WardrobeItem[]
): {
  matchesStyle: boolean;
  addsVariety: boolean;
  suggestion: string;
} {
  if (existingItems.length === 0) {
    return {
      matchesStyle: true,
      addsVariety: true,
      suggestion: "Great first piece for your wardrobe!",
    };
  }

  const analysis = analyzeWardrobeStyle(existingItems);
  const primaryStyle = analysis.primaryStyle;

  // Check if item matches primary style
  const itemStyles = Object.entries(STYLE_INDICATORS)
    .filter(([_, indicators]) => {
      let matches = 0;
      if (item.color && indicators.colors.includes(item.color)) matches++;
      if (item.category && indicators.categories.includes(item.category))
        matches++;
      return matches >= 1;
    })
    .map(([style]) => style);

  const matchesStyle = itemStyles.includes(primaryStyle);

  // Check if it adds variety
  const existingColors = existingItems.map((i) => i.color).filter(Boolean);
  const addsVariety = !existingColors.includes(item.color || "");

  // Generate suggestion
  let suggestion = "";
  if (matchesStyle && addsVariety) {
    suggestion = "Perfect! This matches your style and adds color variety.";
  } else if (matchesStyle) {
    suggestion = "This fits your established style nicely.";
  } else if (addsVariety) {
    suggestion =
      "This would add variety to your wardrobe and expand your style range.";
  } else {
    suggestion = "You have similar pieces. Consider if you need this.";
  }

  return { matchesStyle, addsVariety, suggestion };
}
