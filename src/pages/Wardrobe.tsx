import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import {
  Plus,
  Trash2,
  Shirt,
  Search,
  Filter,
  X,
  BarChart3,
  Pencil,
  Droplets,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import {
  WARDROBE_CATEGORIES,
  ITEM_COLORS,
  OCCASIONS,
  SEASONS,
  PATTERNS,
  MATERIALS,
  FIT_TYPES,
  STYLE_TAGS,
} from "@/lib/constants";
import {
  useWardrobe,
  useAddWardrobeItem,
  useDeleteWardrobeItem,
  useUpdateWardrobeItem,
  WardrobeItem,
} from "@/hooks/useDataQueries";
import { WardrobeSkeleton } from "@/components/skeletons/PageSkeletons";
import { WardrobeInsights } from "@/components/WardrobeInsights";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Use shared constants
const categories = [...WARDROBE_CATEGORIES];
const colors = [...ITEM_COLORS];
const occasions = [...OCCASIONS];
const seasons = [...SEASONS];
const patterns = [...PATTERNS];
const materials = [...MATERIALS];
const fitTypes = [...FIT_TYPES];
const styleTags = [...STYLE_TAGS];

const Wardrobe = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterColor, setFilterColor] = useState<string>("all");
  const [filterWashStatus, setFilterWashStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WardrobeItem | null>(null);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
    occasion: [] as string[],
    season: [] as string[],
    // Style intelligence fields
    pattern: "Solid",
    secondary_color: "",
    material: "",
    fit: "",
    style_tags: [] as string[],
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
    occasion: [] as string[],
    season: [] as string[],
    wears_before_wash: 3,
    // Style intelligence fields
    pattern: "Solid",
    secondary_color: "",
    material: "",
    fit: "",
    style_tags: [] as string[],
  });

  // TanStack Query hooks
  const { data: items = [], isLoading } = useWardrobe();
  const addItemMutation = useAddWardrobeItem();
  const deleteItemMutation = useDeleteWardrobeItem();
  const updateItemMutation = useUpdateWardrobeItem();

  // Filtered items based on search and filters
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      const matchesColor = filterColor === "all" || item.color === filterColor;

      // Wash status filter
      const wearsSince = item.wears_since_wash || 0;
      const wearsMax = item.wears_before_wash || 3;
      const wearPercent = wearsMax > 0 ? (wearsSince / wearsMax) * 100 : 0;
      const needsWash = wearsSince >= wearsMax;
      const isAlmost = wearPercent >= 60 && !needsWash;

      let matchesWashStatus = true;
      if (filterWashStatus === "clean")
        matchesWashStatus = !needsWash && !isAlmost;
      else if (filterWashStatus === "almost") matchesWashStatus = isAlmost;
      else if (filterWashStatus === "dirty") matchesWashStatus = needsWash;

      return (
        matchesSearch && matchesCategory && matchesColor && matchesWashStatus
      );
    });

    // Sort items
    if (sortBy === "newest") {
      result = result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      result = result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "name") {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "most-worn") {
      result = result.sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0));
    } else if (sortBy === "least-worn") {
      result = result.sort((a, b) => (a.wear_count || 0) - (b.wear_count || 0));
    } else if (sortBy === "needs-wash") {
      result = result.sort((a, b) => {
        const aRatio = (a.wears_since_wash || 0) / (a.wears_before_wash || 3);
        const bRatio = (b.wears_since_wash || 0) / (b.wears_before_wash || 3);
        return bRatio - aRatio;
      });
    } else if (sortBy === "last-worn") {
      result = result.sort((a, b) => {
        if (!a.last_worn && !b.last_worn) return 0;
        if (!a.last_worn) return 1;
        if (!b.last_worn) return -1;
        return (
          new Date(b.last_worn).getTime() - new Date(a.last_worn).getTime()
        );
      });
    }

    return result;
  }, [
    items,
    searchQuery,
    filterCategory,
    filterColor,
    filterWashStatus,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterCategory("all");
    setFilterColor("all");
    setFilterWashStatus("all");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery ||
    filterCategory !== "all" ||
    filterColor !== "all" ||
    filterWashStatus !== "all" ||
    sortBy !== "newest";

  const addItem = async () => {
    if (!newItem.name || !newItem.category) {
      return;
    }

    addItemMutation.mutate(
      {
        name: newItem.name,
        category: newItem.category,
        color: newItem.color || null,
        brand: newItem.brand || null,
        occasion: newItem.occasion.length > 0 ? newItem.occasion : null,
        season: newItem.season.length > 0 ? newItem.season : null,
        // Style intelligence fields
        pattern: newItem.pattern || "Solid",
        secondary_color: newItem.secondary_color || null,
        material: newItem.material || null,
        fit: newItem.fit || null,
        style_tags: newItem.style_tags.length > 0 ? newItem.style_tags : null,
      },
      {
        onSuccess: () => {
          setNewItem({
            name: "",
            category: "",
            color: "",
            brand: "",
            occasion: [],
            season: [],
            pattern: "Solid",
            secondary_color: "",
            material: "",
            fit: "",
            style_tags: [],
          });
          setIsAdding(false);
        },
      }
    );
  };

  const handleDeleteClick = (item: WardrobeItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditClick = (item: WardrobeItem) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      color: item.color || "",
      brand: item.brand || "",
      occasion: item.occasion || [],
      season: item.season || [],
      wears_before_wash: item.wears_before_wash || 3,
      // Style intelligence fields
      pattern: item.pattern || "Solid",
      secondary_color: item.secondary_color || "",
      material: item.material || "",
      fit: item.fit || "",
      style_tags: item.style_tags || [],
    });
  };

  const saveEdit = () => {
    if (!editingItem || !editForm.name || !editForm.category) return;

    updateItemMutation.mutate(
      {
        id: editingItem.id,
        updates: {
          name: editForm.name,
          category: editForm.category,
          color: editForm.color || null,
          brand: editForm.brand || null,
          occasion: editForm.occasion.length > 0 ? editForm.occasion : null,
          season: editForm.season.length > 0 ? editForm.season : null,
          wears_before_wash: editForm.wears_before_wash,
          // Style intelligence fields
          pattern: editForm.pattern || "Solid",
          secondary_color: editForm.secondary_color || null,
          material: editForm.material || null,
          fit: editForm.fit || null,
          style_tags:
            editForm.style_tags.length > 0 ? editForm.style_tags : null,
        },
      },
      {
        onSuccess: () => {
          setEditingItem(null);
        },
      }
    );
  };

  const toggleArrayValue = (
    field: "occasion" | "season" | "style_tags",
    value: string
  ) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const toggleEditArrayValue = (
    field: "occasion" | "season" | "style_tags",
    value: string
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <WardrobeSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-medium mb-2">
              My Wardrobe
            </h1>
            <p className="text-muted-foreground">
              {filteredItems.length} of {items.length} items
            </p>
          </div>
          <Button variant="gold" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Tabs for Items and Insights */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Shirt className="w-4 h-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, category, color, or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={showFilters ? "gold" : "soft"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-gold" />
                  )}
                </Button>
              </div>

              {/* Expandable Filters */}
              {showFilters && (
                <div className="bg-card rounded-xl p-4 border border-border/50 animate-fade-up">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Category
                      </Label>
                      <Select
                        value={filterCategory}
                        onValueChange={setFilterCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Color
                      </Label>
                      <Select
                        value={filterColor}
                        onValueChange={setFilterColor}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Colors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Colors</SelectItem>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-1">
                        <Droplets className="w-3 h-3" />
                        Wash Status
                      </Label>
                      <Select
                        value={filterWashStatus}
                        onValueChange={setFilterWashStatus}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Items" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="clean">✓ Clean</SelectItem>
                          <SelectItem value="almost">⚠ Almost Dirty</SelectItem>
                          <SelectItem value="dirty">🧺 Needs Wash</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Sort By
                      </Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Newest First" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="name">Name A-Z</SelectItem>
                          <SelectItem value="most-worn">Most Worn</SelectItem>
                          <SelectItem value="least-worn">Least Worn</SelectItem>
                          <SelectItem value="needs-wash">
                            Needs Wash First
                          </SelectItem>
                          <SelectItem value="last-worn">
                            Recently Worn
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {hasActiveFilters && (
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {isAdding && (
              <div className="bg-card rounded-xl p-6 border border-border/50 mb-8 animate-fade-up">
                <h3 className="font-display text-xl font-medium mb-4">
                  Add New Item
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name *</Label>
                    <Input
                      placeholder="e.g., Silk Blouse"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Category *</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(v) =>
                        setNewItem({ ...newItem, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Select
                      value={newItem.color}
                      onValueChange={(v) =>
                        setNewItem({ ...newItem, color: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      placeholder="e.g., Zara"
                      value={newItem.brand}
                      onChange={(e) =>
                        setNewItem({ ...newItem, brand: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Occasions</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {occasions.map((occ) => (
                        <button
                          key={occ}
                          onClick={() => toggleArrayValue("occasion", occ)}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            newItem.occasion.includes(occ)
                              ? "bg-gold text-primary-foreground"
                              : "bg-accent text-muted-foreground"
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Seasons</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {seasons.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleArrayValue("season", s)}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            newItem.season.includes(s)
                              ? "bg-gold text-primary-foreground"
                              : "bg-accent text-muted-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Intelligence Fields */}
                  <div>
                    <Label>Pattern</Label>
                    <Select
                      value={newItem.pattern}
                      onValueChange={(v) =>
                        setNewItem({ ...newItem, pattern: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Material</Label>
                    <Select
                      value={newItem.material}
                      onValueChange={(v) =>
                        setNewItem({ ...newItem, material: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Secondary Color (for patterns)</Label>
                    <Select
                      value={newItem.secondary_color || "none"}
                      onValueChange={(v) =>
                        setNewItem({ ...newItem, secondary_color: v === "none" ? "" : v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fit</Label>
                    <Select
                      value={newItem.fit}
                      onValueChange={(v) => setNewItem({ ...newItem, fit: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fit" />
                      </SelectTrigger>
                      <SelectContent>
                        {fitTypes.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Style Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {styleTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleArrayValue("style_tags", tag)}
                          className={`px-3 py-1 rounded-full text-xs transition-all capitalize ${
                            newItem.style_tags.includes(tag)
                              ? "bg-gold text-primary-foreground"
                              : "bg-accent text-muted-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="gold"
                    onClick={addItem}
                    disabled={addItemMutation.isPending}
                  >
                    {addItemMutation.isPending
                      ? "Adding..."
                      : "Add to Wardrobe"}
                  </Button>
                  <Button variant="soft" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border/50">
                <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-medium mb-2">
                  Your wardrobe is empty
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start adding your favorite pieces to get personalized outfit
                  recommendations
                </p>
                <Button variant="gold" onClick={() => setIsAdding(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border/50">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-xl font-medium mb-2">
                  No items found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <Button variant="soft" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const wearsSince = item.wears_since_wash || 0;
                  const wearsMax = item.wears_before_wash || 1;
                  const wearPercent = (wearsSince / wearsMax) * 100;
                  const needsWash = wearsSince >= wearsMax;
                  const isWarning = wearPercent >= 60 && !needsWash;

                  return (
                    <div
                      key={item.id}
                      className="bg-card rounded-xl p-5 border border-border/50 group hover:shadow-card hover:border-gold/30 transition-all cursor-pointer relative"
                      onClick={() => handleEditClick(item)}
                    >
                      {/* Wear status badge */}
                      {wearsSince > 0 && (
                        <div
                          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                            needsWash
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : isWarning
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                          }`}
                          title={
                            needsWash
                              ? "Needs washing"
                              : `${wearsSince}/${wearsMax} wears`
                          }
                        >
                          <Droplets className="w-3 h-3" />
                          {wearsSince}/{wearsMax}
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                          <Shirt className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(item);
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-all"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(item);
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-all"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-medium mb-1">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.category}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.color && (
                          <span className="px-2 py-0.5 bg-accent rounded text-xs">
                            {item.color}
                          </span>
                        )}
                        {item.brand && (
                          <span className="px-2 py-0.5 bg-accent rounded text-xs">
                            {item.brand}
                          </span>
                        )}
                        {item.wear_count > 0 && (
                          <span className="px-2 py-0.5 bg-accent rounded text-xs">
                            {item.wear_count} wears
                          </span>
                        )}
                      </div>
                      {/* Wash Status & Last Worn */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {(() => {
                          const wearsSinceWash = item.wears_since_wash || 0;
                          const threshold = item.wears_before_wash || 3;
                          const remaining = threshold - wearsSinceWash;
                          if (remaining <= 0) {
                            return (
                              <span className="flex items-center gap-1 text-destructive font-medium">
                                <Droplets className="w-3 h-3" />
                                Needs wash
                              </span>
                            );
                          } else if (remaining === 1) {
                            return (
                              <span className="flex items-center gap-1 text-yellow-600">
                                <Droplets className="w-3 h-3" />1 wear left
                              </span>
                            );
                          }
                          return null;
                        })()}
                        {item.last_worn && (
                          <span className="flex items-center gap-1">
                            Last worn:{" "}
                            {new Date(item.last_worn).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <WardrobeInsights items={items} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Remove from Wardrobe"
        itemName={itemToDelete?.name}
      />

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border/50 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-display text-2xl font-medium">Edit Item</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 hover:bg-accent rounded-lg"
                aria-label="Close edit dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g., Blue Oxford Shirt"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Select
                  value={editForm.color}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  placeholder="e.g., Zara"
                  value={editForm.brand}
                  onChange={(e) =>
                    setEditForm({ ...editForm, brand: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Occasions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {occasions.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => toggleEditArrayValue("occasion", occ)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        editForm.occasion.includes(occ)
                          ? "bg-gold text-primary-foreground"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Seasons</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {seasons.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleEditArrayValue("season", s)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        editForm.season.includes(s)
                          ? "bg-gold text-primary-foreground"
                          : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Intelligence Fields */}
              <div className="pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-3">Style Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pattern</Label>
                    <Select
                      value={editForm.pattern}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, pattern: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        {patterns.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Material</Label>
                    <Select
                      value={editForm.material}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, material: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <Select
                      value={editForm.secondary_color}
                      value={editForm.secondary_color || "none"}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, secondary_color: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fit</Label>
                    <Select
                      value={editForm.fit}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, fit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fit" />
                      </SelectTrigger>
                      <SelectContent>
                        {fitTypes.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Style Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {styleTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleEditArrayValue("style_tags", tag)}
                        className={`px-3 py-1 rounded-full text-xs transition-all capitalize ${
                          editForm.style_tags.includes(tag)
                            ? "bg-gold text-primary-foreground"
                            : "bg-accent text-muted-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Laundry Settings */}
              <div className="pt-4 border-t border-border/50">
                <Label className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-500" />
                  Wears Before Wash
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  How many times can you wear this before it needs washing?
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={editForm.wears_before_wash}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        wears_before_wash: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-gold"
                    aria-label="Wears before wash"
                  />
                  <span className="w-12 text-center font-medium bg-accent px-2 py-1 rounded">
                    {editForm.wears_before_wash}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 wear</span>
                  <span>20 wears</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={saveEdit}
                disabled={
                  !editForm.name ||
                  !editForm.category ||
                  updateItemMutation.isPending
                }
              >
                {updateItemMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
