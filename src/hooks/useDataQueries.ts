import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Import types from centralized types file
import type {
  WardrobeItem,
  ShoppingItem,
  CalendarEntry,
  Profile,
  LaundryLog,
  DashboardStats,
  OutfitRecommendation,
  OutfitItem,
  SavedOutfit,
  StyleProfile,
} from "@/types";
import { queryKeys } from "@/types";

// Re-export types for backward compatibility
export type {
  WardrobeItem,
  ShoppingItem,
  CalendarEntry,
  Profile,
  LaundryLog,
  DashboardStats,
  OutfitRecommendation,
  OutfitItem,
  SavedOutfit,
  StyleProfile,
};
export { queryKeys };

// ============ PROFILE HOOKS ============

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile(user?.id ?? ""),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get user's streak (from profile, with localStorage as fallback)
export function useStreak() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [streak, setStreak] = useState({
    currentStreak: 0,
    lastOutfitDate: null as string | null,
  });

  useEffect(() => {
    if (!user) return;

    // Prefer database values, fallback to localStorage
    const STREAK_KEY = `style_streak_${user.id}`;
    const LAST_DATE_KEY = `last_outfit_date_${user.id}`;

    const dbStreak = profile?.style_streak;
    const dbLastDate = profile?.last_outfit_date;

    const storedStreak = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10);
    const storedLastDate = localStorage.getItem(LAST_DATE_KEY);

    setStreak({
      currentStreak: dbStreak ?? storedStreak,
      lastOutfitDate: dbLastDate ?? storedLastDate,
    });
  }, [user, profile]);

  return streak;
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(user?.id ?? ""),
      });
      toast.success("Profile updated!");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error(error);
    },
  });
}

// ============ WARDROBE HOOKS ============

export function useWardrobe() {
  const { user } = useAuth();

  return useQuery<WardrobeItem[]>({
    queryKey: queryKeys.wardrobe(user?.id ?? ""),
    queryFn: async (): Promise<WardrobeItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as WardrobeItem[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddWardrobeItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      item: Omit<WardrobeItem, "id" | "user_id" | "created_at">
    ) => {
      if (!user) throw new Error("Not authenticated");

      // Get smart default for wears_before_wash based on category
      const wearsBeforeWash =
        item.wears_before_wash ??
        getCategoryWashDefault(item.category || "Other");

      const { error } = await supabase.from("wardrobe_items").insert({
        user_id: user.id,
        ...item,
        wears_before_wash: wearsBeforeWash,
        wear_count: item.wear_count ?? 0,
        wears_since_wash: item.wears_since_wash ?? 0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Item added to wardrobe!");
    },
    onError: (error) => {
      toast.error("Failed to add item");
      console.error(error);
    },
  });
}

export function useDeleteWardrobeItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("wardrobe_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Item removed from wardrobe");
    },
    onError: (error) => {
      toast.error("Failed to remove item");
      console.error(error);
    },
  });
}

export function useUpdateWardrobeItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<WardrobeItem, "id" | "user_id" | "created_at">>;
    }) => {
      const { error } = await supabase
        .from("wardrobe_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.wardrobe(user?.id ?? ""),
      });
      toast.success("Item updated");
    },
    onError: (error) => {
      toast.error("Failed to update item");
      console.error(error);
    },
  });
}

// ============ SHOPPING LIST HOOKS ============

export function useShoppingList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.shoppingList(user?.id ?? ""),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("shopping_list")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ShoppingItem[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      item: Omit<ShoppingItem, "id" | "user_id" | "created_at" | "is_purchased">
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("shopping_list").insert({
        user_id: user.id,
        is_purchased: false,
        ...item,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingList(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Item added to wishlist!");
    },
    onError: (error) => {
      toast.error("Failed to add item");
      console.error(error);
    },
  });
}

export function useToggleShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isPurchased,
    }: {
      id: string;
      isPurchased: boolean;
    }) => {
      const { error } = await supabase
        .from("shopping_list")
        .update({ is_purchased: isPurchased })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingList(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success(
        variables.isPurchased
          ? "Marked as purchased!"
          : "Moved back to wishlist"
      );
    },
    onError: (error) => {
      toast.error("Failed to update item");
      console.error(error);
    },
  });
}

export function useDeleteShoppingItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("shopping_list")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.shoppingList(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Item removed");
    },
    onError: (error) => {
      toast.error("Failed to remove item");
      console.error(error);
    },
  });
}

// ============ CALENDAR HOOKS ============

