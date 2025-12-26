import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Check, Trash2, ShoppingBag, DollarSign, Star } from "lucide-react";

interface ShoppingItem {
  id: string;
  item_name: string;
  category: string | null;
  priority: string | null;
  estimated_price: number | null;
  notes: string | null;
  is_purchased: boolean;
}

const categories = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Jewelry"];
const priorities = [
  { value: "high", label: "High Priority", color: "bg-red-500" },
  { value: "medium", label: "Medium", color: "bg-gold" },
  { value: "low", label: "Nice to Have", color: "bg-muted-foreground" },
];

const Shopping = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "purchased">("pending");
  const [newItem, setNewItem] = useState({
    item_name: "",
    category: "",
    priority: "medium",
    estimated_price: "",
    notes: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("shopping_list")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  };

  const addItem = async () => {
    if (!newItem.item_name) {
      toast.error("Please enter item name");
      return;
    }

    const { error } = await supabase.from("shopping_list").insert({
      user_id: user!.id,
      item_name: newItem.item_name,
      category: newItem.category || null,
      priority: newItem.priority,
      estimated_price: newItem.estimated_price ? parseFloat(newItem.estimated_price) : null,
      notes: newItem.notes || null
    });

    if (error) {
      toast.error("Failed to add item");
    } else {
      toast.success("Added to shopping list!");
      setNewItem({ item_name: "", category: "", priority: "medium", estimated_price: "", notes: "" });
      setIsAdding(false);
      fetchItems();
    }
  };

  const togglePurchased = async (item: ShoppingItem) => {
    const { error } = await supabase
      .from("shopping_list")
      .update({ is_purchased: !item.is_purchased })
      .eq("id", item.id);

    if (!error) {
      fetchItems();
      if (!item.is_purchased) {
        toast.success("Marked as purchased! 🎉");
      }
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("shopping_list").delete().eq("id", id);
    if (!error) {
      toast.success("Item removed");
      setItems(items.filter(i => i.id !== id));
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  }

  const filteredItems = items.filter(item => {
    if (filter === "pending") return !item.is_purchased;
    if (filter === "purchased") return item.is_purchased;
    return true;
  });

  const totalEstimated = items
    .filter(i => !i.is_purchased && i.estimated_price)
    .reduce((sum, i) => sum + (i.estimated_price || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-medium mb-2">Shopping List</h1>
            <p className="text-muted-foreground">Track your wardrobe wishlist</p>
          </div>
          <Button variant="gold" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pending Items</span>
            </div>
            <p className="font-display text-2xl font-medium">
              {items.filter(i => !i.is_purchased).length}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Estimated Total</span>
            </div>
            <p className="font-display text-2xl font-medium">
              ${totalEstimated.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Add Item Form */}
        {isAdding && (
          <div className="bg-card rounded-xl p-6 border border-border/50 mb-8 animate-fade-up">
            <h3 className="font-display text-xl font-medium mb-4">Add to Wishlist</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g., Camel Wool Coat"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={newItem.priority} onValueChange={(v) => setNewItem({ ...newItem, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
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
                  onChange={(e) => setNewItem({ ...newItem, estimated_price: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Color, size, where to buy..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="gold" onClick={addItem}>Add to List</Button>
              <Button variant="soft" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["pending", "purchased", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                filter === f ? "bg-gold text-primary-foreground" : "bg-accent text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border/50">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">
              {filter === "purchased" ? "No purchases yet" : "Your wishlist is empty"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filter === "purchased" 
                ? "Items you mark as purchased will appear here"
                : "Add items you're planning to buy"
              }
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
              const priority = priorities.find(p => p.value === item.priority);
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
                      item.is_purchased ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground hover:border-gold"
                    }`}
                  >
                    {item.is_purchased && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${item.is_purchased ? "line-through" : ""}`}>
                        {item.item_name}
                      </p>
                      {priority && (
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {item.category && <span>{item.category}</span>}
                      {item.estimated_price && <span>${item.estimated_price}</span>}
                      {item.notes && <span className="truncate">{item.notes}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shopping;
