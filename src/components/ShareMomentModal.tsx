import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

import { shareToSocial } from "@/utils/shareToSocial";

type WellnessStats = {
  moodAverage: number;
  happiestDay: string;
  streak: number;
  bestStreak?: number;
  wellnessScore?: number;
  meditationMinutes?: number;
  journalEntries?: number;
  wellnessStatus?: string;
  summary?: string;
};

type Profile = {
  name?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

type ProfileResponse = {
  profile: Profile | null;
  stats: WellnessStats;
};

const apiBase = import.meta.env.VITE_API_URL || "/api";

async function fetchProfileAndStats(): Promise<ProfileResponse> {
  const token = localStorage.getItem("saathi_access_token");

  const response = await fetch(`${apiBase}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Unable to load wellness profile");
  }

  return payload;
}

function getDisplayName(profile: Profile | null) {
  return (
    profile?.full_name ||
    profile?.name ||
    profile?.username ||
    "Saathi User"
  );
}

function getMoodLabel(moodAverage: number) {
  if (moodAverage >= 85) return "Thriving";
  if (moodAverage >= 70) return "Improving";
  if (moodAverage >= 50) return "Balanced";
  if (moodAverage >= 30) return "Recovery";
  return "Attention";
}

function getMoodEmoji(moodAverage: number) {
  if (moodAverage >= 85) return "🥰";
  if (moodAverage >= 70) return "😊";
  if (moodAverage >= 50) return "😌";
  if (moodAverage >= 30) return "😔";
  return "🌱";
}

function formatDate() {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

function WellnessStatsCard({
  profile,
  stats,
  cardRef,
}: {
  profile: Profile | null;
  stats: WellnessStats;
  cardRef: React.RefObject<HTMLDivElement>;
}) {
  const moodAverage = Math.round(stats.moodAverage ?? 0);
  const wellnessScore = Math.round(
    stats.wellnessScore ?? stats.moodAverage ?? 0,
  );

  const moodLabel =
    stats.wellnessStatus || getMoodLabel(moodAverage);

  return (
    <div
      ref={cardRef}
      className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-500 p-5 text-white shadow-2xl"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/80">
              Saathi
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              My Wellness Journey
            </h2>

            <p className="mt-1 text-sm text-white/75">
              Your progress, one day at a time
            </p>
          </div>

          <div className="rounded-2xl bg-white/20 px-3 py-2 text-right backdrop-blur-sm">
            <p className="text-xs text-white/75">Today</p>
            <p className="text-xs font-semibold">
              {formatDate()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl bg-white/15 p-4 backdrop-blur-sm">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white text-5xl shadow-lg">
            {getMoodEmoji(moodAverage)}
          </div>

          <div>
            <p className="text-sm text-white/75">
              Your wellness status
            </p>

            <h3 className="text-2xl font-bold">
              {moodLabel}
            </h3>

            <p className="mt-1 text-sm text-white/80">
              {stats.summary ||
                "Small steps are still progress."}
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col items-center justify-center border-r border-slate-200 pr-4">
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#7c3aed ${
                    wellnessScore * 3.6
                  }deg, #e9d5ff 0deg)`,
                }}
              >
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-bold">
                    {wellnessScore}
                  </span>

                  <span className="text-xs text-slate-500">
                    / 100
                  </span>
                </div>
              </div>

              <p className="mt-3 text-center text-sm font-semibold">
                Wellness Score
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">
                  😊 Mood Average
                </p>

                <p className="text-xl font-bold">
                  {moodAverage}/100
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  🔥 Longest Streak
                </p>

                <p className="text-xl font-bold">
                  {stats.bestStreak ?? stats.streak ?? 0} days
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  🧘 Meditation
                </p>

                <p className="text-xl font-bold">
                  {stats.meditationMinutes ?? 0} min
                </p>
              </div>
            </div>
          </div>

          <div className="my-5 h-px bg-slate-200" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">
                📔 Journal Entries
              </p>

              <p className="text-lg font-bold">
                {stats.journalEntries ?? 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                🥰 Happiest Day
              </p>

              <p className="text-lg font-bold">
                {stats.happiestDay || "Not available"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {getDisplayName(profile)}
            </p>

            <p className="text-xs text-white/70">
              Your zen companion
            </p>
          </div>

          <p className="text-right text-xs italic text-white/80">
            Small steps.
            <br />
            Real progress. 🌱
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShareMomentModal({
  open,
  onClose,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<WellnessStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const response = await fetchProfileAndStats();

        if (!cancelled) {
          setProfile(response.profile);
          setStats(response.stats);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your wellness data",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function generateCardImage() {
    if (!cardRef.current) {
      throw new Error("Wellness card is not ready");
    }

    return toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#8b5cf6",
    });
  }

  async function handleSaveImage() {
    try {
      setExporting(true);

      const imageUrl = await generateCardImage();

      const link = document.createElement("a");
      link.download = "saathi-wellness-journey.png";
      link.href = imageUrl;
      link.click();
    } catch (err) {
      console.error("Unable to save wellness card:", err);
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    try {
      setExporting(true);

      const imageUrl = await generateCardImage();

      const blob = await fetch(imageUrl).then((response) =>
        response.blob(),
      );

      const file = new File(
        [blob],
        "saathi-wellness-journey.png",
        {
          type: "image/png",
        },
      );

      if (
        navigator.share &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({
          title: "My Wellness Journey 🌱",
          text: "My wellness progress with Saathi",
          files: [file],
        });

        return;
      }

      await shareToSocial({
        title: "My Wellness Journey 🌱",
        text: `My wellness progress with Saathi.\n\nWellness Score: ${
          stats?.wellnessScore ?? stats?.moodAverage ?? 0
        }/100\nLongest Streak: ${
          stats?.bestStreak ?? stats?.streak ?? 0
        } days`,
      });
    } catch (err) {
      console.error("Unable to share wellness card:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-5 sm:px-8">
          <div>
            <p className="text-sm font-medium text-primary">
              Saathi Wellness
            </p>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Share My Progress
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Your wellness journey, beautifully captured.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full text-xl"
            aria-label="Close share progress modal"
          >
            ×
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 pb-[150px] sm:px-8 sm:py-8 sm:pb-32">
          {loading && (
            <div className="rounded-3xl border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Preparing your wellness card...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && stats && (
            <div className="space-y-6">
              <div className="rounded-3xl border bg-muted/20 p-3 sm:p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    Your Wellness Card
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Automatically generated from your progress.
                  </p>
                </div>

                <WellnessStatsCard
                  profile={profile}
                  stats={stats}
                  cardRef={cardRef}
                />
              </div>

              <div className="rounded-3xl border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No typing required. Your card uses your saved
                  wellness data automatically.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  onClick={handleShare}
                  disabled={exporting}
                  className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-base font-semibold hover:from-violet-700 hover:to-cyan-600"
                >
                  {exporting
                    ? "Preparing..."
                    : "📤 Share Card"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={exporting}
                  className="h-12 rounded-2xl text-base font-semibold"
                >
                  🖼️ Save Image
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Share your progress whenever you feel proud of it. 💜
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}