export function useCalendarEntries(date: Date) {
  const { user } = useAuth();
  const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

  return useQuery({
    queryKey: queryKeys.calendarEntries(user?.id ?? "", monthKey),
    queryFn: async () => {
      if (!user) return [];
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from("outfit_calendar")
        .select("*")
        .gte("planned_date", startOfMonth.toISOString().split("T")[0])
        .lte("planned_date", endOfMonth.toISOString().split("T")[0]);

      if (error) throw error;
      return (data || []) as CalendarEntry[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddCalendarEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: {
      planned_date: string;
      occasion?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("outfit_calendar").insert({
        user_id: user.id,
        ...entry,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Outfit planned!");
    },
    onError: (error) => {
      toast.error("Failed to plan outfit");
      console.error(error);
    },
  });
}

export function useToggleCalendarEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isCompleted,
    }: {
      id: string;
      isCompleted: boolean;
    }) => {
      const { error } = await supabase
        .from("outfit_calendar")
        .update({ is_completed: isCompleted })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: (error) => {
      toast.error("Failed to update");
      console.error(error);
    },
  });
}

export function useDeleteCalendarEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("outfit_calendar")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Entry removed");
    },
    onError: (error) => {
      toast.error("Failed to remove entry");
      console.error(error);
    },
  });
}

// ============ DASHBOARD STATS ============

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.stats(user?.id ?? ""),
    queryFn: async (): Promise<DashboardStats> => {
      if (!user)
        return {
          wardrobeCount: 0,
          savedOutfits: 0,
          shoppingItems: 0,
          plannedOutfits: 0,
        };

      const [wardrobe, outfits, shopping, calendar] = await Promise.all([
        supabase
          .from("wardrobe_items")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("saved_outfits")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("shopping_list")
          .select("*", { count: "exact", head: true })
          .eq("is_purchased", false),
        supabase
          .from("outfit_calendar")
          .select("*", { count: "exact", head: true })
          .gte("planned_date", new Date().toISOString().split("T")[0]),
      ]);

      return {
        wardrobeCount: wardrobe.count || 0,
        savedOutfits: outfits.count || 0,
        shoppingItems: shopping.count || 0,
        plannedOutfits: calendar.count || 0,
      };
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============ DAILY OUTFIT ============

export function useDailyOutfit(date?: string) {
  const { user } = useAuth();
  const today = date || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: queryKeys.dailyOutfit(user?.id ?? "", today),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("daily_outfits")
        .select("*")
        .eq("user_id", user.id)
        .eq("outfit_date", today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ OUTFIT GENERATION HOOKS ============

export function useGenerateOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      occasion = "Everyday",
      weather,
      preferClean = true,
    }: {
      occasion?: string;
      weather?: { temperature: number; condition: string; isDay?: boolean };
      preferClean?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Fetch wardrobe items
      const { data: rawWardrobeItems } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id);

      // Filter items based on cleanliness preference
      let wardrobeItems = rawWardrobeItems || [];
      if (preferClean && wardrobeItems.length > 0) {
        // Separate clean and dirty items
        const cleanItems = wardrobeItems.filter((item: WardrobeItem) => {
          const wears = item.wears_since_wash || 0;
          const threshold = item.wears_before_wash || 3;
          return wears < threshold;
        });

        // Use clean items if we have enough variety (at least 3 items)
        // Otherwise fall back to all items
        if (cleanItems.length >= 3) {
          wardrobeItems = cleanItems;
        }
      }

      // Fetch profile
      const { data: styleProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      // Analyze wardrobe style for AI context
      const styleAnalysis =
        wardrobeItems.length > 0
          ? analyzeWardrobeStyle(
              wardrobeItems as WardrobeItem[],
              styleProfile?.style_preference,
              styleProfile?.color_palette
            )
          : null;

      // Build style intelligence payload for AI
      const styleIntelligencePayload = styleAnalysis
        ? {
            primaryStyle: styleAnalysis.primaryStyle,
            styleDistribution: Object.fromEntries(
              styleAnalysis.dominantStyles.map((s) => [s.style, s.percentage])
            ),
            colorAnalysis: {
              dominantColors: styleAnalysis.colorAnalysis.primary,
              accentColors: styleAnalysis.colorAnalysis.accent,
              colorTemperature: styleAnalysis.colorAnalysis.temperature,
              neutralRatio: styleAnalysis.colorAnalysis.neutralRatio,
            },
            patternPreferences: styleAnalysis.patternBreakdown,
            materialPreferences: styleAnalysis.materialBreakdown,
            fitPreferences: styleAnalysis.fitBreakdown,
            confidence: styleAnalysis.confidence,
            versatilityScore: styleAnalysis.versatilityScore,
            mostWornItems: wardrobeItems
              .filter((i: WardrobeItem) => (i.wear_count || 0) > 0)
              .sort(
                (a: WardrobeItem, b: WardrobeItem) =>
                  (b.wear_count || 0) - (a.wear_count || 0)
              )
              .slice(0, 5)
              .map((i: WardrobeItem) => ({
                name: i.name,
                wearCount: i.wear_count,
              })),
            gaps: styleAnalysis.gaps,
            declaredVsActual: styleAnalysis.declaredVsActual
              ? {
                  declaredStyle: styleAnalysis.declaredVsActual.declaredStyle,
                  actualPrimaryStyle: styleAnalysis.primaryStyle,
                  isConsistent: styleAnalysis.declaredVsActual.styleMatch,
                  matchPercentage:
                    styleAnalysis.declaredVsActual.declaredStylePercent,
                }
              : null,
          }
        : null;

      // Call edge function
      const { data, error } = await supabase.functions.invoke(
        "generate-outfit",
        {
          body: {
            wardrobeItems: wardrobeItems || [],
            styleProfile,
            occasion,
            weather,
            preferClean,
            styleAnalysis: styleIntelligencePayload,
          },
        }
      );

      if (error) throw error;
      if (!data.outfit) throw new Error("No outfit generated");

      // Normalize the outfit data - handle both direct and nested structures
      let outfit = data.outfit;

      // If outfit has a recommendation string that's actually JSON, parse it
      if (
        outfit.recommendation &&
        typeof outfit.recommendation === "string" &&
        !outfit.items
      ) {
        try {
          const innerParsed = JSON.parse(outfit.recommendation);
          if (innerParsed.items) {
            outfit = innerParsed;
          }
        } catch {
          // Keep original outfit if inner parsing fails
        }
      }

      // Save to daily outfits
      const today = new Date().toISOString().split("T")[0];
      await supabase.from("daily_outfits").upsert(
        {
          user_id: user.id,
          outfit_date: today,
          recommendation: JSON.stringify(outfit),
          items: outfit.items || null,
          trend_notes: outfit.trendNote || null,
          weather_note: weather
            ? `${weather.temperature}°F, ${weather.condition}${
                weather.isDay === false ? " (evening)" : ""
              }`
            : null,
        },
        { onConflict: "user_id,outfit_date" }
      );

      return outfit as OutfitRecommendation;
    },
    onSuccess: (outfit) => {
      queryClient.invalidateQueries({ queryKey: ["dailyOutfit"] });
      toast.success("Your outfit for today is ready!");
    },
    onError: (error: Error) => {
      console.error("Error generating outfit:", error);
      const errorMessage = error?.message || error?.toString() || "";
      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        toast.error("AI is busy! Please wait 30 seconds and try again.");
      } else if (errorMessage.includes("402")) {
        toast.error("Please add credits to continue using AI features.");
      } else if (errorMessage.includes("GEMINI_API_KEY")) {
        toast.error("AI is not configured. Please contact support.");
      } else {
        toast.error("Failed to generate outfit. Please try again.");
      }
    },
  });
}

