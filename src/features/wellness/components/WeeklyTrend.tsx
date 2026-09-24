import { useEffect, useState } from "react";
import {
  BarChart3,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PenTool,
  Music2,
  Users,
  Brain,
  Smile,
} from "lucide-react";

import WellnessShareCard from "./WellnessShareCard";
import WellnessShareService, {
  type WeeklyWellnessData,
} from "../services/WellnessShareService";

import { useSubscription } from "@/context/SubscriptionContext";
import UpgradeModal from "@/components/UpgradeModal";

const EMPTY_WELLNESS_DATA: WeeklyWellnessData = {
  score: 0,
  status: "No data yet",
  mood: 0,
  journal: 0,
  music: 0,
  community: 0,
  meditation: 0,
};

const ringMetrics = [
  { key: "mood", label: "Mood", icon: Smile, color: "#ef7890" },
  { key: "journal", label: "Journal", icon: PenTool, color: "#a855f7" },
  { key: "music", label: "Music", icon: Music2, color: "#ec4899" },
  { key: "community", label: "Community", icon: Users, color: "#6366f1" },
  { key: "meditation", label: "Meditation", icon: Brain, color: "#14b8a6" },
] as const;

function ActivityRing({
  value,
  color,
  Icon,
  delay,
}: {
  value: number;
  color: string;
  Icon: typeof Smile;
  delay: number;
}) {
  const size = 76;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-[76px] w-[76px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-muted"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={2.3} />
        <span className="mt-0.5 text-xs font-bold text-foreground">
          {Math.round(clamped)}
        </span>
      </div>
    </div>
  );
}

export default function WeeklyTrend() {
  const [shareOpen, setShareOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isSubscribed } = useSubscription();

  const [wellnessData, setWellnessData] =
    useState<WeeklyWellnessData>(EMPTY_WELLNESS_DATA);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadWellnessData() {
      try {
        const data = await WellnessShareService.getWeeklyWellnessData();
        if (mounted) setWellnessData(data);
      } catch (error) {
        console.error("Failed to load weekly wellness card data:", error);
        if (mounted) setWellnessData(EMPTY_WELLNESS_DATA);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadWellnessData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div className="rounded-[30px] border bg-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Weekly Wellness</h2>
              <p className="text-xs text-muted-foreground">
                This week&apos;s activity breakdown
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              isSubscribed ? setShareOpen(true) : setShowUpgrade(true)
            }
            disabled={loading}
            className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Create Wellness Card</span>
            <span className="sm:hidden">Share</span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-y-6 sm:grid-cols-5">
          {ringMetrics.map((metric, index) => (
            <div
              key={metric.key}
              className="flex flex-col items-center gap-2"
            >
              <ActivityRing
                value={loading ? 0 : wellnessData[metric.key]}
                color={metric.color}
                Icon={metric.icon}
                delay={index * 0.1}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {metric.label}
              </span>
            </div>
          ))}
        </div>

        {!loading && wellnessData.score === 0 && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            No wellness data yet — check back after a few days of activity.
          </p>
        )}
      </div>

      <WellnessShareCard
        data={wellnessData}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        featureName="Weekly Wellness Report"
      />
    </>
  );
}