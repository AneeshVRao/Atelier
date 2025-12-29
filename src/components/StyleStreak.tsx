import { useState, useEffect } from "react";
import { Flame, Trophy, Star, Sparkles, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StyleStreakProps {
  currentStreak: number;
  longestStreak?: number;
  lastOutfitDate?: string;
  className?: string;
}

export function StyleStreak({
  currentStreak,
  longestStreak = 0,
  lastOutfitDate,
  className,
}: StyleStreakProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if streak is still active (outfit worn today or yesterday)
  const isStreakActive = () => {
    if (!lastOutfitDate) return false;
    const last = new Date(lastOutfitDate);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 1;
  };

  const active = isStreakActive();

  // Determine streak level and badge
  const getStreakLevel = (streak: number) => {
    if (streak >= 30)
      return {
        level: "Style Icon",
        color: "text-purple-500",
        bg: "bg-purple-500/20",
      };
    if (streak >= 14)
      return { level: "Trendsetter", color: "text-gold", bg: "bg-gold/20" };
    if (streak >= 7)
      return {
        level: "Style Maven",
        color: "text-emerald-500",
        bg: "bg-emerald-500/20",
      };
    if (streak >= 3)
      return {
        level: "Rising Star",
        color: "text-blue-500",
        bg: "bg-blue-500/20",
      };
    return {
      level: "Getting Started",
      color: "text-muted-foreground",
      bg: "bg-accent",
    };
  };

  const streakLevel = getStreakLevel(currentStreak);

  // Animate on mount or streak change
  useEffect(() => {
    if (currentStreak > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [currentStreak]);

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border/50 p-5 hover:shadow-card transition-all",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              active ? "bg-orange-500/20" : "bg-accent",
              isAnimating && "animate-bounce"
            )}
          >
            <Flame
              className={cn(
                "w-6 h-6 transition-colors",
                active ? "text-orange-500" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <p className="font-display text-2xl font-medium">
              {currentStreak}
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </p>
            <p className="text-sm text-muted-foreground">Style Streak</p>
          </div>
        </div>

        {currentStreak >= 3 && (
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              streakLevel.bg,
              streakLevel.color
            )}
          >
            {streakLevel.level}
          </div>
        )}
      </div>

      {/* Streak Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress to next level</span>
          <span className="font-medium">
            {getProgressToNextLevel(currentStreak)}%
          </span>
        </div>
        <div className="h-2 bg-accent rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              active
                ? "bg-gradient-to-r from-orange-500 to-gold"
                : "bg-muted-foreground"
            )}
            style={{ width: `${getProgressToNextLevel(currentStreak)}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-muted-foreground">Best:</span>
          <span className="font-medium">{longestStreak} days</span>
        </div>
        {lastOutfitDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last:</span>
            <span className="font-medium">
              {formatLastDate(lastOutfitDate)}
            </span>
          </div>
        )}
      </div>

      {/* Encouragement Message */}
      {!active && currentStreak > 0 && (
        <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
          <p className="text-sm text-orange-600 dark:text-orange-400">
            <Sparkles className="w-4 h-4 inline mr-1" />
            Don't break your streak! Log today's outfit to keep it going.
          </p>
        </div>
      )}
    </div>
  );
}

function getProgressToNextLevel(streak: number): number {
  if (streak >= 30) return 100;
  if (streak >= 14) return ((streak - 14) / 16) * 100;
  if (streak >= 7) return ((streak - 7) / 7) * 100;
  if (streak >= 3) return ((streak - 3) / 4) * 100;
  return (streak / 3) * 100;
}

function formatLastDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Mini version for dashboard
export function StyleStreakMini({
  currentStreak,
  active = true,
}: {
  currentStreak: number;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          active ? "bg-orange-500/20" : "bg-accent"
        )}
      >
        <Flame
          className={cn(
            "w-4 h-4",
            active ? "text-orange-500" : "text-muted-foreground"
          )}
        />
      </div>
      <div>
        <p className="font-medium text-sm">
          {currentStreak}
          <span className="text-xs text-muted-foreground ml-1">day streak</span>
        </p>
      </div>
    </div>
  );
}