export function useSaveDailyOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfit: {
      recommendation: string;
      items?: OutfitItem[];
      weather_note?: string;
      trend_notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const today = new Date().toISOString().split("T")[0];

      // Upsert - update if exists, insert if not
      const { error } = await supabase.from("daily_outfits").upsert(
        {
          user_id: user.id,
          outfit_date: today,
          ...outfit,
        },
        { onConflict: "user_id,outfit_date" }
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyOutfit"] });
      toast.success("Outfit saved!");
    },
    onError: (error) => {
      toast.error("Failed to save outfit");
      console.error(error);
    },
  });
}

// ============ SAVED OUTFITS ============

export function useSavedOutfits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.savedOutfits(user?.id ?? ""),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as SavedOutfit[]) || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveOutfitToCollection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfit: {
      name: string;
      description?: string;
      items?: OutfitItem[];
      occasion?: string;
      season?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("saved_outfits")
        .insert({
          user_id: user.id,
          name: outfit.name,
          description: outfit.description || null,
          items: outfit.items || null,
          occasion: outfit.occasion || null,
          season: outfit.season || null,
          is_favorite: false,
          times_worn: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedOutfits(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Outfit saved to collection!");
    },
    onError: (error) => {
      toast.error("Failed to save outfit");
      console.error(error);
    },
  });
}

export function useToggleFavoriteOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isFavorite,
    }: {
      id: string;
      isFavorite: boolean;
    }) => {
      const { error } = await supabase
        .from("saved_outfits")
        .update({ is_favorite: isFavorite })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedOutfits(user?.id ?? ""),
      });
    },
  });
}

