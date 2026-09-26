import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";
import WellnessScoreEngine from "./WellnessScoreEngine";

export interface WeeklyWellnessData {
  score: number;
  status: string;
  mood: number;
  journal: number;
  music: number;
  community: number;
  meditation: number;
}

interface ActivityRecord {
  activity_type: string;
  energy_level: number | null;
  created_at: string;
}

interface ActivityResponse {
  data?: ActivityRecord[];
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const ACTIVITY_TYPES = [
  "mood",
  "journal",
  "music",
  "community",
  "meditation",
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];

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

function normalizeEnergy(value: number | null | undefined): number {
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
    .map((activity) => normalizeEnergy(activity.energy_level));

  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length,
  );
}

function getStatus(score: number): string {
  if (score >= 80) {
    return "Thriving";
  }

  if (score >= 60) {
    return "Balanced";
  }

  if (score >= 40) {
    return "Improving";
  }

  if (score > 0) {
    return "Recovery";
  }

  return "No data yet";
}

class WellnessShareService {
  async getWeeklyWellnessData(): Promise<WeeklyWellnessData> {
    const token = getAccessToken();

    if (!token) {
      return {
        score: 0,
        status: "No data yet",
        mood: 0,
        journal: 0,
        music: 0,
        community: 0,
        meditation: 0,
      };
    }

    const now = new Date();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7,
    );

    const params = new URLSearchParams({
      gte_created_at:
        sevenDaysAgo.toISOString(),
      lte_created_at: now.toISOString(),
      order: "created_at:asc",
      limit: "500",
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/data/activity_history?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch wellness activity data: ${response.status}`,
        );
      }

      const result =
        (await response.json()) as ActivityResponse;

      const activities = Array.isArray(result.data)
        ? result.data
        : [];

      const mood = calculateAverage(
        activities,
        "mood",
      );

      const journal = calculateAverage(
        activities,
        "journal",
      );

      const music = calculateAverage(
        activities,
        "music",
      );

      const community = calculateAverage(
        activities,
        "community",
      );

      const meditation = calculateAverage(
        activities,
        "meditation",
      );

      const values = [
        mood,
        journal,
        music,
        community,
        meditation,
      ];

      const score = Math.round(
        values.reduce(
          (sum, value) => sum + value,
          0,
        ) / values.length,
      );

      // Persist the whole breakdown to backend so it doesn't remain empty; final_energy_level is read-only
      if (values.some((v) => v > 0)) {
        WellnessScoreEngine.saveBreakdown({
          mood,
          journal,
          music,
          community,
          meditation,
        }).catch(() => {});
      }

      return {
        score,
        status: getStatus(score),
        mood,
        journal,
        music,
        community,
        meditation,
      };
    } catch (error) {
      console.error(
        "Failed to load weekly wellness data:",
        error,
      );

      return {
        score: 0,
        status: "No data yet",
        mood: 0,
        journal: 0,
        music: 0,
        community: 0,
        meditation: 0,
      };
    }
  }

  async downloadJpeg(
    element: HTMLElement,
    filename = "saathi-weekly-wellness.jpg",
  ) {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");

    link.download = filename;
    link.href = dataUrl;
    link.click();
  }

  async downloadPdf(
    element: HTMLElement,
    filename = "saathi-weekly-wellness.pdf",
  ) {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const pdf = new jsPDF({
      orientation:
        width >= height ? "landscape" : "portrait",
      unit: "px",
      format: [width, height],
    });

    pdf.addImage(
      dataUrl,
      "PNG",
      0,
      0,
      width,
      height,
    );

    pdf.save(filename);
  }
}

export default new WellnessShareService();