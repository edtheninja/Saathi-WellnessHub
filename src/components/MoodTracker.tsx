import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

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
  getEnergyLevel,
  getMoodFromScore,
  moodCheckpoints,
} from "@/components/mood/moodScale";

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
  const location = useLocation();

  const dashboardMood =
    (location.state as { moodValue?: number } | null)?.moodValue;

  const [moodValue, setMoodValue] = useState(
    typeof dashboardMood === "number"
      ? dashboardMood
      : 50
  );

  const [isDragging, setIsDragging] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [weeklyData, setWeeklyData] = useState<number[]>(
    Array(7).fill(0)
  );

  const currentMood = useMemo(
    () => getMoodFromScore(moodValue),
    [moodValue]
  );

  /*
   * -------------------------------------------
   * LOAD WEEKLY DATA
   * -------------------------------------------
   */
  const loadWeeklyProgress = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Authentication error:",
          userError
        );
        return;
      }

      if (!user) return;

      const today = new Date();

      /*
       * Find Monday of the current week.
       */
      const monday = new Date(today);

      const day = monday.getDay();

      const diff =
        day === 0
          ? -6
          : 1 - day;

      monday.setDate(
        monday.getDate() + diff
      );

      monday.setHours(0, 0, 0, 0);

      /*
       * Find Sunday.
       */
      const sunday = new Date(monday);

      sunday.setDate(
        monday.getDate() + 6
      );

      sunday.setHours(
        23,
        59,
        59,
        999
      );

      /*
       * Fetch this week's moods.
       */
      const {
        data,
        error,
      } = await supabase
        .from("mood")
        .select(
          "id, energy_level, mood, created_at"
        )
        .eq("user_id", user.id)
        .gte(
          "created_at",
          monday.toISOString()
        )
        .lte(
          "created_at",
          sunday.toISOString()
        )
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Progress fetch error:",
          error
        );

        return;
      }

      /*
       * Map:
       *
       * YYYY-MM-DD → highest mood score
       */
      const map: Record<string, number> = {};

      data?.forEach((row) => {
        if (
          typeof row.energy_level !==
          "number"
        ) {
          return;
        }

        const dateKey =
          new Date(
            row.created_at
          ).toLocaleDateString(
            "en-CA"
          );

        /*
         * Existing DB stores 1–5.
         *
         * Convert:
         * 1 → 20
         * 2 → 40
         * 3 → 60
         * 4 → 80
         * 5 → 100
         */
        const score =
          row.energy_level * 20;

        map[dateKey] = Math.max(
          map[dateKey] || 0,
          score
        );
      });

      /*
       * Build Monday → Sunday.
       */
      const weekly: number[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);

        date.setDate(
          monday.getDate() + i
        );

        const dateKey =
          date.toLocaleDateString(
            "en-CA"
          );

        weekly.push(
          map[dateKey] || 0
        );
      }

      console.log(
        "Weekly mood data:",
        weekly
      );

      setWeeklyData(weekly);
    } catch (error) {
      console.error(
        "Unexpected progress error:",
        error
      );
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

  /*
   * -------------------------------------------
   * SAVE MOOD
   * -------------------------------------------
   *
   * The exact 0–100 value drives the UI.
   *
   * For now, Supabase remains compatible with
   * the existing energy_level 1–5 column.
   * -------------------------------------------
   */
  const handleSaveMood = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Authentication error:",
          userError
        );
        alert("Unable to verify your account.");
        return;
      }

      if (!user) {
        alert("Please sign in before saving your mood.");
        return;
      }

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      /*
       * Convert the new 0–100 mood score
       * into the existing 1–5 energy level.
       */
      const energyLevel = getEnergyLevel(moodValue);

      /*
       * Find today's mood entry.
       */
      const {
        data: existingMoods,
        error: findError,
      } = await supabase
        .from("mood")
        .select("id")
        .eq("user_id", user.id)
        .gte(
          "created_at",
          todayStart.toISOString()
        )
        .lte(
          "created_at",
          todayEnd.toISOString()
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1);

      const existingMood = existingMoods?.[0] ?? null;

      if (findError) {
        console.error(
          "Failed to find today's mood:",
          findError
        );

        alert(
          `Could not load today's mood: ${findError.message}`
        );

        return;
      }

      /*
       * UPDATE existing mood
       */
      if (existingMood) {
        const {
          error: updateError,
        } = await supabase
          .from("mood")
          .update({
            mood: currentMood.label,
            energy_level: energyLevel,
          })
          .eq("id", existingMood.id)
          .eq("user_id", user.id);

        if (updateError) {
          console.error(
            "Mood update error:",
            updateError
          );

          alert(
            `Failed to update mood: ${updateError.message}`
          );

          return;
        }
      }

      /*
       * INSERT new mood
       */
      else {
        const {
          error: insertError,
        } = await supabase
          .from("mood")
          .insert({
            user_id: user.id,
            mood: currentMood.label,
            energy_level: energyLevel,
          });

        if (insertError) {
          console.error(
            "Mood insert error:",
            insertError
          );

          alert(
            `Failed to save mood: ${insertError.message}`
          );

          return;
        }
      }

      /*
       * Reload the weekly chart from Supabase.
       */
      await loadWeeklyProgress();

      /*
       * Close any open modal.
       */
      setNoteOpen(false);

      /*
       * Give the user confirmation.
       */
      alert(
        `Mood saved successfully ✨\n${currentMood.expression} ${currentMood.label} · ${moodValue}/100`
      );
    } catch (error) {
      console.error(
        "Unexpected mood save error:",
        error
      );

      alert(
        "Something went wrong while saving your mood."
      );
    }
  };

  /*
   * -------------------------------------------
   * SAVE NOTE
   * -------------------------------------------
   */
  const handleSaveNote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !note.trim()) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data, error: fetchError } =
      await supabase
        .from("mood")
        .select("id")
        .eq("user_id", user.id)
        .gte(
          "created_at",
          todayStart.toISOString()
        )
        .lte(
          "created_at",
          todayEnd.toISOString()
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .single();

    if (fetchError || !data) {
      alert("No mood found for today");
      return;
    }

    const { error } = await supabase
      .from("mood")
      .update({ note })
      .eq("id", data.id);

    if (error) {
      console.error(error);

      alert("Failed to save note");

      return;
    }

    alert("Note saved successfully ✨");

    setNoteOpen(false);
  };

  /*
   * -------------------------------------------
   * WEEK DAY LABELS
   * -------------------------------------------
   */
  const getWeekDate = (index: number) => {
    const today = new Date();

    const monday = new Date(today);
    const day = monday.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    monday.setDate(monday.getDate() + diff);

    const d = new Date(monday);
    d.setDate(monday.getDate() + index);

    return d;
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
                  {new Date().toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
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
                        transform:
                          "translate(-50%, -50%)",
                      }}
                    >
                      <motion.div
                        animate={{
                          scale: isDragging
                            ? 1.15
                            : 1,
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
                      min="0"
                      max="100"
                      step="1"
                      value={moodValue}
                      onChange={(event) =>
                        setMoodValue(
                          Number(event.target.value)
                        )
                      }
                      onMouseDown={() =>
                        setIsDragging(true)
                      }
                      onMouseUp={() =>
                        setIsDragging(false)
                      }
                      onTouchStart={() =>
                        setIsDragging(true)
                      }
                      onTouchEnd={() =>
                        setIsDragging(false)
                      }
                      onBlur={() =>
                        setIsDragging(false)
                      }
                      className="relative z-10 w-full h-3 appearance-none bg-transparent cursor-pointer mood-slider"
                      aria-label="Current mood"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={moodValue}
                    />

                    {/* CHECKPOINT TICKS */}

                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      {moodCheckpoints.map(
                        (checkpoint) => (
                          <div
                            key={checkpoint.value}
                            className="absolute"
                            style={{
                              left: `${checkpoint.value}%`,
                              transform:
                                "translateX(-50%)",
                            }}
                          >
                            <div className="h-5 w-0.5 rounded-full bg-foreground/30" />
                          </div>
                        )
                      )}
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
                        onClick={() =>
                          setMoodValue(
                            checkpoint.value
                          )
                        }
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
                    <span className="font-semibold text-primary">
                      ✨ Tip:
                    </span>{" "}
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

                      <p className="font-semibold">
                        {currentMood.music}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
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

                      <p className="font-semibold">
                        {currentMood.meditation}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full mt-4 justify-between"
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

                      <p className="font-semibold">
                        Journal Prompt
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    "{currentMood.journalPrompt}"
                  </p>

                  <Button
                    variant="ghost"
                    className="w-full mt-2 justify-between"
                    onClick={() =>
                      setNoteOpen(true)
                    }
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
          {/* WEEKLY PROGRESS */}
          {/* -------------------------------- */}

          {/* Progress */}
          <motion.div variants={sectionAnim}>
            <Card className="shadow-soft border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />

                  <CardTitle className="text-lg">
                    Your Progress
                  </CardTitle>
                </div>

                <CardDescription>
                  Your mood energy throughout this week
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Chart */}
                <div className="grid grid-cols-7 gap-2 h-48">
                  {weeklyData.map((value, index) => {
                    const today = new Date();

                    /*
                     * Find Monday of the current week
                     */
                    const monday = new Date(today);
                    const day = monday.getDay();

                    const diff =
                      day === 0
                        ? -6
                        : 1 - day;

                    monday.setDate(
                      monday.getDate() + diff
                    );

                    monday.setHours(0, 0, 0, 0);

                    /*
                     * Current day
                     */
                    const date = new Date(monday);

                    date.setDate(
                      monday.getDate() + index
                    );

                    const isToday =
                      date.toDateString() ===
                      today.toDateString();

                    /*
                     * Convert 0–100 mood score
                     * into chart height.
                     */
                    const barHeight =
                      value > 0
                        ? Math.max(
                          8,
                          (value / 100) * 150
                        )
                        : 8;

                    return (
                      <div
                        key={index}
                        className="h-full flex flex-col items-center justify-end min-w-0"
                      >
                        {/* Bar area */}
                        <div className="h-[150px] w-full flex items-end justify-center">
                          <motion.div
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: `${barHeight}px`,
                              opacity: value > 0 ? 1 : 0.35,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                            className={`w-7 max-w-full rounded-t-xl ${value > 0
                              ? "bg-gradient-calm"
                              : "bg-muted"
                              }`}
                            title={
                              value > 0
                                ? `${value}/100 mood`
                                : "No mood logged"
                            }
                          />
                        </div>

                        {/* Day label */}
                        <span
                          className={`mt-4 text-xs sm:text-sm text-center whitespace-nowrap ${isToday
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                            }`}
                        >
                          {isToday
                            ? "Today"
                            : date.toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                              }
                            )}
                        </span>
                      </div>
                    );
                  })}
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
        onClose={() =>
          setNoteOpen(false)
        }
        mood={currentMood.label}
        note={note}
        setNote={setNote}
        onSave={handleSaveNote}
      />
    </>
  );
};

export default MoodTracker;