export function useDeleteSavedOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_outfits")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedOutfits(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });
      toast.success("Outfit deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete outfit");
      console.error(error);
    },
  });
}

export function useWearOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      // Get current outfit with items
      const { data: outfit, error: fetchError } = await supabase
        .from("saved_outfits")
        .select("times_worn, items")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update worn count and last worn date
      const { error } = await supabase
        .from("saved_outfits")
        .update({
          times_worn: (outfit.times_worn || 0) + 1,
          last_worn: new Date().toISOString().split("T")[0],
        })
        .eq("id", id);

      if (error) throw error;

      // Try to match outfit items to wardrobe items and increment wear
      if (
        outfit.items &&
        Array.isArray(outfit.items) &&
        outfit.items.length > 0
      ) {
        // Fetch user's wardrobe items
        const { data: wardrobeItems } = await supabase
          .from("wardrobe_items")
          .select("id, name, wear_count, wears_since_wash")
          .eq("user_id", user.id);

        if (wardrobeItems && wardrobeItems.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const matchedIds: string[] = [];

          // Try to match each outfit item to a wardrobe item
          for (const outfitItem of outfit.items) {
            // outfitItem might be a string (name) or an object with name property
            const itemName =
              typeof outfitItem === "string"
                ? outfitItem.toLowerCase()
                : (outfitItem?.name || outfitItem?.item || "").toLowerCase();

            if (!itemName) continue;

            // Find a matching wardrobe item (fuzzy match)
            const match = wardrobeItems.find((w) => {
              const wardrobeName = w.name.toLowerCase();
              // Check if names match or one contains the other
              return (
                wardrobeName === itemName ||
                wardrobeName.includes(itemName) ||
                itemName.includes(wardrobeName)
              );
            });

            if (match && !matchedIds.includes(match.id)) {
              matchedIds.push(match.id);
            }
          }

          // Increment wear counts for matched items
          for (const itemId of matchedIds) {
            const item = wardrobeItems.find((w) => w.id === itemId);
            if (item) {
              await supabase
                .from("wardrobe_items")
                .update({
                  wear_count: (item.wear_count || 0) + 1,
                  wears_since_wash: (item.wears_since_wash || 0) + 1,
                  last_worn: today,
                })
                .eq("id", itemId);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.savedOutfits(user?.id ?? ""),
      });
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
      toast.success("Marked as worn today! Wear counts updated.");
    },
  });
}

// Wear a generated outfit (from Looks page) - increments wear for matched wardrobe items
export function useWearGeneratedOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfitItems: OutfitItem[]) => {
      if (!user) throw new Error("Not authenticated");
      if (!outfitItems || outfitItems.length === 0) return;

      // Fetch user's wardrobe items
      const { data: wardrobeItems } = await supabase
        .from("wardrobe_items")
        .select("id, name, wear_count, wears_since_wash")
        .eq("user_id", user.id);

      if (!wardrobeItems || wardrobeItems.length === 0) return;

      const today = new Date().toISOString().split("T")[0];
      const matchedIds: string[] = [];

      // Try to match each outfit item to a wardrobe item
      for (const outfitItem of outfitItems) {
        // outfitItem might be a string (name) or an object with name/item property
        const itemName =
          typeof outfitItem === "string"
            ? outfitItem.toLowerCase()
            : (outfitItem?.name || outfitItem?.item || "").toLowerCase();

        if (!itemName) continue;

        // Find a matching wardrobe item (fuzzy match)
        const match = wardrobeItems.find((w) => {
          const wardrobeName = w.name.toLowerCase();
          // Check if names match or one contains the other
          return (
            wardrobeName === itemName ||
            wardrobeName.includes(itemName) ||
            itemName.includes(wardrobeName)
          );
        });

        if (match && !matchedIds.includes(match.id)) {
          matchedIds.push(match.id);
        }
      }

      // Increment wear counts for matched items
      for (const itemId of matchedIds) {
        const item = wardrobeItems.find((w) => w.id === itemId);
        if (item) {
          await supabase
            .from("wardrobe_items")
            .update({
              wear_count: (item.wear_count || 0) + 1,
              wears_since_wash: (item.wears_since_wash || 0) + 1,
              last_worn: today,
            })
            .eq("id", itemId);
        }
      }

      return {
        matchedCount: matchedIds.length,
        totalItems: outfitItems.length,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
      if (result && result.matchedCount > 0) {
        toast.success(`Worn! Updated ${result.matchedCount} wardrobe items.`);
      } else {
        toast.success("Marked as worn today!");
      }
    },
  });
}

