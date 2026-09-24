const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
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

function getAccessToken(): string | null {
  try {
    const possibleKeys = [
      "saathi_access_token",
      "saathi_session",
      "saathi_auth",
      "auth_session",
      "session",
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);

      if (!value) continue;

      try {
        const parsed = JSON.parse(value);

        if (typeof parsed?.access_token === "string") {
          return parsed.access_token;
        }

        if (typeof parsed?.session?.access_token === "string") {
          return parsed.session.access_token;
        }
      } catch {
        if (value.trim()) {
          return value;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

class WellnessScoreEngine {
  private formatScore(
    data: WellnessScoreResponse | null | undefined,
  ): WellnessScore {
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
      // final_energy_level is strictly READ-ONLY: calculated by separate ML backend
      score: Number(data.final_energy_level ?? 0),
      breakdown: {
        music: Math.max(0, Math.min(100, Math.round(Number(rawBreakdown.music ?? 0)))),
        mood: Math.max(0, Math.min(100, Math.round(Number(rawBreakdown.mood ?? 0)))),
        meditation: Math.max(0, Math.min(100, Math.round(Number(rawBreakdown.meditation ?? 0)))),
        journal: Math.max(0, Math.min(100, Math.round(Number(rawBreakdown.journal ?? 0)))),
        community: Math.max(0, Math.min(100, Math.round(Number(rawBreakdown.community ?? 0)))),
      },
    };
  }

  /**
   * Loads the latest wellness score and breakdown.
   * final_energy_level is read-only.
   */
  async load(): Promise<WellnessScore> {
    const token = getAccessToken();

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
        `${API_BASE_URL}/api/wellness-score/latest`,
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
      return this.formatScore(data);
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

  /**
   * Writes and sends the full breakdown to the backend.
   * final_energy_level remains strictly READ-ONLY and will not be overwritten.
   */
  async saveBreakdown(
    breakdown: Partial<WellnessScore["breakdown"]>,
  ): Promise<WellnessScore> {
    const token = getAccessToken();

    if (!token) {
      return {
        score: 0,
        breakdown: {
          music: Number(breakdown.music ?? 0),
          mood: Number(breakdown.mood ?? 0),
          meditation: Number(breakdown.meditation ?? 0),
          journal: Number(breakdown.journal ?? 0),
          community: Number(breakdown.community ?? 0),
        },
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wellness-score/breakdown`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ breakdown }),
        },
      );

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.error || "Failed to save wellness breakdown",
        );
      }

      const data = payload?.data as WellnessScoreResponse | null;
      return this.formatScore(data);
    } catch (error) {
      console.error("Failed to save wellness breakdown:", error);

      return {
        score: 0,
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

  /**
   * Triggers recomputing the breakdown from activity history on the backend
   * while preserving final_energy_level as read-only.
   */
  async recomputeBreakdown(): Promise<WellnessScore> {
    const token = getAccessToken();

    if (!token) {
      return this.load();
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/wellness-score/breakdown`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );

      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload?.data) {
        return this.formatScore(payload.data);
      }
    } catch (error) {
      console.error("Failed to recompute breakdown:", error);
    }

    return this.load();
  }
}

export default new WellnessScoreEngine();