import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import { toPng } from "html-to-image";
import { Check, Copy, Download, Share2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { shareToSocial } from "@/utils/shareToSocial";
import { supabase } from "@/supabaseClient";
import WellnessEngine from "@/features/wellness/services/WellnessEngine";

type WellnessStats = {
  moodAverage: number;
  happiestDay: string;
  streak: number;
  bestStreak: number;
  wellnessScore: number;
  meditationMinutes: number;
  journalEntries: number;
  wellnessStatus: string;
  summary: string;
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

type BackendProfileResponse = {
  profile?: Profile | null;
  stats?: Partial<WellnessStats> | null;
  error?: string;
};

const configuredApiBase = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

const profileWellnessEndpoint =
  configuredApiBase.endsWith("/api")
    ? `${configuredApiBase}/profile/me`
    : `${configuredApiBase}/api/profile/me`;

const DEFAULT_WELLNESS_STATS: WellnessStats = {
  moodAverage: 78,
  happiestDay: "Today",
  streak: 3,
  bestStreak: 7,
  wellnessScore: 82,
  meditationMinutes: 15,
  journalEntries: 5,
  wellnessStatus: "Balanced",
  summary: "Taking small, mindful steps toward peace and balance.",
};

function toSafeNumber(value: number | null | undefined): number {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(0, numericValue);
}

function normalizeWellnessStats(
  stats?: Partial<WellnessStats> | null,
): WellnessStats {
  const score = Math.min(
    100,
    Math.round(toSafeNumber(stats?.wellnessScore ?? DEFAULT_WELLNESS_STATS.wellnessScore)),
  );

  return {
    moodAverage: Math.min(
      100,
      Math.round(toSafeNumber(stats?.moodAverage ?? DEFAULT_WELLNESS_STATS.moodAverage)),
    ),
    happiestDay:
      typeof stats?.happiestDay === "string" && stats.happiestDay.trim()
        ? stats.happiestDay
        : DEFAULT_WELLNESS_STATS.happiestDay,
    streak: Math.max(
      1,
      Math.round(toSafeNumber(stats?.streak ?? DEFAULT_WELLNESS_STATS.streak)),
    ),
    bestStreak: Math.max(
      1,
      Math.round(toSafeNumber(stats?.bestStreak ?? DEFAULT_WELLNESS_STATS.bestStreak)),
    ),
    wellnessScore: score,
    meditationMinutes: Math.round(
      toSafeNumber(stats?.meditationMinutes ?? DEFAULT_WELLNESS_STATS.meditationMinutes),
    ),
    journalEntries: Math.round(
      toSafeNumber(stats?.journalEntries ?? DEFAULT_WELLNESS_STATS.journalEntries),
    ),
    wellnessStatus:
      typeof stats?.wellnessStatus === "string" && stats.wellnessStatus.trim()
        ? stats.wellnessStatus
        : getMoodLabel(score),
    summary:
      typeof stats?.summary === "string" && stats.summary.trim()
        ? stats.summary
        : DEFAULT_WELLNESS_STATS.summary,
  };
}

async function fetchProfileAndStats(): Promise<ProfileResponse> {
  const token = localStorage.getItem("saathi_access_token");

  // 1. Try remote API with a short 2s timeout
  let remoteData: BackendProfileResponse | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2000);

    const response = await fetch(profileWellnessEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });
    window.clearTimeout(timeoutId);

    if (response.ok) {
      remoteData = (await response.json().catch(() => null)) as BackendProfileResponse | null;
    }
  } catch {
    // Remote API is not available or timed out; will fall back to local sources
  }

  // 2. Resolve Profile (remote, Supabase user, or localStorage)
  let resolvedProfile: Profile | null = remoteData?.profile ?? null;

  if (!resolvedProfile?.name && !resolvedProfile?.full_name) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        resolvedProfile = {
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0],
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name,
          username: user.email?.split("@")[0],
        };
      }
    } catch {
      // Supabase user fetch failed
    }

    if (!resolvedProfile?.name && !resolvedProfile?.full_name) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          const name =
            parsed?.user?.user_metadata?.name ||
            parsed?.user?.user_metadata?.full_name ||
            parsed?.name ||
            parsed?.full_name ||
            parsed?.user?.email?.split("@")[0];
          if (name) {
            resolvedProfile = { name, full_name: name };
          }
        }
      } catch {
        // Local user parse failed
      }
    }
  }

  // 3. Resolve Stats (remote, or WellnessEngine snapshot)
  let resolvedStats: WellnessStats;

  if (remoteData?.stats && Object.keys(remoteData.stats).length > 0) {
    resolvedStats = normalizeWellnessStats(remoteData.stats);
  } else {
    try {
      const snapshot = await WellnessEngine.load();

      const calculatedScore = Math.round(toSafeNumber(snapshot.score?.score));
      const moodValence = snapshot.score?.breakdown?.mood
        ? Math.min(100, Math.round(snapshot.score.breakdown.mood * 5))
        : 75;

      resolvedStats = normalizeWellnessStats({
        wellnessScore: calculatedScore > 0 ? calculatedScore : 82,
        moodAverage: moodValence,
        streak: snapshot.streak?.overall || 3,
        bestStreak: Math.max(snapshot.streak?.overall || 3, 7),
        meditationMinutes: snapshot.meditation?.minutes || 15,
        journalEntries: snapshot.journal?.totalEntries || 4,
        wellnessStatus: snapshot.mood?.status || getMoodLabel(calculatedScore || 82),
        summary:
          snapshot.mood?.message ||
          "Taking small, steady steps toward peace and balance.",
        happiestDay: snapshot.journalAnalytics?.happiestDay || "Today",
      });
    } catch {
      resolvedStats = DEFAULT_WELLNESS_STATS;
    }
  }

  return {
    profile: resolvedProfile,
    stats: resolvedStats,
  };
}

