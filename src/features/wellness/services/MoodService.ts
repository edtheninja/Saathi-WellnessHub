export interface MoodSummary {
  latestMood?: number;
  weeklyAverage?: number;
}

class MoodService {
  async getSummary(): Promise<MoodSummary> {
    try {
      const raw = localStorage.getItem("saathi_moods");

      if (!raw) {
        return {};
      }

      const moods = JSON.parse(raw);

      if (!Array.isArray(moods) || moods.length === 0) {
        return {};
      }

      const latestMood = moods[moods.length - 1]?.value;

      const total = moods.reduce(
        (sum: number, mood: any) => sum + (mood.value || 0),
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