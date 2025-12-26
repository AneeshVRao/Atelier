import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wardrobeItems, styleProfile, occasion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' });
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const season = getSeason(today.getMonth());

    const systemPrompt = `You are a personal fashion stylist AI with expertise in current trends and timeless style. 
    
Today is ${dayOfWeek}, ${month} ${today.getDate()}, ${today.getFullYear()}.
Current season: ${season}

Your role is to create personalized outfit recommendations based on the user's wardrobe and style preferences.

Guidelines:
- Consider current fashion trends and seasonal appropriateness
- Mix and match pieces creatively from the user's actual wardrobe
- Provide styling tips and accessory suggestions
- Explain why the outfit works for them
- Be encouraging and fashion-forward

Response format (JSON):
{
  "outfitName": "Creative name for the look",
  "items": [
    {"name": "Item name", "category": "category", "stylingTip": "How to wear it"}
  ],
  "overallLook": "Description of the complete outfit",
  "trendNote": "Current trend this outfit incorporates",
  "occasionSuitability": "Why this works for the occasion",
  "stylingTips": ["tip1", "tip2", "tip3"],
  "alternativeSwaps": ["Alternative item suggestions if weather changes"]
}`;

    const userPrompt = `Create today's outfit recommendation based on:

Style Profile:
- Style Preference: ${styleProfile?.style_preference || 'Classic'}
- Color Palette: ${styleProfile?.color_palette || 'Neutrals'}
- Usual Occasions: ${styleProfile?.occasions?.join(', ') || 'Work, Casual'}

Today's Occasion: ${occasion || 'Everyday'}

My Wardrobe (${wardrobeItems?.length || 0} items):
${wardrobeItems?.map((item: any) => `- ${item.name} (${item.category}, ${item.color || 'neutral'})`).join('\n') || 'No items yet - suggest versatile starter pieces'}

Please create a stylish outfit for today that follows current ${season} trends and suits my personal style.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Please add credits to continue using AI features." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Try to parse JSON from the response
    let outfitData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outfitData = JSON.parse(jsonMatch[0]);
      } else {
        outfitData = { recommendation: content };
      }
    } catch {
      outfitData = { recommendation: content };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      outfit: outfitData,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outfit function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSeason(month: number): string {
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}
