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
      .limit(1)
      .maybeSingle();

    if (error || !data) {
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

    const breakdown = data.breakdown ?? {};

    return {
      score: Number(data.final_energy_level ?? 0),

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