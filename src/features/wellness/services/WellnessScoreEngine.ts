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

    const { data, error } = await supabase
      .from("wellness_scores")
      .select("final_energy_level, breakdown")
      .eq("user_id", user.id)
      .order("computed_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
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

    const row = data[0];
    const breakdown = row.breakdown ?? {};

    return {
      score: Number(row.final_energy_level ?? 0),

      breakdown: {
        music: Number(breakdown.music ?? 0),
        mood: Number(breakdown.mood ?? 0),
        meditation: Number(breakdown.meditation ?? 0),
        journal: Number(breakdown.journal ?? 0),
        community: Number(breakdown.community ?? 0),
      },
    };
  }
}

export default new WellnessScoreEngine();