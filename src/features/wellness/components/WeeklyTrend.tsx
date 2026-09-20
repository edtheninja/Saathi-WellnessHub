import { useEffect, useState } from "react";
import {
  BarChart3,
  Share2,
} from "lucide-react";

import WellnessShareCard from "./WellnessShareCard";
import WellnessShareService, {
  type WeeklyWellnessData,
} from "../services/WellnessShareService";

const days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const EMPTY_WELLNESS_DATA: WeeklyWellnessData = {
  score: 0,
  status: "No data yet",
  mood: 0,
  journal: 0,
  music: 0,
  community: 0,
  meditation: 0,
};

export default function WeeklyTrend() {
  const [shareOpen, setShareOpen] =
    useState(false);

  const [wellnessData, setWellnessData] =
    useState<WeeklyWellnessData>(
      EMPTY_WELLNESS_DATA,
    );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWellnessData() {
      try {
        const data =
          await WellnessShareService.getWeeklyWellnessData();

        if (mounted) {
          setWellnessData(data);
        }
      } catch (error) {
        console.error(
          "Failed to load weekly wellness card data:",
          error,
        );

        if (mounted) {
          setWellnessData(
            EMPTY_WELLNESS_DATA,
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadWellnessData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="rounded-[30px] border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />

            <h2 className="text-xl font-semibold">
              Weekly Wellness
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            disabled={loading}
            className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" />

            <span className="hidden sm:inline">
              Create Wellness Card
            </span>

            <span className="sm:hidden">
              Share
            </span>
          </button>
        </div>

        <div className="mt-8 flex h-52 items-end justify-between">
          {days.map((day) => (
            <div
              key={day}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-28 w-6 rounded-full bg-muted" />

              <span className="text-xs text-muted-foreground">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>

      <WellnessShareCard
        data={wellnessData}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}