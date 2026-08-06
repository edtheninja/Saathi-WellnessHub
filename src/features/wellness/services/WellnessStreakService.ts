import JournalAnalytics from "./JournalAnalytics";
import MeditationService from "./MeditationService";
import GoalService from "./GoalService";

export interface WellnessStreak {

  overall: number;

  journal: number;

  meditation: number;

  goals: number;

  status:
    | "Excellent"
    | "Good"
    | "Building"
    | "Inactive";
}

class WellnessStreakService {

  async getSummary(): Promise<WellnessStreak> {

    const [
      journal,
      meditation,
      goals,
    ] = await Promise.all([
      JournalAnalytics.getAnalytics(),
      MeditationService.getSummary(),
      GoalService.getSummary(),
    ]);

    const journalStreak = journal.streak;

    const meditationStreak =
      meditation.completed;

    const goalStreak =
      goals.completed ?? 0;

    const overall = Math.min(
      journalStreak,
      meditationStreak,
      goalStreak
    );

    let status: WellnessStreak["status"] =
      "Inactive";

    if (overall >= 30)
      status = "Excellent";

    else if (overall >= 14)
      status = "Good";

    else if (overall >= 3)
      status = "Building";

    return {

      overall,

      journal: journalStreak,

      meditation: meditationStreak,

      goals: goalStreak,

      status,

    };

  }

}

export default new WellnessStreakService();