// ============ OUTFIT LOGGING (User-logged outfits with streak) ============

export interface OutfitLog {
  date: string;
  occasion: string;
  items: string[];
  rating: number;
  notes?: string;
}

export function useLogOutfit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outfitLog: OutfitLog) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      // 1. Save the outfit log to daily_outfits
      const { error: outfitError } = await supabase
        .from("daily_outfits")
        .upsert(
          {
            user_id: user.id,
            outfit_date: outfitLog.date,
            recommendation: `User logged: ${outfitLog.items.join(", ")}`,
            items: outfitLog.items,
            trend_notes: outfitLog.notes || null,
            weather_note: `Mood: ${outfitLog.rating}/5 • ${outfitLog.occasion}`,
          },
          { onConflict: "user_id,outfit_date" }
        );

      if (outfitError) throw outfitError;

      // 2. Update streak in profile
      // First get current profile to calculate streak
      // Note: style_streak and last_outfit_date may not exist yet if migration hasn't run
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Type cast to handle optional columns that may not be in types yet
      const profileData = profile as {
        style_streak?: number;
        last_outfit_date?: string;
      } | null;

      // Use localStorage as fallback for streak tracking
      const STREAK_KEY = `style_streak_${user.id}`;
      const LAST_DATE_KEY = `last_outfit_date_${user.id}`;

      const storedStreak = parseInt(
        localStorage.getItem(STREAK_KEY) || "0",
        10
      );
      const storedLastDate = localStorage.getItem(LAST_DATE_KEY);

      // Prefer DB values if they exist, otherwise use localStorage
      const currentStreak = profileData?.style_streak ?? storedStreak;
      const lastDate = profileData?.last_outfit_date ?? storedLastDate;

      let newStreak = 1;

      if (lastDate) {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffDays = Math.floor(
          (todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
          // Same day - don't increment
          newStreak = currentStreak || 1;
        } else if (diffDays === 1) {
          // Consecutive day - increment streak
          newStreak = (currentStreak || 0) + 1;
        } else {
          // Streak broken - reset to 1
          newStreak = 1;
        }
      }

      // Always save to localStorage as backup
      localStorage.setItem(STREAK_KEY, newStreak.toString());
      localStorage.setItem(LAST_DATE_KEY, today);

      // Update profile with new streak in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          style_streak: newStreak,
          last_outfit_date: today,
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.warn("Failed to update streak in DB:", profileError);
      }

      return { streak: newStreak };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dailyOutfit"] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile(user?.id ?? ""),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stats(user?.id ?? ""),
      });

      if (data.streak > 1) {
        toast.success(`Outfit logged! 🔥 ${data.streak} day streak!`);
      } else {
        toast.success("Outfit logged! Start building your streak 🔥");
      }
    },
    onError: (error) => {
      toast.error("Failed to log outfit");
      console.error(error);
    },
  });
}

// ============ STYLE BOARDS ============

export interface StyleBoard {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color_scheme: string[] | null;
  tags: string[] | null;
  inspiration_urls: string[] | null;
  created_at: string;
}

export function useStyleBoards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.styleBoards(user?.id ?? ""),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("style_boards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as StyleBoard[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveStyleBoard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      board: Omit<StyleBoard, "id" | "user_id" | "created_at">
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("style_boards")
        .insert({
          user_id: user.id,
          ...board,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.styleBoards(user?.id ?? ""),
      });
      toast.success("Style board saved!");
    },
    onError: (error) => {
      toast.error("Failed to save style board");
      console.error(error);
    },
  });
}

export function useDeleteStyleBoard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boardId: string) => {
      const { error } = await supabase
        .from("style_boards")
        .delete()
        .eq("id", boardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.styleBoards(user?.id ?? ""),
      });
      toast.success("Style board deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete style board");
      console.error(error);
    },
  });
}

// ============ WEATHER API (Open-Meteo - Free, no API key needed) ============

export interface WeatherData {
  temperature: number; // Fahrenheit
  condition: "sunny" | "clear" | "cloudy" | "rainy" | "snowy" | "windy";
  humidity: number;
  description: string;
  windSpeed: number;
  location?: string;
  isDay: boolean;
}

