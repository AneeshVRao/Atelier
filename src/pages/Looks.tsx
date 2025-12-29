import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useWardrobe,
  useProfile,
  useDailyOutfit,
  useGenerateOutfit,
  useLocationWeather,
  useSaveOutfitToCollection,
  useWearGeneratedOutfit,
  OutfitRecommendation,
} from "@/hooks/useDataQueries";
import {
  Sparkles,
  RefreshCw,
  Calendar,
  TrendingUp,
  Shirt,
  Cloud,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  Wind,
  Heart,
  Check,
  Droplets,
} from "lucide-react";

const Looks = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isWorn, setIsWorn] = useState(false);
  const [preferClean, setPreferClean] = useState(true);

  // TanStack Query hooks
  const { data: wardrobeItems = [], isLoading: wardrobeLoading } =
    useWardrobe();
  const { data: profile } = useProfile();
  const { data: existingOutfit, isLoading: outfitLoading } = useDailyOutfit();
  const { data: weather } = useLocationWeather();
  const generateOutfitMutation = useGenerateOutfit();
  const saveOutfitMutation = useSaveOutfitToCollection();
  const wearOutfitMutation = useWearGeneratedOutfit();

  // Reset saved/worn state when outfit changes
  useEffect(() => {
    setIsSaved(false);
    setIsWorn(false);
  }, [existingOutfit?.id]);

  // Parse existing outfit if it exists - handles double-stringified JSON
  const todayOutfit: OutfitRecommendation | null = existingOutfit
    ? (() => {
        try {
          let parsed: Partial<OutfitRecommendation> & Record<string, unknown> =
            {};

          if (existingOutfit.recommendation) {
            let recStr = existingOutfit.recommendation;

            // First parse - might give us {recommendation: "..."} or the actual outfit
            if (typeof recStr === "string") {
              try {
                parsed = JSON.parse(recStr);

                // Check if we got a double-wrapped structure: {recommendation: "...json string..."}
                if (
                  parsed.recommendation &&
                  typeof parsed.recommendation === "string"
                ) {
                  try {
                    // Parse the inner JSON string
                    const innerParsed = JSON.parse(parsed.recommendation);
                    parsed = innerParsed;
                  } catch {
                    // Inner string is truncated/malformed, extract with regex
                    const innerStr = parsed.recommendation;
                    const nameMatch = innerStr.match(
                      /"outfitName":\s*"([^"]+)"/
                    );
                    const lookMatch = innerStr.match(
                      /"overallLook":\s*"([^"]+)"/
                    );
                    const trendMatch = innerStr.match(
                      /"trendNote":\s*"([^"]+)"/
                    );
                    const occasionMatch = innerStr.match(
                      /"occasionSuitability":\s*"([^"]+)"/
                    );
                    const weatherMatch = innerStr.match(
                      /"weatherNote":\s*"([^"]+)"/
                    );

                    // Extract items array with regex
                    const itemsMatch = innerStr.match(/"items":\s*(\[.*?\])/s);
                    let items = null;
                    if (itemsMatch) {
                      try {
                        items = JSON.parse(itemsMatch[1]);
                      } catch {
                        // Try to extract individual items
                        const itemMatches = innerStr.matchAll(
                          /\{\s*"name":\s*"([^"]+)"\s*,\s*"category":\s*"([^"]+)"(?:\s*,\s*"stylingTip":\s*"([^"]+)")?\s*\}/g
                        );
                        items = Array.from(itemMatches).map((m) => ({
                          name: m[1],
                          category: m[2],
                          stylingTip: m[3],
                        }));
                      }
                    }

                    parsed = {
                      outfitName: nameMatch?.[1] || "Today's Look",
                      overallLook: lookMatch?.[1],
                      trendNote: trendMatch?.[1],
                      occasionSuitability: occasionMatch?.[1],
                      weatherNote: weatherMatch?.[1],
                      items: items && items.length > 0 ? items : undefined,
                    };
                  }
                }

                // Handle {outfit: {...}} wrapper
                if (parsed?.outfit) {
                  parsed = parsed.outfit;
                }
              } catch {
                // First parse failed, use regex extraction
                const nameMatch = recStr.match(/"outfitName":\s*"([^"]+)"/);
                const lookMatch = recStr.match(/"overallLook":\s*"([^"]+)"/);
                const trendMatch = recStr.match(/"trendNote":\s*"([^"]+)"/);
                const occasionMatch = recStr.match(
                  /"occasionSuitability":\s*"([^"]+)"/
                );

                parsed = {
                  outfitName: nameMatch?.[1] || "Today's Look",
                  overallLook: lookMatch?.[1],
                  trendNote: trendMatch?.[1],
                  occasionSuitability: occasionMatch?.[1],
                };
              }
            } else {
              parsed = recStr;
            }
          }

          // Use the items column directly if available
          if (existingOutfit.items) {
            let items = existingOutfit.items;
            if (typeof items === "string") {
              try {
                items = JSON.parse(items);
              } catch {
                items = null;
              }
            }
            if (Array.isArray(items) && items.length > 0) {
              parsed.items = items;
            }
          }

          // Use trend_notes column if available
          if (existingOutfit.trend_notes && !parsed.trendNote) {
            parsed.trendNote = existingOutfit.trend_notes;
          }

          // Use weather_note column if available
          if (existingOutfit.weather_note && !parsed.weatherNote) {
            parsed.weatherNote = existingOutfit.weather_note;
          }

          return parsed as OutfitRecommendation;
        } catch (e) {
          console.error("Error parsing outfit:", e);
          return {
            outfitName: "Today's Look",
            items: existingOutfit.items || [],
            trendNote: existingOutfit.trend_notes || undefined,
            weatherNote: existingOutfit.weather_note || undefined,
          };
        }
      })()
    : generateOutfitMutation.data || null;

  const wardrobeCount = wardrobeItems.length;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Generate outfit with weather context
  const generateOutfit = () => {
    generateOutfitMutation.mutate({
      occasion: "Everyday",
      weather: weather
        ? {
            temperature: weather.temperature,
            condition: weather.condition,
            isDay: weather.isDay,
          }
        : undefined,
      preferClean,
    });
  };

  // Show generating state
  const isGenerating = generateOutfitMutation.isPending;
  const generatedOutfit = generateOutfitMutation.data;

  if (loading || wardrobeLoading || outfitLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-gold animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading your style...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-3">
            Today's Look
          </h1>
          <p className="text-muted-foreground">
            AI-curated outfit based on your wardrobe and current trends
          </p>
        </div>

        {wardrobeCount === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">
              Add items to get recommendations
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your wardrobe to receive personalized AI outfit
              suggestions
            </p>
            <Button variant="gold" onClick={() => navigate("/wardrobe")}>
              Go to Wardrobe
            </Button>
          </div>
        ) : isGenerating ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-gold animate-spin" />
            </div>
            <h3 className="font-display text-2xl font-medium mb-3">
              Creating your perfect look...
            </h3>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              Our AI stylist is analyzing your wardrobe, style preferences, and
              today's weather
            </p>
            <div className="flex items-center justify-center gap-1 text-gold text-sm">
              <span className="animate-bounce delay-0">●</span>
              <span className="animate-bounce delay-100">●</span>
              <span className="animate-bounce delay-200">●</span>
            </div>
          </div>
        ) : !todayOutfit ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
            <h3 className="font-display text-2xl font-medium mb-3">
              Ready for your daily look?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get a personalized outfit recommendation based on your{" "}
              {wardrobeCount} wardrobe items
            </p>

            {/* Prefer Clean Items Toggle */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="prefer-clean"
                  checked={preferClean}
                  onCheckedChange={setPreferClean}
                />
                <Label
                  htmlFor="prefer-clean"
                  className="text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Droplets className="w-4 h-4 text-sky-500" />
                  Only use clean items
                </Label>
              </div>
            </div>

            <Button
              variant="gold"
              size="xl"
              onClick={generateOutfit}
              disabled={generateOutfitMutation.isPending}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Today's Outfit
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-up">
            <div className="bg-card rounded-xl p-8 border border-border/50 shadow-card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-display text-2xl font-medium mb-2">
                    {todayOutfit.outfitName || "Today's Recommendation"}
                  </h2>
                  {todayOutfit.trendNote && (
                    <div className="flex items-center gap-2 text-gold">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{todayOutfit.trendNote}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={isWorn ? "default" : "gold"}
                    size="sm"
                    onClick={() => {
                      if (!isWorn && todayOutfit?.items) {
                        wearOutfitMutation.mutate(todayOutfit.items, {
                          onSuccess: () => setIsWorn(true),
                        });
                      }
                    }}
                    disabled={wearOutfitMutation.isPending || isWorn}
                    className={isWorn ? "bg-green-600 hover:bg-green-600" : ""}
                  >
                    {isWorn ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Worn Today
                      </>
                    ) : (
                      <>
                        <Shirt className="w-4 h-4 mr-2" />
                        Wear This
                      </>
                    )}
                  </Button>
                  <Button
                    variant={isSaved ? "default" : "soft"}
                    size="sm"
                    onClick={() => {
                      if (!isSaved && todayOutfit) {
                        saveOutfitMutation.mutate(
                          {
                            name: todayOutfit.outfitName || "Saved Outfit",
                            description: todayOutfit.overallLook,
                            items: todayOutfit.items,
                            occasion: todayOutfit.occasionSuitability,
                          },
                          {
                            onSuccess: () => setIsSaved(true),
                          }
                        );
                      }
                    }}
                    disabled={saveOutfitMutation.isPending || isSaved}
                    className={isSaved ? "bg-green-600 hover:bg-green-600" : ""}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={generateOutfit}
                    disabled={generateOutfitMutation.isPending}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        generateOutfitMutation.isPending ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {todayOutfit.overallLook && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {todayOutfit.overallLook}
                </p>
              )}

              {todayOutfit.items && todayOutfit.items.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium">Outfit Pieces</h3>
                  <div className="grid gap-3">
                    {todayOutfit.items.map((item, i) => {
                      // Find matching wardrobe item to check wash status
                      const wardrobeItem = wardrobeItems.find(
                        (wi) =>
                          wi.name.toLowerCase() === item.name.toLowerCase()
                      );
                      const needsWash =
                        wardrobeItem &&
                        (wardrobeItem.wears_since_wash || 0) >=
                          (wardrobeItem.wears_before_wash || 3);
                      const almostDirty =
                        wardrobeItem &&
                        !needsWash &&
                        (wardrobeItem.wears_before_wash || 3) -
                          (wardrobeItem.wears_since_wash || 0) ===
                          1;

                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-4 p-4 rounded-lg ${
                            needsWash
                              ? "bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30"
                              : "bg-accent/50"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              needsWash
                                ? "bg-red-100 dark:bg-red-900/50"
                                : "bg-background"
                            }`}
                          >
                            {needsWash ? (
                              <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <Shirt className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{item.name}</p>
                              {needsWash && (
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs font-medium">
                                  Needs wash
                                </span>
                              )}
                              {almostDirty && (
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                                  1 wear left
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.category}
                            </p>
                            {item.stylingTip && (
                              <p className="text-sm text-gold mt-1">
                                {item.stylingTip}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {todayOutfit.stylingTips &&
                todayOutfit.stylingTips.length > 0 && (
                  <div className="border-t border-border/50 pt-6">
                    <h3 className="font-medium mb-3">Styling Tips</h3>
                    <ul className="space-y-2">
                      {todayOutfit.stylingTips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Sparkles className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Occasion suitability */}
              {todayOutfit.occasionSuitability && (
                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-medium mb-2">Why This Works</h3>
                  <p className="text-sm text-muted-foreground">
                    {todayOutfit.occasionSuitability}
                  </p>
                </div>
              )}

              {/* Style Intelligence Insights */}
              {todayOutfit.whyThisWorks && (
                <div className="border-t border-border/50 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium">Style Match Insights</h3>
                    {todayOutfit.confidenceScore && (
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          todayOutfit.confidenceScore >= 80
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : todayOutfit.confidenceScore >= 60
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {todayOutfit.confidenceScore}% match
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {todayOutfit.whyThisWorks.styleMatch && (
                      <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            Your Style DNA
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {todayOutfit.whyThisWorks.styleMatch}
                          </p>
                        </div>
                      </div>
                    )}
                    {todayOutfit.whyThisWorks.colorHarmony && (
                      <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-pink-700 dark:text-pink-300">
                            Color Harmony
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {todayOutfit.whyThisWorks.colorHarmony}
                          </p>
                        </div>
                      </div>
                    )}
                    {todayOutfit.whyThisWorks.bodyTypeConsideration && (
                      <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Body Type
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {todayOutfit.whyThisWorks.bodyTypeConsideration}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {todayOutfit.confidenceReason && (
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      {todayOutfit.confidenceReason}
                    </p>
                  )}
                </div>
              )}

              {/* Weather note with dynamic icon and colors */}
              {weather &&
                (() => {
                  const hour = new Date().getHours();

                  // Define time periods with their icons and colors
                  const getTimePeriod = (h: number) => {
                    if (h >= 0 && h < 5)
                      return {
                        label: "midnight",
                        Icon: Moon,
                        bg: "bg-slate-800/20",
                        border: "border-slate-600/30",
                        text: "text-slate-400",
                        iconBg: "bg-slate-700/30",
                      };
                    if (h >= 5 && h < 8)
                      return {
                        label: "early morning",
                        Icon: Sunrise,
                        bg: "bg-orange-500/10",
                        border: "border-orange-400/20",
                        text: "text-orange-400",
                        iconBg: "bg-orange-500/20",
                      };
                    if (h >= 8 && h < 12)
                      return {
                        label: "morning",
                        Icon: Sun,
                        bg: "bg-amber-500/10",
                        border: "border-amber-400/20",
                        text: "text-amber-500",
                        iconBg: "bg-amber-500/20",
                      };
                    if (h >= 12 && h < 17)
                      return {
                        label: "afternoon",
                        Icon: Sun,
                        bg: "bg-gold/10",
                        border: "border-gold/20",
                        text: "text-gold",
                        iconBg: "bg-gold/20",
                      };
                    if (h >= 17 && h < 20)
                      return {
                        label: "evening",
                        Icon: Sunset,
                        bg: "bg-rose-500/10",
                        border: "border-rose-400/20",
                        text: "text-rose-400",
                        iconBg: "bg-rose-500/20",
                      };
                    return {
                      label: "night",
                      Icon: Moon,
                      bg: "bg-indigo-500/10",
                      border: "border-indigo-500/20",
                      text: "text-indigo-400",
                      iconBg: "bg-indigo-500/20",
                    };
                  };

                  const timePeriod = getTimePeriod(hour);
                  const TimeIcon = timePeriod.Icon;

                  // For weather condition icon (rain, snow, etc. override time icon)
                  const hasWeatherCondition = [
                    "rainy",
                    "snowy",
                    "windy",
                    "cloudy",
                  ].includes(weather.condition);
                  const WeatherConditionIcon = {
                    cloudy: Cloud,
                    rainy: CloudRain,
                    snowy: CloudSnow,
                    windy: Wind,
                  }[weather.condition];

                  const DisplayIcon = hasWeatherCondition
                    ? WeatherConditionIcon || TimeIcon
                    : TimeIcon;

                  return (
                    <div
                      className={`flex items-center gap-3 p-4 ${timePeriod.bg} rounded-lg border ${timePeriod.border} mt-4`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${timePeriod.iconBg}`}
                      >
                        <DisplayIcon className={`w-5 h-5 ${timePeriod.text}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${timePeriod.text}`}>
                          {weather.temperature}°F • {weather.condition} •{" "}
                          {timePeriod.label}
                        </p>
                        {/* Only show weatherNote if it's actual styling advice from AI, not raw temp data */}
                        {todayOutfit.weatherNote &&
                          !/^\d+°F/.test(todayOutfit.weatherNote) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {todayOutfit.weatherNote}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })()}

              {/* Fallback for text-only recommendation */}
              {todayOutfit.recommendation && !todayOutfit.items && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {typeof todayOutfit.recommendation === "string"
                      ? todayOutfit.recommendation
                      : "Outfit recommendation generated successfully!"}
                  </p>
                </div>
              )}
            </div>

            {todayOutfit.alternativeSwaps &&
              todayOutfit.alternativeSwaps.length > 0 && (
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h3 className="font-medium mb-3">Weather Alternatives</h3>
                  <div className="flex flex-wrap gap-2">
                    {todayOutfit.alternativeSwaps.map((swap, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-accent rounded-full text-sm"
                      >
                        {swap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Looks;
