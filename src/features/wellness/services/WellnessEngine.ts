import JournalService from "./JournalService";
import MeditationService from "./MeditationService";
import GoalService, {type Goal} from "./GoalService";
import WellnessScoreEngine from "./WellnessScoreEngine";
import JournalAnalytics, {
  type JournalAnalytics as JournalAnalyticsType,
} from "./JournalAnalytics";
import MoodEngine from "./MoodEngine";
import WellnessStreakService, {
  type WellnessStreak,
} from "./WellnessStreakService";
import { GoalCategory } from "@/context/GoalsContext";
export interface WellnessSnapshot {
  journal: {
    totalEntries: number;
  };

  streak: WellnessStreak;

  mood: {
    status: string;
    emoji: string;
    color: string;
    message: string;
    
  };
 
journalAnalytics: JournalAnalyticsType;

meditation: {
  completed: number;
  minutes: number;
};

goal: Goal;

score: {
  score: number;
  breakdown: {
    journal: number;
    meditation: number;
    goals: number;
    health: number;
  };
};
}

class WellnessEngine {
  async load(): Promise<WellnessSnapshot> {
    const [
      journal,
      journalAnalytics,
      meditation,
      goal,
      streak,
    ] = await Promise.all([
      JournalService.getSummary(),
      JournalAnalytics.getAnalytics(),
      MeditationService.getSummary(),
      GoalService.getSummary(),
      WellnessStreakService.getSummary(),
    ]);

    const snapshot: Omit<WellnessSnapshot, "score" | "mood"> = {
      journal,
      journalAnalytics,
      meditation,
      goal,
      streak,
    };

    const score = WellnessScoreEngine.calculate(snapshot);
    const mood = MoodEngine.calculate({ ...snapshot, score });

    return {
      ...snapshot,
      score,
      mood,
      streak,
    };
  }
}

export default new WellnessEngine();
