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

interface EnergyRow {
  energy_level: number | null;
}

class WellnessScoreEngine {
  private async getAverageEnergy(
    table:
      | "music"
      | "moods"
      | "meditation_sessions"
      | "journals"
      | "community_rooms",
    userId: string,
  ): Promise<number> {
    const { data, error } = await supabase
      .from(table)
      .select("energy_level")
      .eq("user_id", userId);

    if (error || !data || data.length === 0) {
      return 0;
    }

    const rows = data as EnergyRow[];

    const values = rows
      .map((row) => Number(row.energy_level))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      return 0;
    }

    const average =
      values.reduce((sum, value) => sum + value, 0) /
      values.length;

    return Number(average.toFixed(2));
  }

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
     * Overall score
     * ----------------
     * This still comes from wellness_scores.
     */
    const { data: scoreData, error: scoreError } = await supabase
      .from("wellness_scores")
      .select("final_energy_level")
      .eq("user_id", user.id)
      .order("computed_at", { ascending: false })
      .limit(1);

    const score =
      !scoreError && scoreData && scoreData.length > 0
        ? Number(scoreData[0].final_energy_level ?? 0)
        : 0;

    /*
     * Individual parameters
     * ---------------------
     * Each parameter comes directly from its
     * respective source table.
     */
    const [
      music,
      mood,
      meditation,
      journal,
      community,
    ] = await Promise.all([
      this.getAverageEnergy("music", user.id),
      this.getAverageEnergy("moods", user.id),
      this.getAverageEnergy("meditation_sessions", user.id),
      this.getAverageEnergy("journals", user.id),
      this.getAverageEnergy("community_rooms", user.id),
    ]);

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