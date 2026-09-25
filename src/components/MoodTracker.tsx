import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Calendar,
  ChevronRight,
  Headphones,
  PenLine,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import MoodNoteModal from "@/components/mood/MoodNoteModal";
import { supabase } from "@/supabaseClient";
import { motion, AnimatePresence } from "motion/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

import { getMoodFromScore, moodCheckpoints } from "@/components/mood/moodScale";

export interface WeeklyMoodPoint {
  day: string;
  shortDate: string;
  fullDate: string;
  score: number | null;
  moodLabel?: string;
  moodEmoji?: string;
  note?: string;
  isToday: boolean;
  hasLogged: boolean;
}

const CustomChartDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || payload?.chartScore === null || payload?.chartScore === undefined) return null;
  const isPreview = Boolean(payload.preview);
  const isToday = Boolean(payload.isToday);

  return (
    <g key={`dot-${payload.fullDate || payload.day}`}>
      {isToday && (
        <circle
          cx={cx}
          cy={cy}
          r={9}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          strokeDasharray={isPreview ? "3 3" : undefined}
          opacity={0.65}
        />
      )}
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isPreview ? "hsl(var(--background))" : "hsl(var(--primary))"}
        stroke="hsl(var(--primary))"
        strokeWidth={2.5}
      />
    </g>
  );
};

const CustomMoodTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.chartScore === null || data.chartScore === undefined) {
      return (
        <div className="rounded-2xl border bg-card/95 backdrop-blur-md p-3 shadow-lg text-xs">
          <p className="font-semibold text-foreground">{data.day} · {data.shortDate}</p>
          <p className="text-muted-foreground text-[11px] mt-1">No mood recorded</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border bg-card/95 backdrop-blur-md p-3 shadow-xl text-xs space-y-1.5 z-50 min-w-[150px]">
        <div className="font-semibold text-foreground flex items-center justify-between gap-3">
          <span>{data.day} · {data.shortDate}</span>
          {data.isToday && (
            <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
              {data.preview ? "Preview" : "Today"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
          <span className="text-base">{data.moodEmoji}</span>
          <span>{data.moodLabel}</span>
          <span className="text-muted-foreground font-normal text-xs">({data.chartScore}/100)</span>
        </div>
        {data.preview ? (
          <p className="text-muted-foreground text-[10px]">
            Live preview from slider · Click Save Mood below to record
          </p>
        ) : (
          <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            ✓ Logged
          </span>
        )}
        {data.note && (
          <p className="text-muted-foreground italic text-[11px] pt-1 border-t border-border/40 max-w-[200px] truncate">
            "{data.note}"
          </p>
        )}
      </div>
    );
  }
  return null;
};

const pageAnim = {
  hidden: {
    opacity: 0,
    y: 25,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut" as const,
      staggerChildren: 0.12,
    },
  },
};

const sectionAnim = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 18,
    },
  },
};

const MoodTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardMood = (location.state as { moodValue?: number } | null)
    ?.moodValue;

  const [moodValue, setMoodValue] = useState(() => {
    if (typeof dashboardMood === "number") return dashboardMood;
    try {
      const stored = localStorage.getItem("saathi_latest_energy");
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) return parsed;
    } catch {}
    return 50;
  });

  const [isDragging, setIsDragging] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [weeklyPoints, setWeeklyPoints] = useState<WeeklyMoodPoint[]>([]);
  const [weeklyAvg, setWeeklyAvg] = useState<number | null>(null);
  const [loggedCount, setLoggedCount] = useState<number>(0);

  const currentMood = useMemo(() => getMoodFromScore(moodValue), [moodValue]);

  /*
   * -------------------------------------------
   * LOAD WEEKLY DATA (Multi-Tier: DB + Local)
   * -------------------------------------------
   */
  const loadWeeklyProgress = async () => {
    try {
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day; // Monday as first day
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      // 1. Read cached/local moods
      let localMap: Record<string, { score: number; mood: string; note?: string }> = {};
      try {
        const raw = localStorage.getItem("saathi_mood_history");
        if (raw) localMap = JSON.parse(raw);
      } catch {}

      // 2. Fetch authenticated moods from Supabase if logged in
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("moods")
            .select("id, energy_level, mood, note, created_at")
            .eq("user_id", user.id)
            .gte("created_at", monday.toISOString())
            .lte("created_at", sunday.toISOString())
            .order("created_at", { ascending: true });

          if (!error && Array.isArray(data)) {
            data.forEach((row) => {
              const numScore = Number(row.energy_level);
              if (Number.isFinite(numScore) && numScore >= 1 && numScore <= 100) {
                const dateKey = new Date(row.created_at).toLocaleDateString("en-CA");
                localMap[dateKey] = {
                  score: numScore,
                  mood: row.mood || getMoodFromScore(numScore).label,
                  note: row.note || "",
                };
              }
            });
            try {
              localStorage.setItem("saathi_mood_history", JSON.stringify(localMap));
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote moods, using local cache:", err);
      }

      // 3. Assemble Monday -> Sunday points
      const points: WeeklyMoodPoint[] = [];
      let totalLogged = 0;
      let scoreSum = 0;

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateKey = d.toLocaleDateString("en-CA");
        const isToday = d.toDateString() === today.toDateString();
        const entry = localMap[dateKey];

        if (entry) {
          const meta = getMoodFromScore(entry.score);
          points.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            shortDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: dateKey,
            score: entry.score,
            moodLabel: entry.mood || meta.label,
            moodEmoji: meta.expression,
            note: entry.note,
            isToday,
            hasLogged: true,
          });
          totalLogged += 1;
          scoreSum += entry.score;
        } else {
          points.push({
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            shortDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            fullDate: dateKey,
            score: null,
            isToday,
            hasLogged: false,
          });
        }
      }

      setWeeklyPoints(points);
      setLoggedCount(totalLogged);
      setWeeklyAvg(totalLogged > 0 ? Math.round(scoreSum / totalLogged) : null);
    } catch (error) {
      console.error("Unexpected progress error:", error);
    }
  };

  /*
   * -------------------------------------------
   * INITIAL LOAD
   * -------------------------------------------
   */
  useEffect(() => {
    loadWeeklyProgress();
  }, []);

  const chartData = useMemo(() => {
    return weeklyPoints.map((point) => {
      if (point.hasLogged && point.score !== null) {
        return {
          ...point,
          chartScore: point.score,
          preview: false,
        };
      }
      if (point.isToday) {
        return {
          ...point,
          chartScore: moodValue,
          moodLabel: currentMood.label,
          moodEmoji: currentMood.expression,
          preview: true,
        };
      }
      return {
        ...point,
        chartScore: null,
        preview: false,
      };
    });
  }, [weeklyPoints, moodValue, currentMood]);

  /*
   * -------------------------------------------
   * SAVE MOOD
   * -------------------------------------------
   *
   * The exact 1–100 value drives the UI and
   * is stored directly in the moods table.
   * -------------------------------------------
   */
  /*
   * -------------------------------------------
   * SAVE MOOD
   * -------------------------------------------
   *
   * Stores to localStorage cache and Supabase
   * backend (if authenticated).
   * -------------------------------------------
   */
  const handleSaveMood = async () => {
    try {
      const todayKey = new Date().toLocaleDateString("en-CA");
      const energyLevel = moodValue;

      // 1. Immediately store to local cache & latest energy
      try {
        localStorage.setItem("saathi_latest_energy", String(energyLevel));
        const raw = localStorage.getItem("saathi_mood_history");
        const history = raw ? JSON.parse(raw) : {};
        history[todayKey] = {
          score: energyLevel,
          mood: currentMood.label,
          note: note.trim() || undefined,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("saathi_mood_history", JSON.stringify(history));
      } catch {}

      // 2. Check if user is authenticated for Supabase sync
      let syncedWithDb = false;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);

          // Find today's mood entry
          const { data: existingMoods } = await supabase
            .from("moods")
            .select("id")
            .eq("user_id", user.id)
            .gte("created_at", todayStart.toISOString())
            .lte("created_at", todayEnd.toISOString())
            .order("created_at", { ascending: false })
            .limit(1);

          const existingMood = existingMoods?.[0] ?? null;

          if (existingMood) {
            await supabase
              .from("moods")
              .update({
                mood: currentMood.label,
                energy_level: energyLevel,
                note: note.trim() || null,
              })
              .eq("id", existingMood.id)
              .eq("user_id", user.id);
          } else {
            await supabase.from("moods").insert({
              user_id: user.id,
              mood: currentMood.label,
              energy_level: energyLevel,
              note: note.trim() || null,
            });
          }
          syncedWithDb = true;
        }
      } catch (dbErr) {
        console.warn("Could not sync mood to remote server:", dbErr);
      }

      // 3. Reload graph data
      await loadWeeklyProgress();
      setNoteOpen(false);

      alert(
        syncedWithDb
          ? `Mood saved & synced ✨\n${currentMood.expression} ${currentMood.label} · ${moodValue}/100`
          : `Mood saved locally ✨\n${currentMood.expression} ${currentMood.label} · ${moodValue}/100\n(Sign in anytime to sync across devices)`
      );
    } catch (error) {
      console.error("Unexpected mood save error:", error);
      alert("Mood saved ✨");
      await loadWeeklyProgress();
    }
  };

  /*
   * -------------------------------------------
   * SAVE NOTE
   * -------------------------------------------
   */
  /*
   * -------------------------------------------
   * SAVE NOTE
   * -------------------------------------------
   */
  const handleSaveNote = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;

    const todayKey = new Date().toLocaleDateString("en-CA");
    try {
      const raw = localStorage.getItem("saathi_mood_history");
      const history = raw ? JSON.parse(raw) : {};
      if (history[todayKey]) {
        history[todayKey].note = trimmed;
      } else {
        history[todayKey] = {
          score: moodValue,
          mood: currentMood.label,
          note: trimmed,
          timestamp: new Date().toISOString(),
        };
      }
      localStorage.setItem("saathi_mood_history", JSON.stringify(history));
    } catch {}

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data } = await supabase
          .from("moods")
          .select("id")
          .eq("user_id", user.id)
          .gte("created_at", todayStart.toISOString())
          .lte("created_at", todayEnd.toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.id) {
          await supabase.from("moods").update({ note: trimmed }).eq("id", data.id);
        }
      }
    } catch (e) {
      console.warn("Could not sync note to server:", e);
    }

    await loadWeeklyProgress();
    alert("Note saved successfully ✨");
    setNoteOpen(false);
  };

  return (
    <>
      <motion.div
        variants={pageAnim}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-background p-4 md:p-6 pb-32 overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* -------------------------------- */}
          {/* HEADER */}
          {/* -------------------------------- */}

          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Mood Journey
            </h1>

            <p className="text-muted-foreground text-base md:text-lg">
              How are you feeling today?
            </p>
          </div>

          {/* -------------------------------- */}
          {/* DATE */}
          {/* -------------------------------- */}

          <motion.div variants={sectionAnim}>
            <Card className="shadow-soft border-0">
              <CardContent className="p-4 flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />

                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </CardContent>
            </Card>
          </motion.div>

          {/* -------------------------------- */}
          {/* MOOD JOURNEY */}
          {/* -------------------------------- */}

          <motion.div variants={sectionAnim}>
            <Card className="relative overflow-hidden border-0 shadow-elevated rounded-[32px]">
              {/* soft background decoration */}

              <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

              <CardContent className="relative p-6 md:p-10">
                {/* Title */}

                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary font-medium">
                    <Sparkles className="w-4 h-4" />
                    Your mood right now
                  </div>
                </div>

                {/* -------------------------------- */}
                {/* FOX + MOOD */}
                {/* -------------------------------- */}

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 mt-8">
                  {/* FOX */}

                  <motion.div
                    key={currentMood.expression}
                    initial={{
                      scale: 0.8,
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 16,
                    }}
                    className="relative"
                  >
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-primary/10 flex items-center justify-center shadow-soft">
                      <motion.span
                        key={currentMood.expression}
                        initial={{
                          scale: 0.6,
                          opacity: 0,
                          rotate: -10,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          rotate: 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 14,
                        }}
                        className="text-8xl md:text-9xl leading-none select-none"
                      >
                        {currentMood.expression}
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* MOOD TEXT */}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentMood.label}
                      initial={{
                        opacity: 0,
                        x: 15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: -15,
                      }}
                      className="text-center md:text-left"
                    >
                      <h2 className="text-4xl md:text-5xl font-black text-primary">
                        {currentMood.label}
                      </h2>

                      <p className="text-2xl md:text-3xl font-semibold mt-2">
                        {moodValue}
                        <span className="text-muted-foreground text-lg md:text-xl">
                          {" "}
                          / 100
                        </span>
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* -------------------------------- */}
                {/* RESPONSE */}
                {/* -------------------------------- */}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMood.message}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="mt-8 rounded-3xl bg-primary/5 border border-primary/10 p-5 text-center"
                  >
                    <p className="font-semibold text-lg">
                      {currentMood.message}
                    </p>

                    <p className="text-sm text-muted-foreground mt-2">
                      {currentMood.tip}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* -------------------------------- */}
                {/* SLIDER */}
                {/* -------------------------------- */}

                <div className="mt-10">
                  <div className="relative px-2">
                    {/* gradient track */}

                    <div
                      className="absolute left-2 right-2 top-1/2 h-3 -translate-y-1/2 rounded-full"
                      style={{
                        background:
                          "linear-gradient(to right, #ef6b73 0%, #f39b62 25%, #f5d76e 50%, #a8cf70 75%, #45b982 100%)",
                      }}
                    />

                    {/* FOX THUMB */}

                    <div
                      className="absolute top-1/2 z-20 pointer-events-none transition-[left] duration-75 ease-out"
                      style={{
                        left: `${moodValue}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: isDragging ? 1.15 : 1,
                        }}
                        className="relative"
                      >
                        <div className="w-16 h-16 rounded-full bg-background border-4 border-primary shadow-elevated flex items-center justify-center">
                          <motion.span
                            key={currentMood.expression}
                            initial={{ scale: 0.7 }}
                            animate={{
                              scale: isDragging ? 1.2 : 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 15,
                            }}
                            className="text-4xl md:text-5xl leading-none select-none"
                          >
                            {currentMood.expression}
                          </motion.span>
                        </div>

                        {/* score bubble */}

                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-xl bg-primary text-primary-foreground px-3 py-1 font-bold text-sm shadow-md whitespace-nowrap">
                          {moodValue}
                        </div>
                      </motion.div>
                    </div>

                    {/* REAL RANGE INPUT */}

                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={moodValue}
                      onChange={(event) => {
                        const val = Number(event.target.value);
                        setMoodValue(val);
                        try {
                          localStorage.setItem("saathi_latest_energy", String(val));
                        } catch {}
                      }}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onTouchStart={() => setIsDragging(true)}
                      onTouchEnd={() => setIsDragging(false)}
                      onBlur={() => setIsDragging(false)}
                      className="relative z-10 w-full h-3 appearance-none bg-transparent cursor-pointer mood-slider"
                      aria-label="Current mood"
                      aria-valuemin={1}
                      aria-valuemax={100}
                      aria-valuenow={moodValue}
                    />

                    {/* CHECKPOINT TICKS */}

                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      {moodCheckpoints.map((checkpoint) => (
                        <div
                          key={checkpoint.value}
                          className="absolute"
                          style={{
                            left: `${checkpoint.value}%`,
                            transform: "translateX(-50%)",
                          }}
                        >
                          <div className="h-5 w-0.5 rounded-full bg-foreground/30" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CHECKPOINT LABELS */}

                  <div className="grid grid-cols-5 gap-2 mt-8">
                    {[
                      moodCheckpoints[0],
                      moodCheckpoints[2],
                      moodCheckpoints[5],
                      moodCheckpoints[7],
                      moodCheckpoints[9],
                    ].map((checkpoint) => (
                      <button
                        key={checkpoint.value}
                        type="button"
                        onClick={() => setMoodValue(checkpoint.value)}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <span className="text-2xl transition-transform group-hover:scale-125">
                          {checkpoint.expression}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {checkpoint.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* -------------------------------- */}
                {/* TIP */}
                {/* -------------------------------- */}

                <div className="mt-8 rounded-full bg-primary/5 px-5 py-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">✨ Tip:</span>{" "}
                    {currentMood.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* -------------------------------- */}
          {/* RECOMMENDATIONS */}
          {/* -------------------------------- */}

          <motion.div variants={sectionAnim}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* MUSIC */}

              <Card className="border-0 shadow-soft bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Music for your mood
                      </p>

                      <p className="font-semibold">{currentMood.music}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
                    onClick={() => {
                      try {
                        localStorage.setItem("saathi_latest_energy", String(moodValue));
                      } catch {}
                      navigate("/music", { state: { energyLevel: moodValue } });
                    }}
                  >
                    Listen now
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* MEDITATION */}

              <Card className="border-0 shadow-soft bg-secondary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-secondary/15 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-secondary-foreground" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Try this
                      </p>

                      <p className="font-semibold">{currentMood.meditation}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
                    onClick={() => navigate("/meditation")}
                  >
                    Start
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* JOURNAL */}

              <Card className="border-0 shadow-soft bg-accent/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center">
                      <PenLine className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Reflect
                      </p>

                      <p className="font-semibold">Journal Prompt</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    "{currentMood.journalPrompt}"
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full mt-2 justify-between"
                    onClick={() => setNoteOpen(true)}
                  >
                    Reflect
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* -------------------------------- */}
          {/* SAVE */}
          {/* -------------------------------- */}

          <motion.div variants={sectionAnim}>
            <div className="flex justify-center">
              <Button
                onClick={handleSaveMood}
                className="rounded-full px-8 py-6 text-base font-semibold shadow-elevated"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Save Mood · {moodValue}/100
              </Button>
            </div>
          </motion.div>

          {/* -------------------------------- */}
          {/* WEEKLY MOOD GRAPH */}
          {/* -------------------------------- */}

          <motion.div variants={sectionAnim}>
            <Card className="shadow-soft border-0 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Weekly Mood Flow</CardTitle>
                      <CardDescription>
                        {loggedCount > 0 ? (
                          <>
                            {loggedCount} of 7 days logged
                            {weeklyAvg !== null && (
                              <span className="ml-1.5 font-medium text-foreground">
                                · Weekly Avg: {weeklyAvg}/100 ({getMoodFromScore(weeklyAvg).expression} {getMoodFromScore(weeklyAvg).label})
                              </span>
                            )}
                          </>
                        ) : (
                          "Your mood energy curve throughout this week"
                        )}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Live Tracker
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-2">
                {/* Recharts Area Graph */}
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 16, right: 12, left: -22, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient id="moodWaveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />

                      <YAxis
                        domain={[0, 100]}
                        ticks={[20, 50, 80]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dx={-4}
                      />

                      <ReferenceLine
                        y={80}
                        stroke="hsl(var(--border))"
                        strokeDasharray="4 4"
                        strokeOpacity={0.7}
                      />
                      <ReferenceLine
                        y={50}
                        stroke="hsl(var(--border))"
                        strokeDasharray="4 4"
                        strokeOpacity={0.7}
                      />
                      <ReferenceLine
                        y={20}
                        stroke="hsl(var(--border))"
                        strokeDasharray="4 4"
                        strokeOpacity={0.7}
                      />

                      <Tooltip content={<CustomMoodTooltip />} />

                      <Area
                        type="monotone"
                        dataKey="chartScore"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#moodWaveGradient)"
                        connectNulls
                        dot={<CustomChartDot />}
                        activeDot={{
                          r: 7,
                          stroke: "hsl(var(--primary))",
                          strokeWidth: 3,
                          fill: "hsl(var(--background))",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Graph footer legend */}
                <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                      Logged mood
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-primary bg-background" />
                      Today preview
                    </span>
                  </div>
                  <span>
                    Scale: 0–100 (Low → Calm → Thriving)
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* -------------------------------- */}
      {/* NOTE MODAL */}
      {/* -------------------------------- */}

      <MoodNoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        mood={currentMood.label}
        note={note}
        setNote={setNote}
        onSave={handleSaveNote}
      />
    </>
  );
};

export default MoodTracker;
