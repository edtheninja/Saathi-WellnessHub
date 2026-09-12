// src/screens/SetGoalScreen.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle } from "lucide-react";
import { supabase } from "@/supabaseClient";
import OtherGoalModal from "@/components/OtherGoalModal";

type GoalCategory =
  | "Meditation"
  | "Yoga"
  | "Self Care"
  | "Fitness"
  | "Other";

const categories: GoalCategory[] = [
  "Meditation",
  "Yoga",
  "Self Care",
  "Fitness",
  "Other",
];

export default function SetGoalScreen() {
  const navigate = useNavigate();

  const [category, setCategory] = useState<GoalCategory | null>(null);
  const [duration, setDuration] = useState(10);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const [otherOpen, setOtherOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  /* -----------------------------
     LOAD TODAY'S GOAL
  ------------------------------ */
  useEffect(() => {
    loadTodayGoal();
  }, []);

  const loadTodayGoal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setGoalId(data.id);
      setCategory(data.category);
      setDuration(data.duration);
      setCustomGoal(data.custom_title || "");
      setCompleted(data.completed);
    }
  };

  /* -----------------------------
     SAVE GOAL
  ------------------------------ */
  const saveGoal = async () => {
    if (!category) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        category,
        custom_title: category === "Other" ? customGoal : null,
        duration,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to save goal");
      return;
    }

    setGoalId(data.id);
    setCompleted(false);
  };

  /* -----------------------------
     MARK COMPLETED
  ------------------------------ */
  const markCompleted = async () => {
    if (!goalId) return;

    const { error } = await supabase
      .from("goals")
      .update({ completed: true })
      .eq("id", goalId);

    if (error) {
      alert("Failed to update goal");
      return;
    }

    setCompleted(true);
    navigate("/dashboard");
  };

  const handleCategoryClick = (c: GoalCategory) => {
    setCategory(c);
    if (c === "Other") setOtherOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Set Today’s Goal
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            {categories.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                className="w-full h-12 rounded-xl"
                onClick={() => handleCategoryClick(c)}
                disabled={!!goalId}
              >
                {c === "Other" && customGoal
                  ? `Other: ${customGoal}`
                  : c}
              </Button>
            ))}
          </div>

          {/* Duration */}
          {!goalId && category && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Duration (minutes)
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-center text-sm">{duration} minutes</p>
            </div>
          )}

          {/* Save / Complete */}
          {!goalId && (
            <Button
              className="w-full h-12 bg-gradient-calm"
              onClick={saveGoal}
              disabled={!category || (category === "Other" && !customGoal)}
            >
              Save Goal
            </Button>
          )}

          {goalId && !completed && (
            <Button
              className="w-full h-12 bg-gradient-mint"
              onClick={markCompleted}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Goal as Completed
            </Button>
          )}

          {completed && (
            <p className="text-center text-primary font-medium">
              🎉 Goal completed for today!
            </p>
          )}
        </CardContent>
      </Card>

      <OtherGoalModal
        open={otherOpen}
        onClose={() => setOtherOpen(false)}
        value={customGoal}
        setValue={setCustomGoal}
      />
    </div>
  );
}
