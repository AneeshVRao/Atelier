import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, RefreshCw, Calendar, TrendingUp, Shirt, Heart, Save } from "lucide-react";

interface OutfitRecommendation {
  outfitName?: string;
  items?: Array<{ name: string; category: string; stylingTip: string }>;
  overallLook?: string;
  trendNote?: string;
  occasionSuitability?: string;
  stylingTips?: string[];
  alternativeSwaps?: string[];
  recommendation?: string;
}

interface DailyOutfit {
  id: string;
  outfit_date: string;
  recommendation: string;
  items: any;
  trend_notes: string | null;
}

const Looks = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [todayOutfit, setTodayOutfit] = useState<OutfitRecommendation | null>(null);
  const [generating, setGenerating] = useState(false);
  const [wardrobeCount, setWardrobeCount] = useState(0);
  const [styleProfile, setStyleProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch wardrobe count
    const { count } = await supabase
      .from("wardrobe_items")
      .select("*", { count: "exact", head: true });
    setWardrobeCount(count || 0);

    // Fetch profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setStyleProfile(profile);

    // Fetch today's outfit if exists
    const today = new Date().toISOString().split('T')[0];
    const { data: existingOutfit } = await supabase
      .from("daily_outfits")
      .select("*")
      .eq("user_id", user!.id)
      .eq("outfit_date", today)
      .maybeSingle();

    if (existingOutfit) {
      try {
        const parsed = JSON.parse(existingOutfit.recommendation);
        setTodayOutfit(parsed);
      } catch {
        setTodayOutfit({ recommendation: existingOutfit.recommendation });
      }
    }
  };

  const generateOutfit = async () => {
    setGenerating(true);

    try {
      // Fetch wardrobe items
      const { data: wardrobeItems } = await supabase
        .from("wardrobe_items")
        .select("*");

      const { data, error } = await supabase.functions.invoke("generate-outfit", {
        body: {
          wardrobeItems: wardrobeItems || [],
          styleProfile,
          occasion: "Everyday"
        }
      });

      if (error) throw error;

      if (data.outfit) {
        setTodayOutfit(data.outfit);
        
        // Save to daily outfits
        const today = new Date().toISOString().split('T')[0];
        await supabase.from("daily_outfits").upsert({
          user_id: user!.id,
          outfit_date: today,
          recommendation: JSON.stringify(data.outfit),
          items: data.outfit.items,
          trend_notes: data.outfit.trendNote
        }, { onConflict: "user_id,outfit_date" });

        toast.success("Your outfit for today is ready!");
      }
    } catch (error: any) {
      console.error("Error generating outfit:", error);
      if (error.message?.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (error.message?.includes("402")) {
        toast.error("Please add credits to continue using AI features.");
      } else {
        toast.error("Failed to generate outfit. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
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
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-3">Today's Look</h1>
          <p className="text-muted-foreground">AI-curated outfit based on your wardrobe and current trends</p>
        </div>

        {wardrobeCount === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">Add items to get recommendations</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your wardrobe to receive personalized AI outfit suggestions
            </p>
            <Button variant="gold" onClick={() => navigate("/wardrobe")}>
              Go to Wardrobe
            </Button>
          </div>
        ) : !todayOutfit ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
            <h3 className="font-display text-2xl font-medium mb-3">Ready for your daily look?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get a personalized outfit recommendation based on your {wardrobeCount} wardrobe items
            </p>
            <Button variant="gold" size="xl" onClick={generateOutfit} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating your look...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Today's Outfit
                </>
              )}
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
                <Button variant="soft" size="sm" onClick={generateOutfit} disabled={generating}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${generating ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {todayOutfit.overallLook && (
                <p className="text-muted-foreground mb-6 leading-relaxed">{todayOutfit.overallLook}</p>
              )}

              {todayOutfit.items && todayOutfit.items.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium">Outfit Pieces</h3>
                  <div className="grid gap-3">
                    {todayOutfit.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 bg-accent/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                          {item.stylingTip && (
                            <p className="text-sm text-gold mt-1">{item.stylingTip}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {todayOutfit.stylingTips && todayOutfit.stylingTips.length > 0 && (
                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-medium mb-3">Styling Tips</h3>
                  <ul className="space-y-2">
                    {todayOutfit.stylingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {todayOutfit.recommendation && !todayOutfit.items && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">{todayOutfit.recommendation}</p>
                </div>
              )}
            </div>

            {todayOutfit.alternativeSwaps && todayOutfit.alternativeSwaps.length > 0 && (
              <div className="bg-card rounded-xl p-6 border border-border/50">
                <h3 className="font-medium mb-3">Weather Alternatives</h3>
                <div className="flex flex-wrap gap-2">
                  {todayOutfit.alternativeSwaps.map((swap, i) => (
                    <span key={i} className="px-3 py-1.5 bg-accent rounded-full text-sm">
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
