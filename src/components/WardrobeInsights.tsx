import { useMemo } from "react";
import {
  Shirt,
  Palette,
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  Sparkles,
  ThermometerSun,
  ThermometerSnowflake,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WardrobeItem } from "@/hooks/useDataQueries";
import { useStyleProfile } from "@/hooks/useDataQueries";
import { STYLE_PREFERENCES } from "@/lib/constants";

interface WardrobeInsightsProps {
  items: WardrobeItem[];
  className?: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  Tops: "👕",
  Bottoms: "👖",
  Dresses: "👗",
  Outerwear: "🧥",
  Shoes: "👟",
  Accessories: "💍",
  Bags: "👜",
  Jewelry: "💎",
  Activewear: "🏃",
  Swimwear: "👙",
  Sleepwear: "😴",
};

// Color mood descriptions
const COLOR_MOODS: Record<string, { mood: string; tip: string }> = {
  Black: {
    mood: "Powerful & Elegant",
    tip: "A versatile foundation for any outfit",
  },
  White: { mood: "Fresh & Clean", tip: "Perfect for layering and summer" },
  Navy: { mood: "Classic & Trustworthy", tip: "A softer alternative to black" },
  Beige: { mood: "Warm & Approachable", tip: "Great for quiet luxury looks" },
  Gray: { mood: "Sophisticated & Neutral", tip: "Easy to mix and match" },
  Brown: { mood: "Earthy & Grounded", tip: "Trending for fall and winter" },
  Cream: { mood: "Soft & Luxurious", tip: "Elevates casual pieces instantly" },
  Pink: { mood: "Feminine & Playful", tip: "Add pops of color strategically" },
  Blue: { mood: "Calm & Dependable", tip: "Works for both casual and formal" },
  Green: { mood: "Natural & Balanced", tip: "Great for earth-toned palettes" },
  Red: { mood: "Bold & Confident", tip: "Use as a statement piece" },
  Burgundy: {
    mood: "Rich & Sophisticated",
    tip: "Perfect for fall and evening",
  },
};

