import { supabase } from "@/supabaseClient";

export interface WellnessScore {
  score: number;

  breakdown: {
    music: number;
    mood: number;
    meditation: number;
    journal: number;
    community: number;
  };
}

interface ActivityRecord {
  activity_type: string;
  energy_level: number | null;
}

interface ActivityResponse {
  data?: ActivityRecord[];
}

const ACTIVITY_TYPES = [
  "music",
  "mood",
  "meditation",
  "journal",
  "community",
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];

function normalizeEnergy(
  value: number | null | undefined,
): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
}

function calculateAverage(
  activities: ActivityRecord[],
  type: ActivityType,
): number {
  const values = activities
    .filter(
      (activity) =>
        activity.activity_type === type &&
        activity.energy_level !== null &&
        activity.energy_level !== undefined,
    )
    .map((activity) =>
      normalizeEnergy(activity.energy_level),
    );

  if (values.length === 0) {
    return 0;
  }

  const average =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  return Number(average.toFixed(2));
}

class WellnessScoreEngine {
  async load(): Promise<WellnessScore> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        score: 0,
        breakdown: {
          music: 0,
          mood: 0,
          meditation: 0,
          journal: 0,
          community: 0,
        },
      };
    }

    /*
     * All five wellness parameters come from
     * activity_history.
     *
     * Each value is the average energy_level
     * for that activity type.
     */
    const {
      data,
      error,
    } = await supabase
      .from("activity_history")
      .select(
        "activity_type, energy_level",
      )
      .eq("user_id", user.id)
      .limit(500);

    if (error || !data) {
      console.error(
        "Failed to load wellness activity history:",
        error,
      );

      return {
        score: 0,
        breakdown: {
          music: 0,
          mood: 0,
          meditation: 0,
          journal: 0,
          community: 0,
        },
      };
    }

    const activities =
      data as ActivityRecord[];

    const music = calculateAverage(
      activities,
      "music",
    );

    const mood = calculateAverage(
      activities,
      "mood",
    );

    const meditation = calculateAverage(
      activities,
      "meditation",
    );

    const journal = calculateAverage(
      activities,
      "journal",
    );

    const community = calculateAverage(
      activities,
      "community",
    );

    /*
     * Overall Wellness Score
     *
     * Missing categories are already represented
     * as 0, so all five parameters participate
     * equally in the final calculation.
     */
    const score = Number(
      (
        (music +
          mood +
          meditation +
          journal +
          community) /
        5
      ).toFixed(2),
    );

    return {
      score,
      breakdown: {
        music,
        mood,
        meditation,
        journal,
        community,
      },
    };
  }
}

export default new WellnessScoreEngine();