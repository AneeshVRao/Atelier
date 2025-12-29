import { useState, useEffect } from "react";
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
import { useProfile, useUpdateProfile } from "@/hooks/useDataQueries";
import { toast } from "sonner";
import { User, Save, Palette, Shirt, Heart, ChevronRight } from "lucide-react";
import {
  STYLE_PREFERENCES,
  COLOR_PALETTES,
  BODY_TYPES,
  BUDGET_RANGES,
  OCCASIONS,
} from "@/lib/constants";

// Use shared constants
const bodyTypes = [...BODY_TYPES];
const budgetRanges = [...BUDGET_RANGES];
const stylePreferences = STYLE_PREFERENCES.map((s) => ({
  id: s.id,
  label: s.label,
}));
const colorPalettes = COLOR_PALETTES.map((c) => ({ id: c.id, label: c.label }));
const occasionOptions = [...OCCASIONS];

const Profile = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // TanStack Query hooks
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [profile, setProfile] = useState({
    full_name: "",
    style_preference: "",
    color_palette: "",
    body_type: "",
    height: "",
    budget_range: "",
    occasions: [] as string[],
  });

  // Sync local state with fetched profile
  useEffect(() => {
    if (profileData) {
      setProfile({
        full_name: profileData.full_name || "",
        style_preference: profileData.style_preference || "",
        color_palette: profileData.color_palette || "",
        body_type: profileData.body_type || "",
        height: profileData.height || "",
        budget_range: profileData.budget_range || "",
        occasions: profileData.occasions || [],
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const saveProfile = () => {
    updateProfileMutation.mutate({
      full_name: profile.full_name,
      style_preference: profile.style_preference,
      color_palette: profile.color_palette,
      body_type: profile.body_type,
      height: profile.height,
      budget_range: profile.budget_range,
      occasions: profile.occasions,
    });
  };

  const toggleOccasion = (occasion: string) => {
    setProfile((prev) => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter((o) => o !== occasion)
        : [...prev.occasions, occasion],
    }));
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Use shared occasion options
  const occasions = occasionOptions;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-medium mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your style preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-medium">
                Basic Information
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-accent/50"
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  value={profile.height}
                  onChange={(e) =>
                    setProfile({ ...profile, height: e.target.value })
                  }
                  placeholder="e.g., 5ft 6in or 168cm"
                />
              </div>
              <div>
                <Label>Body Type</Label>
                <Select
                  value={profile.body_type}
                  onValueChange={(v) =>
                    setProfile({ ...profile, body_type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Style Preferences */}
          <div className="bg-card rounded-xl p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-gold" />
              </div>
              <h2 className="font-display text-xl font-medium">
                Style Preferences
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Style Archetype</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {stylePreferences.map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        setProfile({ ...profile, style_preference: style.id })
                      }
                      className={`p-4 rounded-xl border text-left transition-all ${
                        profile.style_preference === style.id
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{style.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color Palette</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() =>
                        setProfile({ ...profile, color_palette: palette.id })
                      }
                      className={`p-4 rounded-xl border text-left transition-all ${
                        profile.color_palette === palette.id
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{palette.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Occasions</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {occasions.map((occasion) => (
                    <button
                      key={occasion}
                      onClick={() => toggleOccasion(occasion.toLowerCase())}
                      className={`px-4 py-2 rounded-full text-sm transition-all ${
                        profile.occasions.includes(occasion.toLowerCase())
                          ? "bg-gold text-primary-foreground"
                          : "bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {occasion}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Budget Range</Label>
                <Select
                  value={profile.budget_range}
                  onValueChange={(v) =>
                    setProfile({ ...profile, budget_range: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              variant="gold"
              onClick={saveProfile}
              disabled={updateProfileMutation.isPending}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Style Boards Link */}
          <button
            onClick={() => navigate("/boards")}
            className="w-full bg-card rounded-xl p-6 border border-border/50 hover:border-gold/50 hover:shadow-card transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                  <Palette className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Style Boards</h3>
                  <p className="text-sm text-muted-foreground">
                    Create mood boards to visualize your style vision
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Danger Zone */}
          <div className="bg-card rounded-xl p-6 border border-destructive/20">
            <h3 className="font-medium mb-4 text-destructive">Danger Zone</h3>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
