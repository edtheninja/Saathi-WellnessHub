// src/context/GoalsContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";


export type GoalCategory = "Meditation" | "Yoga" | "Self Care" | "Fitness";

export type Goal = {
  id: string;
  category: GoalCategory;
  duration: number;   // ✅ MUST be number
  progress: number;   // ✅ number
  completed: boolean;
};


type GoalsContextType = {
  goal: Goal | null;
  setGoal: (goal: Goal) => void;
  updateProgress: (minutes: number) => void;
  completeGoal: () => void;
};

// initial goal state is managed inside GoalsProvider

const GoalsContext = createContext<GoalsContextType | null>(null);

const STORAGE_KEY = "saathi_goal_v1";

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const [goal, setGoalState] = useState<Goal | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setGoalState(JSON.parse(saved));
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      return supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
        .then(({ data }) => {
          if (data) {
            setGoalState(data as Goal);
            persist(data as Goal);
          }
        });
    });
  }, []);

  const persist = (g: Goal | null) => {
    if (g) localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const setGoal = (g: Goal) => {
    setGoalState(g);
    persist(g);
    void supabase.from("goals").insert(g);
  };

  const updateProgress = (minutes: number) => {
    if (!goal) return;

    const updated: Goal = {
      ...goal,
      progress: Math.min(goal.progress + minutes, goal.duration),
      completed: goal.progress + minutes >= goal.duration,
    };

    setGoalState(updated);
    persist(updated);
    void supabase.from("goals").update(updated).eq("id", updated.id);
  };

  const completeGoal = () => {
    if (!goal) return;

    const updated = { ...goal, progress: goal.duration, completed: true };
    setGoalState(updated);
    persist(updated);
    void supabase.from("goals").update(updated).eq("id", updated.id);
  };

  return (
    <GoalsContext.Provider
      value={{ goal, setGoal, updateProgress, completeGoal }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components -- useGoals is tightly
// coupled to GoalsProvider/GoalsContext; splitting into a separate file would require
// updating every import across the codebase. Only affects dev Fast Refresh, not production.*/
export function useGoals() {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error("useGoals must be used inside GoalsProvider");
  return ctx;
}