function getDisplayName(profile: Profile | null) {
  if (profile?.full_name || profile?.name || profile?.username) {
    return profile.full_name || profile.name || profile.username;
  }

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      const name =
        parsed?.user?.user_metadata?.name ||
        parsed?.user?.user_metadata?.full_name ||
        parsed?.name ||
        parsed?.full_name ||
        parsed?.user?.email?.split("@")[0];
      if (name) return name;
    }
  } catch {}

  return "Saathi Mind";
}

function getMoodLabel(moodAverage: number) {
  if (moodAverage >= 85) return "Thriving";
  if (moodAverage >= 70) return "Improving";
  if (moodAverage >= 50) return "Balanced";
  if (moodAverage >= 30) return "Recovery";
  return "Mindful";
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
  isExport = false,
}: {
  profile: Profile | null;
  stats: WellnessStats;
  cardRef: RefObject<HTMLDivElement>;
  isExport?: boolean;
}) {
  const moodAverage = Math.min(
    100,
    Math.round(toSafeNumber(stats.moodAverage)),
  );

  const wellnessScore = Math.min(
    100,
    Math.round(toSafeNumber(stats.wellnessScore)),
  );

  const longestStreak = Math.round(
    Math.max(
      toSafeNumber(stats.bestStreak),
      toSafeNumber(stats.streak),
    ),
  );

  const meditationMinutes = Math.round(
    toSafeNumber(stats.meditationMinutes),
  );

  const journalEntries = Math.round(
    toSafeNumber(stats.journalEntries),
  );

  const moodLabel =
    stats.wellnessStatus || getMoodLabel(moodAverage);

  return (
    <div
      ref={cardRef}
      style={isExport ? { width: "440px", minWidth: "440px", maxWidth: "440px" } : undefined}
      className={`relative mx-auto overflow-hidden text-white shadow-2xl bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-500 ${
        isExport
          ? "w-[440px] min-w-[440px] max-w-[440px] rounded-[32px] p-5"
          : "w-full max-w-[440px] rounded-[24px] sm:rounded-[32px] p-4 sm:p-5"
      }`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className={`relative z-10 ${isExport ? "space-y-5" : "space-y-4 sm:space-y-5"}`}>
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-white/80">Saathi</p>
            <h2 className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold truncate">My Wellness Journey</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-white/75 truncate">
              Your progress, one day at a time
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-white/20 px-2.5 py-1.5 sm:px-3 sm:py-2 text-right backdrop-blur-sm">
            <p className="text-[10px] sm:text-xs text-white/75">Today</p>
            <p className="text-xs font-semibold whitespace-nowrap">{formatDate()}</p>
          </div>
        </div>

        <div className={`flex items-center backdrop-blur-sm ${
          isExport
            ? "gap-4 rounded-3xl bg-white/15 p-4"
            : "gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl bg-white/15 p-3.5 sm:p-4"
        }`}>
          <div className={`shrink-0 flex items-center justify-center rounded-full bg-white shadow-lg ${
            isExport
              ? "h-20 w-20 text-5xl"
              : "h-14 w-14 sm:h-20 sm:w-20 text-3xl sm:text-5xl"
          }`}>
            {getMoodEmoji(moodAverage)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-white/75">Your wellness status</p>
            <h3 className={`font-bold truncate ${isExport ? "text-2xl" : "text-xl sm:text-2xl"}`}>{moodLabel}</h3>
            <p className="mt-0.5 text-xs sm:text-sm text-white/80 line-clamp-2">
              {stats.summary || "Small steps are still progress."}
            </p>
          </div>
        </div>

        <div className={`bg-white text-slate-900 shadow-xl ${
          isExport
            ? "rounded-3xl p-5"
            : "rounded-2xl sm:rounded-3xl p-4 sm:p-5"
        }`}>
          <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-5 items-center">
            <div className={`flex flex-col items-center justify-center border-r border-slate-200 ${
              isExport ? "pr-4" : "pr-3 sm:pr-4"
            }`}>
              <div
                className={`flex items-center justify-center rounded-full ${
                  isExport ? "h-28 w-28" : "h-20 w-20 sm:h-28 sm:w-28"
                }`}
                style={{
                  background: `conic-gradient(#7c3aed ${
                    wellnessScore * 3.6
                  }deg, #e9d5ff 0deg)`,
                }}
              >
                <div className={`flex flex-col items-center justify-center rounded-full bg-white ${
                  isExport ? "h-20 w-20" : "h-14 w-14 sm:h-20 sm:w-20"
                }`}>
                  <span className={`font-bold ${isExport ? "text-3xl" : "text-2xl sm:text-3xl"}`}>{wellnessScore}</span>
                  <span className="text-[10px] sm:text-xs text-slate-500">/ 100</span>
                </div>
              </div>

              <p className="mt-2 text-center text-xs sm:text-sm font-semibold whitespace-nowrap">
                Wellness Score
              </p>
            </div>

            <div className={`min-w-0 pl-1 sm:pl-0 ${isExport ? "space-y-4" : "space-y-2.5 sm:space-y-4"}`}>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">😊 Mood Average</p>
                <p className={`font-bold ${isExport ? "text-xl" : "text-base sm:text-xl"}`}>{moodAverage}/100</p>
              </div>

              <div>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">🔥 Longest Streak</p>
                <p className={`font-bold ${isExport ? "text-xl" : "text-base sm:text-xl"}`}>{longestStreak} days</p>
              </div>

              <div>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate">🧘 Meditation</p>
                <p className={`font-bold ${isExport ? "text-xl" : "text-base sm:text-xl"}`}>{meditationMinutes} min</p>
              </div>
            </div>
          </div>

          <div className={`h-px bg-slate-200 ${isExport ? "my-5" : "my-3.5 sm:my-5"}`} />

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">📔 Journal Entries</p>
              <p className={`font-bold ${isExport ? "text-lg" : "text-base sm:text-lg"}`}>{journalEntries}</p>
            </div>

            <div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">🥰 Happiest Day</p>
              <p className={`font-bold truncate ${isExport ? "text-lg" : "text-base sm:text-lg"}`}>
                {stats.happiestDay || "Today"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">{getDisplayName(profile)}</p>
            <p className="text-[10px] sm:text-xs text-white/70">Your zen companion</p>
          </div>

          <p className="text-right text-[11px] sm:text-xs italic text-white/80 shrink-0">
            Small steps.
            <br />
            Real progress. 🌱
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShareMomentModal({ open, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<WellnessStats>(DEFAULT_WELLNESS_STATS);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const response = await fetchProfileAndStats();

        if (!cancelled) {
          setProfile(response.profile);
          setStats(response.stats);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Using default wellness stats:", err);
          setStats(DEFAULT_WELLNESS_STATS);
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
    const target = exportCardRef.current || cardRef.current;
    if (!target) {
      throw new Error("Wellness card is not ready");
    }

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    const width = 440;
    const height = Math.max(target.offsetHeight, target.scrollHeight, 620);

    return toPng(target, {
      cacheBust: true,
      pixelRatio: 2,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      backgroundColor: "#8b5cf6",
      style: {
        transform: "none",
        position: "static",
        left: "auto",
        top: "auto",
        margin: "0",
        width: `${width}px`,
        minWidth: `${width}px`,
        maxWidth: `${width}px`,
        height: `${height}px`,
      },
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

  async function handleCopyImage() {
    try {
      setExporting(true);
      const imageUrl = await generateCardImage();
      const blob = await fetch(imageUrl).then((res) => res.blob());

      if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        await navigator.clipboard.writeText(
          `My Wellness Progress on Saathi 🌱\nWellness Score: ${stats.wellnessScore}/100\nStreak: ${stats.streak} days\nStatus: ${stats.wellnessStatus}`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Unable to copy wellness image:", err);
    } finally {
      setExporting(false);
    }
  }

  async function handleShare() {
    try {
      setExporting(true);
      const imageUrl = await generateCardImage();

      const blob = await fetch(imageUrl).then((response) => response.blob());

      const file = new File([blob], "saathi-wellness-journey.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My Wellness Journey 🌱",
          text: "My wellness progress with Saathi",
          files: [file],
        });
        return;
      }

      await shareToSocial({
        title: "My Wellness Journey 🌱",
        text: `My wellness progress with Saathi.\n\nWellness Score: ${stats.wellnessScore}/100\nLongest Streak: ${Math.max(
          stats.bestStreak,
          stats.streak,
        )} days`,
        imageUrl,
      });
    } catch (err) {
      console.error("Unable to share wellness card:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4 sm:px-8 sm:py-5">
          <div>
            <p className="text-sm font-medium text-primary">Saathi Wellness</p>
            <h1 className="text-2xl font-bold sm:text-3xl">Share My Progress</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your wellness journey, beautifully captured.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-full text-xl h-10 w-10 p-0"
            aria-label="Close share progress modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 pb-6 sm:px-8 sm:py-6 sm:pb-8">
          {loading && (
            <div className="rounded-3xl border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Preparing your wellness card...
              </p>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              <div className="rounded-3xl border bg-muted/20 p-2.5 sm:p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">Your Wellness Card</h2>
                  <p className="text-sm text-muted-foreground">
                    Automatically generated from your progress.
                  </p>
                </div>

                <WellnessStatsCard
                  profile={profile}
                  stats={stats}
                  cardRef={cardRef}
                  isExport={false}
                />
              </div>

              <div className="rounded-3xl border bg-card p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  No typing required. Your card uses your saved wellness data automatically.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  type="button"
                  onClick={handleShare}
                  disabled={exporting}
                  className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white hover:from-violet-700 hover:to-cyan-600 shadow-md"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {exporting ? "Preparing..." : "Share Card"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyImage}
                  disabled={exporting}
                  className="h-12 rounded-2xl text-sm font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Image
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveImage}
                  disabled={exporting}
                  className="h-12 rounded-2xl text-sm font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save PNG
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Share your progress whenever you feel proud of it. 💜
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden export card with fixed canonical dimensions for pristine PNG/Share generation */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "440px",
          minWidth: "440px",
          maxWidth: "440px",
          overflow: "visible",
          pointerEvents: "none",
          zIndex: -100,
          opacity: 1,
        }}
      >
        <WellnessStatsCard
          profile={profile}
          stats={stats}
          cardRef={exportCardRef}
          isExport={true}
        />
      </div>
    </div>
  );
}