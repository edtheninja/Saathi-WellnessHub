const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

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

  breakdown?:
    | {
        music?: number | null;
        mood?: number | null;
        meditation?: number | null;
        journal?: number | null;
        community?: number | null;
      }
    | string
    | null;
}

class WellnessScoreEngine {
  async load(): Promise<WellnessScore> {
    const token = localStorage.getItem("saathi_access_token");

    if (!token) {
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

    try {
      const response = await fetch(
        `${API_BASE_URL}/wellness-score/latest`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error || "Failed to load wellness score",
        );
      }

      const data = payload?.data as WellnessScoreResponse | null;

      if (!data) {
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

      let rawBreakdown: Record<string, unknown> = {};

      if (typeof data.breakdown === "string") {
        try {
          rawBreakdown = JSON.parse(data.breakdown);
        } catch {
          rawBreakdown = {};
        }
      } else if (data.breakdown && typeof data.breakdown === "object") {
        rawBreakdown = data.breakdown as Record<string, unknown>;
      }

      return {
        score: Number(data.final_energy_level ?? 0),
        breakdown: {
          music: Number(rawBreakdown.music ?? 0),
          mood: Number(rawBreakdown.mood ?? 0),
          meditation: Number(rawBreakdown.meditation ?? 0),
          journal: Number(rawBreakdown.journal ?? 0),
          community: Number(rawBreakdown.community ?? 0),
        },
      };
    } catch (error) {
      console.error("Failed to load wellness score:", error);

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
  }
}

export default new WellnessScoreEngine();