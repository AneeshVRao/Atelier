import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  WashingMachine,
  Droplets,
  Shirt,
  Sparkles,
  History,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  useLaundryBasket,
  useLaundryHistory,
  useDoLaundry,
  useQuickResetWear,
  WardrobeItem,
  LaundryLog,
} from "@/hooks/useDataQueries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type WashType = "machine" | "hand" | "dry_clean" | "spot_clean";

const washTypeLabels: Record<WashType, string> = {
  machine: "Machine Wash",
  hand: "Hand Wash",
  dry_clean: "Dry Clean",
  spot_clean: "Spot Clean",
};

const Laundry = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [washType, setWashType] = useState<WashType>("machine");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("basket");

  const { data: dirtyItems = [], isLoading: basketLoading } =
    useLaundryBasket();
  const { data: laundryHistory = [], isLoading: historyLoading } =
    useLaundryHistory();
  const doLaundryMutation = useDoLaundry();
  const quickResetMutation = useQuickResetWear();

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, WardrobeItem[]> = {};
    dirtyItems.forEach((item) => {
      const category = item.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    return groups;
  }, [dirtyItems]);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleCategory = (category: string) => {
    const categoryItems = groupedItems[category] || [];
    const allSelected = categoryItems.every((item) =>
      selectedItems.has(item.id)
    );

    const newSelected = new Set(selectedItems);
    categoryItems.forEach((item) => {
      if (allSelected) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
    });
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    if (selectedItems.size === dirtyItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(dirtyItems.map((item) => item.id)));
    }
  };

  const handleDoLaundry = () => {
    if (selectedItems.size === 0) return;

    doLaundryMutation.mutate(
      {
        itemIds: Array.from(selectedItems),
        washType,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setSelectedItems(new Set());
          setNotes("");
        },
      }
    );
  };

  const handleQuickReset = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    quickResetMutation.mutate(itemId);
  };

  if (basketLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-28 pb-20 container mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <Droplets className="w-8 h-8 text-gold animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <WashingMachine className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-medium">Laundry</h1>
            <p className="text-muted-foreground">
              {dirtyItems.length} items need washing
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basket" className="gap-2">
              <Droplets className="w-4 h-4" />
              Basket ({dirtyItems.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basket">
            {dirtyItems.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-display text-xl font-medium mb-2">
                  All Clean!
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No items need washing right now. Wear some clothes and check
                  back later!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Actions bar */}
                <div className="bg-card rounded-xl p-4 border border-border/50 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      {selectedItems.size === dirtyItems.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.size} selected
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={washType}
                      onValueChange={(v) => setWashType(v as WashType)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="machine">Machine Wash</SelectItem>
                        <SelectItem value="hand">Hand Wash</SelectItem>
                        <SelectItem value="dry_clean">Dry Clean</SelectItem>
                        <SelectItem value="spot_clean">Spot Clean</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="gold"
                      onClick={handleDoLaundry}
                      disabled={
                        selectedItems.size === 0 || doLaundryMutation.isPending
                      }
                    >
                      {doLaundryMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      )}
                      Mark as Washed
                    </Button>
                  </div>
                </div>

                {/* Notes field */}
                {selectedItems.size > 0 && (
                  <div className="bg-card rounded-xl p-4 border border-border/50">
                    <Textarea
                      placeholder="Optional notes (e.g., 'Used cold water', 'Added fabric softener')"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                )}

                {/* Grouped items */}
                {Object.entries(groupedItems).map(([category, items]) => {
                  const allSelected = items.every((item) =>
                    selectedItems.has(item.id)
                  );
                  const someSelected = items.some((item) =>
                    selectedItems.has(item.id)
                  );

                  return (
                    <div
                      key={category}
                      className="bg-card rounded-xl border border-border/50 overflow-hidden"
                    >
                      {/* Category header */}
                      <div
                        className="p-4 bg-accent/30 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <Checkbox
                          checked={allSelected}
                          // @ts-ignore - indeterminate is valid but not in types
                          indeterminate={someSelected && !allSelected}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <h3 className="font-medium">{category}</h3>
                        <span className="text-sm text-muted-foreground">
                          ({items.length} items)
                        </span>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-border/30">
                        {items.map((item) => {
                          const wearsSince = item.wears_since_wash || 0;
                          const wearsMax = item.wears_before_wash || 1;
                          const overdue = wearsSince - wearsMax;

                          return (
                            <div
                              key={item.id}
                              className="p-4 flex items-center gap-4 hover:bg-accent/20 transition-colors cursor-pointer"
                              onClick={() => toggleItem(item.id)}
                            >
                              <Checkbox
                                checked={selectedItems.has(item.id)}
                                onClick={(e) => e.stopPropagation()}
                                onCheckedChange={() => toggleItem(item.id)}
                              />

                              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                <Shirt className="w-5 h-5 text-muted-foreground" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {item.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {item.color && `${item.color} • `}
                                  {item.brand || "No brand"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    overdue > 0
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {overdue > 0
                                    ? `${overdue} overdue`
                                    : `${wearsSince}/${wearsMax}`}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleQuickReset(item.id, e)}
                                  disabled={quickResetMutation.isPending}
                                  title="Mark as clean (spot cleaned)"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historyLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : laundryHistory.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-medium mb-2">
                  No Laundry History
                </h3>
                <p className="text-muted-foreground">
                  Your wash history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {laundryHistory.map((log: LaundryLog) => {
                  const itemCount = log.laundry_log_items?.length || 0;
                  const date = new Date(log.wash_date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  );

                  return (
                    <div
                      key={log.id}
                      className="bg-card rounded-xl p-4 border border-border/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <WashingMachine className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">{date}</span>
                        </div>
                        <span className="px-2 py-1 bg-accent rounded text-xs">
                          {washTypeLabels[log.wash_type as WashType] ||
                            log.wash_type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {itemCount} items washed
                      </p>
                      {/* Show item names */}
                      {log.laundry_log_items &&
                        log.laundry_log_items.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {log.laundry_log_items
                              .slice(0, 5)
                              .map((logItem, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-accent/50 rounded text-xs"
                                >
                                  {logItem.wardrobe_items?.name ||
                                    "Unknown item"}
                                </span>
                              ))}
                            {log.laundry_log_items.length > 5 && (
                              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                                +{log.laundry_log_items.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Laundry;
