import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Check,
  Trash2,
  ShoppingBag,
  DollarSign,
  Star,
  Search,
  X,
} from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { WARDROBE_CATEGORIES } from "@/lib/constants";
import {
  useShoppingList,
  useAddShoppingItem,
  useToggleShoppingItem,
  useDeleteShoppingItem,
} from "@/hooks/useDataQueries";
import { ShoppingSkeleton } from "@/components/skeletons/PageSkeletons";

interface ShoppingItem {
  id: string;
  item_name: string;
  category: string | null;
  priority: string | null;
  estimated_price: number | null;
  notes: string | null;
  is_purchased: boolean | null;
}

// Use shared constants
const categories = [...WARDROBE_CATEGORIES];
const priorities = [
  { value: "high", label: "High Priority", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-gold" },
  { value: "low", label: "Nice to Have", color: "bg-muted-foreground" },
];

const Shopping = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "purchased">(
    "pending"
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ShoppingItem | null>(null);

  const [newItem, setNewItem] = useState({
    item_name: "",
    category: "",
    priority: "medium",
    estimated_price: "",
    notes: "",
  });

  // Use TanStack Query
  const { data: items = [], isLoading } = useShoppingList();
  const addItemMutation = useAddShoppingItem();
  const toggleItemMutation = useToggleShoppingItem();
  const deleteItemMutation = useDeleteShoppingItem();

  // Filter and search items
  const filteredItems = useMemo(() => {
    return (items as ShoppingItem[]).filter((item) => {
      // Status filter
      const matchesStatus =
        filter === "all" ||
        (filter === "pending" && !item.is_purchased) ||
        (filter === "purchased" && item.is_purchased);

      // Search filter
      const matchesSearch =
        !searchQuery ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const addItem = async () => {
    if (!newItem.item_name) {
      toast.error("Please enter item name");
      return;
    }

    addItemMutation.mutate(
      {
        item_name: newItem.item_name,
        category: newItem.category || null,
        priority: newItem.priority,
        estimated_price: newItem.estimated_price
          ? parseFloat(newItem.estimated_price)
          : null,
        notes: newItem.notes || null,
      },
      {
        onSuccess: () => {
          setNewItem({
            item_name: "",
            category: "",
            priority: "medium",
            estimated_price: "",
            notes: "",
          });
          setIsAdding(false);
        },
      }
    );
  };

  const togglePurchased = (item: ShoppingItem) => {
    toggleItemMutation.mutate({ id: item.id, isPurchased: !item.is_purchased });
  };

  const handleDeleteClick = (item: ShoppingItem) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <ShoppingSkeleton />
      </div>
    );
  }

  const pendingItems = (items as ShoppingItem[]).filter((i) => !i.is_purchased);
  const purchasedItems = (items as ShoppingItem[]).filter(
    (i) => i.is_purchased
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-medium mb-2">Wishlist</h1>
            <p className="text-muted-foreground">Track your wardrobe dreams</p>
          </div>
          <Button variant="gold" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Pending Items
              </span>
            </div>
            <p className="font-display text-2xl font-medium">
              {pendingItems.length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Purchased</span>
            </div>
            <p className="font-display text-2xl font-medium">
              {purchasedItems.length}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Select
            value={filter}
            onValueChange={(v: "all" | "pending" | "purchased") => setFilter(v)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="all">All Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <div className="bg-card rounded-xl p-6 border border-border/50 mb-8 animate-fade-up">
            <h3 className="font-display text-xl font-medium mb-4">
              Add to Wishlist
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g., Camel Wool Coat"
                  value={newItem.item_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, item_name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(v) => setNewItem({ ...newItem, category: v })}
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
                <Label>Priority</Label>
                <Select
                  value={newItem.priority}
                  onValueChange={(v) => setNewItem({ ...newItem, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Price ($)</Label>
                <Input
                  type="number"
                  placeholder="150"
                  value={newItem.estimated_price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, estimated_price: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  placeholder="Color, size, where to buy..."
                  value={newItem.notes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="gold"
                onClick={addItem}
                disabled={addItemMutation.isPending}
              >
                {addItemMutation.isPending ? "Adding..." : "Add to List"}
              </Button>
              <Button variant="soft" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">
              {searchQuery
                ? "No items match your search"
                : filter === "purchased"
                ? "No purchases yet"
                : "Your wishlist is empty"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === "purchased"
                ? "Items you mark as purchased will appear here"
                : "Add items you're planning to buy"}
            </p>
            {filter !== "purchased" && (
              <Button variant="gold" onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const priority = priorities.find(
                (p) => p.value === item.priority
              );
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 group transition-all ${
                    item.is_purchased ? "opacity-60" : ""
                  }`}
                >
                  <button
                    onClick={() => togglePurchased(item)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.is_purchased
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-muted-foreground hover:border-gold"
                    }`}
                  >
                    {item.is_purchased && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-medium ${
                          item.is_purchased ? "line-through" : ""
                        }`}
                      >
                        {item.item_name}
                      </p>
                      {priority && (
                        <div
                          className={`w-2 h-2 rounded-full ${priority.color}`}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {item.category && <span>{item.category}</span>}
                      {item.estimated_price && (
                        <span>${item.estimated_price}</span>
                      )}
                      {item.notes && (
                        <span className="truncate">{item.notes}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                    aria-label={`Delete ${item.item_name}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Remove from Shopping List"
        itemName={itemToDelete?.item_name}
      />
    </div>
  );
};

export default Shopping;
