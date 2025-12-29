import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useSavedOutfits,
  useDeleteSavedOutfit,
  useToggleFavoriteOutfit,
  useWearOutfit,
  SavedOutfit,
  OutfitItem,
} from "@/hooks/useDataQueries";
import {
  Heart,
  Trash2,
  Shirt,
  Calendar,
  Star,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

const SavedOutfits = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [outfitToDelete, setOutfitToDelete] = useState<SavedOutfit | null>(
    null
  );

  const { data: outfits = [], isLoading } = useSavedOutfits();
  const deleteMutation = useDeleteSavedOutfit();
  const toggleFavoriteMutation = useToggleFavoriteOutfit();
  const wearMutation = useWearOutfit();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-gold animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredOutfits =
    filter === "favorites" ? outfits.filter((o) => o.is_favorite) : outfits;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-2">
              Saved Outfits
            </h1>
            <p className="text-muted-foreground">
              Your curated collection of favorite looks
            </p>
          </div>
          <Button variant="gold" onClick={() => navigate("/looks")}>
            <Sparkles className="w-4 h-4 mr-2" />
            Get New Outfit
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "soft"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({outfits.length})
          </Button>
          <Button
            variant={filter === "favorites" ? "default" : "soft"}
            size="sm"
            onClick={() => setFilter("favorites")}
          >
            <Star className="w-4 h-4 mr-1" />
            Favorites ({outfits.filter((o) => o.is_favorite).length})
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 border border-border/50 animate-pulse"
              >
                <div className="h-6 bg-accent rounded w-3/4 mb-3" />
                <div className="h-4 bg-accent rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-accent rounded w-full" />
                  <div className="h-3 bg-accent rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">
              {filter === "favorites"
                ? "No favorite outfits yet"
                : "No saved outfits yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {filter === "favorites"
                ? "Star your favorite outfits to see them here"
                : "Save outfits from the Today's Look page to build your collection"}
            </p>
            <Button variant="gold" onClick={() => navigate("/looks")}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate an Outfit
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredOutfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-card transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-medium mb-1">
                      {outfit.name}
                    </h3>
                    {outfit.occasion && (
                      <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full">
                        {outfit.occasion}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleFavoriteMutation.mutate({
                        id: outfit.id,
                        isFavorite: !outfit.is_favorite,
                      })
                    }
                    className="p-1.5 hover:bg-accent rounded-full transition-colors"
                    aria-label={
                      outfit.is_favorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Star
                      className={`w-5 h-5 ${
                        outfit.is_favorite
                          ? "text-gold fill-gold"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>

                {outfit.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {outfit.description}
                  </p>
                )}

                {outfit.items &&
                  Array.isArray(outfit.items) &&
                  outfit.items.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {outfit.items
                          .slice(0, 4)
                          .map((item: OutfitItem, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-accent/70 px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Shirt className="w-3 h-3" />
                              {item.name}
                            </span>
                          ))}
                        {outfit.items.length > 4 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{outfit.items.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {outfit.times_worn || 0}x worn
                    </span>
                    {outfit.last_worn && (
                      <span>
                        Last: {new Date(outfit.last_worn).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="soft"
                    size="sm"
                    className="flex-1"
                    onClick={() => wearMutation.mutate(outfit.id)}
                    disabled={wearMutation.isPending}
                  >
                    <Shirt className="w-4 h-4 mr-1" />
                    Wear Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOutfitToDelete(outfit)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!outfitToDelete}
        onOpenChange={(open) => !open && setOutfitToDelete(null)}
        onConfirm={() => {
          if (outfitToDelete) {
            deleteMutation.mutate(outfitToDelete.id);
            setOutfitToDelete(null);
          }
        }}
        itemName={outfitToDelete?.name || "this outfit"}
      />
    </div>
  );
};

export default SavedOutfits;
