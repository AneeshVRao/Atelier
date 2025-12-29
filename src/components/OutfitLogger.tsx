import { useState } from "react";
import {
  Check,
  Plus,
  Camera,
  X,
  Sparkles,
  Shirt,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { OCCASIONS } from "@/lib/constants";
import {
  useLogOutfit,
  OutfitLog,
  useWardrobe,
  useIncrementWear,
  WardrobeItem,
} from "@/hooks/useDataQueries";

interface OutfitLoggerProps {
  onLogOutfit?: (outfit: OutfitLog) => void;
  className?: string;
}

const QUICK_ITEMS = [
  "T-Shirt",
  "Blouse",
  "Sweater",
  "Jacket",
  "Coat",
  "Jeans",
  "Trousers",
  "Skirt",
  "Dress",
  "Sneakers",
  "Boots",
  "Heels",
  "Sandals",
  "Bag",
  "Jewelry",
  "Scarf",
  "Hat",
];

const MOOD_RATINGS = [
  { value: 1, emoji: "😞", label: "Not Great" },
  { value: 2, emoji: "😐", label: "Okay" },
  { value: 3, emoji: "🙂", label: "Good" },
  { value: 4, emoji: "😊", label: "Great" },
  { value: 5, emoji: "🤩", label: "Amazing!" },
];

export function OutfitLogger({ onLogOutfit, className }: OutfitLoggerProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedWardrobeIds, setSelectedWardrobeIds] = useState<string[]>([]);
  const [occasion, setOccasion] = useState<string>("");
  const [rating, setRating] = useState<number>(4);
  const [notes, setNotes] = useState("");
  const [customItem, setCustomItem] = useState("");
  const [itemSource, setItemSource] = useState<"quick" | "wardrobe">(
    "wardrobe"
  );

  // Use the real logging mutation and wardrobe
  const logOutfitMutation = useLogOutfit();
  const incrementWearMutation = useIncrementWear();
  const { data: wardrobeItems = [] } = useWardrobe();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleWardrobeItem = (itemId: string) => {
    setSelectedWardrobeIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((i) => i !== itemId)
        : [...prev, itemId]
    );
  };

  const addCustomItem = () => {
    if (customItem.trim() && !selectedItems.includes(customItem.trim())) {
      setSelectedItems((prev) => [...prev, customItem.trim()]);
      setCustomItem("");
    }
  };

  const handleSubmit = async () => {
    const allItems = [
      ...selectedItems,
      ...selectedWardrobeIds.map((id) => {
        const item = wardrobeItems.find((w) => w.id === id);
        return item?.name || "Unknown Item";
      }),
    ];

    if (allItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    const outfitLog: OutfitLog = {
      date: new Date().toISOString().split("T")[0],
      occasion: occasion || "Casual",
      items: allItems,
      rating,
      notes: notes || undefined,
    };

    logOutfitMutation.mutate(outfitLog, {
      onSuccess: async () => {
        // Increment wear count for wardrobe items
        if (selectedWardrobeIds.length > 0) {
          try {
            await incrementWearMutation.mutateAsync(selectedWardrobeIds);
            toast.success(
              `Updated wear count for ${selectedWardrobeIds.length} items`
            );
          } catch (error) {
            console.error("Failed to increment wear counts:", error);
            toast.error("Failed to update wear counts");
          }
        }
        onLogOutfit?.(outfitLog);
        resetForm();
        setOpen(false);
      },
    });
  };

  const resetForm = () => {
    setSelectedItems([]);
    setSelectedWardrobeIds([]);
    setOccasion("");
    setRating(4);
    setNotes("");
    setCustomItem("");
    setItemSource("wardrobe");
  };

  // Group wardrobe items by category
  const wardrobeByCategory = wardrobeItems.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, WardrobeItem[]>);

  const getWearStatus = (item: WardrobeItem) => {
    const wears = item.wears_since_wash || 0;
    const threshold = item.wears_before_wash || 3;
    if (wears >= threshold) return "needs-wash";
    if (wears >= threshold - 1) return "almost";
    return "clean";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="gold" size="lg" className={cn("group", className)}>
          <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Log Today's Outfit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            Log Your Outfit
          </DialogTitle>
          <DialogDescription>
            {today} — Track what you're wearing to build your style streak!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Selection with Tabs */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              What are you wearing? *
            </Label>
            <Tabs
              value={itemSource}
              onValueChange={(v) => setItemSource(v as "quick" | "wardrobe")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="wardrobe"
                  className="flex items-center gap-2"
                >
                  <Shirt className="w-4 h-4" />
                  My Wardrobe
                </TabsTrigger>
                <TabsTrigger value="quick" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Quick Add
                </TabsTrigger>
              </TabsList>

              <TabsContent value="wardrobe" className="space-y-3">
                {wardrobeItems.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shirt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No items in your wardrobe yet</p>
                    <p className="text-xs mt-1">
                      Add items in the Wardrobe section first
                    </p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                    {Object.entries(wardrobeByCategory).map(
                      ([category, items]) => (
                        <div key={category}>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {items.map((item) => {
                              const status = getWearStatus(item);
                              const isSelected = selectedWardrobeIds.includes(
                                item.id
                              );
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => toggleWardrobeItem(item.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-full text-sm transition-all border flex items-center gap-1.5",
                                    isSelected
                                      ? "bg-gold text-primary-foreground border-gold"
                                      : "bg-card border-border hover:border-gold/50",
                                    status === "needs-wash" &&
                                      !isSelected &&
                                      "border-red-500/50 bg-red-500/10"
                                  )}
                                  title={`${item.wears_since_wash || 0}/${
                                    item.wears_before_wash || 3
                                  } wears`}
                                >
                                  {item.name}
                                  {status === "needs-wash" && !isSelected && (
                                    <Droplets className="w-3 h-3 text-red-500" />
                                  )}
                                  {status === "almost" && !isSelected && (
                                    <Droplets className="w-3 h-3 text-amber-500" />
                                  )}
                                  {isSelected && <Check className="w-3 h-3" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quick" className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {QUICK_ITEMS.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleItem(item)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-all border",
                        selectedItems.includes(item)
                          ? "bg-gold text-primary-foreground border-gold"
                          : "bg-card border-border hover:border-gold/50"
                      )}
                    >
                      {item}
                      {selectedItems.includes(item) && (
                        <Check className="w-3 h-3 ml-1 inline" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Item Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom item..."
                    value={customItem}
                    onChange={(e) => setCustomItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomItem();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="soft" size="sm" onClick={addCustomItem}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Selected Items Display */}
            {(selectedItems.length > 0 || selectedWardrobeIds.length > 0) && (
              <div className="mt-3 p-3 bg-accent/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  Selected ({selectedItems.length + selectedWardrobeIds.length}
                  ):
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedWardrobeIds.map((id) => {
                    const item = wardrobeItems.find((w) => w.id === id);
                    if (!item) return null;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gold/20 border border-gold/30 rounded text-sm"
                      >
                        <Shirt className="w-3 h-3" />
                        {item.name}
                        <button
                          onClick={() => toggleWardrobeItem(id)}
                          className="hover:text-destructive"
                          title={`Remove ${item.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {selectedItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-sm"
                    >
                      {item}
                      <button
                        onClick={() => toggleItem(item)}
                        className="hover:text-destructive"
                        title={`Remove ${item}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Occasion */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent>
                {OCCASIONS.map((occ) => (
                  <SelectItem key={occ} value={occ}>
                    {occ}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* How do you feel? */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              How do you feel in this outfit?
            </Label>
            <div className="flex justify-between">
              {MOOD_RATINGS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setRating(mood.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                    rating === mood.value
                      ? "bg-gold/20 scale-110"
                      : "hover:bg-accent"
                  )}
                  title={mood.label}
                  aria-label={mood.label}
                >
                  <span className="text-2xl">{mood.emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Notes (optional)
            </Label>
            <Input
              placeholder="Any thoughts about this outfit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="soft"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="gold"
            className="flex-1"
            onClick={handleSubmit}
            disabled={
              (selectedItems.length === 0 &&
                selectedWardrobeIds.length === 0) ||
              logOutfitMutation.isPending
            }
          >
            {logOutfitMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Logging...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Log Outfit
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Mini version for quick access
export function OutfitLoggerQuick({
  onLogOutfit,
  className,
}: OutfitLoggerProps) {
  return <OutfitLogger onLogOutfit={onLogOutfit} className={className} />;
}
