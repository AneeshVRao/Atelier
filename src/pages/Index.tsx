import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ChevronRight,
  Heart,
  Shirt,
  Palette,
  Star,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import heroImage from "@/assets/hero-fashion.jpg";
import { STYLE_PREFERENCES, COLOR_PALETTES } from "@/lib/constants";

// Enhanced style options with icons
const styleOptions = [
  { ...STYLE_PREFERENCES[0], icon: Star },
  { ...STYLE_PREFERENCES[1], icon: Sparkles },
  { ...STYLE_PREFERENCES[2], icon: Palette },
  { ...STYLE_PREFERENCES[3], icon: Heart },
];

const occasionOptions = [
  { id: "work", label: "Work & Office" },
  { id: "casual", label: "Casual Weekend" },
  { id: "evening", label: "Evening & Events" },
  { id: "travel", label: "Travel & Active" },
];

// Use shared color palettes
const colorOptions = COLOR_PALETTES.slice(0, 4);

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
        occasions: selectedOccasions,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Style profile saved!");
      navigate("/looks");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {step === 0 && (
        <>
          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center pt-20">
            <div className="absolute inset-0 bg-gradient-hero" />
            <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8 animate-fade-up">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
                    Your Personal Style Journey
                  </p>
                  <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-tight">
                    Discover Your
                    <span className="block italic text-gold">
                      Signature Style
                    </span>
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                  Personalized styling recommendations curated just for you.
                  Build a wardrobe that reflects who you truly are.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={() => setStep(1)}
                    className="group"
                  >
                    Take Style Quiz
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="soft"
                    size="xl"
                    onClick={() => navigate("/looks")}
                  >
                    Explore Looks
                  </Button>
                </div>
              </div>
              <div className="relative hidden lg:block animate-fade-in animate-delay-300">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-gold/10 to-champagne/20">
                  <img
                    src={heroImage}
                    alt="Fashion editorial"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to a gradient background with icon if image fails
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/10 to-champagne/20">
                          <div class="text-center space-y-4">
                            <div class="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center mx-auto">
                              <svg class="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                              </svg>
                            </div>
                            <p class="text-muted-foreground font-medium">Your Style Awaits</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card border border-border/50 animate-slide-in-right animate-delay-600">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-medium">
                        AI-Powered
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Styling Recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section - How It Works */}
          <section id="how-it-works" className="py-24 bg-card scroll-mt-20">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <h2 className="font-display text-4xl font-medium tracking-tight">
                  How It Works
                </h2>
                <p className="text-muted-foreground">
                  Three simple steps to unlock your perfect wardrobe
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Sparkles,
                    title: "Take the Quiz",
                    description:
                      "Answer a few questions about your lifestyle, preferences, and body type.",
                  },
                  {
                    icon: Palette,
                    title: "Get Your Profile",
                    description:
                      "Receive a personalized style profile with color palettes and silhouettes.",
                  },
                  {
                    icon: Shirt,
                    title: "Build Your Wardrobe",
                    description:
                      "Get curated outfit recommendations and build your dream closet.",
                  },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`text-center p-8 rounded-xl bg-background border border-border/50 hover:shadow-card transition-all duration-300 group ${
                      index === 0
                        ? ""
                        : index === 1
                        ? "animate-delay-100"
                        : "animate-delay-200"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="font-display text-xl font-medium mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-24 bg-background scroll-mt-20">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  Free Forever
                </span>
                <h2 className="font-display text-4xl font-medium tracking-tight">
                  Everything You Need
                </h2>
                <p className="text-muted-foreground">
                  Powerful features to elevate your personal style
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "AI Outfit Generator",
                    description:
                      "Get personalized outfit suggestions based on your style profile, wardrobe, and the occasion.",
                    icon: Sparkles,
                  },
                  {
                    title: "Digital Wardrobe",
                    description:
                      "Organize your entire closet digitally. Track what you own and identify gaps.",
                    icon: Shirt,
                  },
                  {
                    title: "Color Analysis",
                    description:
                      "Discover which colors complement your skin tone and build a cohesive palette.",
                    icon: Palette,
                  },
                  {
                    title: "Outfit Calendar",
                    description:
                      "Plan your outfits in advance and never repeat looks too often.",
                    icon: Heart,
                  },
                  {
                    title: "Shopping Wishlist",
                    description:
                      "Save items you want to buy and get notified when they go on sale.",
                    icon: Heart,
                  },
                  {
                    title: "Style Insights",
                    description:
                      "Track your style evolution and get insights on your fashion preferences.",
                    icon: Star,
                  },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`p-6 rounded-xl bg-card border border-border/50 hover:shadow-card transition-all duration-300 group animate-fade-up animate-delay-${
                      (index % 3) * 100
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="font-display text-lg font-medium mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <Button
                  variant="gold"
                  size="xl"
                  onClick={() => setStep(1)}
                  className="group"
                >
                  Start Your Style Journey
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  No credit card required • Free forever
                </p>
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
                <p className="text-sm text-muted-foreground">
                  Step {step} of 3
                </p>
                <button
                  onClick={handleBack}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
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
                  <h2 className="font-display text-4xl font-medium">
                    What's your style vibe?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the aesthetic that resonates most with you
                  </p>
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
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            selectedStyle === style.id
                              ? "bg-gold text-primary-foreground"
                              : "bg-accent"
                          }`}
                        >
                          <style.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-medium">
                            {style.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {style.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={handleNext}
                    disabled={!selectedStyle}
                  >
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
                  <h2 className="font-display text-4xl font-medium">
                    Where do you dress for?
                  </h2>
                  <p className="text-muted-foreground">
                    Select all that apply to your lifestyle
                  </p>
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
                      <h3 className="font-display text-lg font-medium">
                        {occasion.label}
                      </h3>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={handleNext}
                    disabled={selectedOccasions.length === 0}
                  >
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
                  <h2 className="font-display text-4xl font-medium">
                    Your ideal color palette?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the colors that make you feel most confident
                  </p>
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
                      <h3 className="font-display text-lg font-medium">
                        {palette.label}
                      </h3>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center pt-4">
                  <Button
                    variant="gold"
                    size="xl"
                    onClick={() => setStep(4)}
                    disabled={!selectedColors}
                  >
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
              <h2 className="font-display text-4xl md:text-5xl font-medium">
                Your Style Profile
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Based on your preferences, here's your personalized style guide
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 animate-fade-up animate-delay-200">
              <div className="bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-4">
                  Style Archetype
                </h3>
                <p className="text-3xl font-display italic text-gold mb-4">
                  {selectedStyle === "classic" && "The Curator"}
                  {selectedStyle === "minimalist" && "The Essentialist"}
                  {selectedStyle === "bold" && "The Trendsetter"}
                  {selectedStyle === "romantic" && "The Romantic"}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Your style is sophisticated and intentional. You value quality
                  over quantity and understand that true elegance comes from
                  knowing exactly what works for you.
                </p>
              </div>

              <div className="bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-4">
                  Your Palette
                </h3>
                <div className="flex gap-3 mb-4">
                  {colorOptions
                    .find((c) => c.id === selectedColors)
                    ?.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-full shadow-soft"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  These colors complement your skin tone and create a cohesive
                  wardrobe that mixes effortlessly.
                </p>
              </div>

              <div className="md:col-span-2 bg-card rounded-xl p-8 border border-border/50 shadow-card">
                <h3 className="font-display text-2xl font-medium mb-6">
                  Wardrobe Essentials
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "Tailored Blazer",
                    "Silk Blouse",
                    "High-waist Trousers",
                    "Cashmere Knit",
                    "A-line Midi Skirt",
                    "Leather Tote",
                    "Gold Hoops",
                    "Pointed Heels",
                  ].map((item) => (
                    <div
                      key={item}
                      className="p-4 bg-accent/50 rounded-lg text-center"
                    >
                      <p className="font-medium text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-12 animate-fade-up animate-delay-400">
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
      <footer className="py-16 bg-card border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <h2 className="font-display text-2xl font-medium mb-3">
                Atelier
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Your personal style, elevated. AI-powered outfit recommendations
                tailored to your unique taste.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-medium mb-4 text-sm">Product</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setStep(1)}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Style Quiz
                </button>
                {user ? (
                  <>
                    <NavLink
                      to="/wardrobe"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      My Wardrobe
                    </NavLink>
                    <NavLink
                      to="/looks"
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Get Styled
                    </NavLink>
                  </>
                ) : (
                  <NavLink
                    to="/auth"
                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Up Free
                  </NavLink>
                )}
              </div>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-medium mb-4 text-sm">Resources</h3>
              <div className="space-y-3">
                <a
                  href="#how-it-works"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#features"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </div>
            </div>

            {/* Get Started CTA */}
            <div>
              <h3 className="font-medium mb-4 text-sm">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join thousands of style-conscious individuals who've transformed
                their wardrobe.
              </p>
              {!user && (
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Free
                </Button>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Atelier. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Made with <Heart className="inline w-3 h-3 text-rose-500 mx-1" />{" "}
              for fashion lovers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
