import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight, Heart, Shirt, Palette, Star, LogOut, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-fashion.jpg";

const styleOptions = [
  { id: "classic", label: "Classic & Timeless", icon: Star, description: "Clean lines, neutral colors, investment pieces" },
  { id: "minimalist", label: "Minimalist Chic", icon: Sparkles, description: "Less is more, quality over quantity" },
  { id: "bold", label: "Bold & Trendy", icon: Palette, description: "Statement pieces, current trends" },
  { id: "romantic", label: "Romantic & Feminine", icon: Heart, description: "Soft fabrics, delicate details" },
];

const occasionOptions = [
  { id: "work", label: "Work & Office" },
  { id: "casual", label: "Casual Weekend" },
  { id: "evening", label: "Evening & Events" },
  { id: "travel", label: "Travel & Active" },
];

const colorOptions = [
  { id: "neutrals", label: "Warm Neutrals", colors: ["#E8DCD0", "#C4A484", "#8B7355"] },
  { id: "cool", label: "Cool & Crisp", colors: ["#F5F5F5", "#A9B4C2", "#4A5568"] },
  { id: "earth", label: "Earth Tones", colors: ["#8B6F47", "#6B5344", "#3D2914"] },
  { id: "pastels", label: "Soft Pastels", colors: ["#F5E6E0", "#E0D4C8", "#D4C4B0"] },
];

