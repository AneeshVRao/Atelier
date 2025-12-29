import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useStyleBoards,
  useSaveStyleBoard,
  useDeleteStyleBoard,
  StyleBoard,
} from "@/hooks/useDataQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Plus, Trash2, Sparkles, X } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";

// Predefined color palettes for fashion
const MOOD_PALETTES = [
  {
    name: "Quiet Luxury",
    colors: ["#F5F5DC", "#D2B48C", "#8B7355", "#2F2F2F", "#FFFFF0"],
    vibe: "Understated elegance",
  },
  {
    name: "Coastal Grandmother",
    colors: ["#87CEEB", "#F5F5DC", "#FFFFFF", "#E6E6FA", "#DEB887"],
    vibe: "Breezy sophistication",
  },
  {
    name: "Old Money",
    colors: ["#2F4F4F", "#8B4513", "#F5F5DC", "#191970", "#D4AF37"],
    vibe: "Timeless heritage",
  },
  {
    name: "Modern Minimalist",
    colors: ["#000000", "#FFFFFF", "#808080", "#F5F5F5", "#C0C0C0"],
    vibe: "Clean & essential",
  },
  {
    name: "Romantic Soft",
    colors: ["#FFB6C1", "#FFDAB9", "#E6E6FA", "#F0FFF0", "#D4AF37"],
    vibe: "Feminine elegance",
  },
  {
    name: "Urban Edge",
    colors: ["#000000", "#2F2F2F", "#808080", "#8B0000", "#C0C0C0"],
    vibe: "Bold & confident",
  },
];

const STYLE_WORDS = [
  "Effortless",
  "Timeless",
  "Elegant",
  "Bold",
  "Feminine",
  "Classic",
  "Modern",
  "Chic",
  "Sophisticated",
  "Refined",
  "Luxe",
  "Minimal",
  "Romantic",
  "Edgy",
  "Polished",
];

const StyleBoards = () => {
  const { user, loading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [boardToDelete, setBoardToDelete] = useState<StyleBoard | null>(null);

  const { data: boards = [], isLoading } = useStyleBoards();
  const saveMutation = useSaveStyleBoard();
  const deleteMutation = useDeleteStyleBoard();

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

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;

    const palette =
      selectedPalette !== null ? MOOD_PALETTES[selectedPalette] : null;

    saveMutation.mutate(
      {
        name: newBoardName,
        description: palette?.vibe || null,
        color_scheme: palette?.colors || null,
        tags: selectedTags.length > 0 ? selectedTags : null,
        inspiration_urls: null,
      },
      {
        onSuccess: () => {
          setIsCreating(false);
          setNewBoardName("");
          setSelectedPalette(null);
          setSelectedTags([]);
        },
      }
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-medium mb-2">
              Style Boards
            </h1>
            <p className="text-muted-foreground">
              Curate your style vision with mood boards
            </p>
          </div>
          <Button variant="gold" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Board
          </Button>
        </div>

        {/* Create new board modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h2 className="font-display text-2xl font-medium">
                  Create Style Board
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-accent rounded-lg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Board Name
                  </label>
                  <Input
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Spring Capsule, Work Wardrobe..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Choose a Color Palette
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {MOOD_PALETTES.map((palette, index) => (
                      <button
                        key={palette.name}
                        onClick={() =>
                          setSelectedPalette(
                            selectedPalette === index ? null : index
                          )
                        }
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          selectedPalette === index
                            ? "border-gold bg-gold/10"
                            : "border-border/50 hover:border-border"
                        )}
                      >
                        <div className="flex gap-1 mb-2">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-border/30"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <p className="font-medium text-sm">{palette.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {palette.vibe}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Style Words
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_WORDS.map((word) => (
                      <button
                        key={word}
                        onClick={() => toggleTag(word)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm transition-all",
                          selectedTags.includes(word)
                            ? "bg-gold text-white"
                            : "bg-accent hover:bg-accent/80"
                        )}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/50 flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gold"
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim() || saveMutation.isPending}
                >
                  Create Board
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Boards grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-6 border border-border/50 animate-pulse"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="w-8 h-8 rounded-full bg-accent" />
                  ))}
                </div>
                <div className="h-5 bg-accent rounded w-2/3 mb-2" />
                <div className="h-4 bg-accent rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">
              No style boards yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create mood boards to visualize your style goals and color
              palettes
            </p>
            <Button variant="gold" onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Board
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-card rounded-xl p-6 border border-border/50 hover:shadow-card transition-shadow"
              >
                {/* Color swatches */}
                {board.color_scheme && board.color_scheme.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {board.color_scheme.map((color, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border border-border/30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}

                <h3 className="font-display text-lg font-medium mb-1">
                  {board.name}
                </h3>
                {board.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {board.description}
                  </p>
                )}

                {/* Tags */}
                {board.tags && board.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {board.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-accent px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {new Date(board.created_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBoardToDelete(board)}
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
        open={!!boardToDelete}
        onOpenChange={(open) => !open && setBoardToDelete(null)}
        onConfirm={() => {
          if (boardToDelete) {
            deleteMutation.mutate(boardToDelete.id);
            setBoardToDelete(null);
          }
        }}
        itemName={boardToDelete?.name || "this board"}
      />
    </div>
  );
};

export default StyleBoards;
