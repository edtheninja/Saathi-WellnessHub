import type { WellnessSnapshot } from "./WellnessEngine";

export interface WellnessMood {
  status:
    | "Thriving"
    | "Improving"
    | "Balanced"
    | "Recovery"
    | "Attention";

  emoji: string;

  color: string;

  message: string;
}

class MoodEngine {

  calculate(snapshot: Omit<WellnessSnapshot, "mood">): WellnessMood {

  const score = snapshot.score.score;

  const journalStreak =
    snapshot.journalAnalytics.streak;

  const averageMood =
    snapshot.journalAnalytics.averageMood;

  const meditationCompleted =
    snapshot.meditation.completed;

  const healthScore =
    snapshot.score.breakdown.health;

  // 🌟 Thriving
  if (
    score >= 90 &&
    journalStreak >= 7 &&
    meditationCompleted >= 5
  ) {
    return {
      status: "Thriving",
      emoji: "🌟",
      color: "text-emerald-500",
      message:
        "Fantastic consistency! Your wellness habits are excellent.",
    };
  }

  // 😊 Improving
  if (
    score >= 75 &&
    journalStreak >= 3
  ) {
    return {
      status: "Improving",
      emoji: "😊",
      color: "text-green-500",
      message:
        "You're building healthy habits. Keep the momentum going.",
    };
  }

  // 😴 Recovery
  if (
    averageMood < 4 ||
    healthScore < 40
  ) {
    return {
      status: "Recovery",
      emoji: "😴",
      color: "text-orange-500",
      message:
        "Take time to rest and recover. Small improvements today can make a big difference.",
    };
  }

  // ⚠️ Attention
  if (score < 40) {
    return {
      status: "Attention",
      emoji: "⚠️",
      color: "text-red-500",
      message:
        "Several wellness areas need attention. Consider reviewing your goals and routines.",
    };
  }

  // 🙂
  return {
    status: "Balanced",
    emoji: "🙂",
    color: "text-blue-500",
    message:
      "Your wellness is stable. Stay consistent with your daily habits.",
  };
}

}

export default new MoodEngine();