// WMO Weather interpretation codes mapping
function getConditionFromCode(
  code: number,
  isDay: boolean
): WeatherData["condition"] {
  // https://open-meteo.com/en/docs - WMO Weather interpretation codes
  if (code === 0 || code === 1) return isDay ? "sunny" : "clear"; // Clear / Mainly clear
  if (code >= 2 && code <= 3) return "cloudy"; // Partly cloudy / Overcast
  if (code >= 45 && code <= 48) return "cloudy"; // Fog
  if (code >= 51 && code <= 67) return "rainy"; // Drizzle / Rain / Freezing rain
  if (code >= 71 && code <= 77) return "snowy"; // Snow
  if (code >= 80 && code <= 82) return "rainy"; // Rain showers
  if (code >= 85 && code <= 86) return "snowy"; // Snow showers
  if (code >= 95) return "rainy"; // Thunderstorm
  return "cloudy";
}

function getDescriptionFromCode(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "Clear skies" : "Clear night";
  if (code === 1) return isDay ? "Mainly clear" : "Clear night";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy conditions";
  if (code >= 51 && code <= 55) return "Light drizzle";
  if (code >= 56 && code <= 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rainy";
  if (code >= 66 && code <= 67) return "Freezing rain";
  if (code >= 71 && code <= 75) return "Snowing";
  if (code === 77) return "Snow grains";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95) return "Thunderstorm";
  return "Variable conditions";
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();
  const current = data.current;
  const isDay = current.is_day === 1;

  return {
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    condition: getConditionFromCode(current.weather_code, isDay),
    description: getDescriptionFromCode(current.weather_code, isDay),
    isDay,
  };
}

export function useWeather(latitude?: number, longitude?: number) {
  return useQuery({
    queryKey: queryKeys.weather(latitude ?? 0, longitude ?? 0),
    queryFn: () => fetchWeather(latitude!, longitude!),
    enabled: !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// Hook to get user's location and weather
export function useLocationWeather() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      setCoords({ lat: 40.7128, lon: -74.006 }); // NYC default
      return;
    }

    // Check permission state first if available
    const checkPermissionAndGetLocation = async () => {
      try {
        // Check if Permissions API is available
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
          setPermissionState(permission.state);

          // Listen for permission changes
          permission.onchange = () => {
            setPermissionState(permission.state);
            if (permission.state === "granted") {
              requestLocation();
            } else if (permission.state === "denied") {
              console.warn("Location permission denied, using default");
              setCoords({ lat: 40.7128, lon: -74.006 }); // NYC default
            }
          };

          // If already denied, use default immediately
          if (permission.state === "denied") {
            setCoords({ lat: 40.7128, lon: -74.006 }); // NYC default
            return;
          }
        }

        // Request location (will trigger prompt if needed)
        requestLocation();
      } catch (error) {
        // Permissions API not supported, fall back to direct request
        requestLocation();
      }
    };

    const requestLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          // Default to New York if location denied or times out
          console.warn("Location access denied, using default:", error.message);
          setCoords({ lat: 40.7128, lon: -74.006 }); // NYC default
        },
        {
          timeout: 30000, // 30 seconds - plenty of time to respond to permission prompt
          maximumAge: 600000, // 10 min cache
          enableHighAccuracy: false, // Faster response, city-level accuracy is fine for weather
        }
      );
    };

    checkPermissionAndGetLocation();
  }, []);

  const weatherQuery = useWeather(coords?.lat, coords?.lon);

  return {
    ...weatherQuery,
    coords,
    locationError,
    permissionState,
    isLocating: !coords && !locationError,
  };
}

// ============ LAUNDRY TRACKING HOOKS ============

// Get category-based default for wears before wash
export function getCategoryWashDefault(category: string): number {
  const cat = category.toLowerCase();
  if (["underwear", "socks", "intimates"].includes(cat)) return 1;
  if (
    ["t-shirts", "tank tops", "activewear", "sportswear", "gym"].includes(cat)
  )
    return 1;
  if (["shirts", "blouses", "polos", "tops"].includes(cat)) return 2;
  if (["dresses"].includes(cat)) return 2;
  if (["sweaters", "hoodies", "cardigans", "knitwear"].includes(cat)) return 4;
  if (["jeans", "pants", "trousers", "bottoms"].includes(cat)) return 6;
  if (["dress pants", "skirts", "shorts"].includes(cat)) return 4;
  if (["blazers", "sport coats", "suits"].includes(cat)) return 8;
  if (["jackets", "outerwear", "light jackets"].includes(cat)) return 10;
  if (["coats", "winter coats", "heavy outerwear"].includes(cat)) return 15;
  if (["accessories", "scarves", "hats", "belts"].includes(cat)) return 10;
  if (["shoes", "footwear", "sneakers", "boots"].includes(cat)) return 10;
  return 3; // Default
}