const Index = () => {
  const [step, setStep] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string | null>(null);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const toggleOccasion = (id: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSaveProfile = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        style_preference: selectedStyle,
        color_palette: selectedColors,
        occasions: selectedOccasions
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Style profile saved!");
      navigate("/looks");
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <NavLink to="/" className="font-display text-2xl font-semibold tracking-tight">Atelier</NavLink>
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" className="text-sm text-foreground font-medium">Style Quiz</NavLink>
            <NavLink to="/wardrobe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wardrobe</NavLink>
            <NavLink to="/looks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Looks</NavLink>
          </div>
          {loading ? null : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <Button variant="soft" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="elegant" size="sm" onClick={() => navigate("/auth")}>
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </nav>

      {step === 0 && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center pt-20">
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8 animate-fade-up">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">Your Personal Style Journey</p>
                  <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight">
                    Discover Your
                    <span className="block italic text-gold">Signature Style</span>
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Personalized styling recommendations curated just for you. Build a wardrobe that reflects who you truly are.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="gold" size="xl" onClick={() => setStep(1)} className="group">
                    Take Style Quiz
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="soft" size="xl" onClick={() => navigate("/looks")}>
                    Explore Looks
                  </Button>
                </div>
              </div>
              <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-card">
                  <img
                    src={heroImage}
                    alt="Fashion editorial"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card border border-border/50 animate-slide-in-right" style={{ animationDelay: "0.6s" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-medium">AI-Powered</p>
                      <p className="text-sm text-muted-foreground">Styling Recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-card">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="font-display text-4xl font-medium tracking-tight">How It Works</h2>
                <p className="text-muted-foreground">Three simple steps to unlock your perfect wardrobe</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Sparkles, title: "Take the Quiz", description: "Answer a few questions about your lifestyle, preferences, and body type." },
                  { icon: Palette, title: "Get Your Profile", description: "Receive a personalized style profile with color palettes and silhouettes." },
                  { icon: Shirt, title: "Build Your Wardrobe", description: "Get curated outfit recommendations and build your dream closet." },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className="text-center p-8 rounded-xl bg-background border border-border/50 hover:shadow-card transition-all duration-300 group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="font-display text-xl font-medium mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Style Quiz Steps */}
      {step >= 1 && step <= 3 && (
        <section className="min-h-screen pt-32 pb-20 bg-gradient-hero">
          <div className="container mx-auto px-6 max-w-3xl">
            {/* Progress */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Step {step} of 3</p>
                <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← Back
                </button>
              </div>
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Step 1: Style Preference */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-up">
                <div className="text-center space-y-4">
                  <h2 className="font-display text-4xl font-medium">What's your style vibe?</h2>
                  <p className="text-muted-foreground">Choose the aesthetic that resonates most with you</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {styleOptions.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-6 rounded-xl border text-left transition-all duration-300 ${
                        selectedStyle === style.id
                          ? "border-gold bg-gold/10 shadow-glow"
                          : "border-border bg-card hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          selectedStyle === style.id ? "bg-gold text-primary-foreground" : "bg-accent"
                        }`}>
                          <style.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-medium">{style.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{style.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button variant="gold" size="xl" onClick={handleNext} disabled={!selectedStyle}>
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Occasions */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-up">
                <div className="text-center space-y-4">
                  <h2 className="font-display text-4xl font-medium">Where do you dress for?</h2>
                  <p className="text-muted-foreground">Select all that apply to your lifestyle</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {occasionOptions.map((occasion) => (
                    <button
                      key={occasion.id}
                      onClick={() => toggleOccasion(occasion.id)}
                      className={`p-6 rounded-xl border text-center transition-all duration-300 ${
                        selectedOccasions.includes(occasion.id)
                          ? "border-gold bg-gold/10 shadow-glow"
                          : "border-border bg-card hover:border-gold/50"
                      }`}
                    >
                      <h3 className="font-display text-lg font-medium">{occasion.label}</h3>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button variant="gold" size="xl" onClick={handleNext} disabled={selectedOccasions.length === 0}>
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Color Palette */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-up">
                <div className="text-center space-y-4">
                  <h2 className="font-display text-4xl font-medium">Your ideal color palette?</h2>
                  <p className="text-muted-foreground">Choose the colors that make you feel most confident</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {colorOptions.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => setSelectedColors(palette.id)}
                      className={`p-6 rounded-xl border text-left transition-all duration-300 ${
                        selectedColors === palette.id
                          ? "border-gold bg-gold/10 shadow-glow"
                          : "border-border bg-card hover:border-gold/50"
                      }`}
                    >
                      <div className="flex gap-2 mb-4">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full shadow-soft"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h3 className="font-display text-lg font-medium">{palette.label}</h3>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button variant="gold" size="xl" onClick={() => setStep(4)} disabled={!selectedColors}>
                    Get My Style Profile
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Results */}
      {step === 4 && (
        <section className="min-h-screen pt-32 pb-20 bg-gradient-hero">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center space-y-6 mb-12 animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-gold" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-medium">Your Style Profile</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Based on your preferences, here's your personalized style guide
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-4">Style Archetype</h3>
                <p className="text-3xl font-display italic text-gold mb-4">
                  {selectedStyle === "classic" && "The Curator"}
                  {selectedStyle === "minimalist" && "The Essentialist"}
                  {selectedStyle === "bold" && "The Trendsetter"}
                  {selectedStyle === "romantic" && "The Romantic"}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your style is sophisticated and intentional. You value quality over quantity and understand that true elegance comes from knowing exactly what works for you.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-4">Your Palette</h3>
                <div className="flex gap-3 mb-4">
                  {colorOptions.find(c => c.id === selectedColors)?.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-full shadow-soft"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  These colors complement your skin tone and create a cohesive wardrobe that mixes effortlessly.
                </p>
              </div>

              <div className="md:col-span-2 bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-6">Wardrobe Essentials</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {["Tailored Blazer", "Silk Blouse", "High-waist Trousers", "Cashmere Knit", "A-line Midi Skirt", "Leather Tote", "Gold Hoops", "Pointed Heels"].map((item) => (
                    <div key={item} className="p-4 bg-accent/50 rounded-lg text-center">
                      <p className="font-medium text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
              <Button variant="gold" size="xl" onClick={handleSaveProfile}>
                {user ? "Save & Get Outfits" : "Sign In to Save"}
              </Button>
              <Button variant="soft" size="xl" onClick={() => setStep(0)}>
                Start Over
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="font-display text-2xl font-medium mb-2">Atelier</h2>
              <p className="text-sm text-muted-foreground">Your personal style, elevated</p>
            </div>
            <div className="flex gap-8">
              <NavLink to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Style Quiz</NavLink>
              <NavLink to="/wardrobe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wardrobe</NavLink>
              <NavLink to="/looks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Looks</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
