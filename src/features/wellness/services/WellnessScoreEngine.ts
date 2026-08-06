import type { WellnessSnapshot } from "./WellnessEngine";

export interface WellnessScore {
  score: number;

  breakdown: {
    journal: number;
    meditation: number;
    goals: number;
    health: number;
  };
}

class WellnessScoreEngine {
  calculate(
    snapshot: Omit<WellnessSnapshot, "score" | "mood">
  ): WellnessScore {

    const breakdown = {
      journal: 0,
      meditation: 0,
      goals: 0,
      health: 0,
    };

    breakdown.journal = Math.min(
      snapshot.journal.totalEntries * 2.5,
      25
    );

    breakdown.meditation = Math.min(
      snapshot.meditation.minutes / 2,
      30
    );

    if (snapshot.goal?.completed) {
      breakdown.goals = 25;
    } else if (snapshot.goal?.id) {
      breakdown.goals = 12;
    }

    breakdown.health = 0;

    const score =
      breakdown.journal +
      breakdown.meditation +
      breakdown.goals +
      breakdown.health;

    return {
      score: Math.round(score),
      breakdown,
    };
  }
}

export default new WellnessScoreEngine();