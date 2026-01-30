import { createContext, useContext, useEffect, useState } from "react";
import { useGoals } from "./GoalsContext";

type MascotMood = "idle" | "encouraging" | "celebrating";

const MascotContext = createContext<{ mood: MascotMood }>({ mood: "idle" });

export const MascotProvider = ({ children }: { children: React.ReactNode }) => {
  const { goal } = useGoals();
  const [mood, setMood] = useState<MascotMood>("idle");

  useEffect(() => {
    if (!goal) {
      setMood("idle");
      return;
    }

    if (goal.completed) {
      setMood("celebrating");
    } else {
      setMood("encouraging");
    }
  }, [goal]);

  return (
    <MascotContext.Provider value={{ mood }}>
      {children}
    </MascotContext.Provider>
  );
};

export const useMascot = () => useContext(MascotContext);
