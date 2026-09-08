import { getDemoJournals, isDemoMode } from "./DemoMode";

export interface MoodSummary {
  latestMood?: number;
  weeklyAverage?: number;
}

class MoodService {
  async getSummary(): Promise<MoodSummary> {
    if (isDemoMode()) {
      const moods = getDemoJournals();
      return { latestMood: moods[0]?.mood, weeklyAverage: moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length };
    }
    try {
      const raw = localStorage.getItem("saathi_moods");

      if (!raw) {
        return {};
      }

      interface MoodEntry {
        value: number;
      }

      const moods = JSON.parse(raw) as MoodEntry[];

      if (!Array.isArray(moods) || moods.length === 0) {
        return {};
      }

      const latestMood = moods[moods.length - 1]?.value;

      const total = moods.reduce(
        (sum, mood) => sum + (mood.value || 0),
        0
      );

      return {
        latestMood,
        weeklyAverage: total / moods.length,
      };
    } catch {
      return {};
    }
  }
}

export default new MoodService();