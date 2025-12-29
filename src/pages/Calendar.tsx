import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCalendarEntries,
  useAddCalendarEntry,
  useToggleCalendarEntry,
  useDeleteCalendarEntry,
  CalendarEntry,
} from "@/hooks/useDataQueries";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Sparkles,
  Check,
  X,
  Trash2,
} from "lucide-react";

const Calendar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState({ occasion: "", notes: "" });

  // TanStack Query hooks
  const { data: entries = [], isLoading: entriesLoading } =
    useCalendarEntries(currentDate);
  const addEntryMutation = useAddCalendarEntry();
  const toggleEntryMutation = useToggleCalendarEntry();
  const deleteEntryMutation = useDeleteCalendarEntry();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEntryForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return entries.find((e) => e.planned_date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setIsAdding(true);

    const existing = getEntryForDay(day);
    if (existing) {
      setEditingEntryId(existing.id);
      setNewEntry({
        occasion: existing.occasion || "",
        notes: existing.notes || "",
      });
    } else {
      setEditingEntryId(null);
      setNewEntry({ occasion: "", notes: "" });
    }
  };

  const saveEntry = () => {
    if (!selectedDate) return;

    addEntryMutation.mutate(
      {
        planned_date: selectedDate,
        occasion: newEntry.occasion || null,
        notes: newEntry.notes || null,
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setSelectedDate(null);
        },
      }
    );
  };

  const toggleComplete = (entry: CalendarEntry) => {
    toggleEntryMutation.mutate(entry.id);
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  if (loading || entriesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-28 pb-20 container mx-auto px-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-medium mb-2">
              Outfit Calendar
            </h1>
            <p className="text-muted-foreground">
              Plan your looks ahead of time
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display text-xl font-medium">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-muted-foreground font-medium py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (day === null) {
                  return <div key={i} className="aspect-square" />;
                }

                const entry = getEntryForDay(day);
                const dateStr = `${currentDate.getFullYear()}-${String(
                  currentDate.getMonth() + 1
                ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all hover:bg-accent ${
                      isToday
                        ? "ring-2 ring-gold ring-offset-2 ring-offset-background"
                        : ""
                    } ${entry ? "bg-gold/10" : ""}`}
                  >
                    <span
                      className={`text-sm ${
                        isToday ? "font-bold text-gold" : ""
                      }`}
                    >
                      {day}
                    </span>
                    {entry && (
                      <div
                        className={`w-2 h-2 rounded-full ${
                          entry.is_completed ? "bg-green-500" : "bg-gold"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isAdding && selectedDate && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl p-6 border border-border/50 shadow-lg max-w-md w-full animate-fade-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl font-medium">
                  Plan Outfit for{" "}
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-accent rounded-lg"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Occasion</Label>
                  <Input
                    placeholder="e.g., Work meeting, Date night..."
                    value={newEntry.occasion}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, occasion: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    placeholder="Any specific items or ideas..."
                    value={newEntry.notes}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button variant="gold" onClick={saveEntry} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
                {editingEntryId && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteEntryMutation.mutate(editingEntryId);
                      setIsAdding(false);
                      setEditingEntryId(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="soft" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Plans */}
        {entries.filter((e) => e.planned_date >= todayStr).length > 0 && (
          <div className="mt-8">
            <h3 className="font-display text-xl font-medium mb-4">
              Upcoming Plans
            </h3>
            <div className="space-y-3">
              {entries
                .filter((e) => e.planned_date >= todayStr)
                .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 group"
                  >
                    <button
                      onClick={() => toggleComplete(entry)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        entry.is_completed
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-muted-foreground"
                      }`}
                    >
                      {entry.is_completed && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium">
                        {entry.occasion || "Outfit planned"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.planned_date).toLocaleDateString(
                          "en-US",
                          { weekday: "short", month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => navigate("/looks")}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Get Ideas
                    </Button>
                    <button
                      onClick={() => deleteEntryMutation.mutate(entry.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 rounded-lg transition-all"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
