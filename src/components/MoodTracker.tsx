import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp } from "lucide-react";
import MoodNoteModal from "@/components/mood/MoodNoteModal";
import { supabase } from "@/supabaseClient";

type Mood = {
  emoji: string;
  label: string;
  value: number;
  color: string;
};

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState<number[]>(Array(7).fill(0));
  const [note, setNote] = useState("");

  const moods: Mood[] = [
    { emoji: "😊", label: "Happy", value: 5, color: "bg-secondary" },
    { emoji: "😌", label: "Calm", value: 4, color: "bg-primary" },
    { emoji: "😐", label: "Neutral", value: 3, color: "bg-muted" },
    { emoji: "😔", label: "Sad", value: 2, color: "bg-destructive/70" },
    { emoji: "😰", label: "Anxious", value: 1, color: "bg-destructive" },
  ];

  /* -------------------------------------------
     SAVE / UPDATE MOOD FOR TODAY (SUPABASE)
  -------------------------------------------- */
  const handleMoodSelect = async (mood: Mood) => {
    try {
      setSelectedMood(mood);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Today start (UTC-safe)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: existing } = await supabase
        .from("mood")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", today.toISOString())
        .limit(1)
        .single();

      if (existing) {
        // UPDATE
        await supabase
          .from("mood")
          .update({
            mood: mood.label,
            energy_level: mood.value,
          })
          .eq("id", existing.id);
      } else {
        // INSERT
        await supabase.from("mood").insert({
          user_id: user.id,
          mood: mood.label,
          energy_level: mood.value,
        });
      }

      await loadWeeklyProgress();
    } catch (err) {
      console.error(err);
    }
  };




  /* -------------------------------------------
     SAVE NOTE (UPDATE TODAY ONLY)
  -------------------------------------------- */
  const handleSaveNote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !note.trim()) return;

    // Get today's mood entry
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data, error: fetchError } = await supabase
      .from("mood")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString())
      .lte("created_at", todayEnd.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !data) {
      alert("No mood found for today");
      return;
    }

    // Update note
    const { error } = await supabase
      .from("mood")
      .update({ note })
      .eq("id", data.id);

    if (error) {
      console.error(error);
      alert("Failed to save note");
      return;
    }

    alert("Note saved successfully ✨");
  };


  /* -------------------------------------------
     LOAD WEEKLY DATA (MON → SUN) — CLEAN LOGIC
  -------------------------------------------- */
  const loadWeeklyProgress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Get today
    const today = new Date();

    // Find Monday of current week
    const monday = new Date(today);
    const day = monday.getDay(); // Sun=0, Mon=1
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(monday.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    // Sunday
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch moods
    const { data, error } = await supabase
      .from("mood")
      .select("energy_level, created_at")
      .eq("user_id", user.id)
      .gte("created_at", monday.toISOString())
      .lte("created_at", sunday.toISOString());

    if (error) {
      console.error("Progress fetch error:", error);
      return;
    }

    // Map: date → energy
    const map: Record<string, number> = {};

    data?.forEach((row) => {
      const dateKey = new Date(row.created_at)
        .toLocaleDateString("en-CA"); // YYYY-MM-DD (local safe)

      map[dateKey] = Math.max(
        map[dateKey] || 0,
        row.energy_level ?? 0
      );
    });

    // Build week data (Mon → Sun)
    const weekly: number[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = d
        .toLocaleDateString("en-CA"); // YYYY-MM-DD (local)

      weekly.push(map[dateKey] || 0);
    }

    setWeeklyData(weekly);
  };


  /* ------------------------------------------- */

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Mood Tracker
          </h1>
          <p className="text-muted-foreground">
            How are you feeling today?
          </p>
        </div>

        {/* Date */}
        <Card className="shadow-soft border-0">
          <CardContent className="p-4 flex items-center justify-center space-x-3">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </CardContent>
        </Card>

        {/* Mood Selection */}
        <Card className="shadow-elevated border-0">
          <CardHeader>
            <CardTitle className="text-center">
              Select Your Mood
            </CardTitle>
            <CardDescription className="text-center">
              Tap the emotion that best describes you right now
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {moods.map((mood) => (
                <Button
                  key={mood.label}
                  variant="ghost"
                  onClick={() => handleMoodSelect(mood)}
                  className={`h-16 p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${selectedMood?.label === mood.label
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border/30 hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div
                      className={`w-12 h-12 ${mood.color} rounded-full flex items-center justify-center text-2xl shadow-soft`}
                    >
                      {mood.emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">
                        {mood.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {mood.value}/5 energy level
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {selectedMood && (
              <div className="text-center space-y-4 animate-fade-in">
                <p className="text-primary font-medium">
                  Mood logged successfully ✨
                </p>

                <Button
                  onClick={() => setNoteOpen(true)}
                  className="w-full bg-gradient-calm"
                >
                  Add Note (Optional)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        <Card className="shadow-soft border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                Your Progress
              </CardTitle>
            </div>
            <CardDescription>
              Shows only days you logged a mood
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between items-end h-20 px-2">
              {weeklyData.map((value, index) => (
                <div
                  key={index}
                  className="w-6 bg-gradient-calm rounded-t transition-all duration-500"
                  style={{ height: `${value * 16}px` }}
                />
              ))}
            </div>

            <div className="flex justify-between text-xs mt-2">
              {weeklyData.map((_, index) => {
                const today = new Date();

                const monday = new Date(today);
                const day = monday.getDay();
                const diff = day === 0 ? -6 : 1 - day;
                monday.setDate(monday.getDate() + diff);

                const d = new Date(monday);
                d.setDate(monday.getDate() + index);

                const isToday =
                  d.toDateString() === today.toDateString();

                return (
                  <span
                    key={index}
                    className={
                      isToday ? "text-primary font-medium" : ""
                    }
                  >
                    {isToday
                      ? "Today"
                      : d.toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                  </span>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <MoodNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        mood={selectedMood?.label || ""}
        note={note}
        setNote={setNote}
        onSave={handleSaveNote}
      />

    </div>
  );
};
export default MoodTracker;