// Get items that need washing (wears_since_wash >= wears_before_wash)
export function useLaundryBasket() {
  const { user } = useAuth();

  return useQuery<WardrobeItem[]>({
    queryKey: queryKeys.laundryBasket(user?.id ?? ""),
    queryFn: async (): Promise<WardrobeItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id)
        .gte("wears_since_wash", 1) // Has been worn
        .order("wears_since_wash", { ascending: false });

      if (error) throw error;

      // Filter items that have met or exceeded their wash threshold
      return (data || []).filter(
        (item: WardrobeItem) =>
          (item.wears_since_wash || 0) >= (item.wears_before_wash || 3)
      ) as WardrobeItem[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

// Get laundry history
export function useLaundryHistory() {
  const { user } = useAuth();

  return useQuery<LaundryLog[]>({
    queryKey: queryKeys.laundryHistory(user?.id ?? ""),
    queryFn: async (): Promise<LaundryLog[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("laundry_logs")
        .select(
          `
          *,
          laundry_log_items (
            wardrobe_item_id,
            wardrobe_items (id, name, category, color)
          )
        `
        )
        .eq("user_id", user.id)
        .order("wash_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as LaundryLog[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

// Mark items as worn (increment wear counts)
export function useMarkItemsWorn() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      // Update each item's wear counts
      for (const itemId of itemIds) {
        const { error } = await supabase
          .from("wardrobe_items")
          .update({
            wear_count: supabase.rpc ? undefined : undefined, // Will use raw SQL
            wears_since_wash: supabase.rpc ? undefined : undefined,
            last_worn: today,
          })
          .eq("id", itemId);

        if (error) {
          // Fallback: fetch current values and increment
          const { data: item } = await supabase
            .from("wardrobe_items")
            .select("wear_count, wears_since_wash")
            .eq("id", itemId)
            .single();

          if (item) {
            await supabase
              .from("wardrobe_items")
              .update({
                wear_count: (item.wear_count || 0) + 1,
                wears_since_wash: (item.wears_since_wash || 0) + 1,
                last_worn: today,
              })
              .eq("id", itemId);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
    },
    onError: (error) => {
      console.error("Error marking items worn:", error);
      toast.error("Failed to update wear counts");
    },
  });
}

// Mark items as worn with proper increment
export function useIncrementWear() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemIds: string[]) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      for (const itemId of itemIds) {
        // Fetch current values
        const { data: item } = await supabase
          .from("wardrobe_items")
          .select("wear_count, wears_since_wash")
          .eq("id", itemId)
          .single();

        if (item) {
          await supabase
            .from("wardrobe_items")
            .update({
              wear_count: (item.wear_count || 0) + 1,
              wears_since_wash: (item.wears_since_wash || 0) + 1,
              last_worn: today,
            })
            .eq("id", itemId);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
    },
  });
}

// Do laundry - reset items and log wash
export function useDoLaundry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemIds,
      washType = "machine",
      notes,
    }: {
      itemIds: string[];
      washType?: "machine" | "hand" | "dry_clean" | "spot_clean";
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      // Create laundry log entry
      const { data: logEntry, error: logError } = await supabase
        .from("laundry_logs")
        .insert({
          user_id: user.id,
          wash_type: washType,
          notes,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Add items to laundry log
      const logItems = itemIds.map((itemId) => ({
        laundry_log_id: logEntry.id,
        wardrobe_item_id: itemId,
      }));

      const { error: itemsError } = await supabase
        .from("laundry_log_items")
        .insert(logItems);

      if (itemsError) throw itemsError;

      // Reset wears_since_wash for all items
      for (const itemId of itemIds) {
        await supabase
          .from("wardrobe_items")
          .update({
            wears_since_wash: 0,
            last_washed: today,
          })
          .eq("id", itemId);
      }

      return logEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
      queryClient.invalidateQueries({ queryKey: ["laundryHistory"] });
      toast.success("Laundry marked as done!");
    },
    onError: (error) => {
      console.error("Error logging laundry:", error);
      toast.error("Failed to log laundry");
    },
  });
}

// Quick reset - spot clean or partial reset
export function useQuickResetWear() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error("Not authenticated");

      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("wardrobe_items")
        .update({
          wears_since_wash: 0,
          last_washed: today,
        })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
      toast.success("Item marked as clean");
    },
    onError: (error) => {
      console.error("Error resetting wear:", error);
      toast.error("Failed to reset wear count");
    },
  });
}

