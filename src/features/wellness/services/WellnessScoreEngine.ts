const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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
    const token =
      localStorage.getItem("saathi_access_token");

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

      const payload =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            "Failed to load wellness score",
        );
      }

      const data =
        payload?.data as WellnessScoreResponse | null;

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

      const breakdown = {
        music: normalizeEnergy(
          data.breakdown?.music,
        ),
        mood: normalizeEnergy(
          data.breakdown?.mood,
        ),
        meditation: normalizeEnergy(
          data.breakdown?.meditation,
        ),
        journal: normalizeEnergy(
          data.breakdown?.journal,
        ),
        community: normalizeEnergy(
          data.breakdown?.community,
        ),
      };

      return {
        score: Number(
          normalizeEnergy(
            data.final_energy_level,
          ).toFixed(2),
        ),
        breakdown,
      };
    } catch (error) {
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
  }
}

export default new WellnessScoreEngine();