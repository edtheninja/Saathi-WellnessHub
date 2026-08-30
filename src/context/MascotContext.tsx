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
/* eslint-disable-next-line react-refresh/only-export-components -- useMascot is tightly
// coupled to MascotProvider/MascotContext; splitting into a separate file would require
// updating every import across the codebase. Only affects dev Fast Refresh, not production.*/
export const useMascot = () => useContext(MascotContext);

