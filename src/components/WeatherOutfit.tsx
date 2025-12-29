import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Umbrella,
  Sparkles,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocationWeather, WeatherData } from "@/hooks/useDataQueries";

interface WeatherOutfitProps {
  className?: string;
  onGetOutfitIdeas?: () => void;
}

// Weather icons mapping
const WeatherIcons: Record<WeatherData["condition"], typeof Sun> = {
  sunny: Sun,
  clear: Moon,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudSnow,
  windy: Wind,
};

// Outfit suggestions based on weather
function getOutfitSuggestion(weather: WeatherData): {
  suggestion: string;
  items: string[];
  styling: string;
  warningTip?: string;
} {
  const { temperature, condition } = weather;

  if (temperature >= 80) {
    return {
      suggestion: "Light and Breezy",
      items: [
        "Linen shirt or tank top",
        "Light cotton shorts or maxi skirt",
        "Sandals",
        "Sun hat",
      ],
      styling:
        "Embrace breathable fabrics and light colors. Stay cool with loose silhouettes.",
      warningTip:
        condition === "sunny" || condition === "clear"
          ? "Don't forget sunscreen!"
          : undefined,
    };
  }

  if (temperature >= 65) {
    return {
      suggestion: "Perfect Layers",
      items: [
        "T-shirt or blouse",
        "Light cardigan or jacket",
        "Jeans or trousers",
        "Sneakers or loafers",
      ],
      styling:
        "The ideal layering weather! Start with a base and bring a light jacket for temperature changes.",
      warningTip:
        condition === "rainy" ? "Consider a water-resistant layer" : undefined,
    };
  }

  if (temperature >= 50) {
    return {
      suggestion: "Cozy Transitional",
      items: [
        "Long-sleeve shirt",
        "Sweater or hoodie",
        "Denim or chinos",
        "Ankle boots",
        "Light scarf",
      ],
      styling:
        "Mix textures for visual interest. A good day for your favorite sweater!",
      warningTip:
        condition === "windy"
          ? "A structured jacket will hold up better in wind"
          : undefined,
    };
  }

  if (temperature >= 35) {
    return {
      suggestion: "Winter Warmth",
      items: [
        "Thermal base layer",
        "Wool sweater",
        "Warm coat",
        "Boots",
        "Scarf and gloves",
      ],
      styling:
        "Layer strategically - start with thermals, add wool, top with a quality coat.",
      warningTip:
        condition === "snowy" ? "Opt for waterproof boots today" : undefined,
    };
  }

  return {
    suggestion: "Bundle Up",
    items: [
      "Heavy thermal layers",
      "Insulated coat or puffer",
      "Winter boots",
      "Hat, scarf, and gloves",
      "Warm socks",
    ],
    styling:
      "Prioritize warmth with down or wool. Don't forget to protect your extremities!",
    warningTip: "Consider hand and toe warmers for extended time outside",
  };
}

export function WeatherOutfit({
  className,
  onGetOutfitIdeas,
}: WeatherOutfitProps) {
  const { data: weather, isLoading, isLocating } = useLocationWeather();

  if (isLoading || isLocating || !weather) {
    return (
      <div
        className={cn(
          "bg-card rounded-xl p-6 border border-border/50",
          className
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-accent" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-accent rounded" />
              <div className="h-3 w-32 bg-accent rounded" />
            </div>
          </div>
          <div className="h-20 bg-accent rounded" />
        </div>
        {isLocating && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Getting your location...
          </p>
        )}
      </div>
    );
  }

  const WeatherIcon = WeatherIcons[weather.condition];
  const outfit = getOutfitSuggestion(weather);

  // Temperature color gradient (use cool colors at night)
  const isNight = weather.condition === "clear";
  const tempColor = isNight
    ? "text-indigo-400"
    : weather.temperature >= 80
    ? "text-orange-500"
    : weather.temperature >= 65
    ? "text-yellow-500"
    : weather.temperature >= 50
    ? "text-green-500"
    : weather.temperature >= 35
    ? "text-blue-400"
    : "text-blue-600";

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border/50 overflow-hidden",
        className
      )}
    >
      {/* Weather Header */}
      <div className="bg-gradient-to-r from-gold/10 to-champagne/10 p-5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-background/50 flex items-center justify-center">
              <WeatherIcon className={cn("w-7 h-7", tempColor)} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn("font-display text-3xl font-medium", tempColor)}
                >
                  {weather.temperature}°
                </span>
                <span className="text-sm text-muted-foreground">F</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {weather.description}
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end">
              <Thermometer className="w-3 h-3" />
              <span>Humidity: {weather.humidity}%</span>
            </div>
            <p className="capitalize">{weather.condition}</p>
          </div>
        </div>
      </div>

      {/* Outfit Suggestion */}
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <h3 className="font-display text-lg font-medium">
            Today's Look: {outfit.suggestion}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {outfit.styling}
        </p>

        {/* Suggested Items */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Suggested Items
          </p>
          <div className="flex flex-wrap gap-2">
            {outfit.items.map((item, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-accent rounded-full text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Warning Tip */}
        {outfit.warningTip && (
          <div className="flex items-center gap-2 p-3 bg-gold/10 rounded-lg border border-gold/20">
            <Umbrella className="w-4 h-4 text-gold flex-shrink-0" />
            <p className="text-sm text-gold">{outfit.warningTip}</p>
          </div>
        )}

        {/* CTA */}
        <Button
          variant="gold"
          size="sm"
          className="w-full"
          onClick={onGetOutfitIdeas}
        >
          Get AI Outfit Ideas
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Compact version for dashboard
export function WeatherOutfitCompact({
  className,
  onGetOutfitIdeas,
}: WeatherOutfitProps) {
  const { data: weather, isLoading, isLocating } = useLocationWeather();

  if (isLoading || isLocating || !weather) {
    return (
      <div
        className={cn(
          "bg-card rounded-xl p-4 border border-border/50 animate-pulse",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-24 bg-accent rounded" />
            <div className="h-3 w-32 bg-accent rounded" />
          </div>
        </div>
      </div>
    );
  }

  const WeatherIcon = WeatherIcons[weather.condition];
  const outfit = getOutfitSuggestion(weather);

  // Temperature color gradient (use cool colors at night)
  const isNight = weather.condition === "clear";
  const tempColor = isNight
    ? "text-indigo-400"
    : weather.temperature >= 80
    ? "text-orange-500"
    : weather.temperature >= 65
    ? "text-yellow-500"
    : weather.temperature >= 50
    ? "text-green-500"
    : "text-blue-500";

  return (
    <button
      onClick={onGetOutfitIdeas}
      className={cn(
        "w-full bg-gradient-to-r from-gold/5 to-champagne/10 rounded-xl p-4 border border-gold/20",
        "hover:border-gold/40 hover:shadow-card transition-all group text-left",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center">
            <WeatherIcon className={cn("w-5 h-5", tempColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn("font-display text-xl font-medium", tempColor)}
              >
                {weather.temperature}°F
              </span>
              <span className="text-sm text-muted-foreground">
                • {outfit.suggestion}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {weather.description} • {outfit.items.slice(0, 2).join(", ")}
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}
