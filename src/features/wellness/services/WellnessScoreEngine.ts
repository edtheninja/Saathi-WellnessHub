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

interface WellnessScoreResponse {
  final_energy_level: number | null;
  breakdown?: {
    music?: number | null;
    mood?: number | null;
    meditation?: number | null;
    journal?: number | null;
    community?: number | null;
  } | null;
}

function normalizeEnergy(
  value: number | null | undefined,
): number {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, numericValue));
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
     * The backend calculates the Wellness Score
     * from activity_history and stores the result
     * in wellness_scores.
     *
     * This endpoint returns the latest calculated
     * wellness score and its category breakdown.
     */
    const {
      data,
      error,
    } = await supabase
      .from("wellness-score/latest")
      .select("*");

    if (error || !data) {
      console.error(
        "Failed to load wellness score:",
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

    const response =
      data as WellnessScoreResponse;

    const breakdown = {
      music: normalizeEnergy(
        response.breakdown?.music,
      ),
      mood: normalizeEnergy(
        response.breakdown?.mood,
      ),
      meditation: normalizeEnergy(
        response.breakdown?.meditation,
      ),
      journal: normalizeEnergy(
        response.breakdown?.journal,
      ),
      community: normalizeEnergy(
        response.breakdown?.community,
      ),
    };

    return {
      score: Number(
        normalizeEnergy(
          response.final_energy_level,
        ).toFixed(2),
      ),
      breakdown,
    };
  }
}

export default new WellnessScoreEngine();