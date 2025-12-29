import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Build rich style intelligence context for AI prompts
function buildStyleIntelligenceContext(styleAnalysis: any): string {
  if (!styleAnalysis) {
    return `STYLE INTELLIGENCE: Not yet analyzed. Please suggest versatile, classic pieces.`;
  }

  const sections: string[] = [];

  // Primary style DNA
  sections.push(`STYLE DNA (Learned from Wardrobe):`);
  sections.push(
    `- Primary Style: ${styleAnalysis.primaryStyle || "Not determined"}`
  );

  // Style distribution
  if (styleAnalysis.styleDistribution) {
    const topStyles = Object.entries(
      styleAnalysis.styleDistribution as Record<string, number>
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([style, pct]) => `${style}: ${Math.round(pct as number)}%`)
      .join(", ");
    sections.push(`- Style Breakdown: ${topStyles}`);
  }

  // Color analysis
  if (styleAnalysis.colorAnalysis) {
    const colors = styleAnalysis.colorAnalysis;
    sections.push(
      `- Dominant Colors: ${
        colors.dominantColors?.join(", ") || "Not analyzed"
      }`
    );
    sections.push(
      `- Accent Colors: ${colors.accentColors?.join(", ") || "None detected"}`
    );
    sections.push(`- Color Temperature: ${colors.colorTemperature || "Mixed"}`);
    sections.push(
      `- Neutrals Ratio: ${Math.round((colors.neutralRatio || 0) * 100)}%`
    );
  }

  // Pattern preferences
  if (styleAnalysis.patternPreferences) {
    const topPatterns = Object.entries(
      styleAnalysis.patternPreferences as Record<string, number>
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .filter(([, count]) => (count as number) > 0)
      .map(([pattern, count]) => `${pattern} (${count})`)
      .join(", ");
    if (topPatterns) {
      sections.push(`- Preferred Patterns: ${topPatterns}`);
    }
  }

  // Material preferences
  if (styleAnalysis.materialPreferences) {
    const topMaterials = Object.entries(
      styleAnalysis.materialPreferences as Record<string, number>
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .filter(([, count]) => (count as number) > 0)
      .map(([material, count]) => `${material} (${count})`)
      .join(", ");
    if (topMaterials) {
      sections.push(`- Preferred Materials: ${topMaterials}`);
    }
  }

  // Fit preferences
  if (styleAnalysis.fitPreferences) {
    const topFits = Object.entries(
      styleAnalysis.fitPreferences as Record<string, number>
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .filter(([, count]) => (count as number) > 0)
      .map(([fit]) => fit)
      .join(", ");
    if (topFits) {
      sections.push(`- Preferred Fit: ${topFits}`);
    }
  }

  // Versatility and confidence
  sections.push(`\nSTYLE INSIGHTS:`);
  sections.push(
    `- Style Confidence: ${
      styleAnalysis.confidence || 0
    }% (based on wardrobe analysis)`
  );
  sections.push(
    `- Wardrobe Versatility: ${
      styleAnalysis.versatilityScore
        ? Math.round(styleAnalysis.versatilityScore * 100) + "%"
        : "Not calculated"
    }`
  );

  // Most worn items
  if (styleAnalysis.mostWornItems?.length > 0) {
    const topWorn = styleAnalysis.mostWornItems
      .slice(0, 3)
      .map((item: any) => `${item.name} (${item.wearCount}x)`)
      .join(", ");
    sections.push(`- Most Worn: ${topWorn}`);
  }

  // Wardrobe gaps
  if (styleAnalysis.gaps?.length > 0) {
    sections.push(
      `- Wardrobe Gaps: ${styleAnalysis.gaps.slice(0, 3).join(", ")}`
    );
  }

  // Declared vs Actual insight
  if (styleAnalysis.declaredVsActual) {
    const dva = styleAnalysis.declaredVsActual;
    if (!dva.isConsistent) {
      sections.push(
        `\nSTYLE INSIGHT: User's declared preference is "${
          dva.declaredStyle
        }" but their actual wardrobe is ${Math.round(
          dva.matchPercentage || 0
        )}% aligned with "${
          dva.actualPrimaryStyle || styleAnalysis.primaryStyle
        }". Suggest outfits that bridge both preferences.`
      );
    } else {
      sections.push(
        `\nSTYLE INSIGHT: User's wardrobe aligns well (${Math.round(
          dva.matchPercentage || 0
        )}%) with their declared "${dva.declaredStyle}" style.`
      );
    }
  }

  return sections.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      wardrobeItems,
      styleProfile,
      occasion,
      weather,
      styleAnalysis,
      preferClean,
    } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
    const month = today.toLocaleDateString("en-US", { month: "long" });
    const hour = today.getHours();
    const season = getSeason(today.getMonth());

    // Determine time of day
    const getTimeOfDay = (h: number, isDay?: boolean) => {
      // Use isDay from weather API if available (more accurate based on sunrise/sunset)
      if (isDay === false) return "evening/night";
      if (h >= 5 && h < 12) return "morning";
      if (h >= 12 && h < 17) return "afternoon";
      if (h >= 17 && h < 21) return "evening";
      return "night";
    };
    const timeOfDay = getTimeOfDay(hour, weather?.isDay);

    // Weather context
    const weatherContext = weather
      ? `Current Weather: ${weather.temperature}°F, ${weather.condition}. Time of day: ${timeOfDay}. Consider this when suggesting layers, fabrics, and appropriate attire for the time.`
      : `Time of day: ${timeOfDay}.`;

    // Build style intelligence context
    const styleIntelligence = buildStyleIntelligenceContext(styleAnalysis);

    // Filter items based on clean preference
    const availableItems = preferClean
      ? wardrobeItems?.filter(
          (item: any) =>
            (item.wears_since_wash || 0) < (item.wears_before_wash || 3)
        )
      : wardrobeItems;

    const systemPrompt = `You are a personal fashion stylist AI with expertise in current trends, color theory, and personal style. 
    
Today is ${dayOfWeek}, ${month} ${today.getDate()}, ${today.getFullYear()}.
Current season: ${season}
${weatherContext}

Your role is to create personalized outfit recommendations that align with the user's ACTUAL style DNA learned from their wardrobe, not just their declared preferences.

Guidelines:
- Consider current fashion trends and seasonal appropriateness
- Mix and match pieces creatively from the user's actual wardrobe
- Prioritize items that match their dominant style aesthetic
- Use color harmony principles (complementary, analogous colors)
- Explain WHY this outfit works for them based on their style DNA
- Reference specific style patterns you notice in their wardrobe
- Be encouraging and fashion-forward

Response format (JSON only, no markdown):
{
  "outfitName": "Creative name for the look",
  "items": [
    {"name": "Item name", "category": "category", "stylingTip": "How to wear it"}
  ],
  "overallLook": "Description of the complete outfit",
  "trendNote": "Current trend this outfit incorporates",
  "occasionSuitability": "Why this works for the occasion",
  "stylingTips": ["tip1", "tip2", "tip3"],
  "alternativeSwaps": ["Alternative item suggestions if weather changes"],
  "weatherNote": "Brief note about how this outfit suits today's weather",
  "whyThisWorks": {
    "styleMatch": "How this outfit aligns with your personal style DNA",
    "colorHarmony": "Why these colors work together",
    "bodyTypeConsideration": "How this flatters your body type"
  },
  "confidenceScore": 85,
  "confidenceReason": "Based on X items in your wardrobe that match this style"
}`;

    // Weather tip for user prompt
    const weatherTip = weather
      ? `\nToday's Weather: ${weather.temperature}°F and ${weather.condition} (${timeOfDay}). Please suggest an outfit appropriate for this weather and time of day.`
      : `\nTime of day: ${timeOfDay}. Please suggest an outfit appropriate for this time.`;

    const userPrompt = `Create today's outfit recommendation based on:

STYLE PROFILE (Declared Preferences):
- Gender: ${styleProfile?.gender || "Not specified"}
- Style Preference: ${styleProfile?.style_preference || "Classic"}
- Color Palette: ${styleProfile?.color_palette || "Neutrals"}
- Body Type: ${styleProfile?.body_type || "Not specified"}
- Height: ${styleProfile?.height || "Not specified"}
- Usual Occasions: ${styleProfile?.occasions?.join(", ") || "Work, Casual"}

${styleIntelligence}

Today's Occasion: ${occasion || "Everyday"}

My Wardrobe (${availableItems?.length || 0} available items${
      preferClean ? ", showing only clean items" : ""
    }):
${
  availableItems
    ?.map(
      (item: any) =>
        `- ${item.name} (${item.category}, ${item.color || "neutral"}${
          item.pattern && item.pattern !== "Solid" ? ", " + item.pattern : ""
        }${item.material ? ", " + item.material : ""}${
          item.fit ? ", " + item.fit + " fit" : ""
        }${item.wear_count ? ", worn " + item.wear_count + "x" : ""})${
          item.style_tags?.length ? " [" + item.style_tags.join(", ") + "]" : ""
        }`
    )
    .join("\n") || "No items yet - suggest versatile starter pieces"
}
${weatherTip}

Please create a stylish outfit for today that:
1. Is appropriate for someone who identifies as ${
      styleProfile?.gender || "any gender"
    }
2. Follows current ${season} trends
3. Aligns with my ACTUAL style DNA (${
      styleAnalysis?.primaryStyle || "not yet analyzed"
    })
4. Uses harmonious color combinations from my palette
5. Suits my body type: ${styleProfile?.body_type || "not specified"}
6. Works for the weather conditions

IMPORTANT: Include a detailed "whyThisWorks" section explaining:
- How this outfit matches my personal style DNA
- Why the colors harmonize well
- How it flatters my body type

Respond with JSON only, no markdown code blocks.`;

    // Call Gemini API directly
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded, please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content in Gemini response");
    }

    // Try to parse JSON from the response
    let outfitData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outfitData = JSON.parse(jsonMatch[0]);

        // Ensure we have the expected structure
        if (!outfitData.outfitName && !outfitData.items) {
          // Response might be wrapped incorrectly, try to extract
          outfitData = {
            outfitName: "Today's Look",
            items: [],
            overallLook: cleanContent.substring(0, 500),
            recommendation: cleanContent,
          };
        }
      } else {
        outfitData = {
          outfitName: "Today's Look",
          items: [],
          overallLook: cleanContent.substring(0, 500),
          recommendation: cleanContent,
        };
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      // Create a structured response even on parse failure
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      outfitData = {
        outfitName: "Today's Look",
        items: [],
        overallLook: cleanContent.substring(0, 500),
        recommendation: cleanContent,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        outfit: outfitData,
        generatedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-outfit function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}
