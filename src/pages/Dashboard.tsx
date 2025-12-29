import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Shirt,
  Calendar,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Heart,
  Droplets,
} from "lucide-react";
import { getSeasonLabel } from "@/lib/constants";
import {
  useDashboardStats,
  useProfile,
  useStreak,
  useLaundryBasket,
} from "@/hooks/useDataQueries";
import { DashboardSkeleton } from "@/components/skeletons/PageSkeletons";
import { StyleStreakMini } from "@/components/StyleStreak";
import { WeatherOutfitCompact } from "@/components/WeatherOutfit";
import { OutfitLogger } from "@/components/OutfitLogger";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  // Use TanStack Query for data fetching
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const streak = useStreak();
  const { data: laundryItems = [], isLoading: laundryLoading } =
    useLaundryBasket();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Show skeleton while loading
  if (statsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <DashboardSkeleton />
      </div>
    );
  }

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const quickActions = [
    {
      icon: Sparkles,
      label: "Get Today's Look",
      to: "/looks",
      color: "bg-gold/20 text-gold",
    },
    {
      icon: Shirt,
      label: "Add to Wardrobe",
      to: "/wardrobe",
      color: "bg-accent",
    },
    {
      icon: Calendar,
      label: "Plan Outfit",
      to: "/calendar",
      color: "bg-accent",
    },
    {
      icon: ShoppingBag,
      label: "Shopping List",
      to: "/shopping",
      color: "bg-accent",
    },
  ];

  const trendingStyles = [
    {
      name: "Quiet Luxury",
      description: "Understated elegance with premium fabrics",
    },
    {
      name: "Coastal Grandmother",
      description: "Relaxed, breezy sophistication",
    },
    { name: "Old Money Aesthetic", description: "Timeless, refined classics" },
    {
      name: "Minimalist Capsule",
      description: "Curated essentials in neutral tones",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6">
        {/* Header with Outfit Logger CTA */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {formattedDate}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-2">
              {greeting},{" "}
              {profile?.full_name?.split(" ")[0] ||
                user?.email?.split("@")[0] ||
                "there"}
            </h1>
            <p className="text-muted-foreground">
              Your personal style companion awaits
            </p>
          </div>
          <OutfitLogger />
        </div>

        {/* Style Streak Widget */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <StyleStreakMini
            currentStreak={streak.currentStreak}
            lastOutfitDate={streak.lastOutfitDate}
          />
          <WeatherOutfitCompact onGetOutfitIdeas={() => navigate("/looks")} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Wardrobe Items",
              value: stats?.wardrobeCount ?? 0,
              icon: Shirt,
            },
            {
              label: "Saved Outfits",
              value: stats?.savedOutfits ?? 0,
              icon: Heart,
            },
            {
              label: "Wishlist",
              value: stats?.shoppingItems ?? 0,
              icon: ShoppingBag,
            },
            {
              label: "Planned Looks",
              value: stats?.plannedOutfits ?? 0,
              icon: Calendar,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-card transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <p className="font-display text-3xl font-medium">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Laundry Alert Widget */}
        {laundryItems && laundryItems.length > 0 && (
          <div
            onClick={() => navigate("/laundry")}
            className="mb-10 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 rounded-xl p-5 border border-red-200/50 dark:border-red-800/30 cursor-pointer hover:shadow-card transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-medium text-red-900 dark:text-red-100">
                    {laundryItems.length}{" "}
                    {laundryItems.length === 1 ? "item needs" : "items need"}{" "}
                    washing
                  </h3>
                  <p className="text-sm text-red-700/70 dark:text-red-300/70">
                    {laundryItems
                      .slice(0, 3)
                      .map((item) => item.name)
                      .join(", ")}
                    {laundryItems.length > 3 &&
                      ` and ${laundryItems.length - 3} more`}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="font-display text-2xl font-medium mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border/50 hover:border-gold/50 hover:shadow-card transition-all group text-left"
              >
                <div
                  className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{action.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Today's Style Tip */}
          <div className="bg-gradient-to-br from-gold/10 to-champagne/20 rounded-xl p-6 border border-gold/20">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-xl font-medium">
                  Today's Style Tip
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getSeasonLabel()} Trends
                </p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Layer textures for visual interest - try a chunky knit over a silk
              blouse. Earth tones and burgundy are dominating this season. Don't
              forget to accessorize with gold jewelry for that elevated touch.
            </p>
            <Button variant="gold" size="sm" onClick={() => navigate("/looks")}>
              Get Outfit Ideas
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Trending Styles */}
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <h3 className="font-display text-xl font-medium mb-4">
              Trending Now
            </h3>
            <div className="space-y-3">
              {trendingStyles.map((style) => (
                <div
                  key={style.name}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-gold" />
                  <div>
                    <p className="font-medium text-sm">{style.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA for empty wardrobe */}
        {(stats?.wardrobeCount ?? 0) === 0 && (
          <div className="mt-10 text-center py-12 bg-card rounded-xl border border-border/50">
            <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-2xl font-medium mb-2">
              Start Building Your Wardrobe
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your favorite pieces to get personalized AI outfit
              recommendations
            </p>
            <Button
              variant="gold"
              size="xl"
              onClick={() => navigate("/wardrobe")}
            >
              Add Your First Item
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
