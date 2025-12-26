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
import { Plus, Trash2, Shirt } from "lucide-react";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  brand: string | null;
  occasion: string[] | null;
  season: string[] | null;
}

const categories = [
  "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories", "Jewelry"
];

const colors = [
  "Black", "White", "Navy", "Beige", "Brown", "Gray", "Cream", "Pink", "Red", "Blue", "Green"
];

const occasions = ["Work", "Casual", "Evening", "Travel"];
const seasons = ["Spring", "Summer", "Fall", "Winter"];

const Wardrobe = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingItems, setLoadingItems] = useState(true);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
    occasion: [] as string[],
    season: [] as string[]
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchWardrobe();
    }
  }, [user]);

  const fetchWardrobe = async () => {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load wardrobe");
    } else {
      setItems(data || []);
    }
    setLoadingItems(false);
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.category) {
      toast.error("Please enter item name and category");
      return;
    }

    const { error } = await supabase.from("wardrobe_items").insert({
      user_id: user!.id,
      name: newItem.name,
      category: newItem.category,
      color: newItem.color || null,
      brand: newItem.brand || null,
      occasion: newItem.occasion.length > 0 ? newItem.occasion : null,
      season: newItem.season.length > 0 ? newItem.season : null
    });

    if (error) {
      toast.error("Failed to add item");
    } else {
      toast.success("Item added to wardrobe!");
      setNewItem({ name: "", category: "", color: "", brand: "", occasion: [], season: [] });
      setIsAdding(false);
      fetchWardrobe();
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("wardrobe_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete item");
    } else {
      toast.success("Item removed");
      setItems(items.filter(item => item.id !== id));
    }
  };

  const toggleArrayValue = (field: "occasion" | "season", value: string) => {
    setNewItem(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-medium mb-2">My Wardrobe</h1>
            <p className="text-muted-foreground">{items.length} items in your collection</p>
          </div>
          <Button variant="gold" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {isAdding && (
          <div className="bg-card rounded-xl p-6 border border-border/50 mb-8 animate-fade-up">
            <h3 className="font-display text-xl font-medium mb-4">Add New Item</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Item Name *</Label>
                <Input
                  placeholder="e.g., Silk Blouse"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Category *</Label>
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
                <Label>Color</Label>
                <Select value={newItem.color} onValueChange={(v) => setNewItem({ ...newItem, color: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  placeholder="e.g., Zara"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                />
              </div>
              <div>
                <Label>Occasions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {occasions.map(occ => (
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
                  {seasons.map(s => (
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
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="gold" onClick={addItem}>Add to Wardrobe</Button>
              <Button variant="soft" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {loadingItems ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading your wardrobe...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border/50">
            <Shirt className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium mb-2">Your wardrobe is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding your favorite pieces to get personalized outfit recommendations</p>
            <Button variant="gold" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-xl p-5 border border-border/50 group hover:shadow-card transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Shirt className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                <h4 className="font-medium mb-1">{item.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                <div className="flex flex-wrap gap-1">
                  {item.color && (
                    <span className="px-2 py-0.5 bg-accent rounded text-xs">{item.color}</span>
                  )}
                  {item.brand && (
                    <span className="px-2 py-0.5 bg-accent rounded text-xs">{item.brand}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;
