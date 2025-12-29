import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  X,
  Palette,
  Sparkles,
  Heart,
  Share2,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodBoardItem {
  id: string;
  type: "color" | "text" | "inspiration";
  content: string;
  position?: { x: number; y: number };
}

interface OutfitMoodBoardProps {
  name?: string;
  items?: MoodBoardItem[];
  onSave?: (items: MoodBoardItem[]) => void;
  readOnly?: boolean;
  className?: string;
}

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

// Inspirational style words
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

export function OutfitMoodBoard({
  name = "My Style Vision",
  items: initialItems = [],
  onSave,
  readOnly = false,
  className,
}: OutfitMoodBoardProps) {
  const [items, setItems] = useState<MoodBoardItem[]>(initialItems);
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [customText, setCustomText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const addColorPalette = (paletteIndex: number) => {
    const palette = MOOD_PALETTES[paletteIndex];
    const newItem: MoodBoardItem = {
      id: `palette-${Date.now()}`,
      type: "color",
      content: JSON.stringify(palette),
    };
    setItems([...items, newItem]);
    setSelectedPalette(paletteIndex);
  };

  const addTextElement = (text: string) => {
    if (!text.trim()) return;
    const newItem: MoodBoardItem = {
      id: `text-${Date.now()}`,
      type: "text",
      content: text,
    };
    setItems([...items, newItem]);
    setCustomText("");
  };

  const addStyleWord = (word: string) => {
    const newItem: MoodBoardItem = {
      id: `word-${Date.now()}`,
      type: "text",
      content: word,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    onSave?.(items);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border border-border/50 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <Palette className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h3 className="font-display text-xl font-medium">{name}</h3>
              <p className="text-sm text-muted-foreground">
                Curate your style vision
              </p>
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="gold" size="sm" onClick={handleSave}>
                    Save Board
                  </Button>
                </>
              ) : (
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mood Board Content */}
      <div className="p-6">
        {/* Color Palettes */}
        {isEditing && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              Choose Your Color Story
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MOOD_PALETTES.map((palette, index) => (
                <button
                  key={palette.name}
                  onClick={() => addColorPalette(index)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-left hover:shadow-md",
                    selectedPalette === index
                      ? "border-gold bg-gold/5"
                      : "border-border/50 hover:border-gold/50"
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
        )}

        {/* Style Words */}
        {isEditing && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Style Words</h4>
            <div className="flex flex-wrap gap-2">
              {STYLE_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => addStyleWord(word)}
                  className="px-3 py-1 rounded-full text-sm bg-accent hover:bg-gold/20 hover:text-gold transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Text */}
        {isEditing && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Add Your Own</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Type your style inspiration..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && addTextElement(customText)
                }
              />
              <Button variant="soft" onClick={() => addTextElement(customText)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Board Display */}
        <div className="min-h-[200px] bg-gradient-to-br from-background to-accent/30 rounded-xl p-6 border border-border/30">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {isEditing
                  ? "Start building your mood board above"
                  : "No items yet. Click Edit to start curating."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Render color palettes */}
              {items
                .filter((item) => item.type === "color")
                .map((item) => {
                  const palette = JSON.parse(item.content);
                  return (
                    <div
                      key={item.id}
                      className="relative bg-card rounded-lg p-4 border border-border/50"
                    >
                      {!readOnly && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                          title="Remove palette"
                          aria-label={`Remove ${
                            JSON.parse(item.content).name
                          } palette`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <div className="flex gap-2 mb-2">
                        {palette.colors.map((color: string, i: number) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-lg border border-border/30 shadow-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="font-medium">{palette.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {palette.vibe}
                      </p>
                    </div>
                  );
                })}

              {/* Render text elements */}
              <div className="flex flex-wrap gap-2">
                {items
                  .filter((item) => item.type === "text")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative group px-4 py-2 bg-card rounded-full border border-border/50 font-medium"
                    >
                      {item.content}
                      {!readOnly && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove item"
                          aria-label={`Remove ${item.content}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {items.length > 0 && !isEditing && (
        <div className="px-6 pb-6 flex gap-3">
          <Button variant="soft" size="sm" className="flex-1">
            <Heart className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="soft" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      )}
    </div>
  );
}

// Mini preview component for dashboard
export function MoodBoardPreview({
  palette,
}: {
  palette?: (typeof MOOD_PALETTES)[0];
}) {
  const displayPalette = palette || MOOD_PALETTES[0];

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-1">
        {displayPalette.colors.slice(0, 4).map((color, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-background"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div>
        <p className="font-medium text-sm">{displayPalette.name}</p>
        <p className="text-xs text-muted-foreground">{displayPalette.vibe}</p>
      </div>
    </div>
  );
}

export { MOOD_PALETTES };