// Update wear threshold for an item
export function useUpdateWearThreshold() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      threshold,
    }: {
      itemId: string;
      threshold: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("wardrobe_items")
        .update({ wears_before_wash: threshold })
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wardrobe"] });
      queryClient.invalidateQueries({ queryKey: ["laundryBasket"] });
      toast.success("Wash threshold updated");
    },
    onError: (error) => {
      console.error("Error updating threshold:", error);
      toast.error("Failed to update threshold");
    },
  });
}

// Get wardrobe stats for dashboard
export function useWardrobeStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wardrobeStats", user?.id ?? ""],
    queryFn: async () => {
      if (!user) return null;

      const { data: items, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      if (!items || items.length === 0) return null;

      const totalItems = items.length;
      const needsWashing = items.filter(
        (i: WardrobeItem) => i.wears_since_wash >= i.wears_before_wash
      ).length;

      const totalValue = items.reduce(
        (sum: number, i: WardrobeItem) => sum + (i.purchase_price || 0),
        0
      );

      const totalWears = items.reduce(
        (sum: number, i: WardrobeItem) => sum + (i.wear_count || 0),
        0
      );

      const avgCostPerWear =
        totalWears > 0 && totalValue > 0 ? totalValue / totalWears : null;

      // Most worn item
      const mostWorn = items.reduce(
        (max: WardrobeItem | null, item: WardrobeItem) => {
          if (!max || (item.wear_count || 0) > (max.wear_count || 0))
            return item;
          return max;
        },
        null
      );

      // Least worn (excluding never worn)
      const leastWorn = items
        .filter((i: WardrobeItem) => (i.wear_count || 0) > 0)
        .reduce((min: WardrobeItem | null, item: WardrobeItem) => {
          if (!min || (item.wear_count || 0) < (min.wear_count || 0))
            return item;
          return min;
        }, null);

      // Never worn
      const neverWorn = items.filter(
        (i: WardrobeItem) => !i.wear_count || i.wear_count === 0
      );

      // Neglected (not worn in 30+ days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const neglected = items.filter((i: WardrobeItem) => {
        if (!i.last_worn) return i.wear_count && i.wear_count > 0; // Worn before but no date
        return new Date(i.last_worn) < thirtyDaysAgo;
      });

      return {
        totalItems,
        needsWashing,
        totalValue,
        totalWears,
        avgCostPerWear,
        mostWorn,
        leastWorn,
        neverWorn: neverWorn.length,
        neglected: neglected.length,
        neglectedItems: neglected.slice(0, 5),
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ STYLE PROFILE HOOK ============

import {
  analyzeWardrobeStyle,
  StyleAnalysis,
  getItemStyleMatch,
} from "@/lib/styleAnalyzer";
import { getColorSuggestionsForWardrobe } from "@/lib/colorHarmony";

/**
 * Hook to get computed style profile from wardrobe
 * Analyzes wardrobe items to learn user's actual style preferences
 */
export function useStyleProfile(): {
  data: StyleProfile | null;
  isLoading: boolean;
} {
  const { data: items = [], isLoading: itemsLoading } = useWardrobe();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isLoading = itemsLoading || profileLoading;

  const styleProfile = useMemo((): StyleProfile | null => {
    if (items.length === 0) return null;

    // Run the main analysis
    const analysis = analyzeWardrobeStyle(
      items,
      profile?.style_preference,
      profile?.color_palette
    );

    // Get color suggestions
    const existingColors = items
      .map((i) => i.color)
      .filter(Boolean) as string[];
    const colorSuggestions = getColorSuggestionsForWardrobe(existingColors);

    return {
      analysis,

      // Quick access
      primaryStyle: analysis.primaryStyle,
      styleBreakdown: analysis.dominantStyles.map((s) => ({
        style: s.style,
        label: s.label,
        percentage: s.percentage,
      })),
      colorPalette: {
        primary: analysis.colorAnalysis.primary,
        accent: analysis.colorAnalysis.accent,
        temperature: analysis.colorAnalysis.temperature,
      },

      // Declared preferences
      declaredStyle: profile?.style_preference || null,
      declaredColorPalette: profile?.color_palette || null,
      styleMatchesDeclared: analysis.declaredVsActual?.styleMatch ?? false,
      comparisonInsight: analysis.declaredVsActual?.insight || null,

      // Suggestions
      colorSuggestions,

      // Scores
      versatilityScore: analysis.versatilityScore,
      harmonyScore: analysis.colorAnalysis.harmonyScore,
      confidence: analysis.confidence,

      // Utility
      checkItemMatch: (item: Partial<WardrobeItem>) =>
        getItemStyleMatch(item, items),
    };
  }, [items, profile?.style_preference, profile?.color_palette]);

  return { data: styleProfile, isLoading };
}