export function WardrobeInsights({ items, className }: WardrobeInsightsProps) {
  // Use the style profile hook for deep analysis
  const { data: styleProfile, isLoading: styleLoading } = useStyleProfile();

  const insights = useMemo(() => {
    // Category distribution
    const categoryCount = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Color distribution
    const colorCount = items.reduce((acc, item) => {
      if (item.color) {
        acc[item.color] = (acc[item.color] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Season coverage
    const seasonCount = items.reduce((acc, item) => {
      item.season?.forEach((s) => {
        acc[s] = (acc[s] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Occasion coverage
    const occasionCount = items.reduce((acc, item) => {
      item.occasion?.forEach((o) => {
        acc[o] = (acc[o] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    // Find dominant color
    const dominantColor = Object.entries(colorCount).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Find gaps
    const gaps: string[] = [];
    const categories = Object.keys(categoryCount);

    if (!categories.includes("Outerwear")) gaps.push("Outerwear");
    if (!categories.includes("Accessories")) gaps.push("Accessories");
    if ((categoryCount["Tops"] || 0) < 5) gaps.push("Basic tops");

    // Neutrals check
    const neutralColors = ["Black", "White", "Navy", "Beige", "Gray", "Cream"];
    const hasNeutrals = neutralColors.some((c) => colorCount[c]);
    if (!hasNeutrals) gaps.push("Neutral basics");

    // Calculate versatility score (0-100)
    const categoryDiversity = Math.min(
      Object.keys(categoryCount).length / 8,
      1
    );
    const colorDiversity = Math.min(Object.keys(colorCount).length / 6, 1);
    const seasonCoverage = Object.keys(seasonCount).length / 4;
    const versatilityScore = Math.round(
      categoryDiversity * 40 + colorDiversity * 30 + seasonCoverage * 30
    );

    return {
      categoryCount,
      colorCount,
      seasonCount,
      occasionCount,
      dominantColor,
      gaps,
      versatilityScore,
      totalItems: items.length,
    };
  }, [items]);

  const topCategories = Object.entries(insights.categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topColors = Object.entries(insights.colorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Versatility Score */}
      <div className="bg-gradient-to-br from-gold/10 to-champagne/20 rounded-xl p-6 border border-gold/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-xl font-medium">Wardrobe Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on variety and versatility
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-medium text-gold">
              {insights.versatilityScore}
            </p>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
        </div>

        <div className="h-3 bg-background/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-champagne rounded-full transition-all duration-500"
            style={{ width: `${insights.versatilityScore}%` }}
          />
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          {insights.versatilityScore >= 80
            ? "🌟 Excellent! Your wardrobe is well-balanced and versatile."
            : insights.versatilityScore >= 60
            ? "👍 Good variety! Consider adding a few more essentials."
            : insights.versatilityScore >= 40
            ? "📈 Growing nicely! Focus on building capsule basics."
            : "🌱 Just getting started! Build your foundation pieces first."}
        </p>
      </div>

      {/* Style DNA Section */}
      {styleProfile && styleProfile.styleBreakdown.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="font-display text-lg font-medium">Your Style DNA</h3>
            {styleProfile.confidence >= 0.7 && (
              <span className="ml-auto text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                High confidence
              </span>
            )}
          </div>

          {/* Style Personality Description */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {styleProfile.analysis.stylePersonality}
          </p>

          {/* Style Breakdown Bars */}
          <div className="space-y-3 mb-5">
            {styleProfile.styleBreakdown.slice(0, 4).map((style, index) => {
              const styleInfo = STYLE_PREFERENCES.find(
                (s) => s.id === style.style
              );
              const colors = [
                "from-gold to-champagne",
                "from-blue-400 to-blue-600",
                "from-purple-400 to-purple-600",
                "from-pink-400 to-pink-600",
              ];
              return (
                <div key={style.style}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{style.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {style.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-500`}
                      style={{ width: `${style.percentage}%` }}
                    />
                  </div>
                  {index === 0 && styleInfo && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {styleInfo.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Declared vs Actual Comparison */}
          {styleProfile.comparisonInsight && (
            <div
              className={cn(
                "p-3 rounded-lg mb-4",
                styleProfile.styleMatchesDeclared
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
                  : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30"
              )}
            >
              <div className="flex items-start gap-2">
                {styleProfile.styleMatchesDeclared ? (
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{styleProfile.comparisonInsight}</p>
              </div>
            </div>
          )}

          {/* Color Temperature */}
          <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
            {styleProfile.colorPalette.temperature === "warm" ? (
              <ThermometerSun className="w-5 h-5 text-orange-500" />
            ) : styleProfile.colorPalette.temperature === "cool" ? (
              <ThermometerSnowflake className="w-5 h-5 text-blue-500" />
            ) : (
              <Palette className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <p className="text-sm font-medium capitalize">
                {styleProfile.colorPalette.temperature} Palette
              </p>
              <p className="text-xs text-muted-foreground">
                {styleProfile.colorPalette.temperature === "warm"
                  ? "Your colors lean warm with earthy, sun-kissed tones"
                  : styleProfile.colorPalette.temperature === "cool"
                  ? "Your colors lean cool with crisp, sophisticated tones"
                  : "Your palette balances both warm and cool tones"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Color Harmony Suggestions */}
      {styleProfile && styleProfile.colorSuggestions.recommended.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-display text-lg font-medium">
              Color Suggestions
            </h3>
          </div>

          <div className="space-y-2">
            {styleProfile.colorSuggestions.recommended
              .slice(0, 3)
              .map((suggestion) => (
                <div
                  key={suggestion.color}
                  className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg"
                >
                  <div
                    className="w-8 h-8 rounded-full border-2 border-background shadow-md flex-shrink-0"
                    style={{
                      backgroundColor:
                        suggestion.color.toLowerCase() === "black"
                          ? "#000"
                          : suggestion.color.toLowerCase() === "white"
                          ? "#fff"
                          : suggestion.color.toLowerCase() === "navy"
                          ? "#1a365d"
                          : suggestion.color.toLowerCase() === "beige"
                          ? "#d4b896"
                          : suggestion.color.toLowerCase() === "cream"
                          ? "#f5f5dc"
                          : suggestion.color.toLowerCase() === "camel"
                          ? "#c19a6b"
                          : suggestion.color.toLowerCase() === "burgundy"
                          ? "#800020"
                          : suggestion.color.toLowerCase() === "olive"
                          ? "#808000"
                          : suggestion.color.toLowerCase(),
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium">{suggestion.color}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.reason}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-display text-lg font-medium">Category Mix</h3>
        </div>

        <div className="space-y-3">
          {topCategories.map(([category, count]) => (
            <div key={category} className="flex items-center gap-3">
              <span className="text-xl">
                {CATEGORY_ICONS[category] || "👔"}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    {count} items
                  </span>
                </div>
                <div className="h-2 bg-accent rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full"
                    style={{
                      width: `${(count / insights.totalItems) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Palette */}
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-display text-lg font-medium">Your Colors</h3>
        </div>

        <div className="flex gap-2 mb-4">
          {topColors.map(([color]) => (
            <div
              key={color}
              className="w-10 h-10 rounded-full border-2 border-background shadow-md"
              style={{
                backgroundColor:
                  color.toLowerCase() === "black"
                    ? "#000"
                    : color.toLowerCase() === "white"
                    ? "#fff"
                    : color.toLowerCase() === "navy"
                    ? "#1a365d"
                    : color.toLowerCase() === "beige"
                    ? "#d4b896"
                    : color.toLowerCase(),
              }}
              title={color}
            />
          ))}
        </div>

        {insights.dominantColor && COLOR_MOODS[insights.dominantColor[0]] && (
          <div className="p-3 bg-accent/50 rounded-lg">
            <p className="font-medium text-sm">
              Dominant: {insights.dominantColor[0]}
            </p>
            <p className="text-sm text-muted-foreground">
              {COLOR_MOODS[insights.dominantColor[0]].mood} •{" "}
              {COLOR_MOODS[insights.dominantColor[0]].tip}
            </p>
          </div>
        )}
      </div>

      {/* Wardrobe Gaps */}
      {insights.gaps.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-display text-lg font-medium">
              Suggested Additions
            </h3>
          </div>

          <div className="space-y-2">
            {insights.gaps.map((gap) => (
              <div
                key={gap}
                className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <Shirt className="w-4 h-4 text-gold" />
                </div>
                <p className="text-sm">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Season Coverage */}
      <div className="bg-card rounded-xl p-6 border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-display text-lg font-medium">Season Coverage</h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["Spring", "Summer", "Fall", "Winter"].map((season) => {
            const count = insights.seasonCount[season] || 0;
            const hasItems = count > 0;
            return (
              <div
                key={season}
                className={cn(
                  "text-center p-3 rounded-lg border transition-colors",
                  hasItems
                    ? "bg-gold/10 border-gold/30"
                    : "bg-accent/50 border-border/30"
                )}
              >
                <p className="text-lg mb-1">
                  {season === "Spring"
                    ? "🌸"
                    : season === "Summer"
                    ? "☀️"
                    : season === "Fall"
                    ? "🍂"
                    : "❄️"}
                </p>
                <p className="text-xs font-medium">{season}</p>
                <p className="text-xs text-muted-foreground">{count} items</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
