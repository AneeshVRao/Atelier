import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUpdateProfile } from "@/hooks/useDataQueries";
import { toast } from "sonner";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Palette,
  Shirt,
  Calendar,
} from "lucide-react";
import {
  STYLE_PREFERENCES,
  COLOR_PALETTES,
  BODY_TYPES,
  OCCASIONS,
} from "@/lib/constants";

const GENDER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
] as const;

const STEPS = [
  { id: 1, title: "About You", icon: User },
  { id: 2, title: "Your Style", icon: Shirt },
  { id: 3, title: "Colors", icon: Palette },
  { id: 4, title: "Occasions", icon: Calendar },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const updateProfileMutation = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    gender: "",
    body_type: "",
    height: "",
    style_preference: "",
    color_palette: "",
    occasions: [] as string[],
  });

  const progress = (currentStep / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.gender !== "";
      case 2:
        return profile.style_preference !== "";
      case 3:
        return profile.color_palette !== "";
      case 4:
        return profile.occasions.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateProfileMutation.mutate(
      {
        gender: profile.gender,
        body_type: profile.body_type || null,
        height: profile.height || null,
        style_preference: profile.style_preference,
        color_palette: profile.color_palette,
        occasions: profile.occasions,
        onboarding_completed: true,
      },
      {
        onSuccess: () => {
          toast.success("Welcome to Atelier! Your style profile is ready.");
          navigate("/dashboard", { replace: true });
        },
        onError: () => {
          toast.error("Failed to save profile. Please try again.");
        },
      }
    );
  };

  const toggleOccasion = (occasion: string) => {
    setProfile((prev) => ({
      ...prev,
      occasions: prev.occasions.includes(occasion)
        ? prev.occasions.filter((o) => o !== occasion)
        : [...prev.occasions, occasion],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold" />
            </div>
            <span className="font-display text-xl font-medium">Atelier</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4 bg-background/50">
        <div className="max-w-2xl mx-auto">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-1 text-xs ${
                  currentStep >= step.id ? "text-gold" : "text-muted-foreground"
                }`}
              >
                <step.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-card">
            {/* Step 1: Gender & Body */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-medium mb-2">
                    Let's get to know you
                  </h2>
                  <p className="text-muted-foreground">
                    This helps us recommend outfits that suit you perfectly
                  </p>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    How do you identify? *
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          setProfile({ ...profile, gender: option.id })
                        }
                        className={`p-4 rounded-xl border-2 transition-all ${
                          profile.gender === option.id
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Body Type (optional)
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BODY_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setProfile({ ...profile, body_type: type })
                        }
                        className={`p-3 rounded-xl border-2 transition-all text-sm ${
                          profile.body_type === type
                            ? "border-gold bg-gold/10"
                            : "border-border hover:border-gold/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Height (optional)
                  </Label>
                  <input
                    type="text"
                    placeholder="e.g., 5'8 or 173cm"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({ ...profile, height: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border-2 border-border bg-background focus:border-gold outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Style Preference */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-medium mb-2">
                    What's your style vibe?
                  </h2>
                  <p className="text-muted-foreground">
                    Choose the style that resonates with you most
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STYLE_PREFERENCES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        setProfile({ ...profile, style_preference: style.id })
                      }
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        profile.style_preference === style.id
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <div className="font-medium mb-1">{style.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {style.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Color Palette */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-medium mb-2">
                    Choose your color palette
                  </h2>
                  <p className="text-muted-foreground">
                    We'll use these tones when suggesting outfits
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() =>
                        setProfile({ ...profile, color_palette: palette.id })
                      }
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        profile.color_palette === palette.id
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {palette.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-border/50"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{palette.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Occasions */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl font-medium mb-2">
                    When do you dress up?
                  </h2>
                  <p className="text-muted-foreground">
                    Select all the occasions you typically dress for
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {OCCASIONS.map((occasion) => (
                    <button
                      key={occasion}
                      onClick={() => toggleOccasion(occasion)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        profile.occasions.includes(occasion)
                          ? "border-gold bg-gold/10"
                          : "border-border hover:border-gold/50"
                      }`}
                    >
                      <span className="font-medium">{occasion}</span>
                    </button>
                  ))}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Selected: {profile.occasions.length} occasion
                  {profile.occasions.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || updateProfileMutation.isPending}
                className="gap-2 bg-gold hover:bg-gold/90 text-white"
              >
                {currentStep === STEPS.length ? (
                  updateProfileMutation.isPending ? (
                    "Saving..."
                  ) : (
                    "Complete Setup"
                  )
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
